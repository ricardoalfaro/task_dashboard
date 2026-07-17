import { requireSupabase } from '../lib/supabase.js';

const mapColumn = column => ({
  id: column.id,
  title: column.title,
  color: column.color,
  position: column.position,
  isFixed: column.is_fixed,
  slug: column.slug,
});

const mapTask = task => ({
  id: task.id,
  columnId: task.column_id,
  title: task.title,
  description: task.description,
  start: task.start_date,
  due: task.due_date,
  effort: task.effort,
  status: task.status,
  position: task.position,
  createdAt: task.created_at,
  completedAt: task.completed_at,
  deprecatedAt: task.deprecated_at,
  updatedAt: task.updated_at,
});

const columnRecord = (boardId,column) => ({
  id: column.id,
  board_id: boardId,
  slug: column.slug,
  title: column.title,
  color: column.color,
  position: column.position,
  is_fixed: Boolean(column.isFixed),
});

const taskRecord = (boardId,task) => ({
  id: task.id,
  board_id: boardId,
  column_id: task.columnId,
  title: task.title,
  description: task.description || '',
  start_date: task.start,
  due_date: task.due,
  effort: Number(task.effort) || 3,
  status: task.status,
  position: task.position || 0,
  completed_at: task.completedAt || null,
  deprecated_at: task.deprecatedAt || null,
});

const localColumnRecord = (boardId,column,position) => ({
  board_id: boardId,
  legacy_id: String(column.id),
  slug: column.slug || String(column.id).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || `column-${position}`,
  title: column.title,
  color: column.color || '#c5b3d3',
  position,
  is_fixed: ['todo','doing','done'].includes(String(column.id)) || Boolean(column.isFixed),
});

const localTaskRecord = (boardId,task,columnId,position) => ({
  board_id: boardId,
  legacy_id: String(task.id),
  column_id: columnId,
  title: task.title,
  description: task.description || '',
  start_date: task.start || task.due,
  due_date: task.due,
  effort: Number(task.effort) || 3,
  status: task.status || 'active',
  position,
  completed_at: task.completedAt || null,
  deprecated_at: task.deprecatedAt || null,
  created_at: task.createdAt || undefined,
});

function resultOrThrow(result,message) {
  if (result.error) throw new Error(`${message}: ${result.error.message}`);
  return result.data;
}

export const dashboardRepository = {
  async load(boardId) {
    const client=requireSupabase();
    const [boardResult,columnsResult,tasksResult]=await Promise.all([
      client.from('boards').select('id,name,owner_id,updated_at').eq('id',boardId).single(),
      client.from('columns').select('*').eq('board_id',boardId).order('position'),
      client.from('tasks').select('*').eq('board_id',boardId).order('position'),
    ]);
    const board=resultOrThrow(boardResult,'No se pudo cargar el tablero');
    const columns=resultOrThrow(columnsResult,'No se pudieron cargar las columnas').map(mapColumn);
    const tasks=resultOrThrow(tasksResult,'No se pudieron cargar las tareas').map(mapTask);
    return {board,columns,tasks};
  },

  async updateBoardName(boardId,name) {
    const result=await requireSupabase().from('boards').update({name}).eq('id',boardId).select('id,name').single();
    return resultOrThrow(result,'No se pudo guardar el nombre del tablero');
  },

  async upsertColumn(boardId,column) {
    const result=await requireSupabase().from('columns').upsert(columnRecord(boardId,column)).select().single();
    return mapColumn(resultOrThrow(result,'No se pudo guardar la columna'));
  },

  async deleteColumn(columnId) {
    const result=await requireSupabase().from('columns').delete().eq('id',columnId);
    resultOrThrow(result,'No se pudo eliminar la columna');
  },

  async upsertTask(boardId,task) {
    const result=await requireSupabase().from('tasks').upsert(taskRecord(boardId,task)).select().single();
    return mapTask(resultOrThrow(result,'No se pudo guardar la tarea'));
  },

  async deleteTask(taskId) {
    const result=await requireSupabase().from('tasks').delete().eq('id',taskId);
    resultOrThrow(result,'No se pudo eliminar la tarea');
  },

  async migrateLocalSnapshot(boardId,{boardTitle,columns,tasks}) {
    const client=requireSupabase();
    const before=await this.count(boardId);
    const columnRows=columns.map(localColumnRecord.bind(null,boardId));
    const columnsResult=await client.from('columns').upsert(columnRows,{onConflict:'board_id,slug'}).select('*');
    const remoteColumns=resultOrThrow(columnsResult,'No se pudieron migrar las columnas');
    const columnIds=new Map(remoteColumns.map(column=>[column.legacy_id,column.id]));
    const fallbackTodo=remoteColumns.find(column=>column.slug==='todo')?.id;
    const taskRows=tasks.map((task,index)=>localTaskRecord(boardId,task,columnIds.get(String(task.columnId))||fallbackTodo,index));
    if(taskRows.some(task=>!task.column_id))throw new Error('No se encontró la columna TO-DO para migrar algunas tareas.');
    if(taskRows.length){
      const tasksResult=await client.from('tasks').upsert(taskRows,{onConflict:'board_id,legacy_id'}).select('id,legacy_id');
      resultOrThrow(tasksResult,'No se pudieron migrar las tareas');
    }
    await this.updateBoardName(boardId,boardTitle);
    const after=await this.count(boardId);
    const migratedColumnsResult=await client.from('columns').select('legacy_id').eq('board_id',boardId).not('legacy_id','is',null);
    const migratedTasksResult=await client.from('tasks').select('legacy_id').eq('board_id',boardId).not('legacy_id','is',null);
    const migratedColumnIds=new Set(resultOrThrow(migratedColumnsResult,'No se pudieron verificar las columnas').map(item=>item.legacy_id));
    const migratedTaskIds=new Set(resultOrThrow(migratedTasksResult,'No se pudieron verificar las tareas').map(item=>item.legacy_id));
    const missingColumns=columns.filter(column=>!migratedColumnIds.has(String(column.id)));
    const missingTasks=tasks.filter(task=>!migratedTaskIds.has(String(task.id)));
    if(missingColumns.length||missingTasks.length)throw new Error(`La verificación detectó ${missingColumns.length} columnas y ${missingTasks.length} tareas faltantes.`);
    return {before,after,imported:{columns:columns.length,tasks:tasks.length}};
  },

  async count(boardId) {
    const client=requireSupabase();
    const [columnsResult,tasksResult]=await Promise.all([
      client.from('columns').select('*',{count:'exact',head:true}).eq('board_id',boardId),
      client.from('tasks').select('*',{count:'exact',head:true}).eq('board_id',boardId),
    ]);
    if(columnsResult.error)throw new Error(`No se pudieron contar las columnas: ${columnsResult.error.message}`);
    if(tasksResult.error)throw new Error(`No se pudieron contar las tareas: ${tasksResult.error.message}`);
    return {columns:columnsResult.count||0,tasks:tasksResult.count||0};
  },

  async syncSnapshot(boardId,{boardTitle,columns,tasks}) {
    const client=requireSupabase();
    await this.updateBoardName(boardId,boardTitle);
    for(let index=0;index<columns.length;index+=1){
      await this.upsertColumn(boardId,{...columns[index],position:10000+index});
    }
    for(let index=0;index<columns.length;index+=1){
      await this.upsertColumn(boardId,{...columns[index],position:index});
    }
    for(let index=0;index<tasks.length;index+=1){
      await this.upsertTask(boardId,{...tasks[index],position:index});
    }
    const taskIds=tasks.map(task=>task.id);
    let deleteTasks=client.from('tasks').delete().eq('board_id',boardId);
    if(taskIds.length)deleteTasks=deleteTasks.not('id','in',`(${taskIds.join(',')})`);
    resultOrThrow(await deleteTasks,'No se pudieron sincronizar las tareas eliminadas');
    const columnIds=columns.map(column=>column.id);
    let deleteColumns=client.from('columns').delete().eq('board_id',boardId).eq('is_fixed',false);
    if(columnIds.length)deleteColumns=deleteColumns.not('id','in',`(${columnIds.join(',')})`);
    resultOrThrow(await deleteColumns,'No se pudieron sincronizar las columnas eliminadas');
  },
};

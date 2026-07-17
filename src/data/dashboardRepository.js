import { requireSupabase } from '../lib/supabase';

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
};

import { useEffect, useMemo, useState } from 'react';
import {
  Archive, ArrowLeft, ArrowRight, Bell, CalendarBlank, CaretDown, ChartBar,
  Check, ClipboardText, DotsThree, Kanban, MagnifyingGlass, Plus,
  Lightning, SlidersHorizontal, Trash, X
} from '@phosphor-icons/react';

const initialColumns = [
  { id: 'todo', title: 'TO-DO', color: '#43637e' },
  { id: 'doing', title: 'DOING', color: '#65dcd5' },
  { id: 'done', title: 'DONE', color: '#321e48' },
];
const columnPalette = { todo:'#43637e', doing:'#65dcd5', done:'#321e48' };

const initialTasks = [
  { id: 1, columnId: 'todo', title: 'Preparar presentación semanal', description: 'Resumir los avances, bloqueos y próximos hitos del equipo.', due: '2026-07-14', status: 'active', createdAt: '2026-07-03' },
  { id: 2, columnId: 'todo', title: 'Revisar propuesta de presupuesto', description: 'Validar estimaciones y dejar comentarios para Finanzas.', due: '2026-07-16', status: 'active', createdAt: '2026-07-08' },
  { id: 3, columnId: 'todo', title: 'Actualizar documentación', description: 'Incorporar los últimos cambios del flujo de publicación.', due: '2026-07-18', status: 'active', createdAt: '2026-07-09' },
  { id: 4, columnId: 'doing', title: 'Dashboard Plan / Logros', description: 'Definir métricas y preparar el primer prototipo navegable.', due: '2026-07-14', status: 'active', createdAt: '2026-07-02' },
  { id: 5, columnId: 'doing', title: 'Automatización de carruseles con IA', description: 'Probar el flujo de generación y revisar la calidad del contenido.', due: '2026-07-15', status: 'active', createdAt: '2026-07-07' },
  { id: 6, columnId: 'done', title: 'Weekly Planning Elisa/Maca', description: 'Reunión de coordinación y definición de prioridades.', due: '2026-07-11', status: 'completed', createdAt: '2026-07-01', completedAt: '2026-07-11' },
  { id: 7, columnId: 'done', title: 'Benchmark Estudio Billeteras', description: 'Análisis comparativo terminado y compartido con el equipo.', due: '2026-07-10', status: 'completed', createdAt: '2026-07-01', completedAt: '2026-07-10' },
  { id: 8, columnId: 'done', title: 'Borrador artículo billeteras digitales', description: 'Versión inicial terminada y enviada a revisión.', due: '2026-07-08', status: 'completed', createdAt: '2026-06-28', completedAt: '2026-07-08' },
];

const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const shortMonths = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const fmt = (date) => { const d = new Date(`${date}T12:00:00`); return `${d.getDate()} ${shortMonths[d.getMonth()]}`; };

function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" onMouseDown={e => e.stopPropagation()}>
    <header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X size={20}/></button></header>
    {children}
  </section></div>;
}

function TaskForm({ task, columns, defaultColumn, onSave, onClose }) {
  const [form, setForm] = useState(task ? {...task,start:task.start||task.due,effort:task.effort||3} : { title:'', description:'', start:'2026-07-14', due:'2026-07-14', columnId:defaultColumn || columns[0].id, effort:3 });
  const [dateError,setDateError]=useState('');
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  return <form onSubmit={e => { e.preventDefault(); if(form.start>form.due){setDateError('La fecha de inicio no puede ser posterior a la fecha de entrega.');return}setDateError('');if(form.title.trim()) onSave(form); }}>
    <label>Nombre de la tarea<input autoFocus required name="title" value={form.title} onChange={change} placeholder="¿Qué tienes que hacer?"/></label>
    <label>Descripción<textarea name="description" rows="4" value={form.description} onChange={change} placeholder="Añade contexto o próximos pasos"/></label>
    <label className="effort-field"><span>Nivel de esfuerzo <b>{form.effort}</b></span><input className="effort-range" type="range" name="effort" min="1" max="5" step="1" value={form.effort} onChange={change}/><span className="effort-scale"><small>1 · Bajo</small><small>5 · Alto</small></span></label>
    <div className="form-grid"><label>Fecha de inicio<input required type="date" name="start" value={form.start} max={form.due} onChange={change}/></label><label>Fecha de entrega<input required type="date" name="due" value={form.due} min={form.start} onChange={change}/></label></div>
    {dateError&&<p className="form-error" role="alert">{dateError}</p>}
    <div className="form-grid form-grid-single">
    <label>Columna<select name="columnId" value={form.columnId} onChange={change}>{columns.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
    <footer className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary">{task ? 'Guardar cambios' : 'Crear tarea'}</button></footer>
  </form>;
}

function TaskCard({ task, onEdit, onComplete, onDeprecate, onDragStart }) {
  const overdue = task.status === 'active' && task.due < '2026-07-14';
  return <article className={`task-card ${task.status}`} draggable onDragStart={e=>onDragStart(e, task.id)} onClick={()=>onEdit(task)}>
    <div className="task-top"><button className="check-button" onClick={e=>{e.stopPropagation();onComplete(task)}} aria-label="Completar tarea">{task.status==='completed'&&<Check size={14} weight="bold"/>}</button>
      <button className="more" onClick={e=>{e.stopPropagation();onDeprecate(task)}} title="Deprecar tarea"><DotsThree size={22}/></button></div>
    <h3>{task.title}</h3><p>{task.description}</p>
    <div className={`due ${overdue?'overdue':''}`}><CalendarBlank size={16}/><span>{overdue?'Venció ':''}{fmt(task.due)}</span></div>
  </article>;
}

function EditableBoardTitle({ value, onChange }) {
  const [editingTitle,setEditingTitle]=useState(false);
  const [draft,setDraft]=useState(value);
  const startEditing=()=>{setDraft(value);setEditingTitle(true)};
  const save=()=>{const next=draft.trim();if(next)onChange(next);setEditingTitle(false)};
  if(editingTitle)return <input className="board-title-input" autoFocus value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')save();if(event.key==='Escape')setEditingTitle(false)}} onBlur={()=>setEditingTitle(false)} aria-label="Nombre del tablero"/>;
  return <h1 className="editable-board-title" onDoubleClick={startEditing} tabIndex="0" onKeyDown={event=>{if(event.key==='Enter')startEditing()}} title="Haz doble clic para cambiar el nombre">{value}</h1>;
}

function EditableColumnTitle({ value, onChange }) {
  const [editingTitle,setEditingTitle]=useState(false);
  const [draft,setDraft]=useState(value);
  const startEditing=()=>{setDraft(value);setEditingTitle(true)};
  const save=()=>{const next=draft.trim();if(next)onChange(next);setEditingTitle(false)};
  if(editingTitle)return <input className="column-title-input" autoFocus value={draft} onChange={event=>setDraft(event.target.value)} onClick={event=>event.stopPropagation()} onKeyDown={event=>{if(event.key==='Enter')save();if(event.key==='Escape')setEditingTitle(false)}} onBlur={()=>setEditingTitle(false)} aria-label="Nombre de la columna"/>;
  return <h2 className="editable-column-title" onDoubleClick={startEditing} tabIndex="0" onKeyDown={event=>{if(event.key==='Enter')startEditing()}} title="Haz doble clic para cambiar el nombre">{value}</h2>;
}

function Board({ columns, tasks, setTasks, setColumns, openTask, boardTitle, setBoardTitle }) {
  const [newColumn, setNewColumn] = useState(false);
  const [columnMenu,setColumnMenu]=useState(null);
  const fixedColumnIds=['todo','doing','done'];
  const moveTask = (taskId, columnId) => setTasks(items=>items.map(t=>t.id===taskId?{...t,columnId,status:columnId==='done'?'completed':'active',completedAt:columnId==='done'?'2026-07-14':undefined}:t));
  const complete = task => setTasks(items=>items.map(t=>t.id===task.id?{...t,columnId:'done',status:'completed',completedAt:'2026-07-14'}:t));
  const deprecate = task => setTasks(items=>items.map(t=>t.id===task.id?{...t,status:'deprecated',deprecatedAt:'2026-07-14'}:t));
  const renameColumn = (columnId,title) => setColumns(items=>items.map(column=>column.id===columnId?{...column,title}:column));
  const reorderColumn = (draggedId,targetId) => setColumns(items=>{if(draggedId===targetId||fixedColumnIds.includes(draggedId))return items;const dragged=items.find(column=>column.id===draggedId);if(!dragged)return items;const without=items.filter(column=>column.id!==draggedId);const targetIndex=without.findIndex(column=>column.id===targetId);without.splice(targetIndex<0?without.length:targetIndex,0,dragged);return without});
  const deleteColumn = columnId => {if(fixedColumnIds.includes(columnId))return;setTasks(items=>items.map(task=>task.columnId===columnId?{...task,columnId:'todo',status:'active',completedAt:undefined}:task));setColumns(items=>items.filter(column=>column.id!==columnId));setColumnMenu(null)};
  const handleColumnDrop = (event,columnId) => {event.preventDefault();event.stopPropagation();const draggedColumn=event.dataTransfer.getData('text/column');if(draggedColumn){reorderColumn(draggedColumn,columnId);return}const taskId=Number(event.dataTransfer.getData('text/task'));if(taskId)moveTask(taskId,columnId)};
  return <div className="board-wrap"><div className="board-header"><div><p className="eyebrow">ESPACIO DE TRABAJO</p><EditableBoardTitle value={boardTitle} onChange={setBoardTitle}/><p className="subtitle">Organiza el trabajo de hoy y mantén el foco.</p></div><button className="primary add-top" onClick={()=>openTask(null)}><Plus size={18} weight="bold"/> Nueva tarea</button></div>
    <div className="board" role="list">{columns.map(col=>{const list=tasks.filter(t=>t.columnId===col.id&&t.status!=='deprecated');const isFixed=fixedColumnIds.includes(col.id);return <section className={`column ${isFixed?'fixed-column':'custom-column'}`} key={col.id} draggable={!isFixed} onDragStart={event=>{if(!isFixed)event.dataTransfer.setData('text/column',col.id)}} onDragOver={e=>e.preventDefault()} onDrop={event=>handleColumnDrop(event,col.id)}>
      <header className="column-header"><div className="column-title"><span style={{background:col.color}}></span><EditableColumnTitle value={col.title} onChange={title=>renameColumn(col.id,title)}/><b>{list.length}</b></div>{!isFixed&&<div className="column-menu-wrap"><button className="icon-button" onClick={()=>setColumnMenu(current=>current===col.id?null:col.id)} aria-label={`Opciones de ${col.title}`} aria-expanded={columnMenu===col.id}><DotsThree size={22}/></button>{columnMenu===col.id&&<div className="column-menu"><button onClick={()=>deleteColumn(col.id)}><Trash size={16}/> Eliminar columna</button></div>}</div>}</header>
      <div className="task-list">{list.map(t=><TaskCard key={t.id} task={t} onEdit={openTask} onComplete={complete} onDeprecate={deprecate} onDragStart={(e,id)=>{e.stopPropagation();e.dataTransfer.setData('text/task',id)}}/>)}
      <button className="add-card" onClick={()=>openTask(null,col.id)}><Plus size={18}/> Añadir tarea</button></div></section>})}
      <section className="add-column" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const draggedColumn=event.dataTransfer.getData('text/column');if(draggedColumn)reorderColumn(draggedColumn,null)}}>{newColumn?<form onSubmit={e=>{e.preventDefault();const v=e.currentTarget.elements.title.value.trim();if(v){setColumns(c=>[...c,{id:`column-${Date.now()}`,title:v.toUpperCase(),color:'#65dcd5'}]);setNewColumn(false)}}}><input name="title" autoFocus placeholder="Nombre de la columna"/><button className="primary">Añadir</button><button type="button" className="icon-button" onClick={()=>setNewColumn(false)}><X size={20}/></button></form>:<button onClick={()=>setNewColumn(true)}><Plus size={18}/> Añadir columna</button>}</section>
    </div></div>;
}

function Reports({ tasks }) {
  const [month,setMonth]=useState(6), [year,setYear]=useState(2026);
  const inPeriod=(date)=>date&&new Date(`${date}T12:00:00`).getMonth()===month&&new Date(`${date}T12:00:00`).getFullYear()===year;
  const completed=tasks.filter(t=>t.status==='completed'&&inPeriod(t.completedAt)).length;
  const deprecated=tasks.filter(t=>t.status==='deprecated'&&inPeriod(t.deprecatedAt)).length;
  const pending=tasks.filter(t=>t.status==='active'&&inPeriod(t.due)).length;
  const periodTasks=tasks.filter(t=>inPeriod(t.status==='completed'?t.completedAt:t.status==='deprecated'?t.deprecatedAt:t.due));
  const effortAverage=periodTasks.length?periodTasks.reduce((sum,task)=>sum+(Number(task.effort)||3),0)/periodTasks.length:0;
  const effortCounts=[1,2,3,4,5].map(level=>({level,count:periodTasks.filter(task=>(Number(task.effort)||3)===level).length}));
  const maxEffortCount=Math.max(...effortCounts.map(item=>item.count),1);
  const total=Math.max(completed+deprecated+pending,1);
  const data=[{label:'Terminadas',value:completed,color:'#321e48',icon:Check},{label:'Deprecadas',value:deprecated,color:'#43637e',icon:Archive},{label:'Pendientes',value:pending,color:'#65dcd5',icon:ClipboardText}];
  return <div className="reports"><div className="reports-header"><div><p className="eyebrow">RESUMEN DE ACTIVIDAD</p><h1>Reportes</h1><p className="subtitle">Una vista clara de tu ritmo de trabajo.</p></div><div className="filters"><select value={month} onChange={e=>setMonth(Number(e.target.value))}>{months.map((m,i)=><option key={m} value={i}>{m[0].toUpperCase()+m.slice(1)}</option>)}</select><select value={year} onChange={e=>setYear(Number(e.target.value))}>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select></div></div>
    <div className="report-cards">{data.map(d=><article key={d.label}><div className="metric-icon" style={{color:d.color,background:`${d.color}14`}}><d.icon size={22}/></div><span>{d.label}</span><strong>{d.value}</strong><small>{Math.round(d.value/total*100)}% del total del mes</small></article>)}</div>
    <section className="effort-panel"><div className="effort-summary"><div className="metric-icon"><Lightning size={22}/></div><div><p className="eyebrow">NIVEL DE ESFUERZO</p><h2>{effortAverage?effortAverage.toFixed(1):'—'}<span> / 5 promedio</span></h2><p>{periodTasks.length} {periodTasks.length===1?'tarea considerada':'tareas consideradas'} en el período</p></div></div><div className="effort-bars">{effortCounts.map(item=><div key={item.level}><span>{item.level}</span><div><i style={{width:`${item.count/maxEffortCount*100}%`}}></i></div><b>{item.count}</b></div>)}</div></section>
    <section className="report-panel"><div><p className="eyebrow">DISTRIBUCIÓN</p><h2>Estado de las tareas</h2><p>Actividad en {months[month]} de {year}</p></div><div className="chart-area"><div className="donut" style={{background:`conic-gradient(#321e48 0 ${completed/total*100}%, #43637e ${completed/total*100}% ${(completed+deprecated)/total*100}%, #65dcd5 ${(completed+deprecated)/total*100}% 100%)`}}><div><strong>{completed+deprecated+pending}</strong><span>Tareas</span></div></div><div className="legend">{data.map(d=><div key={d.label}><span style={{background:d.color}}></span><p>{d.label}<b>{d.value}</b></p></div>)}</div></div></section>
  </div>;
}

function Today({ tasks, setTasks, openTask }) {
  const today = '2026-07-14';
  const list = tasks.filter(task => task.due === today && task.status !== 'deprecated');
  const complete = task => setTasks(items => items.map(item => item.id === task.id
    ? { ...item, columnId: 'done', status: 'completed', completedAt: today }
    : item));

  return <div className="today-view">
    <div className="today-header">
      <div><p className="eyebrow">MARTES, 14 DE JULIO</p><h1>Hoy</h1><p className="subtitle">Todo lo que necesita tu atención hoy.</p></div>
      <button className="primary" onClick={() => openTask(null)}><Plus size={18} weight="bold"/> Nueva tarea</button>
    </div>
    <section className="today-panel">
      <header><div><h2>Tareas para hoy</h2><span>{list.length} {list.length === 1 ? 'tarea' : 'tareas'}</span></div><CalendarBlank size={21}/></header>
      <div className="today-list">{list.length ? list.map(task => <article className="today-row" key={task.id} onClick={() => openTask(task)}>
        <button className={`today-check ${task.status === 'completed' ? 'checked' : ''}`} onClick={event => { event.stopPropagation(); complete(task); }} aria-label={`Completar ${task.title}`}>{task.status === 'completed' && <Check size={14} weight="bold"/>}</button>
        <div className="today-copy"><h3>{task.title}</h3><p>{task.description}</p></div>
        <span className={`today-status ${task.status}`}>{task.status === 'completed' ? 'Terminada' : task.columnId === 'doing' ? 'En curso' : 'Pendiente'}</span>
        <span className="today-date"><CalendarBlank size={15}/> Hoy</span>
        <DotsThree size={22} className="today-more"/>
      </article>) : <div className="today-empty"><CalendarBlank size={32}/><h3>No hay tareas para hoy</h3><p>Disfruta el espacio o prepara tu próxima prioridad.</p></div>}</div>
    </section>
  </div>;
}

export function App() {
  const [page,setPage]=useState('board');
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [boardTitle,setBoardTitle]=useState(()=>localStorage.getItem('td-board-title')||'Mi tablero');
  const [columns,setColumns]=useState(()=>{const saved=JSON.parse(localStorage.getItem('td-columns')||'null')||initialColumns;return saved.map(column=>({...column,color:columnPalette[column.id]||(column.color==='#7c6ee6'?'#65dcd5':column.color)}))});
  const [tasks,setTasks]=useState(()=>{const saved=JSON.parse(localStorage.getItem('td-tasks')||'null')||initialTasks;return saved.map(task=>({...task,start:task.start||task.due}))});
  const [editing,setEditing]=useState(null), [defaultColumn,setDefaultColumn]=useState(null), [modal,setModal]=useState(false);
  useEffect(()=>localStorage.setItem('td-columns',JSON.stringify(columns)),[columns]);
  useEffect(()=>localStorage.setItem('td-tasks',JSON.stringify(tasks)),[tasks]);
  useEffect(()=>localStorage.setItem('td-board-title',boardTitle),[boardTitle]);
  const pending=useMemo(()=>tasks.filter(t=>t.status==='active').length,[tasks]);
  const openTask=(task,columnId)=>{setEditing(task);setDefaultColumn(columnId);setModal(true)};
  const save=form=>{const taskForm={...form,effort:Number(form.effort)};if(editing)setTasks(ts=>ts.map(t=>t.id===editing.id?{...t,...taskForm}:t));else setTasks(ts=>[...ts,{...taskForm,id:Date.now(),status:form.columnId==='done'?'completed':'active',createdAt:'2026-07-14',completedAt:form.columnId==='done'?'2026-07-14':undefined}]);setModal(false)};
  return <div className={`app-shell ${sidebarCollapsed?'sidebar-collapsed':''}`}><aside><div className="account"><div className="avatar">RA</div><div><b>Ricardo Alfaro</b><span>Mi espacio personal</span></div><CaretDown size={16}/></div>
    <nav><button className={page==='board'?'active':''} onClick={()=>setPage('board')}><Kanban size={21}/><span>Mi tablero</span><b>{pending}</b></button><button className={page==='today'?'active':''} onClick={()=>setPage('today')}><CalendarBlank size={21}/><span>Hoy</span></button><button disabled title="Buscador aún no disponible"><MagnifyingGlass size={21}/><span>Buscador</span></button><button className={page==='reports'?'active':''} onClick={()=>setPage('reports')}><ChartBar size={21}/><span>Reportes</span></button></nav>
    <div className="sidebar-label">VISTAS</div><nav><button disabled title="Filtros y etiquetas aún no disponibles"><SlidersHorizontal size={21}/><span>Filtros y etiquetas</span></button><button disabled title="Vista de tareas deprecadas aún no disponible"><Archive size={21}/><span>Deprecadas</span><b>{tasks.filter(t=>t.status==='deprecated').length}</b></button></nav>
    <div className="aside-bottom"><button disabled title="Notificaciones aún no disponibles"><Bell size={20}/><span>Notificaciones</span></button><button onClick={()=>setSidebarCollapsed(value=>!value)} aria-label={sidebarCollapsed?'Expandir menú':'Contraer menú'} title={sidebarCollapsed?'Expandir menú':'Contraer menú'}>{sidebarCollapsed?<ArrowRight size={20}/>:<ArrowLeft size={20}/>}<span>{sidebarCollapsed?'Expandir menú':'Contraer menú'}</span></button></div>
  </aside><main>{page==='board'?<Board columns={columns} tasks={tasks} setTasks={setTasks} setColumns={setColumns} openTask={openTask} boardTitle={boardTitle} setBoardTitle={setBoardTitle}/>:page==='today'?<Today tasks={tasks} setTasks={setTasks} openTask={openTask}/>:<Reports tasks={tasks}/>}</main>
  {modal&&<Modal title={editing?'Editar tarea':'Nueva tarea'} onClose={()=>setModal(false)}><TaskForm task={editing} columns={columns} defaultColumn={defaultColumn} onSave={save} onClose={()=>setModal(false)}/>{editing&&<button className="delete-task" onClick={()=>{setTasks(ts=>ts.filter(t=>t.id!==editing.id));setModal(false)}}><Trash size={17}/> Eliminar definitivamente</button>}</Modal>}
  </div>;
}

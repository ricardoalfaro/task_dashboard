import { useEffect, useMemo, useState } from 'react';
import {
  Archive, ArrowLeft, ArrowRight, Bell, CalendarBlank, CaretDown, ChartBar,
  Check, ClipboardText, DotsThree, Kanban, MagnifyingGlass, Plus, Sidebar,
  SlidersHorizontal, Trash, X
} from '@phosphor-icons/react';

const initialColumns = [
  { id: 'todo', title: 'TO-DO', color: '#e7462e' },
  { id: 'doing', title: 'DOING', color: '#f5a524' },
  { id: 'done', title: 'DONE', color: '#3b9b73' },
];

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
  const [form, setForm] = useState(task || { title:'', description:'', due:'2026-07-14', columnId:defaultColumn || columns[0].id });
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  return <form onSubmit={e => { e.preventDefault(); if(form.title.trim()) onSave(form); }}>
    <label>Nombre de la tarea<input autoFocus required name="title" value={form.title} onChange={change} placeholder="¿Qué tienes que hacer?"/></label>
    <label>Descripción<textarea name="description" rows="4" value={form.description} onChange={change} placeholder="Añade contexto o próximos pasos"/></label>
    <div className="form-grid"><label>Fecha de entrega<input type="date" name="due" value={form.due} onChange={change}/></label>
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

function Board({ columns, tasks, setTasks, setColumns, openTask }) {
  const [newColumn, setNewColumn] = useState(false);
  const moveTask = (taskId, columnId) => setTasks(items=>items.map(t=>t.id===taskId?{...t,columnId,status:columnId==='done'?'completed':'active',completedAt:columnId==='done'?'2026-07-14':undefined}:t));
  const complete = task => setTasks(items=>items.map(t=>t.id===task.id?{...t,columnId:'done',status:'completed',completedAt:'2026-07-14'}:t));
  const deprecate = task => setTasks(items=>items.map(t=>t.id===task.id?{...t,status:'deprecated',deprecatedAt:'2026-07-14'}:t));
  return <div className="board-wrap"><div className="board-header"><div><p className="eyebrow">ESPACIO DE TRABAJO</p><h1>Mi tablero</h1><p className="subtitle">Organiza el trabajo de hoy y mantén el foco.</p></div><button className="primary add-top" onClick={()=>openTask(null)}><Plus size={18} weight="bold"/> Nueva tarea</button></div>
    <div className="board" role="list">{columns.map(col=>{const list=tasks.filter(t=>t.columnId===col.id&&t.status!=='deprecated'); return <section className="column" key={col.id} onDragOver={e=>e.preventDefault()} onDrop={e=>moveTask(Number(e.dataTransfer.getData('text/task')),col.id)}>
      <header className="column-header"><div className="column-title"><span style={{background:col.color}}></span><h2>{col.title}</h2><b>{list.length}</b></div><button className="icon-button"><DotsThree size={22}/></button></header>
      <div className="task-list">{list.map(t=><TaskCard key={t.id} task={t} onEdit={openTask} onComplete={complete} onDeprecate={deprecate} onDragStart={(e,id)=>e.dataTransfer.setData('text/task',id)}/>)}
      <button className="add-card" onClick={()=>openTask(null,col.id)}><Plus size={18}/> Añadir tarea</button></div></section>})}
      <section className="add-column">{newColumn?<form onSubmit={e=>{e.preventDefault();const v=e.currentTarget.elements.title.value.trim();if(v){setColumns(c=>[...c,{id:`column-${Date.now()}`,title:v.toUpperCase(),color:'#7c6ee6'}]);setNewColumn(false)}}}><input name="title" autoFocus placeholder="Nombre de la columna"/><button className="primary">Añadir</button><button type="button" className="icon-button" onClick={()=>setNewColumn(false)}><X size={20}/></button></form>:<button onClick={()=>setNewColumn(true)}><Plus size={18}/> Añadir columna</button>}</section>
    </div></div>;
}

function Reports({ tasks }) {
  const [month,setMonth]=useState(6), [year,setYear]=useState(2026);
  const inPeriod=(date)=>date&&new Date(`${date}T12:00:00`).getMonth()===month&&new Date(`${date}T12:00:00`).getFullYear()===year;
  const completed=tasks.filter(t=>t.status==='completed'&&inPeriod(t.completedAt)).length;
  const deprecated=tasks.filter(t=>t.status==='deprecated'&&inPeriod(t.deprecatedAt)).length;
  const pending=tasks.filter(t=>t.status==='active'&&inPeriod(t.due)).length;
  const total=Math.max(completed+deprecated+pending,1);
  const data=[{label:'Terminadas',value:completed,color:'#3b9b73',icon:Check},{label:'Deprecadas',value:deprecated,color:'#8d8a86',icon:Archive},{label:'Pendientes',value:pending,color:'#e7462e',icon:ClipboardText}];
  return <div className="reports"><div className="reports-header"><div><p className="eyebrow">RESUMEN DE ACTIVIDAD</p><h1>Reportes</h1><p className="subtitle">Una vista clara de tu ritmo de trabajo.</p></div><div className="filters"><select value={month} onChange={e=>setMonth(Number(e.target.value))}>{months.map((m,i)=><option key={m} value={i}>{m[0].toUpperCase()+m.slice(1)}</option>)}</select><select value={year} onChange={e=>setYear(Number(e.target.value))}>{[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}</select></div></div>
    <div className="report-cards">{data.map(d=><article key={d.label}><div className="metric-icon" style={{color:d.color,background:`${d.color}14`}}><d.icon size={22}/></div><span>{d.label}</span><strong>{d.value}</strong><small>{Math.round(d.value/total*100)}% del total del mes</small></article>)}</div>
    <section className="report-panel"><div><p className="eyebrow">DISTRIBUCIÓN</p><h2>Estado de las tareas</h2><p>Actividad en {months[month]} de {year}</p></div><div className="chart-area"><div className="donut" style={{background:`conic-gradient(#3b9b73 0 ${completed/total*100}%, #8d8a86 ${completed/total*100}% ${(completed+deprecated)/total*100}%, #e7462e ${(completed+deprecated)/total*100}% 100%)`}}><div><strong>{completed+deprecated+pending}</strong><span>Tareas</span></div></div><div className="legend">{data.map(d=><div key={d.label}><span style={{background:d.color}}></span><p>{d.label}<b>{d.value}</b></p></div>)}</div></div></section>
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
  const [columns,setColumns]=useState(()=>JSON.parse(localStorage.getItem('td-columns')||'null')||initialColumns);
  const [tasks,setTasks]=useState(()=>JSON.parse(localStorage.getItem('td-tasks')||'null')||initialTasks);
  const [editing,setEditing]=useState(null), [defaultColumn,setDefaultColumn]=useState(null), [modal,setModal]=useState(false);
  useEffect(()=>localStorage.setItem('td-columns',JSON.stringify(columns)),[columns]);
  useEffect(()=>localStorage.setItem('td-tasks',JSON.stringify(tasks)),[tasks]);
  const pending=useMemo(()=>tasks.filter(t=>t.status==='active').length,[tasks]);
  const openTask=(task,columnId)=>{setEditing(task);setDefaultColumn(columnId);setModal(true)};
  const save=form=>{if(editing)setTasks(ts=>ts.map(t=>t.id===editing.id?{...t,...form}:t));else setTasks(ts=>[...ts,{...form,id:Date.now(),status:form.columnId==='done'?'completed':'active',createdAt:'2026-07-14',completedAt:form.columnId==='done'?'2026-07-14':undefined}]);setModal(false)};
  return <div className="app-shell"><aside><div className="account"><div className="avatar">RA</div><div><b>Ricardo Alfaro</b><span>Mi espacio personal</span></div><CaretDown size={16}/></div>
    <button className="quick-add" onClick={()=>openTask(null)}><span><Plus size={19} weight="bold"/></span>Añadir tarea</button>
    <nav><button className={page==='board'?'active':''} onClick={()=>setPage('board')}><Kanban size={21}/><span>Mi tablero</span><b>{pending}</b></button><button className={page==='today'?'active':''} onClick={()=>setPage('today')}><CalendarBlank size={21}/><span>Hoy</span></button><button><MagnifyingGlass size={21}/><span>Buscador</span></button><button className={page==='reports'?'active':''} onClick={()=>setPage('reports')}><ChartBar size={21}/><span>Reportes</span></button></nav>
    <div className="sidebar-label">VISTAS</div><nav><button><SlidersHorizontal size={21}/><span>Filtros y etiquetas</span></button><button><Archive size={21}/><span>Deprecadas</span><b>{tasks.filter(t=>t.status==='deprecated').length}</b></button></nav>
    <div className="aside-bottom"><button><Bell size={20}/><span>Notificaciones</span></button><button><Sidebar size={20}/><span>Contraer menú</span></button></div>
  </aside><main>{page==='board'?<Board columns={columns} tasks={tasks} setTasks={setTasks} setColumns={setColumns} openTask={openTask}/>:page==='today'?<Today tasks={tasks} setTasks={setTasks} openTask={openTask}/>:<Reports tasks={tasks}/>}</main>
  {modal&&<Modal title={editing?'Editar tarea':'Nueva tarea'} onClose={()=>setModal(false)}><TaskForm task={editing} columns={columns} defaultColumn={defaultColumn} onSave={save} onClose={()=>setModal(false)}/>{editing&&<button className="delete-task" onClick={()=>{setTasks(ts=>ts.filter(t=>t.id!==editing.id));setModal(false)}}><Trash size={17}/> Eliminar definitivamente</button>}</Modal>}
  </div>;
}

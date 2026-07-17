import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Calendar as CalendarBlank, Reports as ChartBar, Check, TaskList as ClipboardText,
  MoreHoriz as DotsThree, KanbanBoard as Kanban, Search as MagnifyingGlass,
  Plus, Flash as Lightning, FilterList as SlidersHorizontal, Trash, Xmark as X,
  SidebarCollapse, SidebarExpand, TableRows, Settings, ShareAndroid,
  Computer, HalfMoon, SunLight
} from 'iconoir-react';

const initialColumns = [
  { id: 'todo', title: 'TO-DO', color: '#f5cbcb' },
  { id: 'doing', title: 'DOING', color: '#ffe2e2' },
  { id: 'done', title: 'DONE', color: '#c5b3d3' },
];
const columnPalette = { todo:'#f5cbcb', doing:'#ffe2e2', done:'#c5b3d3' };

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
const toISODate = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const parseISODate = value => new Date(`${value}T12:00:00`);
const addDays = (date,days) => {const next=new Date(date);next.setDate(next.getDate()+days);return next};
const getPeriodRange = (type,anchorValue) => {
  const anchor=parseISODate(anchorValue);
  let start=new Date(anchor), end=new Date(anchor);
  if(type==='week'){const offset=(anchor.getDay()+6)%7;start=addDays(anchor,-offset);end=addDays(start,6)}
  if(type==='month'){start=new Date(anchor.getFullYear(),anchor.getMonth(),1,12);end=new Date(anchor.getFullYear(),anchor.getMonth()+1,0,12)}
  if(type==='quarter'){const firstMonth=Math.floor(anchor.getMonth()/3)*3;start=new Date(anchor.getFullYear(),firstMonth,1,12);end=new Date(anchor.getFullYear(),firstMonth+3,0,12)}
  return {start:toISODate(start),end:toISODate(end)};
};
const formatPeriodDate = value => {const date=parseISODate(value);return `${date.getDate()} ${shortMonths[date.getMonth()]} ${date.getFullYear()}`};

function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" onMouseDown={e => e.stopPropagation()}>
    <header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X width={20} height={20}/></button></header>
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
    <div className="task-top"><button className="check-button" onClick={e=>{e.stopPropagation();onComplete(task)}} aria-label="Completar tarea">{task.status==='completed'&&<Check width={14} height={14} strokeWidth={2.2}/>}</button>
      <button className="more" onClick={e=>{e.stopPropagation();onDeprecate(task)}} title="Deprecar tarea"><DotsThree width={22} height={22}/></button></div>
    <h3>{task.title}</h3><p>{task.description}</p>
    <div className={`due ${overdue?'overdue':''}`}><CalendarBlank width={16} height={16}/><span>{overdue?'Venció ':''}{fmt(task.due)}</span></div>
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
  return <div className="board-wrap"><div className="board-header"><div><p className="eyebrow">ESPACIO DE TRABAJO</p><EditableBoardTitle value={boardTitle} onChange={setBoardTitle}/><p className="subtitle">Organiza el trabajo de hoy y mantén el foco.</p></div><button className="primary add-top" onClick={()=>openTask(null)}><Plus width={18} height={18} strokeWidth={2.2}/> Nueva tarea</button></div>
    <div className="board" role="list">{columns.map(col=>{const list=tasks.filter(t=>t.columnId===col.id&&t.status!=='deprecated');const isFixed=fixedColumnIds.includes(col.id);return <section className={`column ${isFixed?'fixed-column':'custom-column'}`} key={col.id} draggable={!isFixed} onDragStart={event=>{if(!isFixed)event.dataTransfer.setData('text/column',col.id)}} onDragOver={e=>e.preventDefault()} onDrop={event=>handleColumnDrop(event,col.id)}>
      <header className="column-header"><div className="column-title"><span style={{background:col.color}}></span><EditableColumnTitle value={col.title} onChange={title=>renameColumn(col.id,title)}/><b>{list.length}</b></div>{!isFixed&&<div className="column-menu-wrap"><button className="icon-button" onClick={()=>setColumnMenu(current=>current===col.id?null:col.id)} aria-label={`Opciones de ${col.title}`} aria-expanded={columnMenu===col.id}><DotsThree width={22} height={22}/></button>{columnMenu===col.id&&<div className="column-menu"><button onClick={()=>deleteColumn(col.id)}><Trash width={16} height={16}/> Eliminar columna</button></div>}</div>}</header>
      <div className="task-list">{list.map(t=><TaskCard key={t.id} task={t} onEdit={openTask} onComplete={complete} onDeprecate={deprecate} onDragStart={(e,id)=>{e.stopPropagation();e.dataTransfer.setData('text/task',id)}}/>)}
      <button className="add-card" onClick={()=>openTask(null,col.id)}><Plus width={18} height={18}/> Añadir tarea</button></div></section>})}
      <section className="add-column" onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const draggedColumn=event.dataTransfer.getData('text/column');if(draggedColumn)reorderColumn(draggedColumn,null)}}>{newColumn?<form onSubmit={e=>{e.preventDefault();const v=e.currentTarget.elements.title.value.trim();if(v){setColumns(c=>[...c,{id:`column-${Date.now()}`,title:v.toUpperCase(),color:'#c5b3d3'}]);setNewColumn(false)}}}><input name="title" autoFocus placeholder="Nombre de la columna"/><button className="primary">Añadir</button><button type="button" className="icon-button" onClick={()=>setNewColumn(false)}><X width={20} height={20}/></button></form>:<button onClick={()=>setNewColumn(true)}><Plus width={18} height={18}/> Añadir columna</button>}</section>
    </div></div>;
}

function Reports({ tasks, openTask }) {
  const [periodType,setPeriodType]=useState('month');
  const [anchorDate,setAnchorDate]=useState('2026-07-14');
  const [showCompleted,setShowCompleted]=useState(false);
  const range=useMemo(()=>getPeriodRange(periodType,anchorDate),[periodType,anchorDate]);
  const inPeriod=date=>date&&date.slice(0,10)>=range.start&&date.slice(0,10)<=range.end;
  const completedTasks=tasks.filter(task=>task.status==='completed'&&inPeriod(task.completedAt));
  const completed=completedTasks.length;
  const deprecated=tasks.filter(task=>task.status==='deprecated'&&inPeriod(task.deprecatedAt)).length;
  const pending=tasks.filter(task=>task.status==='active'&&inPeriod(task.due)).length;
  const periodTasks=tasks.filter(task=>inPeriod(task.status==='completed'?task.completedAt:task.status==='deprecated'?task.deprecatedAt:task.due));
  const effortAverage=periodTasks.length?periodTasks.reduce((sum,task)=>sum+(Number(task.effort)||3),0)/periodTasks.length:0;
  const effortCounts=[1,2,3,4,5].map(level=>({level,count:periodTasks.filter(task=>(Number(task.effort)||3)===level).length}));
  const maxEffortCount=Math.max(...effortCounts.map(item=>item.count),1);
  const total=Math.max(completed+deprecated+pending,1);
  const data=[{label:'Terminadas',value:completed,color:'#735a78',icon:Check},{label:'Deprecadas',value:deprecated,color:'#c5b3d3',icon:Archive},{label:'Pendientes',value:pending,color:'#f5cbcb',icon:ClipboardText}];
  const anchor=parseISODate(anchorDate);
  const quarter=Math.floor(anchor.getMonth()/3)+1;
  const years=[2024,2025,2026,2027];
  const periodLabel=range.start===range.end?formatPeriodDate(range.start):`${formatPeriodDate(range.start)} — ${formatPeriodDate(range.end)}`;
  const setQuarter=value=>setAnchorDate(`${anchor.getFullYear()}-${String((Number(value)-1)*3+1).padStart(2,'0')}-01`);
  const setPeriodYear=value=>setAnchorDate(`${value}-${String(anchor.getMonth()+1).padStart(2,'0')}-01`);
  return <div className="reports"><div className="reports-header"><div><p className="eyebrow">RESUMEN DE ACTIVIDAD</p><h1>Reportes</h1><p className="subtitle">Una vista clara de tu ritmo de trabajo.</p></div><div className="reports-controls"><button className="share-report" disabled title="Compartir reporte mediante una URL privada, próximamente"><ShareAndroid width={18} height={18}/> Compartir</button><div className="period-controls"><select aria-label="Tipo de período" value={periodType} onChange={event=>setPeriodType(event.target.value)}><option value="day">Día</option><option value="week">Semana</option><option value="month">Mes</option><option value="quarter">Trimestre</option></select>{periodType==='day'&&<input aria-label="Día del reporte" type="date" value={anchorDate} onChange={event=>setAnchorDate(event.target.value)}/>} {periodType==='week'&&<input aria-label="Día dentro de la semana" type="date" value={anchorDate} onChange={event=>setAnchorDate(event.target.value)}/>} {periodType==='month'&&<input aria-label="Mes del reporte" type="month" value={anchorDate.slice(0,7)} onChange={event=>setAnchorDate(`${event.target.value}-01`)}/>} {periodType==='quarter'&&<><select aria-label="Trimestre" value={quarter} onChange={event=>setQuarter(event.target.value)}>{[1,2,3,4].map(value=><option key={value} value={value}>Q{value}</option>)}</select><select aria-label="Año" value={anchor.getFullYear()} onChange={event=>setPeriodYear(event.target.value)}>{years.map(year=><option key={year}>{year}</option>)}</select></>}</div><p className="active-period">{periodLabel}</p></div></div>
    <div className="report-cards">{data.map(item=><article className={item.label==='Terminadas'?'report-card-action':''} key={item.label} onClick={item.label==='Terminadas'?()=>setShowCompleted(value=>!value):undefined} onKeyDown={item.label==='Terminadas'?event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setShowCompleted(value=>!value)}}:undefined} role={item.label==='Terminadas'?'button':undefined} tabIndex={item.label==='Terminadas'?0:undefined} aria-expanded={item.label==='Terminadas'?showCompleted:undefined}><div className="metric-icon" style={{color:item.color,background:`${item.color}14`}}><item.icon width={22} height={22}/></div><span>{item.label}</span><strong>{item.value}</strong><small>{item.label==='Terminadas'?'Ver tareas · ':''}{Math.round(item.value/total*100)}% del total del período</small></article>)}</div>
    {showCompleted&&<section className="completed-report"><header><div><p className="eyebrow">DETALLE DEL PERÍODO</p><h2>Tareas terminadas</h2></div><span>{completedTasks.length}</span></header><div>{completedTasks.length?completedTasks.map(task=><button key={task.id} onClick={()=>openTask(task)}><div><b>{task.title}</b><p>{task.description||'Sin descripción'}</p></div><span><Check width={15} height={15}/> {formatPeriodDate(task.completedAt.slice(0,10))}</span></button>):<div className="completed-empty">No hay tareas terminadas en este período.</div>}</div></section>}
    <section className="effort-panel"><div className="effort-summary"><div className="metric-icon"><Lightning width={22} height={22}/></div><div><p className="eyebrow">NIVEL DE ESFUERZO</p><h2>{effortAverage?effortAverage.toFixed(1):'—'}<span> / 5 promedio</span></h2><p>{periodTasks.length} {periodTasks.length===1?'tarea considerada':'tareas consideradas'} en el período</p></div></div><div className="effort-bars">{effortCounts.map(item=><div key={item.level}><span>{item.level}</span><div><i style={{width:`${item.count/maxEffortCount*100}%`}}></i></div><b>{item.count}</b></div>)}</div></section>
    <section className="report-panel"><div><p className="eyebrow">DISTRIBUCIÓN</p><h2>Estado de las tareas</h2><p>Actividad del {periodLabel}</p></div><div className="chart-area"><div className="donut" style={{background:`conic-gradient(#735a78 0 ${completed/total*100}%, #c5b3d3 ${completed/total*100}% ${(completed+deprecated)/total*100}%, #f5cbcb ${(completed+deprecated)/total*100}% 100%)`}}><div><strong>{completed+deprecated+pending}</strong><span>Tareas</span></div></div><div className="legend">{data.map(item=><div key={item.label}><span style={{background:item.color}}></span><p>{item.label}<b>{item.value}</b></p></div>)}</div></div></section>
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
      <button className="primary" onClick={() => openTask(null)}><Plus width={18} height={18} strokeWidth={2.2}/> Nueva tarea</button>
    </div>
    <section className="today-panel">
      <header><div><h2>Tareas para hoy</h2><span>{list.length} {list.length === 1 ? 'tarea' : 'tareas'}</span></div><CalendarBlank width={21} height={21}/></header>
      <div className="today-list">{list.length ? list.map(task => <article className="today-row" key={task.id} onClick={() => openTask(task)}>
        <button className={`today-check ${task.status === 'completed' ? 'checked' : ''}`} onClick={event => { event.stopPropagation(); complete(task); }} aria-label={`Completar ${task.title}`}>{task.status === 'completed' && <Check width={14} height={14} strokeWidth={2.2}/>}</button>
        <div className="today-copy"><h3>{task.title}</h3><p>{task.description}</p></div>
        <span className={`today-status ${task.status}`}>{task.status === 'completed' ? 'Terminada' : task.columnId === 'doing' ? 'En curso' : 'Pendiente'}</span>
        <span className="today-date"><CalendarBlank width={15} height={15}/> Hoy</span>
        <DotsThree width={22} height={22} className="today-more"/>
      </article>) : <div className="today-empty"><CalendarBlank width={32} height={32}/><h3>No hay tareas para hoy</h3><p>Disfruta el espacio o prepara tu próxima prioridad.</p></div>}</div>
    </section>
  </div>;
}

export function App() {
  const [page,setPage]=useState('board');
  const [sidebarCollapsed,setSidebarCollapsed]=useState(true);
  const [theme,setTheme]=useState(()=>localStorage.getItem('td-theme')||'system');
  const [boardTitle,setBoardTitle]=useState(()=>localStorage.getItem('td-board-title')||'Mi tablero');
  const [columns,setColumns]=useState(()=>{const saved=JSON.parse(localStorage.getItem('td-columns')||'null')||initialColumns;return saved.map(column=>({...column,color:columnPalette[column.id]||(['#7c6ee6','#65dcd5'].includes(column.color)?'#c5b3d3':column.color)}))});
  const [tasks,setTasks]=useState(()=>{const saved=JSON.parse(localStorage.getItem('td-tasks')||'null')||initialTasks;return saved.map(task=>({...task,start:task.start||task.due}))});
  const [editing,setEditing]=useState(null), [defaultColumn,setDefaultColumn]=useState(null), [modal,setModal]=useState(false);
  useEffect(()=>localStorage.setItem('td-columns',JSON.stringify(columns)),[columns]);
  useEffect(()=>localStorage.setItem('td-tasks',JSON.stringify(tasks)),[tasks]);
  useEffect(()=>localStorage.setItem('td-board-title',boardTitle),[boardTitle]);
  useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const applyTheme=()=>{document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme};applyTheme();localStorage.setItem('td-theme',theme);media.addEventListener('change',applyTheme);return()=>media.removeEventListener('change',applyTheme)},[theme]);
  const pending=useMemo(()=>tasks.filter(t=>t.status==='active').length,[tasks]);
  const openTask=(task,columnId)=>{setEditing(task);setDefaultColumn(columnId);setModal(true)};
  const save=form=>{const taskForm={...form,effort:Number(form.effort)};if(editing)setTasks(ts=>ts.map(t=>t.id===editing.id?{...t,...taskForm}:t));else setTasks(ts=>[...ts,{...taskForm,id:Date.now(),status:form.columnId==='done'?'completed':'active',createdAt:'2026-07-14',completedAt:form.columnId==='done'?'2026-07-14':undefined}]);setModal(false)};
  const themeOptions=['system','light','dark'];
  const cycleTheme=()=>setTheme(current=>themeOptions[(themeOptions.indexOf(current)+1)%themeOptions.length]);
  const ThemeIcon=theme==='system'?Computer:theme==='light'?SunLight:HalfMoon;
  const themeLabel=theme==='system'?'Tema del sistema':theme==='light'?'Tema claro':'Tema oscuro';
  return <div className={`app-shell ${sidebarCollapsed?'sidebar-collapsed':''}`}><aside><div className="account"><label className="sidebar-search"><MagnifyingGlass width={18} height={18}/><input disabled type="search" placeholder="Buscar" aria-label="Buscar, aún no disponible"/></label><button className="account-sidebar-toggle" onClick={()=>setSidebarCollapsed(value=>!value)} aria-label={sidebarCollapsed?'Expandir menú':'Contraer menú'} title={sidebarCollapsed?'Expandir menú':'Contraer menú'}>{sidebarCollapsed?<SidebarExpand width={20} height={20}/>:<SidebarCollapse width={20} height={20}/>}</button></div>
    <div className="sidebar-label">VISTAS</div><nav><button className={page==='board'?'active':''} onClick={()=>setPage('board')}><Kanban width={21} height={21}/><span>Tablero</span><b>{pending}</b></button><button disabled title="Vista semanal de Línea de tiempo, próximamente"><TableRows width={21} height={21}/><span>Semana</span></button><button className={page==='today'?'active':''} onClick={()=>setPage('today')}><CalendarBlank width={21} height={21}/><span>Hoy</span></button></nav>
    <div className="sidebar-label">OPCIONES</div><nav><button className={page==='reports'?'active':''} onClick={()=>setPage('reports')}><ChartBar width={21} height={21}/><span>Reportes</span></button><button disabled title="Filtros aún no disponibles"><SlidersHorizontal width={21} height={21}/><span>Filtros</span></button><button disabled title="Archivo de tareas, próximamente"><Archive width={21} height={21}/><span>Archivo</span><b>{tasks.filter(t=>t.status==='deprecated').length}</b></button></nav>
    <div className="aside-bottom"><button className="theme-toggle" onClick={cycleTheme} title={`${themeLabel}. Cambiar apariencia`} aria-label={`${themeLabel}. Cambiar apariencia`}><ThemeIcon width={20} height={20}/><span>{themeLabel}</span></button><button disabled title="Configuración aún no disponible"><Settings width={20} height={20}/><span>Configuración</span></button></div>
  </aside><main>{page==='board'?<Board columns={columns} tasks={tasks} setTasks={setTasks} setColumns={setColumns} openTask={openTask} boardTitle={boardTitle} setBoardTitle={setBoardTitle}/>:page==='today'?<Today tasks={tasks} setTasks={setTasks} openTask={openTask}/>:<Reports tasks={tasks} openTask={openTask}/>}</main>
  {modal&&<Modal title={editing?'Editar tarea':'Nueva tarea'} onClose={()=>setModal(false)}><TaskForm task={editing} columns={columns} defaultColumn={defaultColumn} onSave={save} onClose={()=>setModal(false)}/>{editing&&<button className="delete-task" onClick={()=>{setTasks(ts=>ts.filter(t=>t.id!==editing.id));setModal(false)}}><Trash width={17} height={17}/> Eliminar definitivamente</button>}</Modal>}
  </div>;
}

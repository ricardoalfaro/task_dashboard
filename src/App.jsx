import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  Calendar as CalendarBlank, Reports as ChartBar, Check, TaskList as ClipboardText,
  MoreHoriz as DotsThree, KanbanBoard as Kanban, Search as MagnifyingGlass,
  Plus, Flash as Lightning, FilterList as SlidersHorizontal, Trash, Xmark as X,
  SidebarCollapse, SidebarExpand, TableRows, Settings, ShareAndroid,
  Computer, HalfMoon, SunLight, NavArrowLeft, NavArrowRight, LogOut
} from 'iconoir-react';
import { authRepository } from './data/authRepository.js';
import { dashboardRepository } from './data/dashboardRepository.js';
import { hasCompletedLocalMigration, migrateLocalDashboard } from './data/localMigration.js';
import { supabaseConfig } from './lib/supabase.js';

const initialColumns = [
  { id: 'todo', title: 'TO-DO', color: '#00a8e8' },
  { id: 'doing', title: 'DOING', color: '#007ea7' },
  { id: 'done', title: 'DONE', color: '#003459' },
];
const columnPalette = { todo:'#00a8e8', doing:'#007ea7', done:'#003459' };

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
const differenceInDays = (from,to) => Math.round((parseISODate(to)-parseISODate(from))/86400000);

function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" onMouseDown={e => e.stopPropagation()}>
    <header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X width={20} height={20}/></button></header>
    {children}
  </section></div>;
}

function AuthScreen({ onSignedIn }) {
  const [form,setForm]=useState({email:'',password:''});
  const [error,setError]=useState('');
  const [submitting,setSubmitting]=useState(false);
  const submit=async event=>{event.preventDefault();setSubmitting(true);setError('');try{await authRepository.signIn(form.email,form.password);onSignedIn?.()}catch(reason){setError(reason.message)}finally{setSubmitting(false)}};
  return <main className="auth-view"><section className="auth-card"><div className="auth-mark"><Kanban width={25} height={25}/></div><p className="eyebrow">WORKSPACE TASK DASHBOARD</p><h1>Ingresa a tu espacio</h1><p>Accede al tablero o al reporte que Ricardo compartió contigo.</p><form onSubmit={submit}><label>Correo<input autoFocus required type="email" autoComplete="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})}/></label><label>Contraseña<input required type="password" autoComplete="current-password" value={form.password} onChange={event=>setForm({...form,password:event.target.value})}/></label>{error&&<p className="auth-error" role="alert">{error}</p>}<button className="primary" disabled={submitting}>{submitting?'Ingresando…':'Ingresar'}</button></form></section></main>;
}

function ReadOnlyTask({ task, columnTitle }) {
  return <div className="readonly-task"><span className={`today-status ${task.status}`}>{task.status==='completed'?'Terminada':task.status==='deprecated'?'Archivada':'Activa'}</span><h3>{task.title}</h3><p>{task.description||'Sin descripción.'}</p>{task.notes&&<p>{task.notes}</p>}{task.link&&<p><a href={task.link} target="_blank" rel="noreferrer">Abrir enlace relacionado</a></p>}<dl><div><dt>Inicio</dt><dd>{formatPeriodDate(task.start||task.due)}</dd></div><div><dt>Fin</dt><dd>{formatPeriodDate(task.due)}</dd></div><div><dt>Esfuerzo</dt><dd>{task.effort||3} de 5</dd></div><div><dt>Estado</dt><dd>{columnTitle||'Sin estado'}</dd></div></dl></div>;
}

function AccessSettings() {
  const [members,setMembers]=useState([]);
  const [form,setForm]=useState({email:'',password:'',role:'viewer'});
  const [state,setState]=useState({loading:true,error:''});
  const load=async()=>{setState({loading:true,error:''});try{setMembers(await authRepository.listMembers(supabaseConfig.boardId));setState({loading:false,error:''})}catch(error){setState({loading:false,error:error.message})}};
  useEffect(()=>{load()},[]);
  const save=async event=>{event.preventDefault();setState(current=>({...current,error:''}));try{await authRepository.setMemberAccess(supabaseConfig.boardId,form);setForm({email:'',password:'',role:'viewer'});await load()}catch(error){setState({loading:false,error:error.message})}};
  const revoke=async userId=>{setState(current=>({...current,error:''}));try{await authRepository.revokeMember(supabaseConfig.boardId,userId);await load()}catch(error){setState({loading:false,error:error.message})}};
  return <div className="settings-view"><header><p className="eyebrow">CONFIGURACIÓN</p><h1>Acceso al reporte</h1><p className="subtitle">Administra quién puede consultar el seguimiento externo.</p></header><section className="settings-panel"><div><h2>Agregar acceso</h2><p>Crea o actualiza una cuenta mediante su correo. La contraseña se envía directamente a Supabase Auth y no queda guardada en el dashboard.</p><form onSubmit={save}><label>Correo<input required type="email" autoComplete="off" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="supervisor@empresa.com"/></label><label>Contraseña temporal<input type="password" minLength="8" autoComplete="new-password" value={form.password} onChange={event=>setForm({...form,password:event.target.value})} placeholder="Obligatoria solo para cuentas nuevas"/></label><label>Rol<select value={form.role} onChange={event=>setForm({...form,role:event.target.value})}><option value="viewer">Solo lectura</option><option value="owner">Propietario</option></select></label><button className="primary">Guardar acceso</button></form></div><div><div className="settings-members-title"><h2>Personas con acceso</h2><span>{members.length}</span></div>{state.error&&<p className="auth-error" role="alert">{state.error}</p>}{state.loading?<p className="settings-empty">Cargando accesos…</p>:members.length?<div className="member-list">{members.map(member=><article key={member.user_id}><div><b>{member.email}</b><span>{member.role==='viewer'?'Solo lectura':'Propietario'}</span></div><div><select aria-label={`Rol de ${member.email}`} value={member.role} onChange={event=>authRepository.setMemberRole(supabaseConfig.boardId,member,event.target.value).then(load).catch(error=>setState({loading:false,error:error.message}))}><option value="viewer">Viewer</option><option value="owner">Owner</option></select><button onClick={()=>revoke(member.user_id)} className="member-revoke"><Trash width={16} height={16}/> Revocar</button></div></article>)}</div>:<p className="settings-empty">Aún no hay supervisores agregados.</p>}</div></section></div>;
}

function TaskForm({ task, columns, defaultColumn, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    if(task) return {...task,start:task.start||task.due,effort:task.effort||3,notes:task.notes||'',link:task.link||''};
    const today=toISODate(new Date());
    return {title:'',description:'',notes:'',link:'',start:today,due:today,columnId:defaultColumn||columns[0].id,effort:3};
  });
  const [dateError,setDateError]=useState('');
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  return <form onSubmit={e => { e.preventDefault(); if(form.start>form.due){setDateError('La fecha de inicio no puede ser posterior a la fecha de entrega.');return}setDateError('');if(form.title.trim()) onSave(form); }}>
    <label>Nombre de la tarea<input autoFocus required name="title" value={form.title} onChange={change} placeholder="¿Qué tienes que hacer?"/></label>
    <label>Descripción<textarea name="description" rows="4" value={form.description} onChange={change} placeholder="Añade contexto o próximos pasos"/></label>
    <label>Notas<textarea name="notes" rows="3" value={form.notes} onChange={change} placeholder="Agrega observaciones o información adicional"/></label>
    <label>Link<input type="url" name="link" value={form.link} onChange={change} placeholder="https://ejemplo.com/recurso"/></label>
    <label className="effort-field"><span>Nivel de esfuerzo <b>{form.effort}</b></span><input className="effort-range" type="range" name="effort" min="1" max="5" step="1" value={form.effort} onChange={change}/><span className="effort-scale"><small>1 · Bajo</small><small>5 · Alto</small></span></label>
    <div className="form-grid"><label>Fecha de inicio<input required type="date" name="start" value={form.start} max={form.due} onChange={change}/></label><label>Fecha de fin<input required type="date" name="due" value={form.due} min={form.start} onChange={change}/></label></div>
    {dateError&&<p className="form-error" role="alert">{dateError}</p>}
    <div className="form-grid form-grid-single">
    <label>Estado<select name="columnId" value={form.columnId} onChange={change}>{columns.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
    <footer className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary">{task ? 'Guardar cambios' : 'Crear tarea'}</button></footer>
  </form>;
}

function TaskCard({ task, onEdit, onArchive, onDragStart }) {
  const [menuOpen,setMenuOpen]=useState(false);
  const overdue = task.status === 'active' && task.due < toISODate(new Date());
  const confirmArchive=event=>{event.stopPropagation();setMenuOpen(false);if(window.confirm(`¿Archivar “${task.title}”? Podrás recuperarla desde Archivo.`))onArchive(task)};
  return <article className={`task-card ${task.status}`} draggable onDragStart={e=>onDragStart(e, task.id)} onClick={()=>onEdit(task)}>
    <div className="task-top"><div className="task-menu-wrap"><button className="more" onClick={event=>{event.stopPropagation();setMenuOpen(value=>!value)}} aria-label={`Opciones de ${task.title}`} aria-expanded={menuOpen}><DotsThree width={22} height={22}/></button>{menuOpen&&<div className="task-menu"><button onClick={confirmArchive}><Archive width={16} height={16}/> Archivar</button></div>}</div></div>
    <h3>{task.title}</h3><p>{task.description}</p>
    <div className={`due ${overdue?'overdue':''}`}><CalendarBlank width={16} height={16}/><span>{overdue?'Venció ':''}{fmt(task.due)}</span></div>
  </article>;
}

function EditableColumnTitle({ value, onChange }) {
  const [editingTitle,setEditingTitle]=useState(false);
  const [draft,setDraft]=useState(value);
  const startEditing=()=>{setDraft(value);setEditingTitle(true)};
  const save=()=>{const next=draft.trim().toUpperCase();if(next)onChange(next);setEditingTitle(false)};
  if(editingTitle)return <input className="column-title-input" autoFocus value={draft} onChange={event=>setDraft(event.target.value.toUpperCase())} onClick={event=>event.stopPropagation()} onKeyDown={event=>{if(event.key==='Enter')save();if(event.key==='Escape')setEditingTitle(false)}} onBlur={()=>setEditingTitle(false)} aria-label="Nombre de la columna"/>;
  return <h2 className="editable-column-title" onDoubleClick={startEditing} tabIndex="0" onKeyDown={event=>{if(event.key==='Enter')startEditing()}} title="Haz doble clic para cambiar el nombre">{value}</h2>;
}

function Board({ columns, tasks, setTasks, setColumns, openTask, onViewTimeline }) {
  const [newColumn, setNewColumn] = useState(false);
  const [columnMenu,setColumnMenu]=useState(null);
  const fixedColumnIds=['todo','doing','done'];
  const todoColumnId=columns.find(column=>column.slug==='todo'||column.id==='todo')?.id;
  const doneColumnId=columns.find(column=>column.slug==='done'||column.id==='done')?.id;
  const isFixedColumn=column=>Boolean(column?.isFixed)||fixedColumnIds.includes(column?.id);
  const moveTask = (taskId, columnId) => setTasks(items=>items.map(t=>String(t.id)===String(taskId)?{...t,columnId,status:columnId===doneColumnId?'completed':'active',completedAt:columnId===doneColumnId?new Date().toISOString():undefined}:t));
  const archive = task => setTasks(items=>items.map(t=>t.id===task.id?{...t,status:'deprecated',deprecatedAt:new Date().toISOString()}:t));
  const renameColumn = (columnId,title) => setColumns(items=>items.map(column=>column.id===columnId?{...column,title}:column));
  const reorderColumn = (draggedId,targetId) => setColumns(items=>{if(draggedId===targetId||isFixedColumn(items.find(column=>column.id===draggedId)))return items;const dragged=items.find(column=>column.id===draggedId);if(!dragged)return items;const without=items.filter(column=>column.id!==draggedId);const targetIndex=without.findIndex(column=>column.id===targetId);without.splice(targetIndex<0?without.length:targetIndex,0,dragged);return without});
  const deleteColumn = columnId => {if(isFixedColumn(columns.find(column=>column.id===columnId)))return;setTasks(items=>items.map(task=>task.columnId===columnId?{...task,columnId:todoColumnId,status:'active',completedAt:undefined}:task));setColumns(items=>items.filter(column=>column.id!==columnId));setColumnMenu(null)};
  const handleColumnDrop = (event,columnId) => {event.preventDefault();event.stopPropagation();const draggedColumn=event.dataTransfer.getData('text/column');if(draggedColumn){reorderColumn(draggedColumn,columnId);return}const taskId=event.dataTransfer.getData('text/task');if(taskId)moveTask(taskId,columnId)};
  const overdueCount=tasks.filter(task=>task.status==='active'&&task.due<toISODate(new Date())).length;
  return <div className="board-wrap"><div className="board-header"><div><p className="eyebrow">RICARDO ALFARO</p><h1>Tablero de estado</h1><p className="subtitle">Organiza el trabajo de hoy y mantén el foco.</p></div><button className="primary add-top" onClick={()=>openTask(null)}><Plus width={18} height={18} strokeWidth={2.2}/> Nueva tarea</button></div>
    {overdueCount>0&&<div className="overdue-alert" role="status"><span>Tienes {overdueCount} {overdueCount===1?'tarea vencida':'tareas vencidas'}</span><button onClick={onViewTimeline}>Ver</button></div>}
    <div className="board" role="list">{columns.map(col=>{const list=tasks.filter(t=>t.columnId===col.id&&t.status!=='deprecated');const isFixed=isFixedColumn(col);return <section className={`column ${isFixed?'fixed-column':'custom-column'}`} key={col.id} draggable={!isFixed} onDragStart={event=>{if(!isFixed)event.dataTransfer.setData('text/column',col.id)}} onDragOver={e=>e.preventDefault()} onDrop={event=>handleColumnDrop(event,col.id)}>
      <header className="column-header"><div className="column-title"><span style={{background:col.color}}></span><EditableColumnTitle value={col.title} onChange={title=>renameColumn(col.id,title)}/><b>{list.length}</b></div>{!isFixed&&<div className="column-menu-wrap"><button className="icon-button" onClick={()=>setColumnMenu(current=>current===col.id?null:col.id)} aria-label={`Opciones de ${col.title}`} aria-expanded={columnMenu===col.id}><DotsThree width={22} height={22}/></button>{columnMenu===col.id&&<div className="column-menu"><button onClick={()=>deleteColumn(col.id)}><Trash width={16} height={16}/> Eliminar columna</button></div>}</div>}</header>
      <div className="task-list">{list.map(t=><TaskCard key={t.id} task={t} onEdit={openTask} onArchive={archive} onDragStart={(e,id)=>{e.stopPropagation();e.dataTransfer.setData('text/task',id)}}/>)}
      {col.id!==doneColumnId&&<button className="add-card" onClick={()=>openTask(null,col.id)}><Plus width={18} height={18}/> Añadir tarea</button>}</div></section>})}
      <section className={`add-column ${newColumn?'is-creating':''}`} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const draggedColumn=event.dataTransfer.getData('text/column');if(draggedColumn)reorderColumn(draggedColumn,null)}}>{newColumn?<form onSubmit={e=>{e.preventDefault();const v=e.currentTarget.elements.title.value.trim();if(v){setColumns(c=>[...c,{id:crypto.randomUUID(),slug:`column-${Date.now()}`,title:v.toUpperCase(),color:'#00a8e8',isFixed:false}]);setNewColumn(false)}}}><input name="title" autoFocus placeholder="NOMBRE DE LA COLUMNA" onChange={event=>{event.currentTarget.value=event.currentTarget.value.toUpperCase()}}/><div><button type="button" className="icon-button" onClick={()=>setNewColumn(false)} aria-label="Cancelar"><X width={20} height={20}/></button><button className="primary add-column-confirm" aria-label="Añadir columna"><Check width={20} height={20}/></button></div></form>:<button onClick={()=>setNewColumn(true)}><Plus width={18} height={18}/> Añadir columna</button>}</section>
    </div></div>;
}

function ArchiveView({ tasks, columns, setTasks, openTask }) {
  const archivedTasks=tasks.filter(task=>task.status==='deprecated');
  const todoColumnId=columns.find(column=>column.slug==='todo'||column.id==='todo')?.id||'todo';
  const restore=task=>setTasks(items=>items.map(item=>item.id===task.id?{...item,status:'active',columnId:todoColumnId,deprecatedAt:undefined,completedAt:undefined}:item));
  const deletePermanently=task=>{if(window.confirm(`¿Eliminar definitivamente “${task.title}”? Esta acción no se puede deshacer.`))setTasks(items=>items.filter(item=>item.id!==task.id))};
  return <div className="archive-view"><header><p className="eyebrow">RICARDO ALFARO</p><h1>Archivo</h1><p className="subtitle">Recupera tareas archivadas o elimínalas definitivamente.</p></header>{archivedTasks.length?<div className="archive-list">{archivedTasks.map(task=><article key={task.id}><div><h2>{task.title}</h2><p>{task.description||'Sin descripción'}</p><span>Archivada {task.deprecatedAt?new Date(task.deprecatedAt).toLocaleDateString('es-CL'):'recientemente'}</span></div><div><button className="secondary" onClick={()=>openTask(task)}>Ver detalle</button><button className="restore-task" onClick={()=>restore(task)}>Restaurar a TO-DO</button><button className="delete-archive-task" onClick={()=>deletePermanently(task)}><Trash width={16} height={16}/> Eliminar</button></div></article>)}</div>:<div className="archive-empty"><Archive width={32} height={32}/><h2>El archivo está vacío</h2><p>Las tareas que archives desde el tablero aparecerán aquí.</p></div>}</div>;
}

function Timeline({ tasks, columns, setTasks, openTask }) {
  const today=toISODate(new Date());
  const [anchorDate,setAnchorDate]=useState(today);
  const [dragTargetDay,setDragTargetDay]=useState(null);
  const wheelDistance=useRef(0);
  const wheelLocked=useRef(false);
  const wheelUnlockTimer=useRef(null);
  useEffect(()=>()=>window.clearTimeout(wheelUnlockTimer.current),[]);
  const range=useMemo(()=>getPeriodRange('week',anchorDate),[anchorDate]);
  const days=useMemo(()=>Array.from({length:7},(_,index)=>toISODate(addDays(parseISODate(range.start),index))),[range.start]);
  const visibleTasks=tasks.filter(task=>task.status!=='deprecated'&&(task.start||task.due)<=range.end&&task.due>=range.start).sort((a,b)=>(a.start||a.due).localeCompare(b.start||b.due)||b.due.localeCompare(a.due));
  const columnById=new Map(columns.map(column=>[column.id,column]));
  const taskStatusLabel=task=>{const title=columnById.get(task.columnId)?.title||'Sin estado';return title.charAt(0).toUpperCase()+title.slice(1).toLowerCase()};
  const isOverdueDoing=task=>{const column=columnById.get(task.columnId);return (column?.slug==='doing'||column?.id==='doing')&&task.status!=='completed'&&task.due<today};
  const timelineLanes=[];
  visibleTasks.forEach(task=>{
    const clippedStart=(task.start||task.due)>range.start?(task.start||task.due):range.start;
    const clippedEnd=task.due<range.end?task.due:range.end;
    let lane=timelineLanes.find(candidate=>candidate.end<clippedStart);
    if(!lane){lane={end:clippedEnd,tasks:[]};timelineLanes.push(lane)}
    lane.tasks.push(task);
    lane.end=clippedEnd;
  });
  const moveWeek=offset=>setAnchorDate(toISODate(addDays(parseISODate(anchorDate),offset*7)));
  const moveTaskByDays=(taskId,offset)=>setTasks(items=>items.map(task=>String(task.id)===String(taskId)?{...task,start:toISODate(addDays(parseISODate(task.start||task.due),offset)),due:toISODate(addDays(parseISODate(task.due),offset))}:task));
  const moveTaskToDay=(taskId,day)=>{const task=tasks.find(item=>String(item.id)===String(taskId));if(task)moveTaskByDays(taskId,differenceInDays(task.start||task.due,day))};
  const resizeTaskToDay=(taskId,day)=>setTasks(items=>items.map(task=>{if(String(task.id)!==String(taskId))return task;const start=task.start||task.due;return {...task,due:day<start?start:day}}));
  const dayFromPointer=(event,element)=>{const bounds=element.getBoundingClientRect();const index=Math.max(0,Math.min(6,Math.floor((event.clientX-bounds.left)/(bounds.width/7))));return days[index]};
  const dropTask=event=>{event.preventDefault();const day=dayFromPointer(event,event.currentTarget);const resizeTaskId=event.dataTransfer.getData('text/timeline-resize');const taskId=event.dataTransfer.getData('text/timeline-task');if(resizeTaskId)resizeTaskToDay(resizeTaskId,day);else if(taskId)moveTaskToDay(taskId,day);setDragTargetDay(null)};
  const navigateWithHorizontalScroll=event=>{if(event.currentTarget.scrollWidth>event.currentTarget.clientWidth+1)return;const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.shiftKey?event.deltaY:0;if(!horizontal)return;event.preventDefault();if(wheelLocked.current)return;wheelDistance.current+=horizontal;if(Math.abs(wheelDistance.current)<70)return;moveWeek(wheelDistance.current>0?1:-1);wheelDistance.current=0;wheelLocked.current=true;wheelUnlockTimer.current=window.setTimeout(()=>{wheelLocked.current=false},420)};
  return <div className="timeline-view"><div className="timeline-header"><div><p className="eyebrow">RICARDO ALFARO</p><div className="timeline-title"><h1>Planificación semanal</h1><span>{visibleTasks.length} {visibleTasks.length===1?'tarea':'tareas'}</span></div><p className="subtitle">Distribuye el trabajo y revisa la carga de cada día.</p></div><button className="primary" onClick={()=>openTask(null)}><Plus width={18} height={18} strokeWidth={2.2}/> Nueva tarea</button></div>
    <section className="timeline-panel"><header className="timeline-toolbar"><button className="timeline-today" onClick={()=>setAnchorDate(today)}>Esta semana</button><div className="timeline-week-switcher"><button className="icon-button" onClick={()=>moveWeek(-1)} aria-label="Semana anterior"><NavArrowLeft width={20} height={20}/></button><strong>{formatPeriodDate(range.start)} — {formatPeriodDate(range.end)}</strong><button className="icon-button" onClick={()=>moveWeek(1)} aria-label="Semana siguiente"><NavArrowRight width={20} height={20}/></button></div><label className="timeline-date-picker"><span>Ir a fecha</span><input type="date" value={anchorDate} onChange={event=>setAnchorDate(event.target.value)} aria-label="Seleccionar una fecha para mostrar su semana"/></label></header>
      <div className="timeline-scroll" onWheel={navigateWithHorizontalScroll} title="Desplázate horizontalmente para cambiar de semana"><div className="timeline-calendar"><div className="timeline-days">{days.map(day=>{const date=parseISODate(day);return <div className={day===today?'is-today':''} key={day}><span>{date.toLocaleDateString('es-CL',{weekday:'long'}).replace('.','')}</span><b>{date.getDate()}</b></div>})}</div>
        <div className="timeline-body" onDragOver={event=>{event.preventDefault();setDragTargetDay(dayFromPointer(event,event.currentTarget))}} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget))setDragTargetDay(null)}} onDrop={dropTask}>{dragTargetDay&&<div className="timeline-drop-highlight" style={{left:`calc(${differenceInDays(range.start,dragTargetDay)} * 100% / 7)`}}/>}{timelineLanes.length?timelineLanes.map((lane,laneIndex)=><div className="timeline-task-row" key={laneIndex}>{lane.tasks.map(task=>{const taskStart=task.start||task.due;const clippedStart=taskStart>range.start?taskStart:range.start;const clippedEnd=task.due<range.end?task.due:range.end;const startColumn=differenceInDays(range.start,clippedStart)+1;const endColumn=differenceInDays(range.start,clippedEnd)+2;return <div key={task.id} draggable onDragStart={event=>{event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/timeline-task',task.id)}} onDragEnd={()=>setDragTargetDay(null)} className={`timeline-task ${task.status==='completed'?'completed':''} ${isOverdueDoing(task)?'overdue-doing':''} ${taskStart<range.start?'continues-before':''} ${task.due>range.end?'continues-after':''}`} style={{gridColumn:`${startColumn} / ${endColumn}`}} title={task.title}><button className="timeline-task-open" onClick={()=>openTask(task)}><span className="timeline-task-copy"><strong>{task.title}</strong><em><CalendarBlank width={12} height={12}/>{fmt(taskStart)} — {fmt(task.due)}</em></span><b>{taskStatusLabel(task)}</b></button><button type="button" draggable className="timeline-resize-handle" aria-label={`Cambiar duración de ${task.title}`} title="Arrastra para cambiar la duración por días" onClick={event=>event.stopPropagation()} onDragStart={event=>{event.stopPropagation();event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/timeline-resize',task.id)}} onDragEnd={()=>setDragTargetDay(null)}/></div>})}</div>):<div className="timeline-empty"><CalendarBlank width={30} height={30}/><b>Sin tareas esta semana</b><span>Navega a otra semana o crea una nueva tarea.</span></div>}</div>
      </div></div>
    </section>
  </div>;
}

function Reports({ tasks, openTask, canShare=false }) {
  const [periodType,setPeriodType]=useState('month');
  const [anchorDate,setAnchorDate]=useState('2026-07-14');
  const [showCompleted,setShowCompleted]=useState(false);
  const [shareState,setShareState]=useState('');
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
  const data=[{label:'Terminadas',value:completed,color:'#003459',icon:Check},{label:'Archivadas',value:deprecated,color:'#007ea7',icon:Archive},{label:'Pendientes',value:pending,color:'#00a8e8',icon:ClipboardText}];
  const anchor=parseISODate(anchorDate);
  const quarter=Math.floor(anchor.getMonth()/3)+1;
  const years=[2024,2025,2026,2027];
  const periodLabel=range.start===range.end?formatPeriodDate(range.start):`${formatPeriodDate(range.start)} — ${formatPeriodDate(range.end)}`;
  const setQuarter=value=>setAnchorDate(`${anchor.getFullYear()}-${String((Number(value)-1)*3+1).padStart(2,'0')}-01`);
  const setPeriodYear=value=>setAnchorDate(`${value}-${String(anchor.getMonth()+1).padStart(2,'0')}-01`);
  const shareReport=async()=>{try{await navigator.clipboard.writeText(window.location.origin);setShareState('Enlace copiado')}catch{setShareState('No se pudo copiar')}};
  return <div className="reports"><div className="reports-header"><div><p className="eyebrow">RESUMEN DE ACTIVIDAD</p><h1>Reportes</h1><p className="subtitle">Una vista clara de tu ritmo de trabajo.</p></div><div className="reports-controls"><button className="share-report" disabled={!canShare} onClick={shareReport} title={canShare?'Copiar URL privada del reporte':'Disponible al conectar el acceso externo'}><ShareAndroid width={18} height={18}/> {shareState||'Compartir'}</button><div className="period-controls"><select aria-label="Tipo de período" value={periodType} onChange={event=>setPeriodType(event.target.value)}><option value="day">Día</option><option value="week">Semana</option><option value="month">Mes</option><option value="quarter">Trimestre</option></select>{periodType==='day'&&<input aria-label="Día del reporte" type="date" value={anchorDate} onChange={event=>setAnchorDate(event.target.value)}/>} {periodType==='week'&&<input aria-label="Día dentro de la semana" type="date" value={anchorDate} onChange={event=>setAnchorDate(event.target.value)}/>} {periodType==='month'&&<input aria-label="Mes del reporte" type="month" value={anchorDate.slice(0,7)} onChange={event=>setAnchorDate(`${event.target.value}-01`)}/>} {periodType==='quarter'&&<><select aria-label="Trimestre" value={quarter} onChange={event=>setQuarter(event.target.value)}>{[1,2,3,4].map(value=><option key={value} value={value}>Q{value}</option>)}</select><select aria-label="Año" value={anchor.getFullYear()} onChange={event=>setPeriodYear(event.target.value)}>{years.map(year=><option key={year}>{year}</option>)}</select></>}</div><p className="active-period">{periodLabel}</p></div></div>
    <div className="report-cards">{data.map(item=><article className={item.label==='Terminadas'?'report-card-action':''} key={item.label} onClick={item.label==='Terminadas'?()=>setShowCompleted(value=>!value):undefined} onKeyDown={item.label==='Terminadas'?event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setShowCompleted(value=>!value)}}:undefined} role={item.label==='Terminadas'?'button':undefined} tabIndex={item.label==='Terminadas'?0:undefined} aria-expanded={item.label==='Terminadas'?showCompleted:undefined}><div className="metric-icon" style={{color:item.color,background:`${item.color}14`}}><item.icon width={22} height={22}/></div><span>{item.label}</span><strong>{item.value}</strong><small>{item.label==='Terminadas'?'Ver tareas · ':''}{Math.round(item.value/total*100)}% del total del período</small></article>)}</div>
    {showCompleted&&<section className="completed-report"><header><div><p className="eyebrow">DETALLE DEL PERÍODO</p><h2>Tareas terminadas</h2></div><span>{completedTasks.length}</span></header><div>{completedTasks.length?completedTasks.map(task=><button key={task.id} onClick={()=>openTask(task)}><div><b>{task.title}</b><p>{task.description||'Sin descripción'}</p></div><span><Check width={15} height={15}/> {formatPeriodDate(task.completedAt.slice(0,10))}</span></button>):<div className="completed-empty">No hay tareas terminadas en este período.</div>}</div></section>}
    <section className="effort-panel"><div className="effort-summary"><div className="metric-icon"><Lightning width={22} height={22}/></div><div><p className="eyebrow">NIVEL DE ESFUERZO</p><h2>{effortAverage?effortAverage.toFixed(1):'—'}<span> / 5 promedio</span></h2><p>{periodTasks.length} {periodTasks.length===1?'tarea considerada':'tareas consideradas'} en el período</p></div></div><div className="effort-bars">{effortCounts.map(item=><div key={item.level}><span>{item.level}</span><div><i style={{width:`${item.count/maxEffortCount*100}%`}}></i></div><b>{item.count}</b></div>)}</div></section>
    <section className="report-panel"><div><p className="eyebrow">DISTRIBUCIÓN</p><h2>Estado de las tareas</h2><p>Actividad del {periodLabel}</p></div><div className="chart-area"><div className="donut" style={{background:`conic-gradient(#003459 0 ${completed/total*100}%, #007ea7 ${completed/total*100}% ${(completed+deprecated)/total*100}%, #00a8e8 ${(completed+deprecated)/total*100}% 100%)`}}><div><strong>{completed+deprecated+pending}</strong><span>Tareas</span></div></div><div className="legend">{data.map(item=><div key={item.label}><span style={{background:item.color}}></span><p>{item.label}<b>{item.value}</b></p></div>)}</div></div></section>
  </div>;
}

function Today({ tasks, setTasks, openTask, doneColumnId='done' }) {
  const today = toISODate(new Date());
  const list = tasks.filter(task => task.due === today && task.status !== 'deprecated');
  const complete = task => setTasks(items => items.map(item => item.id === task.id
    ? { ...item, columnId: doneColumnId, status: 'completed', completedAt: new Date().toISOString() }
    : item));

  return <div className="today-view">
    <div className="today-header">
      <div><p className="eyebrow">{parseISODate(today).toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'}).toUpperCase()}</p><h1>Hoy</h1><p className="subtitle">Todo lo que necesita tu atención hoy.</p></div>
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
  const [page,setPage]=useState(()=>{const saved=localStorage.getItem('td-page')||'board';return saved==='settings'&&!supabaseConfig.isConfigured?'board':saved});
  const [sidebarCollapsed,setSidebarCollapsed]=useState(true);
  const [theme,setTheme]=useState(()=>localStorage.getItem('td-theme')||'system');
  const [boardTitle,setBoardTitle]=useState(()=>localStorage.getItem('td-board-title')||'Mi tablero');
  const [columns,setColumns]=useState(()=>{const saved=JSON.parse(localStorage.getItem('td-columns')||'null')||initialColumns;const legacyColors=['#7c6ee6','#65dcd5','#f5cbcb','#ffe2e2','#c5b3d3'];return saved.map(column=>({...column,color:columnPalette[column.id]||(legacyColors.includes(column.color)?'#00a8e8':column.color)}))});
  const [tasks,setTasks]=useState(()=>{const saved=JSON.parse(localStorage.getItem('td-tasks')||'null')||initialTasks;return saved.map(task=>({...task,start:task.start||task.due}))});
  const [editing,setEditing]=useState(null), [defaultColumn,setDefaultColumn]=useState(null), [modal,setModal]=useState(false);
  const [session,setSession]=useState(supabaseConfig.isConfigured?undefined:null);
  const [access,setAccess]=useState(null);
  const [cloudReady,setCloudReady]=useState(false);
  const [cloudError,setCloudError]=useState('');
  const syncQueue=useRef(Promise.resolve());
  useEffect(()=>{if(!supabaseConfig.isConfigured)return;let active=true;authRepository.getSession().then(value=>{if(active)setSession(value)}).catch(reason=>{if(active){setCloudError(reason.message);setSession(null)}});const unsubscribe=authRepository.onAuthStateChange(value=>{if(active){setSession(value);if(!value){setAccess(null);setCloudReady(false)}}});return()=>{active=false;unsubscribe()}},[]);
  useEffect(()=>{if(!supabaseConfig.isConfigured||!session?.user)return;let active=true;setCloudReady(false);setCloudError('');const loadCloud=async()=>{const nextAccess=await authRepository.getBoardAccess(supabaseConfig.boardId,session.user.id);const hasLocalData=Boolean(localStorage.getItem('td-columns')&&localStorage.getItem('td-tasks'));if(nextAccess.role==='owner'&&hasLocalData&&!hasCompletedLocalMigration())await migrateLocalDashboard();const data=await dashboardRepository.load(supabaseConfig.boardId);if(!active)return;setAccess(nextAccess);setBoardTitle(data.board.name);setColumns(data.columns);setTasks(data.tasks);if(nextAccess.role==='viewer')setPage('reports');setCloudReady(true)};loadCloud().catch(reason=>{if(active)setCloudError(reason.message)});return()=>{active=false}},[session]);
  useEffect(()=>{if(!supabaseConfig.isConfigured||!cloudReady||!access?.canWrite)return;let active=true;const snapshot={boardTitle,columns,tasks};const timeout=setTimeout(()=>{syncQueue.current=syncQueue.current.catch(()=>{}).then(()=>dashboardRepository.syncSnapshot(supabaseConfig.boardId,snapshot));syncQueue.current.then(()=>{if(active)setCloudError('')}).catch(reason=>{if(active)setCloudError(`${reason.message} Los cambios permanecen visibles, pero aún no se confirmaron en la nube.`)})},650);return()=>{active=false;clearTimeout(timeout)}},[boardTitle,columns,tasks,cloudReady,access]);
  useEffect(()=>{if(!supabaseConfig.isConfigured)localStorage.setItem('td-columns',JSON.stringify(columns))},[columns]);
  useEffect(()=>{if(!supabaseConfig.isConfigured)localStorage.setItem('td-tasks',JSON.stringify(tasks))},[tasks]);
  useEffect(()=>{if(!supabaseConfig.isConfigured)localStorage.setItem('td-board-title',boardTitle)},[boardTitle]);
  useEffect(()=>localStorage.setItem('td-page',page),[page]);
  useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const applyTheme=()=>{document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme};applyTheme();localStorage.setItem('td-theme',theme);media.addEventListener('change',applyTheme);return()=>media.removeEventListener('change',applyTheme)},[theme]);
  const pending=useMemo(()=>tasks.filter(t=>t.status==='active').length,[tasks]);
  const currentWeekTaskCount=useMemo(()=>{const today=toISODate(new Date());const currentWeek=getPeriodRange('week',today);return tasks.filter(task=>task.status!=='deprecated'&&(task.start||task.due)<=currentWeek.end&&task.due>=currentWeek.start).length},[tasks]);
  const doneColumnId=columns.find(column=>column.slug==='done'||column.id==='done')?.id||'done';
  const openTask=(task,columnId)=>{setEditing(task);setDefaultColumn(columnId);setModal(true)};
  const save=form=>{const taskForm={...form,effort:Number(form.effort)};if(editing)setTasks(ts=>ts.map(t=>t.id===editing.id?{...t,...taskForm,status:form.columnId===doneColumnId?'completed':t.status==='deprecated'?'deprecated':'active',completedAt:form.columnId===doneColumnId?(t.completedAt||new Date().toISOString()):undefined}:t));else setTasks(ts=>[...ts,{...taskForm,id:crypto.randomUUID(),status:form.columnId===doneColumnId?'completed':'active',createdAt:toISODate(new Date()),completedAt:form.columnId===doneColumnId?new Date().toISOString():undefined}]);setModal(false)};
  const themeOptions=['system','light','dark'];
  const cycleTheme=()=>setTheme(current=>themeOptions[(themeOptions.indexOf(current)+1)%themeOptions.length]);
  const ThemeIcon=theme==='system'?Computer:theme==='light'?SunLight:HalfMoon;
  const themeLabel=theme==='system'?'Tema del sistema':theme==='light'?'Tema claro':'Tema oscuro';
  if(supabaseConfig.isConfigured&&session===undefined)return <main className="cloud-state"><span className="loader"/><p>Comprobando acceso…</p></main>;
  if(supabaseConfig.isConfigured&&!session)return <AuthScreen/>;
  if(supabaseConfig.isConfigured&&!cloudReady)return <main className="cloud-state"><span className="loader"/><p>{cloudError||'Cargando el espacio…'}</p>{cloudError&&<button className="secondary" onClick={()=>authRepository.signOut()}>Volver al ingreso</button>}</main>;
  if(access?.role==='viewer')return <div className="viewer-shell"><header><div><p className="eyebrow">REPORTE COMPARTIDO · SOLO LECTURA</p><strong>{boardTitle}</strong></div><button className="secondary" onClick={()=>authRepository.signOut()}>Cerrar sesión</button></header>{cloudError&&<div className="cloud-alert" role="alert">{cloudError}</div>}<main><Reports tasks={tasks} openTask={task=>{setEditing(task);setModal(true)}}/></main>{modal&&editing&&<Modal title="Detalle de tarea" onClose={()=>setModal(false)}><ReadOnlyTask task={editing} columnTitle={columns.find(column=>column.id===editing.columnId)?.title}/></Modal>}</div>;
  return <div className={`app-shell ${sidebarCollapsed?'sidebar-collapsed':''}`}><aside><div className="account"><label className="sidebar-search"><MagnifyingGlass width={18} height={18}/><input disabled type="search" placeholder="Buscar" aria-label="Buscar, aún no disponible"/></label><button className="account-sidebar-toggle" onClick={()=>setSidebarCollapsed(value=>!value)} aria-label={sidebarCollapsed?'Expandir menú':'Contraer menú'} title={sidebarCollapsed?'Expandir menú':'Contraer menú'}>{sidebarCollapsed?<SidebarExpand width={20} height={20}/>:<SidebarCollapse width={20} height={20}/>}</button></div>
    <div className="sidebar-label">VISTAS</div><nav><button className={page==='board'?'active':''} aria-current={page==='board'?'page':undefined} onClick={()=>setPage('board')}><Kanban width={21} height={21}/><span>Estado</span><b>{pending}</b></button><button className={page==='timeline'?'active':''} aria-current={page==='timeline'?'page':undefined} onClick={()=>setPage('timeline')}><TableRows width={21} height={21}/><span>Semanal</span><b>{currentWeekTaskCount}</b></button><button className={page==='today'?'active':''} aria-current={page==='today'?'page':undefined} onClick={()=>setPage('today')}><CalendarBlank width={21} height={21}/><span>Diaria</span></button></nav>
    <div className="sidebar-label">OPCIONES</div><nav><button className={page==='reports'?'active':''} onClick={()=>setPage('reports')}><ChartBar width={21} height={21}/><span>Reportes</span></button><button disabled title="Filtros aún no disponibles"><SlidersHorizontal width={21} height={21}/><span>Filtros</span></button><button className={page==='archive'?'active':''} aria-current={page==='archive'?'page':undefined} onClick={()=>setPage('archive')}><Archive width={21} height={21}/><span>Archivo</span><b>{tasks.filter(t=>t.status==='deprecated').length}</b></button></nav>
    <div className="aside-bottom"><button className="theme-toggle" onClick={cycleTheme} title={`${themeLabel}. Cambiar apariencia`} aria-label={`${themeLabel}. Cambiar apariencia`}><ThemeIcon width={20} height={20}/><span>{themeLabel}</span></button>{supabaseConfig.isConfigured&&<button onClick={()=>authRepository.signOut()} title="Cerrar sesión"><LogOut width={20} height={20}/><span>Cerrar sesión</span></button>}<button disabled={!access?.canManageAccess} className={page==='settings'?'active':''} onClick={()=>setPage('settings')} title={access?.canManageAccess?'Administrar configuración':'Configuración disponible al conectar Supabase'}><Settings width={20} height={20}/><span>Configuración</span></button></div>
  </aside><main>{cloudError&&<div className="cloud-alert" role="alert">{cloudError}</div>}{page==='board'?<Board columns={columns} tasks={tasks} setTasks={setTasks} setColumns={setColumns} openTask={openTask} onViewTimeline={()=>setPage('timeline')}/>:page==='timeline'?<Timeline tasks={tasks} columns={columns} setTasks={setTasks} openTask={openTask}/>:page==='today'?<Today tasks={tasks} setTasks={setTasks} openTask={openTask} doneColumnId={doneColumnId}/>:page==='archive'?<ArchiveView tasks={tasks} columns={columns} setTasks={setTasks} openTask={openTask}/>:page==='settings'?<AccessSettings/>:<Reports tasks={tasks} openTask={openTask} canShare={Boolean(access?.canManageAccess)}/>}</main>
  {modal&&<Modal title={editing?'Editar tarea':'Nueva tarea'} onClose={()=>setModal(false)}><TaskForm task={editing} columns={columns} defaultColumn={defaultColumn} onSave={save} onClose={()=>setModal(false)}/>{editing&&<button className="delete-task" onClick={()=>{setTasks(ts=>ts.filter(t=>t.id!==editing.id));setModal(false)}}><Trash width={17} height={17}/> Eliminar definitivamente</button>}</Modal>}
  </div>;
}

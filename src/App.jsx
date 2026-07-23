import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive, Book,
  Calendar as CalendarBlank, Reports as ChartBar, Check, TaskList as ClipboardText,
  MoreHoriz as DotsThree, KanbanBoard as Kanban, Search as MagnifyingGlass,
  Plus, Flash as Lightning, Trash, Xmark as X,
  SidebarCollapse, SidebarExpand, Settings, ShareAndroid, Download,
  Computer, HalfMoon, SunLight, NavArrowDown, NavArrowLeft, NavArrowRight, LogOut, Bell, HomeSimple, ClockRotateRight
} from 'iconoir-react';
import { authRepository } from './data/authRepository.js';
import { dashboardRepository } from './data/dashboardRepository.js';
import { hasCompletedLocalMigration, migrateLocalDashboard, retireLocalDashboard, saveLocalDashboardSnapshot } from './data/localMigration.js';
import { supabaseConfig } from './lib/supabase.js';

const themeColors = Object.freeze({danger:'#d62839',archive:'#ba324f',primary:'#175676',interaction:'#4ba3c3',soft:'#cce6f4'});
const projectName = 'Ricardo Alfaro';
const initialColumns = [
  { id: 'todo', title: 'TO-DO', color: themeColors.soft },
  { id: 'doing', title: 'DOING', color: themeColors.interaction },
  { id: 'done', title: 'DONE', color: themeColors.primary },
];
const columnPalette = {todo:themeColors.soft,doing:themeColors.interaction,done:themeColors.primary};
const columnTone = column => {
  const identifier=column?.slug||column?.id;
  return identifier==='todo'?'todo':identifier==='doing'?'doing':identifier==='done'?'done':'custom';
};
const normalizeChecklist = (checklist,description='',taskId='new') => Array.isArray(checklist)?checklist.map((item,index)=>({id:item.id||`${taskId}-${index}`,text:item.text||'',checked:Boolean(item.checked)})):description.trim()?[{id:`legacy-${taskId}`,text:description.trim(),checked:false}]:[];
const checklistComplete = checklist => checklist.length>0&&checklist.every(item=>item.checked);
const checklistSummary = task => {const checklist=normalizeChecklist(task.checklist,task.description,task.id);return checklist.length?`${checklist.filter(item=>item.checked).length}/${checklist.length} completados`:''};
const checklistDescription = checklist => checklist.map(item=>item.text.trim()).filter(Boolean).join('\n');

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

function ProjectSwitcher() {
  const [isExpanded,setIsExpanded]=useState(false);
  return <div className={`project-switcher ${isExpanded?'is-expanded':''}`}>
    <button className="project-switcher-tab" type="button" onClick={()=>setIsExpanded(value=>!value)} aria-expanded={isExpanded} aria-controls="project-switcher-panel" aria-label={isExpanded?'Ocultar proyecto':'Mostrar proyecto'} title={isExpanded?'Ocultar proyecto':'Mostrar proyecto'}><NavArrowDown width={18} height={18}/></button>
    {isExpanded&&<label className="project-switcher-panel" id="project-switcher-panel"><span>Proyecto</span><select value="ricardo-alfaro" onChange={()=>{}} aria-label="Proyecto actual"><option value="ricardo-alfaro">{projectName}</option></select></label>}
  </div>;
}

function AuthScreen({ onSignedIn }) {
  const [form,setForm]=useState({email:'',password:''});
  const [error,setError]=useState('');
  const [submitting,setSubmitting]=useState(false);
  const submit=async event=>{event.preventDefault();setSubmitting(true);setError('');try{await authRepository.signIn(form.email,form.password);onSignedIn?.()}catch(reason){setError(reason.message)}finally{setSubmitting(false)}};
  return <main className="auth-view"><section className="auth-card"><div className="auth-mark"><Kanban width={25} height={25}/></div><p className="eyebrow">WORKSPACE TASK DASHBOARD</p><h1>Ingresa a tu espacio</h1><p>Accede al tablero o al reporte que Ricardo compartió contigo.</p><form onSubmit={submit}><label>Correo<input autoFocus required type="email" autoComplete="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})}/></label><label>Contraseña<input required type="password" autoComplete="current-password" value={form.password} onChange={event=>setForm({...form,password:event.target.value})}/></label>{error&&<p className="auth-error" role="alert">{error}</p>}<button className="primary" disabled={submitting}>{submitting?'Ingresando…':'Ingresar'}</button></form></section></main>;
}

function ReadOnlyTask({ task, columnTitle }) {
  const checklist=(Array.isArray(task.checklist)?normalizeChecklist(task.checklist,task.description,task.id):task.description?.split(/\n+/).filter(Boolean).map((text,index)=>({id:`legacy-${task.id}-${index}`,text,checked:false}))||[]).filter(item=>item.text.trim());
  return <div className="readonly-task"><span className={`today-status ${task.status}`}>{columnTitle||'Sin estado'}</span><h3>{task.title}</h3>{checklist.length?<section className="readonly-checklist"><h4>Checklist</h4><ul>{checklist.map(item=><li key={item.id}>{item.text}</li>)}</ul></section>:<p>Sin checklist.</p>}{task.notes&&<p>{task.notes}</p>}{task.link&&<p><a href={task.link} target="_blank" rel="noreferrer">Abrir enlace relacionado</a></p>}<dl><div><dt>Inicio</dt><dd>{formatPeriodDate(task.start||task.due)}</dd></div><div><dt>Fin</dt><dd>{formatPeriodDate(task.due)}</dd></div><div><dt>Esfuerzo</dt><dd>{task.effort||3} de 5</dd></div></dl></div>;
}

function AccessSettings() {
  const [members,setMembers]=useState([]);
  const [form,setForm]=useState({email:'',password:''});
  const [state,setState]=useState({loading:true,submitting:false,error:'',success:''});
  const load=async()=>{setState(current=>({...current,loading:true,error:''}));try{setMembers(await authRepository.listMembers(supabaseConfig.boardId));setState(current=>({...current,loading:false}))}catch(error){setState(current=>({...current,loading:false,error:error.message}))}};
  useEffect(()=>{load()},[]);
  const save=async event=>{event.preventDefault();setState(current=>({...current,submitting:true,error:'',success:''}));try{await authRepository.createReportUser(supabaseConfig.boardId,form);setForm({email:'',password:''});setState(current=>({...current,submitting:false,success:'El usuario ya puede ingresar al reporte con estas credenciales.'}));await load()}catch(error){setState(current=>({...current,submitting:false,error:error.message}))}};
  const resetPassword=async member=>{const password=window.prompt(`Nueva contraseña temporal para ${member.email}`);if(password===null)return;setState(current=>({...current,submitting:true,error:'',success:''}));try{await authRepository.updateReportPassword(supabaseConfig.boardId,{email:member.email,password});setState(current=>({...current,submitting:false,success:`Contraseña actualizada para ${member.email}.`}))}catch(error){setState(current=>({...current,submitting:false,error:error.message}))}};
  const revoke=async userId=>{setState(current=>({...current,error:'',success:''}));try{await authRepository.revokeMember(supabaseConfig.boardId,userId);setState(current=>({...current,success:'El acceso al reporte fue revocado.'}));await load()}catch(error){setState(current=>({...current,error:error.message}))}};
  const reportMembers=members.filter(member=>member.role==='viewer');
  return <div className="settings-view"><header><p className="eyebrow">CONFIGURACIÓN</p><h1>Acceso al reporte</h1><p className="subtitle">Crea cuentas para que supervisores externos consulten el reporte, sin acceso operativo al tablero.</p></header><section className="settings-panel"><div><h2>Crear usuario</h2><p>La cuenta tendrá acceso de solo lectura. La contraseña viaja directamente a Supabase Auth y nunca se guarda en el dashboard.</p><form onSubmit={save}><label>Correo<input required type="email" autoComplete="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="supervisor@empresa.com"/></label><label>Contraseña temporal<input required type="password" minLength="8" autoComplete="new-password" value={form.password} onChange={event=>setForm({...form,password:event.target.value})} placeholder="Mínimo 8 caracteres"/></label><button className="primary" disabled={state.submitting}>{state.submitting?'Guardando…':'Crear acceso al reporte'}</button></form></div><div><div className="settings-members-title"><h2>Usuarios del reporte</h2><span>{reportMembers.length}</span></div>{state.error&&<p className="auth-error" role="alert">{state.error}</p>}{state.success&&<p className="settings-success" role="status">{state.success}</p>}{state.loading?<p className="settings-empty">Cargando usuarios…</p>:reportMembers.length?<div className="member-list">{reportMembers.map(member=><article key={member.user_id}><div><b>{member.email}</b><span>Solo lectura · Reportes</span></div><div><button disabled={state.submitting} onClick={()=>resetPassword(member)} className="member-password">Cambiar contraseña</button><button disabled={state.submitting} onClick={()=>revoke(member.user_id)} className="member-revoke"><Trash width={16} height={16}/> Revocar</button></div></article>)}</div>:<p className="settings-empty">Aún no hay usuarios con acceso al reporte.</p>}</div></section></div>;
}

function TaskForm({ task, columns, defaultColumn, defaultDate, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    if(task) return {...task,start:task.start||task.due,effort:task.effort||3,notes:task.notes||'',link:task.link||'',checklist:normalizeChecklist(task.checklist,task.description,task.id)};
    const date=defaultDate||toISODate(new Date());
    return {title:'',checklist:[],notes:'',link:'',start:date,due:date,columnId:defaultColumn||columns[0].id,effort:3};
  });
  const [dateError,setDateError]=useState(''), [checklistError,setChecklistError]=useState('');
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const doneColumnId=columns.find(column=>column.slug==='done'||column.id==='done')?.id;
  const doingColumnId=columns.find(column=>column.slug==='doing'||column.id==='doing')?.id;
  const todoColumnId=columns.find(column=>column.slug==='todo'||column.id==='todo')?.id;
  const updateChecklist=(index,changeSet)=>setForm(current=>{const checklist=current.checklist.map((item,itemIndex)=>itemIndex===index?{...item,...changeSet}:item);const hasStarted=checklist.some(item=>item.checked);const columnId=!hasStarted?todoColumnId:checklistComplete(checklist)?doneColumnId:doingColumnId;return {...current,checklist,columnId}});
  return <form onSubmit={e => { e.preventDefault(); if(form.start>form.due){setDateError('La fecha de inicio no puede ser posterior a la fecha de entrega.');return}if(form.columnId===doingColumnId&&form.checklist.length!==1&&!form.checklist.some(item=>item.checked)){setChecklistError('Marca al menos un ítem del checklist antes de pasar la tarea a DOING.');return}if(form.columnId===doneColumnId&&form.checklist.length&&!checklistComplete(form.checklist)){setChecklistError('Marca todos los ítems del checklist antes de pasar la tarea a DONE.');return}setDateError('');setChecklistError('');if(form.title.trim()) onSave({...form,columnId:checklistComplete(form.checklist)?doneColumnId:form.columnId,description:checklistDescription(form.checklist)}); }}>
    <label>Nombre de la tarea<input autoFocus required name="title" value={form.title} onChange={change} placeholder="¿Qué tienes que hacer?"/></label>
    <fieldset className="checklist-editor"><legend>Checklist</legend><div>{form.checklist.map((item,index)=><label key={item.id} className="checklist-editor-item"><input type="checkbox" checked={item.checked} onChange={event=>updateChecklist(index,{checked:event.target.checked})}/><input value={item.text} onChange={event=>updateChecklist(index,{text:event.target.value})} placeholder="Añade un ítem" aria-label={`Ítem ${index+1} del checklist`}/><button type="button" className="icon-button" onClick={()=>setForm(current=>({...current,checklist:current.checklist.filter((_,itemIndex)=>itemIndex!==index)}))} aria-label="Eliminar ítem"><X width={16} height={16}/></button></label>)}</div><button type="button" className="add-checklist-item" onClick={()=>setForm(current=>{const checklist=[...current.checklist,{id:crypto.randomUUID(),text:'',checked:false}];return {...current,checklist,columnId:current.columnId===doneColumnId?doingColumnId:current.columnId}})}><Plus width={16} height={16}/> Añadir ítem</button></fieldset>
    <label>Notas<textarea name="notes" rows="6" value={form.notes} onChange={change} placeholder="Agrega observaciones, contexto o información adicional"/></label>
    <label>Link<input type="url" name="link" value={form.link} onChange={change} placeholder="https://ejemplo.com/recurso"/></label>
    <label className="effort-field"><span>Nivel de esfuerzo <b>{form.effort}</b></span><input className="effort-range" type="range" name="effort" min="1" max="5" step="1" value={form.effort} onChange={change}/><span className="effort-scale"><small>1 · Bajo</small><small>5 · Alto</small></span></label>
    <div className="form-grid"><label>Fecha de inicio<input required type="date" name="start" value={form.start} max={form.due} onChange={change}/></label><label>Fecha de fin<input required type="date" name="due" value={form.due} min={form.start} onChange={change}/></label></div>
    {dateError&&<p className="form-error" role="alert">{dateError}</p>}{checklistError&&<p className="form-error" role="alert">{checklistError}</p>}
    <div className="form-grid form-grid-single">
    <label>Estado<select name="columnId" value={form.columnId} onChange={change}>{columns.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
    <footer className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary">{task ? 'Guardar cambios' : 'Crear tarea'}</button></footer>
  </form>;
}

function TaskCard({ task, onEdit, onArchive, onDragStart, onDragEnd, onToggleChecklist, onDragOver, onDragLeave, onDrop, boardDropTarget }) {
  const [menuOpen,setMenuOpen]=useState(false);
  const overdue = task.status === 'active' && task.due < toISODate(new Date());
  const checklist=normalizeChecklist(task.checklist,task.description,task.id);
  const visibleChecklist=[...checklist].sort((a,b)=>Number(a.checked)-Number(b.checked));
  const effort=Number(task.effort)||3;
  const confirmArchive=event=>{event.stopPropagation();setMenuOpen(false);if(window.confirm(`¿Archivar “${task.title}”? Podrás recuperarla desde Archivo.`))onArchive(task)};
  return <article className={`task-card ${task.status} ${overdue?'overdue':''} ${boardDropTarget?.placement==='before'?'is-board-drop-before':''} ${boardDropTarget?.placement==='after'?'is-board-drop-after':''}`} draggable onDragStart={e=>onDragStart(e, task.id)} onDragEnd={onDragEnd} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={()=>onEdit(task)}>
    <div className="task-top"><div className="task-menu-wrap"><button className="more" onClick={event=>{event.stopPropagation();setMenuOpen(value=>!value)}} aria-label={`Opciones de ${task.title}`} aria-expanded={menuOpen}><DotsThree width={22} height={22}/></button>{menuOpen&&<div className="task-menu"><button onClick={confirmArchive}><Archive width={16} height={16}/> Archivar</button></div>}</div></div>
    <h3>{task.title}</h3>{visibleChecklist.length?<ul className="task-checklist">{visibleChecklist.map(item=><li key={item.id}><label><input type="checkbox" checked={item.checked} onClick={event=>event.stopPropagation()} onChange={()=>onToggleChecklist(task,item.id)}/><span>{item.text}</span></label></li>)}</ul>:null}
    <div className="task-card-footer"><div className={`due ${overdue?'overdue':''}`}><CalendarBlank width={16} height={16}/><span>{overdue?'Venció ':''}{fmt(task.due)}</span></div><span className="timeline-effort task-card-effort" aria-label={`Esfuerzo ${effort} de 5`} title={`Esfuerzo ${effort} de 5`}>{[1,2,3,4,5].map(level=><i className={level<=effort?'is-filled':''} key={level}/>)}</span></div>
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

function Board({ columns, tasks, setTasks, setColumns, openTask, onViewCompleted }) {
  const [newColumn, setNewColumn] = useState(false);
  const [columnMenu,setColumnMenu]=useState(null);
  const [movePrompt,setMovePrompt]=useState(null);
  const [boardDropTarget,setBoardDropTarget]=useState(null);
  const fixedColumnIds=['todo','doing','done'];
  const todoColumnId=columns.find(column=>column.slug==='todo'||column.id==='todo')?.id;
  const doingColumnId=columns.find(column=>column.slug==='doing'||column.id==='doing')?.id;
  const doneColumnId=columns.find(column=>column.slug==='done'||column.id==='done')?.id;
  const isFixedColumn=column=>Boolean(column?.isFixed)||fixedColumnIds.includes(column?.id);
  const isBoardOverdue=task=>task.status==='active'&&task.due<toISODate(new Date());
  const boardTaskSort=(a,b)=>{const aOverdue=isBoardOverdue(a),bOverdue=isBoardOverdue(b);if(aOverdue!==bOverdue)return aOverdue?-1:1;const aEditedAfterManual=!a.manualBoardOrderAt||Date.parse(a.updatedAt||0)>Date.parse(a.manualBoardOrderAt);const bEditedAfterManual=!b.manualBoardOrderAt||Date.parse(b.updatedAt||0)>Date.parse(b.manualBoardOrderAt);if(aEditedAfterManual!==bEditedAfterManual)return aEditedAfterManual?-1:1;if(aEditedAfterManual)return (Date.parse(b.updatedAt||b.createdAt||0)||0)-(Date.parse(a.updatedAt||a.createdAt||0)||0);return (a.boardPosition??Number.MAX_SAFE_INTEGER)-(b.boardPosition??Number.MAX_SAFE_INTEGER)};
  const applyMove=(taskId,columnId,checklist)=>setTasks(items=>items.map(task=>String(task.id)===String(taskId)?{...task,checklist:checklist||task.checklist,description:checklist?checklistDescription(checklist):task.description,columnId,status:columnId===doneColumnId?'completed':'active',completedAt:columnId===doneColumnId?new Date().toISOString():undefined,updatedAt:new Date().toISOString(),manualBoardOrderAt:undefined}:task));
  const moveTask = (taskId, columnId) => {const task=tasks.find(item=>String(item.id)===String(taskId));if(!task||task.columnId===columnId)return;const checklist=normalizeChecklist(task.checklist,task.description,task.id);const hasStarted=checklist.some(item=>item.checked);const singleItemChecklist=checklist.length===1;if(task.columnId===doneColumnId){setMovePrompt({type:'done-locked',task});return}if(columnId===doneColumnId){if(task.columnId===todoColumnId){setMovePrompt({type:'todo-to-done',task});return}if(!checklistComplete(checklist)){setMovePrompt({type:'complete',task,columnId});return}applyMove(taskId,columnId);return}if(columnId===doingColumnId&&!hasStarted&&!singleItemChecklist){setMovePrompt({type:'needs-progress',task});return}if(columnId===todoColumnId&&task.columnId===doingColumnId&&hasStarted){setMovePrompt({type:'reset',task,columnId});return}applyMove(taskId,columnId)};
  const archive = task => setTasks(items=>items.map(t=>t.id===task.id?{...t,status:'deprecated',deprecatedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}:t));
  const toggleChecklist = (task,itemId) => setTasks(items=>items.map(current=>{if(current.id!==task.id)return current;const checklist=normalizeChecklist(current.checklist,current.description,current.id).map(item=>item.id===itemId?{...item,checked:!item.checked}:item);const hasStarted=checklist.some(item=>item.checked);const columnId=!hasStarted?todoColumnId:checklistComplete(checklist)?doneColumnId:doingColumnId;return {...current,checklist,description:checklistDescription(checklist),columnId,status:columnId===doneColumnId?'completed':'active',completedAt:columnId===doneColumnId?(current.completedAt||new Date().toISOString()):undefined,updatedAt:new Date().toISOString()}}));
  const renameColumn = (columnId,title) => setColumns(items=>items.map(column=>column.id===columnId?{...column,title}:column));
  const reorderColumn = (draggedId,targetId) => setColumns(items=>{if(draggedId===targetId||isFixedColumn(items.find(column=>column.id===draggedId)))return items;const dragged=items.find(column=>column.id===draggedId);if(!dragged)return items;const without=items.filter(column=>column.id!==draggedId);const targetIndex=without.findIndex(column=>column.id===targetId);without.splice(targetIndex<0?without.length:targetIndex,0,dragged);return without});
  const reorderBoardTasks=(taskId,columnId,targetId,placement='after')=>{const dragged=tasks.find(task=>String(task.id)===String(taskId));if(!dragged)return;if(dragged.columnId!==columnId){moveTask(taskId,columnId);return}if(String(taskId)===String(targetId))return;setTasks(items=>{const ordered=items.filter(task=>task.columnId===columnId&&task.status!=='deprecated').sort(boardTaskSort);const [moved]=ordered.splice(ordered.findIndex(task=>String(task.id)===String(taskId)),1);if(!moved)return items;const targetIndex=targetId?ordered.findIndex(task=>String(task.id)===String(targetId)):ordered.length;ordered.splice(targetIndex<0?ordered.length:targetIndex+(placement==='after'?1:0),0,moved);const reorderedAt=new Date().toISOString();const positions=new Map(ordered.map((task,index)=>[String(task.id),index]));return items.map(task=>positions.has(String(task.id))?{...task,boardPosition:positions.get(String(task.id)),manualBoardOrderAt:reorderedAt}:task)})};
  const deleteColumn = columnId => {if(isFixedColumn(columns.find(column=>column.id===columnId)))return;setTasks(items=>items.map(task=>task.columnId===columnId?{...task,columnId:todoColumnId,status:'active',completedAt:undefined,updatedAt:new Date().toISOString()}:task));setColumns(items=>items.filter(column=>column.id!==columnId));setColumnMenu(null)};
  const handleColumnDrop = (event,columnId) => {event.preventDefault();event.stopPropagation();const draggedColumn=event.dataTransfer.getData('text/column');if(draggedColumn){reorderColumn(draggedColumn,columnId);return}const taskId=event.dataTransfer.getData('text/task');if(taskId)moveTask(taskId,columnId)};
  const promptDetails={
    complete:{title:'Finalizar subtareas',copy:'Esta tarea tiene ítems pendientes. ¿Quieres marcarlos todos como completados y mover la tarea a DONE?'},
    reset:{title:'Volver a TO-DO',copy:'Esta tarea tiene subtareas marcadas. ¿Quieres desmarcarlas antes de moverla a TO-DO?'},
    'todo-to-done':{title:'No se puede completar todavía',copy:'Una tarea en TO-DO no puede pasar directamente a DONE. Marca una subtarea y avánzala primero a DOING.'},
    'needs-progress':{title:'Marca una subtarea primero',copy:'Para mover una tarea a DOING debe tener al menos un ítem del checklist marcado.'},
    'done-locked':{title:'La tarea ya está finalizada',copy:'Las tareas en DONE no se pueden mover a TO-DO ni a DOING.'}
  };
  const confirmMovePrompt=()=>{
    if(!movePrompt)return;
    const checklist=normalizeChecklist(movePrompt.task.checklist,movePrompt.task.description,movePrompt.task.id);
    if(movePrompt.type==='complete')applyMove(movePrompt.task.id,doneColumnId,checklist.map(item=>({...item,checked:true})));
    if(movePrompt.type==='reset')applyMove(movePrompt.task.id,todoColumnId,checklist.map(item=>({...item,checked:false})));
    setMovePrompt(null);
  };
  return <div className="board-wrap"><div className="board-header"><div><ProjectSwitcher/><h1>Tablero</h1><p className="subtitle">Organiza tu trabajo para mantener el foco y los tiempos bajo control.</p></div><button className="primary add-top" onClick={()=>openTask(null)}><Plus width={18} height={18} strokeWidth={2.2}/> Nueva tarea</button></div>
    <div className="board" role="list">{columns.map(col=>{const columnTasks=tasks.filter(t=>t.columnId===col.id&&t.status!=='deprecated').sort(boardTaskSort);const list=col.id===doneColumnId?columnTasks.slice(0,12):columnTasks;const isFixed=isFixedColumn(col);return <section className={`column ${isFixed?'fixed-column':'custom-column'}`} key={col.id} draggable={!isFixed} onDragStart={event=>{if(!isFixed)event.dataTransfer.setData('text/column',col.id)}} onDragOver={e=>e.preventDefault()} onDrop={event=>handleColumnDrop(event,col.id)}>
      <header className="column-header"><div className="column-title"><span style={{background:col.color}}></span><EditableColumnTitle value={col.title} onChange={title=>renameColumn(col.id,title)}/><b className={`status-count status-${columnTone(col)}`}>{columnTasks.length}</b></div><div className="column-header-actions">{col.id!==doneColumnId&&<button className="column-add-task" onClick={()=>openTask(null,col.id)} aria-label={`Añadir tarea a ${col.title}`} title="Añadir tarea"><Plus width={18} height={18}/></button>}{!isFixed&&<div className="column-menu-wrap"><button className="icon-button" onClick={()=>setColumnMenu(current=>current===col.id?null:col.id)} aria-label={`Opciones de ${col.title}`} aria-expanded={columnMenu===col.id}><DotsThree width={22} height={22}/></button>{columnMenu===col.id&&<div className="column-menu"><button onClick={()=>deleteColumn(col.id)}><Trash width={16} height={16}/> Eliminar columna</button></div>}</div>}</div></header>
      <div className="task-list" onDragOver={event=>{if(event.dataTransfer.types.includes('text/task')){event.preventDefault();event.stopPropagation();setBoardDropTarget({columnId:col.id,targetId:null,placement:'after'})}}} onDrop={event=>{const taskId=event.dataTransfer.getData('text/task');if(taskId){event.preventDefault();event.stopPropagation();reorderBoardTasks(taskId,col.id,null);setBoardDropTarget(null)}}}>{list.map(t=><TaskCard key={t.id} task={t} onEdit={openTask} onArchive={archive} onToggleChecklist={toggleChecklist} boardDropTarget={boardDropTarget?.columnId===col.id&&boardDropTarget?.targetId===t.id?boardDropTarget:null} onDragOver={event=>{if(event.dataTransfer.types.includes('text/task')){event.preventDefault();event.stopPropagation();const bounds=event.currentTarget.getBoundingClientRect();setBoardDropTarget({columnId:col.id,targetId:t.id,placement:event.clientY<bounds.top+bounds.height/2?'before':'after'})}}} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget))setBoardDropTarget(null)}} onDrop={event=>{const taskId=event.dataTransfer.getData('text/task');if(taskId){event.preventDefault();event.stopPropagation();const target=boardDropTarget?.targetId===t.id?boardDropTarget:{columnId:col.id,targetId:t.id,placement:'before'};reorderBoardTasks(taskId,col.id,target.targetId,target.placement);setBoardDropTarget(null)}}} onDragStart={(e,id)=>{e.stopPropagation();e.dataTransfer.setData('text/task',id)}} onDragEnd={()=>setBoardDropTarget(null)}/>) }
      {col.id!==doneColumnId&&<button className="add-card" onClick={()=>openTask(null,col.id)}><Plus width={18} height={18}/> Añadir tarea</button>}{col.id===doneColumnId&&columnTasks.length>12&&<button className="view-more-done" onClick={onViewCompleted}>Ver más</button>}</div></section>})}
      <section className={`add-column ${newColumn?'is-creating':''}`} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const draggedColumn=event.dataTransfer.getData('text/column');if(draggedColumn)reorderColumn(draggedColumn,null)}}>{newColumn?<form onSubmit={e=>{e.preventDefault();const v=e.currentTarget.elements.title.value.trim();if(v){setColumns(c=>[...c,{id:crypto.randomUUID(),slug:`column-${Date.now()}`,title:v.toUpperCase(),color:themeColors.archive,isFixed:false}]);setNewColumn(false)}}}><input name="title" autoFocus placeholder="NOMBRE DE LA COLUMNA" onChange={event=>{event.currentTarget.value=event.currentTarget.value.toUpperCase()}}/><div><button type="button" className="icon-button" onClick={()=>setNewColumn(false)} aria-label="Cancelar"><X width={20} height={20}/></button><button className="primary add-column-confirm" aria-label="Añadir columna"><Check width={20} height={20}/></button></div></form>:<button onClick={()=>setNewColumn(true)}><Plus width={18} height={18}/> Añadir columna</button>}</section>
    </div>{movePrompt&&<Modal title={promptDetails[movePrompt.type].title} onClose={()=>setMovePrompt(null)}><p className="move-prompt-copy">{promptDetails[movePrompt.type].copy}</p><footer className="modal-actions"><button type="button" className="secondary" onClick={()=>setMovePrompt(null)}>{movePrompt.type==='complete'||movePrompt.type==='reset'?'Cancelar':'Entendido'}</button>{(movePrompt.type==='complete'||movePrompt.type==='reset')&&<button className="primary" onClick={confirmMovePrompt}>{movePrompt.type==='complete'?'Finalizar subtareas':'Deshacer subtareas'}</button>}</footer></Modal>}</div>;
}

function ArchiveView({ tasks, columns, setTasks, openTask }) {
  const [page,setPage]=useState(0);
  const archivedTasks=tasks.filter(task=>task.status==='deprecated').sort((a,b)=>String(b.deprecatedAt||'').localeCompare(String(a.deprecatedAt||'')));
  const perPage=20;
  const totalPages=Math.max(1,Math.ceil(archivedTasks.length/perPage));
  const currentPage=Math.min(page,totalPages-1);
  const visibleTasks=archivedTasks.slice(currentPage*perPage,currentPage*perPage+perPage);
  const todoColumnId=columns.find(column=>column.slug==='todo'||column.id==='todo')?.id||'todo';
  const restore=task=>setTasks(items=>items.map(item=>item.id===task.id?{...item,status:'active',columnId:todoColumnId,deprecatedAt:undefined,completedAt:undefined}:item));
  const deletePermanently=task=>{if(window.confirm(`¿Eliminar definitivamente “${task.title}”? Esta acción no se puede deshacer.`))setTasks(items=>items.filter(item=>item.id!==task.id))};
  return <div className="today-view archive-view"><ProjectSwitcher/><div className="today-header"><div><h1>Tareas archivadas <span className="page-title-count">{archivedTasks.length}</span></h1><p className="subtitle">Recupera tareas archivadas o elimínalas definitivamente.</p></div></div><section className="today-panel"><div className="today-list">{archivedTasks.length?visibleTasks.map(task=>{const archivedDate=(task.deprecatedAt||task.due).slice(0,10);return <article className="today-row archive-task-row" key={task.id} onClick={()=>openTask(task)}><span className="today-check archive-task-marker" aria-hidden="true"><X width={14} height={14} strokeWidth={2.4}/></span><div className="today-copy"><h3>{task.title}</h3><p>{task.description||'Sin detalles adicionales.'}</p></div><span className="today-status archive-task-status">Archivada</span><span className="today-date"><CalendarBlank width={15} height={15}/> {formatPeriodDate(archivedDate)}</span><div className="archive-row-actions"><button className="restore-task" onClick={event=>{event.stopPropagation();restore(task)}}>Restaurar</button><button className="delete-archive-task" onClick={event=>{event.stopPropagation();deletePermanently(task)}} aria-label={`Eliminar ${task.title}`} title="Eliminar definitivamente"><Trash width={17} height={17}/></button></div></article>}) : <div className="today-empty"><Archive width={32} height={32}/><h3>El archivo está vacío</h3><p>Las tareas que archives desde el tablero aparecerán aquí.</p></div>}</div>{archivedTasks.length>perPage&&<footer className="completed-pagination"><span>Página {currentPage+1} de {totalPages}</span><div><button className="icon-button" disabled={currentPage===0} onClick={()=>setPage(current=>Math.max(0,current-1))} aria-label="Página anterior"><NavArrowLeft width={20} height={20}/></button><button className="icon-button" disabled={currentPage===totalPages-1} onClick={()=>setPage(current=>Math.min(totalPages-1,current+1))} aria-label="Página siguiente"><NavArrowRight width={20} height={20}/></button></div></footer>}</section></div>;
}

function Timeline({ tasks, columns, setTasks, openTask, holidays, setHolidays, initialAnchorDate }) {
  const today=toISODate(new Date());
  const [anchorDate,setAnchorDate]=useState(initialAnchorDate||today);
  const [dragTargetDay,setDragTargetDay]=useState(null);
  const [verticalDropLane,setVerticalDropLane]=useState(null);
  const [holidayMenu,setHolidayMenu]=useState(null);
  const wheelDistance=useRef(0);
  const wheelLocked=useRef(false);
  const wheelUnlockTimer=useRef(null);
  useEffect(()=>()=>window.clearTimeout(wheelUnlockTimer.current),[]);
  const range=useMemo(()=>getPeriodRange('week',anchorDate),[anchorDate]);
  const days=useMemo(()=>Array.from({length:5},(_,index)=>toISODate(addDays(parseISODate(range.start),index))),[range.start]);
  const workEnd=days[days.length-1];
  const visibleTasks=tasks.map((task,index)=>({...task,timelinePosition:task.position??index})).filter(task=>task.status!=='deprecated'&&(task.start||task.due)<=workEnd&&task.due>=range.start).sort((a,b)=>a.timelinePosition-b.timelinePosition||(a.start||a.due).localeCompare(b.start||b.due)||b.due.localeCompare(a.due));
  const columnById=new Map(columns.map(column=>[column.id,column]));
  const taskStatusLabel=task=>(columnById.get(task.columnId)?.title||'Sin estado').toUpperCase();
  const taskStatusTone=task=>columnTone(columnById.get(task.columnId));
  const isOverdue=task=>task.status==='active'&&task.due<today;
  const isOverdueDoing=task=>{const column=columnById.get(task.columnId);return (column?.slug==='doing'||column?.id==='doing')&&task.status!=='completed'&&task.due<today};
  const timelineLanes=[];
  visibleTasks.forEach(task=>{
    const clippedStart=(task.start||task.due)>range.start?(task.start||task.due):range.start;
    const clippedEnd=task.due<workEnd?task.due:workEnd;
    let lane=timelineLanes.find(candidate=>candidate.end<clippedStart);
    if(!lane){lane={end:clippedEnd,tasks:[]};timelineLanes.push(lane)}
    lane.tasks.push(task);
    lane.end=clippedEnd;
  });
  const moveWeek=offset=>setAnchorDate(toISODate(addDays(parseISODate(anchorDate),offset*7)));
  const moveTaskByDays=(taskId,offset)=>setTasks(items=>items.map(task=>String(task.id)===String(taskId)?{...task,start:toISODate(addDays(parseISODate(task.start||task.due),offset)),due:toISODate(addDays(parseISODate(task.due),offset))}:task));
  const moveTaskToDay=(taskId,day)=>{const task=tasks.find(item=>String(item.id)===String(taskId));if(task)moveTaskByDays(taskId,differenceInDays(task.start||task.due,day))};
  const resizeTaskToDay=(taskId,day)=>setTasks(items=>items.map(task=>{if(String(task.id)!==String(taskId))return task;const start=task.start||task.due;return {...task,due:day<start?start:day}}));
  const reorderTimelineTask=(taskId,targetLaneIndex)=>{const targetId=timelineLanes[targetLaneIndex]?.tasks[0]?.id;if(!targetId||String(taskId)===String(targetId))return;setTasks(items=>{const ordered=items.map((task,index)=>({...task,_position:task.position??index})).sort((a,b)=>a._position-b._position);const sourceIndex=ordered.findIndex(task=>String(task.id)===String(taskId));const targetIndex=ordered.findIndex(task=>String(task.id)===String(targetId));if(sourceIndex<0||targetIndex<0)return items;const [dragged]=ordered.splice(sourceIndex,1);ordered.splice(targetIndex,0,dragged);return ordered.map(({_position,...task},position)=>({...task,position}))})};
  const dayFromPointer=(event,element)=>{const bounds=element.getBoundingClientRect();const index=Math.max(0,Math.min(days.length-1,Math.floor((event.clientX-bounds.left)/(bounds.width/days.length))));return days[index]};
  const isHoliday=day=>holidays.includes(day);
  const toggleHoliday=day=>setHolidays(current=>current.includes(day)?current.filter(value=>value!==day):[...current,day]);
  const dropTask=event=>{event.preventDefault();const day=dayFromPointer(event,event.currentTarget);if(isHoliday(day)){setDragTargetDay(null);return}const resizeTaskId=event.dataTransfer.getData('text/timeline-resize');const taskId=event.dataTransfer.getData('text/timeline-task');if(resizeTaskId)resizeTaskToDay(resizeTaskId,day);else if(taskId)moveTaskToDay(taskId,day);setDragTargetDay(null)};
  const createTaskOnEmptyDay=event=>{const day=dayFromPointer(event,event.currentTarget);if(event.target.closest('.timeline-task')||isHoliday(day))return;openTask(null,undefined,day)};
  const navigateWithHorizontalScroll=event=>{if(event.currentTarget.scrollWidth>event.currentTarget.clientWidth+1)return;const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.shiftKey?event.deltaY:0;if(!horizontal)return;event.preventDefault();if(wheelLocked.current)return;wheelDistance.current+=horizontal;if(Math.abs(wheelDistance.current)<70)return;moveWeek(wheelDistance.current>0?1:-1);wheelDistance.current=0;wheelLocked.current=true;wheelUnlockTimer.current=window.setTimeout(()=>{wheelLocked.current=false},420)};
  return <div className="timeline-view"><div className="timeline-header"><div><ProjectSwitcher/><div className="timeline-title"><h1>Planificación</h1><span>{visibleTasks.length} {visibleTasks.length===1?'tarea':'tareas'}</span></div><p className="subtitle">Distribuye el trabajo y revisa la carga de cada día.</p></div><button className="primary" onClick={()=>openTask(null)}><Plus width={18} height={18} strokeWidth={2.2}/> Nueva tarea</button></div>
    <section className="timeline-panel"><header className="timeline-toolbar"><button className="timeline-today" onClick={()=>setAnchorDate(today)}>Esta semana</button><div className="timeline-week-switcher"><button className="icon-button" onClick={()=>moveWeek(-1)} aria-label="Semana anterior"><NavArrowLeft width={20} height={20}/></button><strong>{formatPeriodDate(range.start)} — {formatPeriodDate(workEnd)}</strong><button className="icon-button" onClick={()=>moveWeek(1)} aria-label="Semana siguiente"><NavArrowRight width={20} height={20}/></button></div><label className="timeline-date-picker"><span>Ir a fecha</span><input type="date" value={anchorDate} onChange={event=>setAnchorDate(event.target.value)} aria-label="Seleccionar una fecha para mostrar su semana"/></label></header>
      <div className="timeline-scroll" onWheel={navigateWithHorizontalScroll} title="Desplázate horizontalmente para cambiar de semana"><div className="timeline-calendar"><div className="timeline-days">{days.map(day=>{const date=parseISODate(day);const holiday=isHoliday(day);return <div className={`${day===today?'is-today':''} ${holiday?'is-holiday':''}`} key={day}><span>{date.toLocaleDateString('es-CL',{weekday:'long'}).replace('.','')}</span><b>{date.getDate()}</b><div className="timeline-day-menu-wrap"><button className="icon-button timeline-day-menu-trigger" onClick={()=>setHolidayMenu(current=>current===day?null:day)} aria-label={`Opciones para ${formatPeriodDate(day)}`} aria-expanded={holidayMenu===day}><DotsThree width={18} height={18}/></button>{holidayMenu===day&&<div className="timeline-day-menu"><button onClick={()=>{toggleHoliday(day);setHolidayMenu(null)}}>{holiday?'Desmarcar feriado':'Marcar como feriado'}</button></div>}</div></div>})}</div>
        <div className="timeline-body" onDoubleClick={createTaskOnEmptyDay} onDragOver={event=>{event.preventDefault();const day=dayFromPointer(event,event.currentTarget);setDragTargetDay(isHoliday(day)?null:day)}} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget))setDragTargetDay(null)}} onDrop={dropTask}>{days.filter(isHoliday).map(day=><div className="timeline-holiday-overlay" key={day} style={{left:`calc(${differenceInDays(range.start,day)} * 100% / 5)`}}/>)}{dragTargetDay&&<div className="timeline-drop-highlight" style={{left:`calc(${differenceInDays(range.start,dragTargetDay)} * 100% / 5)`}}/>}{timelineLanes.length?timelineLanes.map((lane,laneIndex)=><div className={`timeline-task-row ${verticalDropLane===laneIndex?'is-vertical-drop-target':''}`} key={laneIndex} onDragOver={event=>{if(event.dataTransfer.types.includes('text/timeline-task')){event.preventDefault();event.stopPropagation();const day=dayFromPointer(event,event.currentTarget);setVerticalDropLane(laneIndex);setDragTargetDay(isHoliday(day)?null:day)}}} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget)){setVerticalDropLane(null);setDragTargetDay(null)}}} onDrop={event=>{const taskId=event.dataTransfer.getData('text/timeline-task');const day=dayFromPointer(event,event.currentTarget);if(taskId){event.preventDefault();event.stopPropagation();if(!isHoliday(day)){moveTaskToDay(taskId,day);reorderTimelineTask(taskId,laneIndex)}}setVerticalDropLane(null);setDragTargetDay(null)}}>{lane.tasks.map(task=>{const taskStart=task.start||task.due;const clippedStart=taskStart>range.start?taskStart:range.start;const clippedEnd=task.due<workEnd?task.due:workEnd;const startColumn=differenceInDays(range.start,clippedStart)+1;const endColumn=differenceInDays(range.start,clippedEnd)+2;const effort=Number(task.effort)||3;return <div key={task.id} draggable onDragStart={event=>{event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/timeline-task',task.id)}} onDragEnd={()=>{setDragTargetDay(null);setVerticalDropLane(null)}} className={`timeline-task ${task.status==='completed'?'completed':''} ${isOverdue(task)?'overdue':''} ${isOverdueDoing(task)?'overdue-doing':''} ${taskStart<range.start?'continues-before':''} ${task.due>workEnd?'continues-after':''}`} style={{gridColumn:`${startColumn} / ${endColumn}`}} title={task.title}><button className="timeline-task-open" onClick={()=>openTask(task)}><span className="timeline-task-copy"><strong>{task.title}</strong><em><CalendarBlank width={12} height={12}/>{fmt(taskStart)} — {fmt(task.due)}</em></span><span className="timeline-task-meta"><b className={`timeline-status status-${taskStatusTone(task)}`}>{taskStatusLabel(task)}</b><span className="timeline-effort" aria-label={`Esfuerzo ${effort} de 5`} title={`Esfuerzo ${effort} de 5`}>{[1,2,3,4,5].map(level=><i className={level<=effort?'is-filled':''} key={level}/>)}</span></span></button><button type="button" draggable className="timeline-resize-handle" aria-label={`Cambiar duración de ${task.title}`} title="Arrastra para cambiar la duración por días" onClick={event=>event.stopPropagation()} onDragStart={event=>{event.stopPropagation();event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/timeline-resize',task.id)}} onDragEnd={()=>setDragTargetDay(null)}/></div>})}</div>):<div className="timeline-empty"><CalendarBlank width={30} height={30}/><b>Sin tareas esta semana</b><span>Navega a otra semana o crea una nueva tarea.</span></div>}</div>
      </div></div>
    </section>
  </div>;
}

function Reports({ tasks, openTask, canShare=false, hideShare=false }) {
  const [periodType,setPeriodType]=useState('month');
  const [anchorDate,setAnchorDate]=useState('2026-07-14');
  const [openDetail,setOpenDetail]=useState(null);
  const [shareState,setShareState]=useState('');
  const [datePickerOpen,setDatePickerOpen]=useState(false);
  const range=useMemo(()=>getPeriodRange(periodType,anchorDate),[periodType,anchorDate]);
  const inPeriod=date=>date&&date.slice(0,10)>=range.start&&date.slice(0,10)<=range.end;
  const completedTasks=tasks.filter(task=>task.status==='completed'&&inPeriod(task.completedAt));
  const completed=completedTasks.length;
  const pendingTasks=tasks.filter(task=>task.status==='active'&&inPeriod(task.due));
  const pending=pendingTasks.length;
  const periodTasks=[...completedTasks,...pendingTasks];
  const effortAverage=periodTasks.length?periodTasks.reduce((sum,task)=>sum+(Number(task.effort)||3),0)/periodTasks.length:0;
  const effortCounts=[1,2,3,4,5].map(level=>({level,count:periodTasks.filter(task=>(Number(task.effort)||3)===level).length}));
  const maxEffortCount=Math.max(...effortCounts.map(item=>item.count),1);
  const total=Math.max(completed+pending,1);
  const data=[{key:'completed',label:'Tareas terminadas',value:completed,color:themeColors.primary,icon:Check},{key:'pending',label:'Tareas pendientes',value:pending,color:themeColors.interaction,icon:ClipboardText}];
  const detailTasks=openDetail==='completed'?completedTasks:pendingTasks;
  const anchor=parseISODate(anchorDate);
  const quarter=Math.floor(anchor.getMonth()/3)+1;
  const years=[2024,2025,2026,2027];
  const periodLabel=range.start===range.end?formatPeriodDate(range.start):`${formatPeriodDate(range.start)} — ${formatPeriodDate(range.end)}`;
  const weekStart=(year,week)=>{const janFourth=new Date(Number(year),0,4,12);const firstMonday=addDays(janFourth,-((janFourth.getDay()+6)%7));return toISODate(addDays(firstMonday,(Number(week)-1)*7))};
  const activeWeek=Math.max(1,Math.min(53,Math.round((parseISODate(anchorDate)-parseISODate(weekStart(anchor.getFullYear(),1)))/(7*86400000))+1));
  const selectedPeriod=`${periodType}:${periodType==='month'?anchor.getMonth()+1:periodType==='quarter'?quarter:activeWeek}`;
  const choosePeriod=value=>{const [type,selection]=value.split(':');const year=anchor.getFullYear();setPeriodType(type);if(type==='month')setAnchorDate(`${year}-${String(selection).padStart(2,'0')}-01`);if(type==='quarter')setAnchorDate(`${year}-${String((Number(selection)-1)*3+1).padStart(2,'0')}-01`);if(type==='week')setAnchorDate(weekStart(year,selection))};
  const setPeriodYear=value=>{if(periodType==='week')setAnchorDate(weekStart(value,activeWeek));else setAnchorDate(`${value}-${String(anchor.getMonth()+1).padStart(2,'0')}-01`)};
  const shareReport=async()=>{try{await navigator.clipboard.writeText(window.location.origin);setShareState('Enlace copiado')}catch{setShareState('No se pudo copiar')}};
  return <div className="reports"><div className="reports-header"><div className="report-tabs" role="tablist" aria-label="Secciones del reporte"><button type="button" role="tab" aria-selected="true">Resumen General</button></div><div className="reports-controls">{!hideShare&&<button className="share-report" disabled={!canShare} onClick={shareReport} title={canShare?'Copiar URL privada del reporte':'Disponible al conectar el acceso externo'}><ShareAndroid width={18} height={18}/> {shareState||'Compartir'}</button>}<div className="period-controls"><select aria-label="Año del reporte" value={anchor.getFullYear()} onChange={event=>setPeriodYear(event.target.value)}>{years.map(year=><option key={year}>{year}</option>)}</select><select aria-label="Período del reporte" value={selectedPeriod} onChange={event=>choosePeriod(event.target.value)}><optgroup label="Meses">{months.map((month,index)=><option key={month} value={`month:${index+1}`}>{month}</option>)}</optgroup><optgroup label="Trimestres">{[1,2,3,4].map(value=><option key={value} value={`quarter:${value}`}>Q{value}</option>)}</optgroup><optgroup label="Semanas">{Array.from({length:53},(_,index)=><option key={index+1} value={`week:${index+1}`}>Semana {index+1}</option>)}</optgroup></select><button type="button" className="period-picker-trigger" onClick={()=>setDatePickerOpen(true)} aria-label="Elegir fecha"><CalendarBlank width={18} height={18}/></button></div></div></div>
    {datePickerOpen&&<Modal title="Elegir fecha" onClose={()=>setDatePickerOpen(false)}><div className="date-picker-modal"><label>Fecha<input autoFocus type="date" value={anchorDate} onChange={event=>setAnchorDate(event.target.value)}/></label><footer className="modal-actions"><button type="button" className="primary" onClick={()=>setDatePickerOpen(false)}>Aplicar</button></footer></div></Modal>}
    <section className="report-panel report-overview"><div><p className="eyebrow">DISTRIBUCIÓN</p><h2>Estado de las tareas</h2><p>Actividad del {periodLabel}</p></div><div className="report-overview-body"><div className="chart-area"><div className="donut" style={{background:`conic-gradient(${themeColors.primary} 0 ${completed/total*100}%, ${themeColors.interaction} ${completed/total*100}% 100%)`}}><div><strong>{completed+pending}</strong><span>Tareas</span></div></div><div className="legend">{data.map(item=><div key={item.label}><span style={{background:item.color}}></span><p>{item.label}<b>{item.value}</b></p></div>)}</div></div><section className="effort-panel report-effort"><div className="effort-summary"><div className="metric-icon"><Lightning width={22} height={22}/></div><div><p className="eyebrow">NIVEL DE ESFUERZO</p><h2>{effortAverage?effortAverage.toFixed(1):'—'}<span> / 5 promedio</span></h2><p>{periodTasks.length} {periodTasks.length===1?'tarea considerada':'tareas consideradas'} en el período</p></div></div><div className="effort-mini-chart" aria-label="Distribución del nivel de esfuerzo">{effortCounts.map(item=><div key={item.level}><b>{item.count}</b><i style={{height:`${item.count?Math.max(item.count/maxEffortCount*100,18):4}%`}}></i><span>{item.level}</span></div>)}</div></section></div></section>
    <div className="report-cards">{data.map(item=><article className={`report-card-action ${openDetail===item.key?'is-expanded':''}`} key={item.key} onClick={()=>setOpenDetail(current=>current===item.key?null:item.key)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setOpenDetail(current=>current===item.key?null:item.key)}}} role="button" tabIndex={0} aria-expanded={openDetail===item.key}><strong className="report-card-count">{item.value}</strong><span>{item.label}</span><small>{Math.round(item.value/total*100)}% del total del período</small></article>)}</div>
    {openDetail&&<section className={`completed-report report-detail is-${openDetail}`}><div className="report-detail-list">{detailTasks.length?detailTasks.map(task=>{const date=openDetail==='completed'?task.completedAt:task.due;const StatusIcon=openDetail==='completed'?Check:CalendarBlank;return <button key={task.id} onClick={()=>openTask(task)}><b>{task.title}</b><span><StatusIcon width={15} height={15}/> {formatPeriodDate(date.slice(0,10))}</span></button>}):<div className="completed-empty">No hay tareas {openDetail==='completed'?'terminadas':'pendientes'} en este período.</div>}</div></section>}
  </div>;
}

function Today({ tasks, setTasks, openTask }) {
  const today = toISODate(new Date());
  const completedToday=task=>task.status==='completed'&&String(task.completedAt||'').slice(0,10)===today;
  const list = tasks.filter(task => task.status !== 'deprecated' && (task.due === today || (task.status==='active' && task.due<today) || completedToday(task))).sort((a,b)=>{const priority=task=>task.status==='active'&&task.due<today?0:task.status==='active'?1:2;return priority(a)-priority(b)||a.due.localeCompare(b.due)});
  const overdueTasks=tasks.filter(task=>task.status==='active'&&task.due<today).sort((a,b)=>a.due.localeCompare(b.due));

  return <div className="today-view">
    <div className="today-header">
      <div><ProjectSwitcher/><h1>Buen día Ricardo! <span className="page-title-count">{list.length}</span></h1><p className="subtitle">Esta es tu carga de tareas para hoy{overdueTasks.length?' y ojo con las vencidas.':'.'}</p></div>
      <button className="primary" onClick={() => openTask(null)}><Plus width={18} height={18} strokeWidth={2.2}/> Nueva tarea</button>
    </div>
    {overdueTasks.length>0&&<div className="overdue-alert" role="status"><span>Tienes {overdueTasks.length} {overdueTasks.length===1?'tarea vencida':'tareas vencidas'}</span></div>}
    <section className="today-panel">
      <div className="today-list">{list.length ? list.map(task => <article className={`today-row home-task-row ${task.status==='active'&&task.due<today?'overdue':''}`} key={task.id} onClick={() => openTask(task)}>
        <div className="today-copy"><h3>{task.title}</h3><p>{normalizeChecklist(task.checklist,task.description,task.id).map(item=>item.text.trim()).filter(Boolean).join(', ')}</p></div>
        <span className={`today-status status-${task.status === 'completed' ? 'done' : task.columnId === 'doing' ? 'doing' : 'todo'}`}>{task.status === 'completed' ? 'DONE' : task.columnId === 'doing' ? 'DOING' : 'TO-DO'}</span>
      </article>) : <div className="today-empty"><CalendarBlank width={32} height={32}/><h3>No hay tareas para Home</h3><p>Disfruta el espacio o prepara tu próxima prioridad.</p></div>}</div>
    </section>
  </div>;
}

function CompletedTasks({ tasks, setTasks, openTask }) {
  const [page,setPage]=useState(0);
  const [archivingTask,setArchivingTask]=useState(null);
  const [menuTask,setMenuTask]=useState(null);
  const list=tasks.filter(task=>task.status==='completed').sort((a,b)=>String(b.completedAt||b.due).localeCompare(String(a.completedAt||a.due)));
  const perPage=20;
  const totalPages=Math.max(1,Math.ceil(list.length/perPage));
  const currentPage=Math.min(page,totalPages-1);
  const visibleTasks=list.slice(currentPage*perPage,currentPage*perPage+perPage);
  const archiveTask=()=>{if(!archivingTask)return;setTasks(items=>items.map(task=>task.id===archivingTask.id?{...task,status:'deprecated',deprecatedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}:task));setArchivingTask(null)};
  return <div className="today-view completed-tasks-view"><div className="today-header"><div><ProjectSwitcher/><h1>Historial <span className="page-title-count">{list.length}</span></h1><p className="subtitle">Revisa todas las tareas que ya completaste.</p></div></div>
    <section className="today-panel"><div className="today-list">{list.length?visibleTasks.map(task=><article className="today-row completed-task-row" key={task.id} onClick={()=>openTask(task)}><span className="today-check checked" aria-hidden="true"><Check width={14} height={14} strokeWidth={2.2}/></span><div className="today-copy"><h3>{task.title}</h3><p>{task.description||'Sin detalles adicionales.'}</p></div><span className="today-status status-done">DONE</span><div className="task-menu-wrap completed-task-menu"><button className="icon-button" onClick={event=>{event.stopPropagation();setMenuTask(current=>current?.id===task.id?null:task)}} aria-label={`Opciones de ${task.title}`} aria-expanded={menuTask?.id===task.id}><DotsThree width={22} height={22}/></button>{menuTask?.id===task.id&&<div className="task-menu"><button onClick={event=>{event.stopPropagation();setMenuTask(null);setArchivingTask(task)}}><Archive width={16} height={16}/> Archivar</button></div>}</div></article>) : <div className="today-empty"><Check width={32} height={32}/><h3>Aún no hay tareas terminadas</h3><p>Las tareas que completes aparecerán aquí.</p></div>}</div>{list.length>perPage&&<footer className="completed-pagination"><span>Página {currentPage+1} de {totalPages}</span><div><button className="icon-button" disabled={currentPage===0} onClick={()=>setPage(current=>Math.max(0,current-1))} aria-label="Página anterior"><NavArrowLeft width={20} height={20}/></button><button className="icon-button" disabled={currentPage===totalPages-1} onClick={()=>setPage(current=>Math.min(totalPages-1,current+1))} aria-label="Página siguiente"><NavArrowRight width={20} height={20}/></button></div></footer>}</section>{archivingTask&&<Modal title="Archivar tarea" onClose={()=>setArchivingTask(null)}><p className="move-prompt-copy">¿Quieres archivar “{archivingTask.title}”? Podrás restaurarla desde Archivo.</p><footer className="modal-actions"><button type="button" className="secondary" onClick={()=>setArchivingTask(null)}>Cancelar</button><button className="primary" onClick={archiveTask}>Archivar</button></footer></Modal>}</div>;
}

export function App() {
  const isLocalReportPreview=!supabaseConfig.isConfigured&&import.meta.env.VITE_REPORT_PREVIEW==='true';
  const [page,setPage]=useState(()=>{const saved=localStorage.getItem('td-page')||'board';return saved==='settings'&&!supabaseConfig.isConfigured?'board':saved});
  const [timelineAnchorDate,setTimelineAnchorDate]=useState(null);
  const [sidebarCollapsed,setSidebarCollapsed]=useState(true);
  const [theme,setTheme]=useState(()=>localStorage.getItem('td-theme')||'system');
  const [boardTitle,setBoardTitle]=useState(()=>localStorage.getItem('td-board-title')||'Mi tablero');
  const [columns,setColumns]=useState(()=>{const saved=JSON.parse(localStorage.getItem('td-columns')||'null')||initialColumns;const legacyColors=['#7c6ee6','#65dcd5','#f5cbcb','#ffe2e2','#c5b3d3','#00a8e8','#007ea7','#003459','#ffef00','#ff7538','#11ee11','#ff66cc'];return saved.map(column=>({...column,color:columnPalette[column.id]||(legacyColors.includes(column.color)?themeColors.archive:column.color)}))});
  const [tasks,setTasks]=useState(()=>{const saved=JSON.parse(localStorage.getItem('td-tasks')||'null')||initialTasks;return saved.map(task=>({...task,start:task.start||task.due,checklist:normalizeChecklist(task.checklist,task.description,task.id)}))});
  const [editing,setEditing]=useState(null), [defaultColumn,setDefaultColumn]=useState(null), [defaultDate,setDefaultDate]=useState(null), [modal,setModal]=useState(false);
  const [holidays,setHolidays]=useState(()=>JSON.parse(localStorage.getItem('td-holidays')||'[]'));
  const [session,setSession]=useState(supabaseConfig.isConfigured?undefined:null);
  const [access,setAccess]=useState(null);
  const [cloudReady,setCloudReady]=useState(false);
  const [cloudError,setCloudError]=useState('');
  const syncQueue=useRef(Promise.resolve());
  useEffect(()=>{if(!supabaseConfig.isConfigured)return;let active=true;authRepository.getSession().then(value=>{if(active)setSession(value)}).catch(reason=>{if(active){setCloudError(reason.message);setSession(null)}});const unsubscribe=authRepository.onAuthStateChange(value=>{if(active){setSession(value);if(!value){setAccess(null);setCloudReady(false)}}});return()=>{active=false;unsubscribe()}},[]);
  useEffect(()=>{if(!supabaseConfig.isConfigured||!session?.user)return;let active=true;setCloudReady(false);setCloudError('');const loadCloud=async()=>{const nextAccess=await authRepository.getBoardAccess(supabaseConfig.boardId,session.user.id);const hasLocalData=Boolean(localStorage.getItem('td-columns')&&localStorage.getItem('td-tasks'));const cloudCounts=await dashboardRepository.count(supabaseConfig.boardId);const cloudAlreadyHasData=cloudCounts.tasks>0||cloudCounts.columns>3;if(nextAccess.role==='owner'&&hasLocalData&&!hasCompletedLocalMigration()&&!cloudAlreadyHasData)await migrateLocalDashboard();const data=await dashboardRepository.load(supabaseConfig.boardId);if(!active)return;const loadedTasks=data.tasks.map(task=>({...task,checklist:normalizeChecklist(task.checklist,task.description,task.id)}));setAccess(nextAccess);setBoardTitle(data.board.name);setColumns(data.columns);setTasks(loadedTasks);if(nextAccess.role==='owner'&&supabaseConfig.captureLocalSnapshot)saveLocalDashboardSnapshot({boardTitle:data.board.name,columns:data.columns,tasks:loadedTasks});else if(nextAccess.role==='owner')retireLocalDashboard();if(nextAccess.role==='viewer')setPage('reports');setCloudReady(true)};loadCloud().catch(reason=>{if(active)setCloudError(reason.message)});return()=>{active=false}},[session]);
  useEffect(()=>{if(!supabaseConfig.isConfigured||!cloudReady||!access?.canWrite)return;let active=true;const snapshot={boardTitle,columns,tasks};const timeout=setTimeout(()=>{syncQueue.current=syncQueue.current.catch(()=>{}).then(()=>dashboardRepository.syncSnapshot(supabaseConfig.boardId,snapshot));syncQueue.current.then(()=>{if(active)setCloudError('')}).catch(reason=>{if(active)setCloudError(`${reason.message} Los cambios permanecen visibles, pero aún no se confirmaron en la nube.`)})},650);return()=>{active=false;clearTimeout(timeout)}},[boardTitle,columns,tasks,cloudReady,access]);
  useEffect(()=>{if(!supabaseConfig.isConfigured)localStorage.setItem('td-columns',JSON.stringify(columns))},[columns]);
  useEffect(()=>{if(!supabaseConfig.isConfigured)localStorage.setItem('td-tasks',JSON.stringify(tasks))},[tasks]);
  useEffect(()=>localStorage.setItem('td-holidays',JSON.stringify(holidays)),[holidays]);
  useEffect(()=>{if(!supabaseConfig.isConfigured)localStorage.setItem('td-board-title',boardTitle)},[boardTitle]);
  useEffect(()=>localStorage.setItem('td-page',page),[page]);
  useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const applyTheme=()=>{document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme};applyTheme();localStorage.setItem('td-theme',theme);media.addEventListener('change',applyTheme);return()=>media.removeEventListener('change',applyTheme)},[theme]);
  const pending=useMemo(()=>tasks.filter(t=>t.status==='active').length,[tasks]);
  const todayTaskCount=useMemo(()=>{const today=toISODate(new Date());return tasks.filter(task=>task.status!=='deprecated'&&(task.due===today||(task.status==='active'&&task.due<today)||(task.status==='completed'&&String(task.completedAt||'').slice(0,10)===today))).length},[tasks]);
  const todayPendingCount=useMemo(()=>{const today=toISODate(new Date());return tasks.filter(task=>task.status==='active'&&task.due<=today).length},[tasks]);
  const currentWeekTaskCount=useMemo(()=>{const today=toISODate(new Date());const currentWeek=getPeriodRange('week',today);return tasks.filter(task=>task.status!=='deprecated'&&(task.start||task.due)<=currentWeek.end&&task.due>=currentWeek.start).length},[tasks]);
  const doneColumnId=columns.find(column=>column.slug==='done'||column.id==='done')?.id||'done';
  const openTask=(task,columnId,date)=>{setEditing(task);setDefaultColumn(columnId);setDefaultDate(date);setModal(true)};
  const save=form=>{const taskForm={...form,effort:Number(form.effort),updatedAt:new Date().toISOString()};if(editing)setTasks(ts=>ts.map(t=>t.id===editing.id?{...t,...taskForm,status:form.columnId===doneColumnId?'completed':t.status==='deprecated'?'deprecated':'active',completedAt:form.columnId===doneColumnId?(t.completedAt||new Date().toISOString()):undefined}:t));else setTasks(ts=>[...ts,{...taskForm,id:crypto.randomUUID(),status:form.columnId===doneColumnId?'completed':'active',createdAt:toISODate(new Date()),completedAt:form.columnId===doneColumnId?new Date().toISOString():undefined}]);setModal(false)};
  const themeOptions=['system','light','dark'];
  const cycleTheme=()=>setTheme(current=>themeOptions[(themeOptions.indexOf(current)+1)%themeOptions.length]);
  const ThemeIcon=theme==='system'?Computer:theme==='light'?SunLight:HalfMoon;
  const themeLabel=theme==='system'?'Tema del sistema':theme==='light'?'Tema claro':'Tema oscuro';
  if(supabaseConfig.isConfigured&&session===undefined)return <main className="cloud-state"><span className="loader"/><p>Comprobando acceso…</p></main>;
  if(supabaseConfig.isConfigured&&!session)return <AuthScreen/>;
  if(supabaseConfig.isConfigured&&!cloudReady)return <main className="cloud-state"><span className="loader"/><p>{cloudError||'Cargando el espacio…'}</p>{cloudError&&<button className="secondary" onClick={()=>authRepository.signOut()}>Volver al ingreso</button>}</main>;
  if(access?.role==='viewer'||isLocalReportPreview)return <div className="viewer-shell"><header><div><p className="eyebrow">Proyecto</p><strong>{projectName}</strong></div><div className="viewer-header-actions"><button className="secondary viewer-icon-action" disabled title="Descargar PDF próximamente" aria-label="Descargar reporte en PDF próximamente"><Download width={18} height={18}/></button><button className="secondary viewer-icon-action" onClick={cycleTheme} title={`${themeLabel}. Cambiar apariencia`} aria-label={`${themeLabel}. Cambiar apariencia`}><ThemeIcon width={18} height={18}/></button>{!isLocalReportPreview&&<button className="secondary" onClick={()=>authRepository.signOut()}>Cerrar sesión</button>}</div></header>{cloudError&&<div className="cloud-alert" role="alert">{cloudError}</div>}<main><Reports tasks={tasks} openTask={task=>{setEditing(task);setModal(true)}} hideShare/></main>{modal&&editing&&<Modal title="Detalle de tarea" onClose={()=>setModal(false)}><ReadOnlyTask task={editing} columnTitle={columns.find(column=>column.id===editing.columnId)?.title}/></Modal>}</div>;
  return <div className={`app-shell ${sidebarCollapsed?'sidebar-collapsed':''}`}><aside><div className="account"><label className="sidebar-search"><MagnifyingGlass width={18} height={18}/><input type="search" placeholder="Buscar" aria-label="Buscar"/></label><button className="account-sidebar-toggle" onClick={()=>setSidebarCollapsed(value=>!value)} aria-label={sidebarCollapsed?'Expandir menú':'Contraer menú'} title={sidebarCollapsed?'Expandir menú':'Contraer menú'}>{sidebarCollapsed?<SidebarExpand width={20} height={20}/>:<SidebarCollapse width={20} height={20}/>}</button></div>
    <div className="sidebar-label">VISTAS</div><nav><button className={`today-nav ${page==='today'?'active':''}`} aria-current={page==='today'?'page':undefined} onClick={()=>setPage('today')}><HomeSimple width={21} height={21}/><span>Buen día!</span><b className="today-nav-count">{sidebarCollapsed?todayPendingCount:todayTaskCount}</b></button><button className={page==='board'?'active':''} aria-current={page==='board'?'page':undefined} onClick={()=>setPage('board')}><Kanban width={21} height={21}/><span>Tablero</span><b>{pending}</b></button><button className={page==='timeline'?'active':''} aria-current={page==='timeline'?'page':undefined} onClick={()=>{setTimelineAnchorDate(null);setPage('timeline')}}><CalendarBlank width={21} height={21}/><span>Planificación</span><b>{currentWeekTaskCount}</b></button><button className={page==='completed'?'active':''} aria-current={page==='completed'?'page':undefined} onClick={()=>setPage('completed')}><ClockRotateRight width={21} height={21}/><span>Historial</span><b>{tasks.filter(t=>t.status==='completed').length}</b></button><button className={page==='archive'?'active':''} aria-current={page==='archive'?'page':undefined} onClick={()=>setPage('archive')}><Archive width={21} height={21}/><span>Archivo</span><b>{tasks.filter(t=>t.status==='deprecated').length}</b></button><button disabled title="Notas próximamente"><Book width={21} height={21}/><span>Notas</span></button><button disabled title="Notificaciones próximamente"><Bell width={21} height={21}/><span>Notificaciones</span></button></nav>
    <div className="sidebar-label">OPCIONES</div><nav><button className={page==='reports'?'active':''} onClick={()=>setPage('reports')}><ChartBar width={21} height={21}/><span>Reportes</span></button></nav>
    <div className="aside-bottom"><button className="theme-toggle" onClick={cycleTheme} title={`${themeLabel}. Cambiar apariencia`} aria-label={`${themeLabel}. Cambiar apariencia`}><ThemeIcon width={20} height={20}/><span>{themeLabel}</span></button><button disabled={!access?.canManageAccess} className={page==='settings'?'active':''} onClick={()=>setPage('settings')} title={access?.canManageAccess?'Administrar configuración':'Configuración disponible al conectar Supabase'}><Settings width={20} height={20}/><span>Configuración</span></button>{supabaseConfig.isConfigured&&<button onClick={()=>authRepository.signOut()} title="Cerrar sesión"><LogOut width={20} height={20}/><span>Cerrar sesión</span></button>}</div>
  </aside><main>{cloudError&&<div className="cloud-alert" role="alert">{cloudError}</div>}{page==='board'?<Board columns={columns} tasks={tasks} setTasks={setTasks} setColumns={setColumns} openTask={openTask} onViewCompleted={()=>setPage('completed')}/>:page==='timeline'?<Timeline tasks={tasks} columns={columns} setTasks={setTasks} openTask={openTask} holidays={holidays} setHolidays={setHolidays} initialAnchorDate={timelineAnchorDate}/>:page==='today'?<Today tasks={tasks} setTasks={setTasks} openTask={openTask}/>:page==='completed'?<CompletedTasks tasks={tasks} setTasks={setTasks} openTask={openTask}/>:page==='archive'?<ArchiveView tasks={tasks} columns={columns} setTasks={setTasks} openTask={openTask}/>:page==='settings'?<AccessSettings/>:<Reports tasks={tasks} openTask={openTask} canShare={Boolean(access?.canManageAccess)}/>}</main>
  {modal&&<Modal title={editing?'Editar tarea':'Nueva tarea'} onClose={()=>setModal(false)}><TaskForm task={editing} columns={columns} defaultColumn={defaultColumn} defaultDate={defaultDate} onSave={save} onClose={()=>setModal(false)}/>{editing&&<button className="delete-task" onClick={()=>{setTasks(ts=>ts.filter(t=>t.id!==editing.id));setModal(false)}}><Trash width={17} height={17}/> Eliminar definitivamente</button>}</Modal>}
  </div>;
}

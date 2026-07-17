import { dashboardRepository } from './dashboardRepository';
import { supabaseConfig } from '../lib/supabase';

export const LOCAL_MIGRATION_KEY='td-cloud-migration';
export const LOCAL_BACKUP_KEY='td-local-backup';

export function readLocalSnapshot(storage=localStorage) {
  const columns=JSON.parse(storage.getItem('td-columns')||'[]');
  const tasks=JSON.parse(storage.getItem('td-tasks')||'[]');
  return {
    boardTitle:storage.getItem('td-board-title')||'Mi tablero',
    columns:columns.map((column,index)=>({...column,position:index})),
    tasks:tasks.map((task,index)=>({...task,start:task.start||task.due,effort:Number(task.effort)||3,position:index})),
  };
}

export async function migrateLocalDashboard({storage=localStorage,repository=dashboardRepository,boardId=supabaseConfig.boardId}={}) {
  if(!boardId)throw new Error('Falta VITE_SUPABASE_BOARD_ID para iniciar la migración.');
  const snapshot=readLocalSnapshot(storage);
  if(!snapshot.columns.length)throw new Error('No hay columnas locales para migrar.');
  storage.setItem(LOCAL_BACKUP_KEY,JSON.stringify({createdAt:new Date().toISOString(),snapshot}));
  const result=await repository.migrateLocalSnapshot(boardId,snapshot);
  storage.setItem(LOCAL_MIGRATION_KEY,JSON.stringify({boardId,completedAt:new Date().toISOString(),counts:result.after}));
  return result;
}

export function hasCompletedLocalMigration(storage=localStorage,boardId=supabaseConfig.boardId) {
  try{return JSON.parse(storage.getItem(LOCAL_MIGRATION_KEY)||'null')?.boardId===boardId}catch{return false}
}

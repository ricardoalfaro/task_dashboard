import { requireSupabase } from '../lib/supabase.js';

function dataOrThrow(result,message) {
  if(result.error)throw new Error(`${message}: ${result.error.message}`);
  return result.data;
}

async function manageMembers(action,payload={}) {
  const result=await requireSupabase().functions.invoke('manage-members',{body:{action,...payload}});
  if(result.error)throw new Error(`No se pudo administrar el acceso: ${result.error.message}`);
  if(result.data?.error)throw new Error(result.data.error);
  return result.data;
}

export const permissionsForRole=role=>({
  role,
  canRead:role==='owner'||role==='viewer',
  canWrite:role==='owner',
  canManageAccess:role==='owner',
});

export const authRepository={
  async getSession() {
    const result=await requireSupabase().auth.getSession();
    return dataOrThrow(result,'No se pudo comprobar la sesión').session;
  },

  onAuthStateChange(callback) {
    const {data}=requireSupabase().auth.onAuthStateChange((_event,session)=>callback(session));
    return ()=>data.subscription.unsubscribe();
  },

  async signIn(email,password) {
    const result=await requireSupabase().auth.signInWithPassword({email:email.trim(),password});
    return dataOrThrow(result,'No se pudo iniciar sesión').session;
  },

  async signOut() {
    const result=await requireSupabase().auth.signOut();
    dataOrThrow(result,'No se pudo cerrar la sesión');
  },

  async getBoardAccess(boardId,userId) {
    const client=requireSupabase();
    const boardResult=await client.from('boards').select('owner_id').eq('id',boardId).single();
    const board=dataOrThrow(boardResult,'No se pudo comprobar el acceso al tablero');
    if(board.owner_id===userId)return permissionsForRole('owner');
    const memberResult=await client.from('board_members').select('role').eq('board_id',boardId).eq('user_id',userId).single();
    const member=dataOrThrow(memberResult,'No se pudo comprobar el rol del usuario');
    return permissionsForRole(member.role);
  },

  async listMembers(boardId) {
    return (await manageMembers('list',{boardId})).members;
  },

  async createReportUser(boardId,{email,password}) {
    if(!password || password.length<8)throw new Error('La contraseña temporal debe tener al menos 8 caracteres.');
    return (await manageMembers('upsert',{boardId,email,password,role:'viewer'})).member;
  },

  async updateReportPassword(boardId,{email,password}) {
    if(!password || password.length<8)throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
    return (await manageMembers('upsert',{boardId,email,password,role:'viewer'})).member;
  },

  async revokeMember(boardId,userId) {
    await manageMembers('revoke',{boardId,userId});
  },
};

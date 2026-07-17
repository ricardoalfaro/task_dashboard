import { requireSupabase } from '../lib/supabase.js';

function dataOrThrow(result,message) {
  if(result.error)throw new Error(`${message}: ${result.error.message}`);
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
    const result=await requireSupabase().from('board_members').select('user_id,role,created_at').eq('board_id',boardId).order('created_at');
    return dataOrThrow(result,'No se pudieron cargar los accesos');
  },

  async setMemberRole(boardId,userId,role='viewer') {
    if(!['owner','viewer'].includes(role))throw new Error('El rol indicado no es válido.');
    const result=await requireSupabase().from('board_members').upsert({board_id:boardId,user_id:userId,role},{onConflict:'board_id,user_id'}).select().single();
    return dataOrThrow(result,'No se pudo guardar el acceso');
  },

  async revokeMember(boardId,userId) {
    const result=await requireSupabase().from('board_members').delete().eq('board_id',boardId).eq('user_id',userId);
    dataOrThrow(result,'No se pudo revocar el acceso');
  },
};

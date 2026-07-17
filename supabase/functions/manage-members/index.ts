import { withSupabase } from 'npm:@supabase/server@^1';

const json=(body,status=200)=>Response.json(body,{status});

async function findUserByEmail(admin,email) {
  let page=1;
  while(true){
    const {data,error}=await admin.auth.admin.listUsers({page,perPage:100});
    if(error)throw error;
    const user=data.users.find(item=>item.email?.toLowerCase()===email.toLowerCase());
    if(user)return user;
    if(data.users.length<100)return null;
    page+=1;
  }
}

async function usersById(admin,ids) {
  const wanted=new Set(ids);
  const users=new Map();
  let page=1;
  while(wanted.size&&page<=100){
    const {data,error}=await admin.auth.admin.listUsers({page,perPage:100});
    if(error)throw error;
    for(const user of data.users){if(wanted.has(user.id)){users.set(user.id,user);wanted.delete(user.id)}}
    if(data.users.length<100)break;
    page+=1;
  }
  return users;
}

export default {
  fetch:withSupabase({auth:'user'},async(req,ctx)=>{
    try{
      if(req.method!=='POST')return json({error:'Método no permitido'},405);
      const {action,boardId,email,password,role='viewer',userId}=await req.json();
      if(!boardId)return json({error:'Falta boardId'},400);
      const {data:isOwner,error:ownerError}=await ctx.supabase.rpc('is_board_owner',{target_board_id:boardId});
      if(ownerError)throw ownerError;
      if(!isOwner)return json({error:'Solo el propietario puede administrar accesos.'},403);

      const {data:board,error:boardError}=await ctx.supabaseAdmin.from('boards').select('owner_id').eq('id',boardId).single();
      if(boardError)throw boardError;

      if(action==='list'){
        const {data:members,error}=await ctx.supabaseAdmin.from('board_members').select('user_id,role,created_at').eq('board_id',boardId).order('created_at');
        if(error)throw error;
        const users=await usersById(ctx.supabaseAdmin,members.map(member=>member.user_id));
        return json({members:members.map(member=>({...member,email:users.get(member.user_id)?.email||'Cuenta sin correo'}))});
      }

      if(action==='upsert'){
        if(!email||!['viewer','owner'].includes(role))return json({error:'Correo o rol inválido.'},400);
        let user=await findUserByEmail(ctx.supabaseAdmin,email.trim());
        if(!user){
          if(!password||password.length<8)return json({error:'La contraseña temporal debe tener al menos 8 caracteres.'},400);
          const {data,error}=await ctx.supabaseAdmin.auth.admin.createUser({email:email.trim(),password,email_confirm:true});
          if(error)throw error;
          user=data.user;
        }else if(password){
          if(password.length<8)return json({error:'La contraseña debe tener al menos 8 caracteres.'},400);
          const {error}=await ctx.supabaseAdmin.auth.admin.updateUserById(user.id,{password});
          if(error)throw error;
        }
        if(user.id===board.owner_id)return json({error:'El propietario principal ya tiene acceso completo.'},400);
        const {error}=await ctx.supabaseAdmin.from('board_members').upsert({board_id:boardId,user_id:user.id,role},{onConflict:'board_id,user_id'});
        if(error)throw error;
        return json({member:{user_id:user.id,email:user.email,role}});
      }

      if(action==='revoke'){
        if(!userId||userId===board.owner_id)return json({error:'No se puede revocar al propietario principal.'},400);
        const {error}=await ctx.supabaseAdmin.from('board_members').delete().eq('board_id',boardId).eq('user_id',userId);
        if(error)throw error;
        return json({revoked:true});
      }

      return json({error:'Acción no reconocida.'},400);
    }catch(error){
      console.error(JSON.stringify({event:'manage_members_failed',message:error.message}));
      return json({error:'No se pudo administrar el acceso.'},500);
    }
  }),
};

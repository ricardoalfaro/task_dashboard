import { createClient } from '@supabase/supabase-js';
import { bootstrapSupabase } from './lib/bootstrap-supabase.mjs';

const required=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_OWNER_EMAIL'];
const missing=required.filter(key=>!process.env[key]);
if(missing.length)throw new Error(`Faltan variables requeridas: ${missing.join(', ')}`);

const client=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const result=await bootstrapSupabase(client,{
  ownerEmail:process.env.SUPABASE_OWNER_EMAIL,
  ownerPassword:process.env.SUPABASE_OWNER_PASSWORD,
  boardName:process.env.SUPABASE_BOARD_NAME||'Mi tablero',
});

console.log(JSON.stringify({event:'supabase_bootstrap_finished',...result},null,2));
console.log(`Configura VITE_SUPABASE_BOARD_ID=${result.boardId}`);

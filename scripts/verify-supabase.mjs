import { createClient } from '@supabase/supabase-js';

const supabaseAnonKey=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_ANON_KEY;
const required=['SUPABASE_URL','SUPABASE_BOARD_ID','SUPABASE_OWNER_EMAIL','SUPABASE_OWNER_PASSWORD','SUPABASE_VIEWER_EMAIL','SUPABASE_VIEWER_PASSWORD'];
const missing=[...required.filter(key=>!process.env[key]),...(supabaseAnonKey?[]:['SUPABASE_ANON_KEY o VITE_SUPABASE_ANON_KEY'])];
if(missing.length)throw new Error(`Faltan variables requeridas: ${missing.join(', ')}`);

const {SUPABASE_URL,SUPABASE_BOARD_ID,SUPABASE_OWNER_EMAIL,SUPABASE_OWNER_PASSWORD,SUPABASE_VIEWER_EMAIL,SUPABASE_VIEWER_PASSWORD}=process.env;
const SUPABASE_ANON_KEY=supabaseAnonKey;
const client=()=>createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const checks=[];
const pass=(name,details={})=>{checks.push({name,status:'passed',...details});console.log(JSON.stringify({event:'supabase_check_passed',name,...details}))};

const anonymous=client();
const anonymousResult=await anonymous.from('tasks').select('*',{count:'exact',head:true}).eq('board_id',SUPABASE_BOARD_ID);
if(anonymousResult.error)throw new Error(`La consulta anónima falló de forma inesperada: ${anonymousResult.error.message}`);
if(anonymousResult.count!==0)throw new Error(`RLS expuso ${anonymousResult.count} tareas a un usuario anónimo.`);
pass('anonymous_reads_are_empty');

const owner=client();
const ownerSignIn=await owner.auth.signInWithPassword({email:SUPABASE_OWNER_EMAIL,password:SUPABASE_OWNER_PASSWORD});
if(ownerSignIn.error)throw new Error(`No se pudo autenticar al owner: ${ownerSignIn.error.message}`);
const ownerBoard=await owner.from('boards').select('id,name').eq('id',SUPABASE_BOARD_ID).single();
if(ownerBoard.error)throw new Error(`El owner no pudo leer el tablero: ${ownerBoard.error.message}`);
const ownerWrite=await owner.from('boards').update({name:ownerBoard.data.name}).eq('id',SUPABASE_BOARD_ID).select('id').single();
if(ownerWrite.error)throw new Error(`El owner no pudo escribir: ${ownerWrite.error.message}`);
const ownerMembers=await owner.functions.invoke('manage-members',{body:{action:'list',boardId:SUPABASE_BOARD_ID}});
if(ownerMembers.error||ownerMembers.data?.error)throw new Error(`El owner no pudo administrar miembros: ${ownerMembers.error?.message||ownerMembers.data.error}`);
pass('owner_can_read_write_and_manage',{members:ownerMembers.data.members.length});

const viewer=client();
const viewerSignIn=await viewer.auth.signInWithPassword({email:SUPABASE_VIEWER_EMAIL,password:SUPABASE_VIEWER_PASSWORD});
if(viewerSignIn.error)throw new Error(`No se pudo autenticar al viewer: ${viewerSignIn.error.message}`);
const viewerBoard=await viewer.from('boards').select('id,name').eq('id',SUPABASE_BOARD_ID).single();
if(viewerBoard.error)throw new Error(`El viewer no pudo leer el tablero: ${viewerBoard.error.message}`);
const viewerWrite=await viewer.from('boards').update({name:viewerBoard.data.name}).eq('id',SUPABASE_BOARD_ID).select('id');
if(!viewerWrite.error&&viewerWrite.data?.length)throw new Error('RLS permitió que el viewer escribiera en el tablero.');
const viewerMembers=await viewer.functions.invoke('manage-members',{body:{action:'list',boardId:SUPABASE_BOARD_ID}});
if(!viewerMembers.error&&!viewerMembers.data?.error)throw new Error('La Edge Function permitió que el viewer administrara miembros.');
pass('viewer_can_read_but_cannot_write_or_manage');

await Promise.all([owner.auth.signOut(),viewer.auth.signOut()]);
console.log(JSON.stringify({event:'supabase_verification_finished',checks:checks.length,boardId:SUPABASE_BOARD_ID}));

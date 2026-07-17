const fixedColumns=[
  {slug:'todo',title:'TO-DO',color:'#f5cbcb',position:0,is_fixed:true},
  {slug:'doing',title:'DOING',color:'#ffe2e2',position:1,is_fixed:true},
  {slug:'done',title:'DONE',color:'#c5b3d3',position:2,is_fixed:true},
];

function dataOrThrow(result,message) {
  if(result.error)throw new Error(`${message}: ${result.error.message}`);
  return result.data;
}

async function findUserByEmail(client,email) {
  let page=1;
  while(true){
    const data=dataOrThrow(await client.auth.admin.listUsers({page,perPage:100}),'No se pudieron consultar los usuarios');
    const user=data.users.find(item=>item.email?.toLowerCase()===email.toLowerCase());
    if(user)return user;
    if(data.users.length<100)return null;
    page+=1;
  }
}

export async function bootstrapSupabase(client,{ownerEmail,ownerPassword,boardName='Mi tablero'}) {
  let owner=await findUserByEmail(client,ownerEmail);
  let ownerCreated=false;
  if(!owner){
    if(!ownerPassword)throw new Error('SUPABASE_OWNER_PASSWORD es obligatorio para crear el usuario propietario.');
    owner=dataOrThrow(await client.auth.admin.createUser({email:ownerEmail,password:ownerPassword,email_confirm:true}),'No se pudo crear el propietario').user;
    ownerCreated=true;
  }

  let board=dataOrThrow(await client.from('boards').select('id,name,owner_id').eq('owner_id',owner.id).limit(1).maybeSingle(),'No se pudo buscar el tablero');
  let boardCreated=false;
  if(!board){
    board=dataOrThrow(await client.from('boards').insert({owner_id:owner.id,name:boardName}).select('id,name,owner_id').single(),'No se pudo crear el tablero');
    boardCreated=true;
  }

  const columns=dataOrThrow(await client.from('columns').upsert(fixedColumns.map(column=>({...column,board_id:board.id})),{onConflict:'board_id,slug'}).select('id,slug,title,position,is_fixed'),'No se pudieron preparar las columnas fijas');
  return {ownerId:owner.id,ownerEmail:owner.email,ownerCreated,boardId:board.id,boardName:board.name,boardCreated,columns:columns.length};
}

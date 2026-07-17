import assert from 'node:assert/strict';
import test from 'node:test';
import { bootstrapSupabase } from './lib/bootstrap-supabase.mjs';

function query(result) {
  const chain={
    select:()=>chain,
    eq:()=>chain,
    limit:()=>chain,
    maybeSingle:async()=>result,
    single:async()=>result,
  };
  return chain;
}

test('creates the owner, board and fixed columns on first bootstrap',async()=>{
  const calls=[];
  const owner={id:'owner-1',email:'ricardo@example.com'};
  const client={
    auth:{admin:{
      listUsers:async()=>({data:{users:[]},error:null}),
      createUser:async input=>{calls.push(['createUser',input]);return {data:{user:owner},error:null}},
    }},
    from:table=>{
      if(table==='boards')return {
        ...query({data:null,error:null}),
        insert:input=>{calls.push(['insertBoard',input]);return query({data:{id:'board-1',name:'Mi tablero',owner_id:owner.id},error:null})},
      };
      if(table==='columns')return {upsert:(input,options)=>{calls.push(['upsertColumns',input,options]);return {select:async()=>({data:input.map((item,index)=>({...item,id:`column-${index}`})),error:null})}}};
      throw new Error(`Unexpected table ${table}`);
    },
  };
  const result=await bootstrapSupabase(client,{ownerEmail:owner.email,ownerPassword:'safe-password'});
  assert.equal(result.ownerCreated,true);
  assert.equal(result.boardCreated,true);
  assert.equal(result.boardId,'board-1');
  assert.deepEqual(calls.find(call=>call[0]==='upsertColumns')[1].map(column=>column.slug),['todo','doing','done']);
});

test('reuses an existing owner and board without requiring a password',async()=>{
  const owner={id:'owner-1',email:'ricardo@example.com'};
  const board={id:'board-1',name:'Trabajo',owner_id:owner.id};
  const client={
    auth:{admin:{listUsers:async()=>({data:{users:[owner]},error:null})}},
    from:table=>{
      if(table==='boards')return query({data:board,error:null});
      if(table==='columns')return {upsert:input=>({select:async()=>({data:input,error:null})})};
      throw new Error(`Unexpected table ${table}`);
    },
  };
  const result=await bootstrapSupabase(client,{ownerEmail:owner.email});
  assert.equal(result.ownerCreated,false);
  assert.equal(result.boardCreated,false);
  assert.equal(result.boardName,'Trabajo');
});

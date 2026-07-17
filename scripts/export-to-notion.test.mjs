import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync=promisify(execFile);

test('creates missing pages and updates existing pages without duplicates',async()=>{
  const calls=[];
  const server=createServer((request,response)=>{
    let body='';
    request.on('data',chunk=>{body+=chunk});
    request.on('end',()=>{
      calls.push({method:request.method,url:request.url,body:body&&JSON.parse(body)});
      response.setHeader('Content-Type','application/json');
      if(request.url.startsWith('/rest/v1/tasks'))return response.end(JSON.stringify([
        {id:'task-1',title:'Existente',description:'Uno',start_date:'2026-07-17',due_date:'2026-07-18',effort:2,status:'active',updated_at:'2026-07-17T10:00:00Z',columns:{title:'TO-DO'}},
        {id:'task-2',title:'Nueva',description:'Dos',start_date:'2026-07-18',due_date:'2026-07-19',effort:4,status:'completed',updated_at:'2026-07-17T11:00:00Z',columns:{title:'DONE'}},
      ]));
      if(request.url.includes('/data_sources/')&&request.url.endsWith('/query'))return response.end(JSON.stringify({results:[{id:'page-1',properties:{'Supabase ID':{rich_text:[{plain_text:'task-1'}]}}}],has_more:false,next_cursor:null}));
      response.end(JSON.stringify({id:'saved-page'}));
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const {port}=server.address();
  try{
    const {stdout}=await execFileAsync(process.execPath,['scripts/export-to-notion.mjs'],{cwd:process.cwd(),env:{...process.env,SUPABASE_URL:`http://127.0.0.1:${port}`,SUPABASE_SERVICE_ROLE_KEY:'service-key',SUPABASE_BOARD_ID:'board-1',NOTION_TOKEN:'notion-key',NOTION_DATA_SOURCE_ID:'source-1',NOTION_API_BASE:`http://127.0.0.1:${port}`}});
    const summary=JSON.parse(stdout.trim().split('\n').at(-1));
    assert.equal(summary.created,1);
    assert.equal(summary.updated,1);
    assert.equal(summary.failed,0);
    assert.equal(calls.filter(call=>call.method==='POST'&&call.url==='/v1/pages').length,1);
    assert.equal(calls.filter(call=>call.method==='PATCH'&&call.url==='/v1/pages/page-1').length,1);
  }finally{
    await new Promise(resolve=>server.close(resolve));
  }
});

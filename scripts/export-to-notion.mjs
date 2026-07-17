const required=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_BOARD_ID','NOTION_TOKEN','NOTION_DATA_SOURCE_ID'];
const missing=required.filter(key=>!process.env[key]);
if(missing.length)throw new Error(`Faltan variables requeridas: ${missing.join(', ')}`);

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_BOARD_ID,
  NOTION_TOKEN,
  NOTION_DATA_SOURCE_ID,
  NOTION_API_BASE='https://api.notion.com',
  EXPORT_SINCE,
  DRY_RUN='false',
}=process.env;
const notionVersion='2026-03-11';
const dryRun=DRY_RUN.toLowerCase()==='true';
const startedAt=new Date();
const stats={read:0,created:0,updated:0,failed:0};

const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

async function request(url,options={},attempt=1) {
  const response=await fetch(url,options);
  if((response.status===429||response.status>=500)&&attempt<5){
    const retryAfter=Number(response.headers.get('retry-after'))*1000;
    await wait(retryAfter||Math.min(1000*2**attempt,10000));
    return request(url,options,attempt+1);
  }
  if(!response.ok){
    const body=await response.text();
    throw new Error(`${options.method||'GET'} ${url} respondió ${response.status}: ${body.slice(0,500)}`);
  }
  return response.status===204?null:response.json();
}

const notionHeaders={
  Authorization:`Bearer ${NOTION_TOKEN}`,
  'Notion-Version':notionVersion,
  'Content-Type':'application/json',
};

async function loadTasks() {
  const query=new URLSearchParams({
    board_id:`eq.${SUPABASE_BOARD_ID}`,
    select:'id,title,description,start_date,due_date,effort,status,completed_at,deprecated_at,updated_at,columns(title)',
    order:'updated_at.asc',
  });
  if(EXPORT_SINCE)query.set('updated_at',`gte.${EXPORT_SINCE}`);
  return request(`${SUPABASE_URL.replace(/\/$/,'')}/rest/v1/tasks?${query}`,{headers:{apikey:SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${SUPABASE_SERVICE_ROLE_KEY}`}});
}

async function loadNotionPages() {
  const pages=[];
  let cursor;
  do{
    const body={page_size:100,result_type:'page'};
    if(cursor)body.start_cursor=cursor;
    const result=await request(`${NOTION_API_BASE.replace(/\/$/,'')}/v1/data_sources/${NOTION_DATA_SOURCE_ID}/query`,{method:'POST',headers:notionHeaders,body:JSON.stringify(body)});
    pages.push(...result.results);
    cursor=result.has_more?result.next_cursor:null;
  }while(cursor);
  return pages;
}

const text=content=>[{type:'text',text:{content:String(content||'').slice(0,2000)}}];
const propertiesFor=task=>({
  Name:{title:text(task.title)},
  'Supabase ID':{rich_text:text(task.id)},
  Description:{rich_text:text(task.description)},
  Start:{date:{start:task.start_date}},
  Due:{date:{start:task.due_date}},
  Status:{select:{name:task.status}},
  Column:{select:{name:task.columns?.title||'Sin columna'}},
  Effort:{number:Number(task.effort)||3},
  'Updated at':{date:{start:task.updated_at}},
  Completed:{checkbox:task.status==='completed'},
});

const notionSupabaseId=page=>page.properties?.['Supabase ID']?.rich_text?.map(item=>item.plain_text).join('')||'';

async function upsertTask(task,pageId) {
  const body={properties:propertiesFor(task)};
  if(dryRun)return;
  if(pageId)return request(`${NOTION_API_BASE.replace(/\/$/,'')}/v1/pages/${pageId}`,{method:'PATCH',headers:notionHeaders,body:JSON.stringify(body)});
  return request(`${NOTION_API_BASE.replace(/\/$/,'')}/v1/pages`,{method:'POST',headers:notionHeaders,body:JSON.stringify({parent:{type:'data_source_id',data_source_id:NOTION_DATA_SOURCE_ID},...body})});
}

console.log(JSON.stringify({event:'notion_export_started',startedAt:startedAt.toISOString(),incrementalSince:EXPORT_SINCE||null,dryRun}));
const [tasks,pages]=await Promise.all([loadTasks(),loadNotionPages()]);
stats.read=tasks.length;
const pageByTaskId=new Map(pages.map(page=>[notionSupabaseId(page),page.id]).filter(([id])=>id));
for(const task of tasks){
  const pageId=pageByTaskId.get(task.id);
  try{
    await upsertTask(task,pageId);
    if(pageId)stats.updated+=1;else stats.created+=1;
  }catch(error){
    stats.failed+=1;
    console.error(JSON.stringify({event:'notion_export_task_failed',taskId:task.id,error:error.message}));
  }
}
const finishedAt=new Date();
console.log(JSON.stringify({event:'notion_export_finished',finishedAt:finishedAt.toISOString(),durationMs:finishedAt-startedAt,...stats,dryRun}));
if(stats.failed)process.exitCode=1;

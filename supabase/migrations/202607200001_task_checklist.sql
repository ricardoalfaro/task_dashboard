alter table public.tasks
  add column if not exists checklist jsonb not null default '[]'::jsonb;

alter table public.tasks
  add column if not exists notes text not null default '',
  add column if not exists link text not null default '';

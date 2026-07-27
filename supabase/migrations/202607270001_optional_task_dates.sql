alter table public.tasks
  alter column start_date drop not null,
  alter column due_date drop not null;

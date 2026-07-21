alter table public.tasks
  add column if not exists board_position integer not null default 0,
  add column if not exists manual_board_ordered_at timestamptz;

alter table public.columns add column legacy_id text;
alter table public.tasks add column legacy_id text;

alter table public.columns
add constraint columns_board_legacy_id_key unique(board_id, legacy_id);

alter table public.tasks
add constraint tasks_board_legacy_id_key unique(board_id, legacy_id);

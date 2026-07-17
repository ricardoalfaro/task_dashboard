create extension if not exists pgcrypto;

create type public.board_role as enum ('owner', 'viewer');
create type public.task_status as enum ('active', 'completed', 'deprecated');

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.board_role not null,
  created_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create table public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  slug text not null check (char_length(trim(slug)) between 1 and 80),
  title text not null check (char_length(trim(title)) between 1 and 120),
  color text not null default '#c5b3d3',
  position integer not null check (position >= 0),
  is_fixed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (board_id, id),
  unique (board_id, slug),
  unique (board_id, position)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  column_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 240),
  description text not null default '',
  start_date date not null,
  due_date date not null,
  effort smallint not null default 3 check (effort between 1 and 5),
  status public.task_status not null default 'active',
  position integer not null default 0 check (position >= 0),
  completed_at timestamptz,
  deprecated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint task_date_range check (start_date <= due_date),
  constraint task_column_same_board foreign key (board_id, column_id)
    references public.columns(board_id, id) on delete restrict
);

create index board_members_user_id_idx on public.board_members(user_id);
create index columns_board_position_idx on public.columns(board_id, position);
create index tasks_board_column_position_idx on public.tasks(board_id, column_id, position);
create index tasks_board_due_date_idx on public.tasks(board_id, due_date);
create index tasks_board_status_idx on public.tasks(board_id, status);
create index tasks_updated_at_idx on public.tasks(updated_at);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger boards_set_updated_at
before update on public.boards
for each row execute function public.set_updated_at();

create trigger columns_set_updated_at
before update on public.columns
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create function public.is_board_owner(target_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.boards
    where id = target_board_id
      and owner_id = (select auth.uid())
  ) or exists (
    select 1
    from public.board_members
    where board_id = target_board_id
      and user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

create function public.is_board_member(target_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_board_owner(target_board_id) or exists (
    select 1
    from public.board_members
    where board_id = target_board_id
      and user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_board_owner(uuid) from public;
revoke all on function public.is_board_member(uuid) from public;
grant execute on function public.is_board_owner(uuid) to authenticated;
grant execute on function public.is_board_member(uuid) to authenticated;

alter table public.boards enable row level security;
alter table public.board_members enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;

create policy boards_select_members
on public.boards for select to authenticated
using (public.is_board_member(id));

create policy boards_insert_owner
on public.boards for insert to authenticated
with check (owner_id = (select auth.uid()));

create policy boards_update_owner
on public.boards for update to authenticated
using (public.is_board_owner(id))
with check (owner_id = (select auth.uid()));

create policy boards_delete_owner
on public.boards for delete to authenticated
using (public.is_board_owner(id));

create policy board_members_select_members
on public.board_members for select to authenticated
using (public.is_board_member(board_id));

create policy board_members_insert_owner
on public.board_members for insert to authenticated
with check (public.is_board_owner(board_id));

create policy board_members_update_owner
on public.board_members for update to authenticated
using (public.is_board_owner(board_id))
with check (public.is_board_owner(board_id));

create policy board_members_delete_owner
on public.board_members for delete to authenticated
using (public.is_board_owner(board_id));

create policy columns_select_members
on public.columns for select to authenticated
using (public.is_board_member(board_id));

create policy columns_insert_owner
on public.columns for insert to authenticated
with check (public.is_board_owner(board_id));

create policy columns_update_owner
on public.columns for update to authenticated
using (public.is_board_owner(board_id))
with check (public.is_board_owner(board_id));

create policy columns_delete_owner
on public.columns for delete to authenticated
using (public.is_board_owner(board_id) and not is_fixed);

create policy tasks_select_members
on public.tasks for select to authenticated
using (public.is_board_member(board_id));

create policy tasks_insert_owner
on public.tasks for insert to authenticated
with check (public.is_board_owner(board_id));

create policy tasks_update_owner
on public.tasks for update to authenticated
using (public.is_board_owner(board_id))
with check (public.is_board_owner(board_id));

create policy tasks_delete_owner
on public.tasks for delete to authenticated
using (public.is_board_owner(board_id));

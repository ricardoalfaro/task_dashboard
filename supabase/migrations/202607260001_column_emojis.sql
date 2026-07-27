alter table public.columns
add column emoji text not null default '📌'
check (char_length(emoji) between 1 and 16);

update public.columns
set emoji = case slug
  when 'todo' then '🗂️'
  when 'doing' then '⚡'
  when 'done' then '✅'
  else emoji
end;

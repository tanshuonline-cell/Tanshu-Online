-- TANSHU ONLINE: one-time free AI photo credits per authenticated Gmail account.
-- Apply this migration in the Supabase SQL Editor for the Preview project first.

create table if not exists public.ai_photo_free_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  free_used smallint not null default 0 check (free_used >= 0 and free_used <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_photo_free_credits enable row level security;
revoke all on table public.ai_photo_free_credits from anon, authenticated;

create or replace function public.consume_ai_photo_credit()
returns table (allowed boolean, used integer, remaining integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_used smallint;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.ai_photo_free_credits (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;

  update public.ai_photo_free_credits
     set free_used = free_used + 1,
         updated_at = now()
   where user_id = auth.uid()
     and free_used < 5
  returning free_used into current_used;

  if found then
    return query select true, current_used::integer, (5 - current_used)::integer;
  else
    select c.free_used into current_used
      from public.ai_photo_free_credits as c
     where c.user_id = auth.uid();
    return query select false, current_used::integer, 0;
  end if;
end;
$$;

revoke all on function public.consume_ai_photo_credit() from public, anon;
grant execute on function public.consume_ai_photo_credit() to authenticated;

-- Correct owner identity, close direct anonymous enquiry inserts,
-- and add server-side database-backed enquiry throttling.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    coalesce(new.email, ''),
    case
      when lower(coalesce(new.email, '')) = lower('kalyanofficial980@gmail.com')
        then 'admin'
      else 'viewer'
    end
  )
  on conflict (id) do update
  set email = excluded.email,
      role = case
        when lower(excluded.email) = lower('kalyanofficial980@gmail.com')
          then 'admin'
        else public.profiles.role
      end;

  return new;
end;
$$;

insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'admin'
from auth.users
where lower(coalesce(email, '')) = lower('kalyanofficial980@gmail.com')
on conflict (id) do update
set email = excluded.email,
    role = 'admin';

update public.profiles
set role = 'viewer'
where lower(email) = lower('kalayanofficial980@gmail.com');

drop policy if exists "public enquiries insert" on public.enquiries;
revoke insert on public.enquiries from anon, authenticated;

create table if not exists public.enquiry_rate_limits (
  fingerprint text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count >= 0)
);

alter table public.enquiry_rate_limits enable row level security;
revoke all on public.enquiry_rate_limits from anon, authenticated;

create or replace function public.allow_enquiry_attempt(p_fingerprint text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  if p_fingerprint is null or char_length(p_fingerprint) < 32 then
    return false;
  end if;

  insert into public.enquiry_rate_limits (
    fingerprint,
    window_started_at,
    request_count
  )
  values (
    p_fingerprint,
    now(),
    1
  )
  on conflict (fingerprint) do update
  set
    request_count = case
      when public.enquiry_rate_limits.window_started_at < now() - interval '15 minutes'
        then 1
      else public.enquiry_rate_limits.request_count + 1
    end,
    window_started_at = case
      when public.enquiry_rate_limits.window_started_at < now() - interval '15 minutes'
        then now()
      else public.enquiry_rate_limits.window_started_at
    end
  returning request_count into current_count;

  delete from public.enquiry_rate_limits
  where window_started_at < now() - interval '2 days';

  return current_count <= 5;
end;
$$;

revoke all on function public.allow_enquiry_attempt(text) from public, anon, authenticated;
grant execute on function public.allow_enquiry_attempt(text) to service_role;
grant insert on public.enquiries to service_role;
grant select, insert, update, delete on public.enquiry_rate_limits to service_role;
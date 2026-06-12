create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'client'::public.profile_role,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), '')
  )
  on conflict (id) do update
  set
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

insert into public.profiles (id, full_name, role, avatar_url)
select
  auth_user.id,
  nullif(trim(coalesce(auth_user.raw_user_meta_data ->> 'full_name', '')), ''),
  'client'::public.profile_role,
  nullif(trim(coalesce(auth_user.raw_user_meta_data ->> 'avatar_url', '')), '')
from auth.users auth_user
where not exists (
  select 1
  from public.profiles profile
  where profile.id = auth_user.id
);

alter table public.client_profiles enable row level security;

revoke all on public.client_profiles from anon;
grant select, insert, update, delete on public.client_profiles to authenticated;

drop policy if exists "client_profiles_manage_general_admin"
  on public.client_profiles;
create policy "client_profiles_manage_general_admin"
on public.client_profiles
for all
to authenticated
using ((select private.is_general_admin()))
with check ((select private.is_general_admin()));

notify pgrst, 'reload schema';

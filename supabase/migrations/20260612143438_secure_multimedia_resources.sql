alter table public.resources
  drop constraint if exists resources_description_length_check;

alter table public.resources
  add constraint resources_description_length_check
  check (
    description is null
    or char_length(btrim(description)) <= 2000
  ) not valid;

alter table public.resources
  drop constraint if exists resources_external_url_check;

alter table public.resources
  add constraint resources_external_url_check
  check (
    char_length(btrim(file_url)) between 1 and 2048
    and btrim(file_url) ~* '^https?://[^[:space:]]+$'
  ) not valid;

create or replace function private.is_resource_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'::public.profile_role
  )
$$;

create or replace function private.prepare_resource()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.title := btrim(new.title);
  new.description := nullif(btrim(coalesce(new.description, '')), '');
  new.file_url := btrim(new.file_url);

  if tg_op = 'UPDATE' then
    new.uploaded_by := old.uploaded_by;
    new.client_id := old.client_id;
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

drop trigger if exists prepare_resource on public.resources;
create trigger prepare_resource
before insert or update on public.resources
for each row
execute function private.prepare_resource();

revoke all on function private.is_resource_admin()
  from public, anon, authenticated;
grant execute on function private.is_resource_admin()
  to authenticated;

revoke all on function private.prepare_resource()
  from public, anon, authenticated;

alter table public.resources enable row level security;

revoke all on public.resources from anon;
revoke all on public.resources from authenticated;

grant select on public.resources to authenticated;
grant insert (
  area,
  description,
  file_url,
  title,
  uploaded_by
) on public.resources to authenticated;
grant update (
  area,
  description,
  file_url,
  title
) on public.resources to authenticated;
grant delete on public.resources to authenticated;

drop policy if exists "Resources visible to related users and admins"
  on public.resources;
drop policy if exists "Admins manage resources"
  on public.resources;
drop policy if exists "Assigned professionals manage client resources"
  on public.resources;
drop policy if exists "resources_select_related_accounts"
  on public.resources;
drop policy if exists "resources_select_allowed_accounts"
  on public.resources;
drop policy if exists "resources_insert_admins"
  on public.resources;
drop policy if exists "resources_update_admins"
  on public.resources;
drop policy if exists "resources_delete_admins"
  on public.resources;

create policy "resources_select_allowed_accounts"
on public.resources
for select
to authenticated
using (
  (select private.is_resource_admin())
  or (
    (select private.current_profile_role())
      = 'client'::public.profile_role
    and (
      client_id is null
      or client_id = (select auth.uid())
    )
    and (
      select private.client_has_service(
        (select auth.uid()),
        area
      )
    )
  )
  or (
    (select private.current_profile_role())
      = 'professional'::public.profile_role
    and (select private.can_manage_resource_area(area))
  )
);

create policy "resources_insert_admins"
on public.resources
for insert
to authenticated
with check (
  (select private.is_resource_admin())
  and uploaded_by = (select auth.uid())
);

create policy "resources_update_admins"
on public.resources
for update
to authenticated
using ((select private.is_resource_admin()))
with check ((select private.is_resource_admin()));

create policy "resources_delete_admins"
on public.resources
for delete
to authenticated
using ((select private.is_resource_admin()));

notify pgrst, 'reload schema';

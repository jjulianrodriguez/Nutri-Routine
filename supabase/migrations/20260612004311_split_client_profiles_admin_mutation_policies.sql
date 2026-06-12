drop policy if exists "client_profiles_manage_general_admin"
  on public.client_profiles;
drop policy if exists "client_profiles_insert_general_admin"
  on public.client_profiles;
drop policy if exists "client_profiles_update_general_admin"
  on public.client_profiles;
drop policy if exists "client_profiles_delete_general_admin"
  on public.client_profiles;

create policy "client_profiles_insert_general_admin"
on public.client_profiles
for insert
to authenticated
with check ((select private.is_general_admin()));

create policy "client_profiles_update_general_admin"
on public.client_profiles
for update
to authenticated
using ((select private.is_general_admin()))
with check ((select private.is_general_admin()));

create policy "client_profiles_delete_general_admin"
on public.client_profiles
for delete
to authenticated
using ((select private.is_general_admin()));

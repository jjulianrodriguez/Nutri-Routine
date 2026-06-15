set lock_timeout = '5s';
set statement_timeout = '30s';

drop policy if exists "appointments_admin_manage_all"
  on public.appointments;
drop policy if exists "diet_plans_admin_manage_all"
  on public.diet_plans;
drop policy if exists "progress_entries_admin_manage_all"
  on public.progress_entries;

create policy "appointments_admin_insert"
on public.appointments
for insert
to authenticated
with check ((select private.is_general_admin()));

create policy "appointments_admin_update"
on public.appointments
for update
to authenticated
using ((select private.is_general_admin()))
with check ((select private.is_general_admin()));

create policy "appointments_admin_delete"
on public.appointments
for delete
to authenticated
using ((select private.is_general_admin()));

create policy "diet_plans_admin_insert"
on public.diet_plans
for insert
to authenticated
with check ((select private.is_general_admin()));

create policy "diet_plans_admin_update"
on public.diet_plans
for update
to authenticated
using ((select private.is_general_admin()))
with check ((select private.is_general_admin()));

create policy "diet_plans_admin_delete"
on public.diet_plans
for delete
to authenticated
using ((select private.is_general_admin()));

create policy "progress_entries_admin_insert"
on public.progress_entries
for insert
to authenticated
with check ((select private.is_general_admin()));

create policy "progress_entries_admin_update"
on public.progress_entries
for update
to authenticated
using ((select private.is_general_admin()))
with check ((select private.is_general_admin()));

create policy "progress_entries_admin_delete"
on public.progress_entries
for delete
to authenticated
using ((select private.is_general_admin()));

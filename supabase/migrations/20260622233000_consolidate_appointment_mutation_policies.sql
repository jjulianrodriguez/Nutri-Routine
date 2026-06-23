set lock_timeout = '5s';
set statement_timeout = '30s';

drop policy if exists "appointments_admin_insert"
  on public.appointments;
drop policy if exists "appointments_admin_update"
  on public.appointments;
drop policy if exists "appointments_admin_delete"
  on public.appointments;
drop policy if exists "appointments_professional_insert_assigned_clients"
  on public.appointments;
drop policy if exists "appointments_professional_update_assigned_clients"
  on public.appointments;
drop policy if exists "appointments_professional_delete_assigned_clients"
  on public.appointments;

create policy "appointments_insert_managed_clients"
on public.appointments
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.can_manage_appointment(client_id, professional_id, area))
);

create policy "appointments_update_managed_clients"
on public.appointments
for update
to authenticated
using ((select private.can_manage_appointment(client_id, professional_id, area)))
with check (
  created_by is not null
  and (select private.can_manage_appointment(client_id, professional_id, area))
);

create policy "appointments_delete_managed_clients"
on public.appointments
for delete
to authenticated
using ((select private.can_manage_appointment(client_id, professional_id, area)));

notify pgrst, 'reload schema';

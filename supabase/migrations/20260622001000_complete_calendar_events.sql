set lock_timeout = '5s';
set statement_timeout = '30s';

do $$
begin
  if not exists (
    select 1
    from pg_type event_type
    join pg_namespace namespace
      on namespace.oid = event_type.typnamespace
    where namespace.nspname = 'public'
      and event_type.typname = 'appointment_event_type'
  ) then
    create type public.appointment_event_type as enum (
      'appointment',
      'follow_up',
      'reminder',
      'review',
      'progress_check',
      'consultation',
      'other'
    );
  end if;
end;
$$;

grant usage on type public.appointment_event_type to anon;
grant usage on type public.appointment_event_type to authenticated;

alter table public.appointments
  add column if not exists event_type public.appointment_event_type
    not null default 'appointment'::public.appointment_event_type,
  add column if not exists created_by uuid
    references public.profiles(id) on delete set null;

update public.appointments
set created_by = professional_id
where created_by is null;

create index if not exists appointments_client_starts_at_idx
  on public.appointments (client_id, starts_at desc);
create index if not exists appointments_professional_starts_at_idx
  on public.appointments (professional_id, starts_at desc);
create index if not exists appointments_created_by_idx
  on public.appointments (created_by)
  where created_by is not null;
create index if not exists appointments_event_type_idx
  on public.appointments (event_type);
create index if not exists appointments_status_starts_at_idx
  on public.appointments (status, starts_at desc);

grant select, insert, update, delete on public.appointments to authenticated;

create or replace function private.appointment_area_matches_assignment(
  p_client_id uuid,
  p_professional_id uuid,
  p_area public.service_area
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.client_profiles client_profile
    join public.profiles client
      on client.id = client_profile.profile_id
    join public.profiles professional
      on professional.id = p_professional_id
    left join public.professional_profiles professional_profile
      on professional_profile.profile_id = professional.id
    where client_profile.profile_id = p_client_id
      and client.role = 'client'::public.profile_role
      and professional.role = 'professional'::public.profile_role
      and professional_profile.is_active = true
      and (
        (
          p_area = 'nutrition'::public.service_area
          and client_profile.assigned_nutritionist_id = p_professional_id
          and professional_profile.specialty in (
            'nutrition'::public.professional_specialty,
            'both'::public.professional_specialty
          )
        )
        or (
          p_area = 'training'::public.service_area
          and client_profile.assigned_trainer_id = p_professional_id
          and professional_profile.specialty in (
            'training'::public.professional_specialty,
            'both'::public.professional_specialty
          )
        )
        or (
          p_area = 'general'::public.service_area
          and client_profile.assigned_nutritionist_id = p_professional_id
          and client_profile.assigned_trainer_id = p_professional_id
          and professional_profile.specialty = 'both'::public.professional_specialty
        )
      )
  )
$$;

create or replace function private.can_manage_appointment(
  p_client_id uuid,
  p_professional_id uuid,
  p_area public.service_area
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.profiles client
      where client.id = p_client_id
        and client.role = 'client'::public.profile_role
    )
    and (
      private.is_general_admin()
      or (
        p_professional_id = (select auth.uid())
        and private.appointment_area_matches_assignment(
          p_client_id,
          p_professional_id,
          p_area
        )
      )
    )
$$;

revoke all on function private.appointment_area_matches_assignment(
  uuid,
  uuid,
  public.service_area
) from public, anon, authenticated;
revoke all on function private.can_manage_appointment(
  uuid,
  uuid,
  public.service_area
) from public, anon, authenticated;

grant execute on function private.appointment_area_matches_assignment(
  uuid,
  uuid,
  public.service_area
) to authenticated;
grant execute on function private.can_manage_appointment(
  uuid,
  uuid,
  public.service_area
) to authenticated;

create or replace function private.enforce_appointment_permissions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_is_general_admin boolean := private.is_general_admin();
begin
  if v_actor_id is null then
    raise exception 'Debes iniciar sesion para gestionar eventos.'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    if not v_is_general_admin
      and (
        old.professional_id is distinct from v_actor_id
        or not private.appointment_area_matches_assignment(
          old.client_id,
          old.professional_id,
          old.area
        )
      ) then
      raise exception 'No tienes permisos para eliminar este evento.'
        using errcode = '42501';
    end if;

    return old;
  end if;

  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, v_actor_id);
  elsif new.created_by is distinct from old.created_by then
    raise exception 'No se puede cambiar el creador del evento.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles client
    where client.id = new.client_id
      and client.role = 'client'::public.profile_role
  ) then
    raise exception 'El evento debe estar relacionado con un cliente.'
      using errcode = '23503';
  end if;

  if not exists (
    select 1
    from public.profiles professional
    left join public.professional_profiles professional_profile
      on professional_profile.profile_id = professional.id
    where professional.id = new.professional_id
      and (
        professional.role = 'admin'::public.profile_role
        or (
          professional.role = 'professional'::public.profile_role
          and professional_profile.is_active = true
        )
      )
  ) then
    raise exception 'El profesional seleccionado no esta disponible.'
      using errcode = '23503';
  end if;

  if not v_is_general_admin then
    if new.created_by is distinct from v_actor_id
      or new.professional_id is distinct from v_actor_id then
      raise exception 'Solo puedes crear eventos con tu cuenta profesional.'
        using errcode = '42501';
    end if;

    if not private.appointment_area_matches_assignment(
      new.client_id,
      new.professional_id,
      new.area
    ) then
      raise exception 'Solo puedes gestionar eventos de clientes asignados a tu area.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_appointment_permissions()
  from public, anon, authenticated;

drop trigger if exists enforce_appointment_permissions
  on public.appointments;
create trigger enforce_appointment_permissions
before insert or update or delete
  on public.appointments
for each row
execute function private.enforce_appointment_permissions();

drop policy if exists "appointments_professional_insert_assigned_clients"
  on public.appointments;
drop policy if exists "appointments_professional_update_assigned_clients"
  on public.appointments;
drop policy if exists "appointments_professional_delete_assigned_clients"
  on public.appointments;

create policy "appointments_professional_insert_assigned_clients"
on public.appointments
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.can_manage_appointment(client_id, professional_id, area))
);

create policy "appointments_professional_update_assigned_clients"
on public.appointments
for update
to authenticated
using ((select private.can_manage_appointment(client_id, professional_id, area)))
with check (
  created_by is not null
  and (select private.can_manage_appointment(client_id, professional_id, area))
);

create policy "appointments_professional_delete_assigned_clients"
on public.appointments
for delete
to authenticated
using ((select private.can_manage_appointment(client_id, professional_id, area)));

create or replace function private.notify_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_event_type text;
  v_message text;
begin
  if tg_op = 'INSERT' then
    v_event_type := 'appointment_created';
    v_message := format('Se creo el evento "%s".', new.title);
  elsif old.status <> 'cancelled'::public.appointment_status
    and new.status = 'cancelled'::public.appointment_status then
    v_event_type := 'appointment_cancelled';
    v_message := format('El evento "%s" fue cancelado.', new.title);
  elsif old.starts_at is distinct from new.starts_at
    or old.ends_at is distinct from new.ends_at then
    v_event_type := 'appointment_rescheduled';
    v_message := format('El evento "%s" fue reprogramado.', new.title);
  elsif old.title is distinct from new.title
    or old.description is distinct from new.description
    or old.area is distinct from new.area
    or old.event_type is distinct from new.event_type
    or old.status is distinct from new.status then
    v_event_type := 'appointment_updated';
    v_message := format('El evento "%s" fue actualizado.', new.title);
  else
    return new;
  end if;

  if not exists (
    select 1
    from public.notifications notification
    where notification.recipient_id = new.client_id
      and notification.event_type = v_event_type
      and notification.metadata ->> 'appointmentId' = new.id::text
      and notification.created_at > now() - interval '1 minute'
  ) then
    perform private.create_notification(
      new.client_id,
      v_event_type,
      v_message,
      '/app/calendario',
      jsonb_build_object('appointmentId', new.id),
      v_actor_id
    );
  end if;

  if not exists (
    select 1
    from public.notifications notification
    where notification.recipient_id = new.professional_id
      and notification.event_type = v_event_type
      and notification.metadata ->> 'appointmentId' = new.id::text
      and notification.created_at > now() - interval '1 minute'
  ) then
    perform private.create_notification(
      new.professional_id,
      v_event_type,
      v_message,
      '/app/calendario',
      jsonb_build_object(
        'appointmentId', new.id,
        'clientId', new.client_id
      ),
      v_actor_id
    );
  end if;

  return new;
end;
$$;

revoke all on function private.notify_appointment_change()
  from public, anon, authenticated;

drop trigger if exists notify_appointment_change
  on public.appointments;
create trigger notify_appointment_change
after insert or update of status, starts_at, ends_at, title, description, area, event_type
  on public.appointments
for each row
execute function private.notify_appointment_change();

notify pgrst, 'reload schema';

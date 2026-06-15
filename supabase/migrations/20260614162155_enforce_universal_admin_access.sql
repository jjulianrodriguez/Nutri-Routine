set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function private.is_general_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'::public.profile_role
  )
$$;

create or replace function private.is_assignable_professional(
  target_profile_id uuid,
  required_specialty public.professional_specialty
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    left join public.professional_profiles professional
      on professional.profile_id = profile.id
    where profile.id = target_profile_id
      and (
        profile.role = 'admin'::public.profile_role
        or (
          profile.role = 'professional'::public.profile_role
          and professional.is_active
          and (
            professional.specialty = required_specialty
            or professional.specialty = 'both'::public.professional_specialty
          )
        )
      )
  )
$$;

create or replace function public.assign_routine_to_client(
  p_routine_id uuid,
  p_client_id uuid,
  p_duration_weeks integer,
  p_start_date date default current_date
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_assignment_id uuid;
  v_end_date date;
  v_is_general_admin boolean;
  v_routine_description text;
  v_routine_id uuid;
  v_routine_name text;
  v_trainer_id uuid;
begin
  v_is_general_admin := private.is_general_admin();

  if not v_is_general_admin
    and not private.has_specialty(
      'training'::public.professional_specialty
    ) then
    raise exception
      'No tienes permisos para asignar rutinas.'
      using errcode = '42501';
  end if;

  if p_duration_weeks is null
    or p_duration_weeks not between 1 and 104 then
    raise exception
      'La duracion debe estar entre 1 y 104 semanas.'
      using errcode = '22023';
  end if;

  select
    routine.id,
    routine.name,
    routine.description
  into
    v_routine_id,
    v_routine_name,
    v_routine_description
  from public.routines as routine
  where routine.id = p_routine_id
    and routine.is_active;

  if v_routine_id is null then
    raise exception
      'La rutina no existe o esta inactiva.'
      using errcode = 'P0002';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_client_id::text, 0)
  );

  if not exists (
    select 1
    from public.profiles as client_profile
    where client_profile.id = p_client_id
      and client_profile.role = 'client'::public.profile_role
  ) then
    raise exception
      'La cuenta seleccionada no es un cliente valido.'
      using errcode = '23503';
  end if;

  select client_profile.assigned_trainer_id
  into v_trainer_id
  from public.client_profiles as client_profile
  where client_profile.profile_id = p_client_id;

  if v_trainer_id is null then
    if v_is_general_admin then
      v_trainer_id := (select auth.uid());
    else
      raise exception
        'El cliente no tiene un entrenador asignado.'
        using errcode = '23503';
    end if;
  end if;

  if not v_is_general_admin
    and v_trainer_id <> (select auth.uid()) then
    raise exception
      'Solo puedes asignar rutinas a tus clientes.'
      using errcode = '42501';
  end if;

  update public.workout_plans
  set status = 'archived'::public.plan_status
  where client_id = p_client_id
    and status = 'active'::public.plan_status
    and (
      v_is_general_admin
      or trainer_id = (select auth.uid())
    );

  v_end_date :=
    coalesce(p_start_date, current_date)
    + (p_duration_weeks * 7 - 1);

  insert into public.workout_plans (
    client_id,
    trainer_id,
    routine_id,
    title,
    description,
    status,
    start_date,
    end_date,
    duration_weeks
  ) values (
    p_client_id,
    v_trainer_id,
    v_routine_id,
    v_routine_name,
    v_routine_description,
    'active'::public.plan_status,
    coalesce(p_start_date, current_date),
    v_end_date,
    p_duration_weeks
  )
  returning id into v_assignment_id;

  return v_assignment_id;
end;
$$;

grant insert, update, delete
  on table public.appointments, public.diet_plans, public.progress_entries
  to authenticated;

grant delete on table public.workout_plans to authenticated;

drop policy if exists "appointments_admin_manage_all"
  on public.appointments;
create policy "appointments_admin_manage_all"
on public.appointments
for all
to authenticated
using ((select private.is_general_admin()))
with check ((select private.is_general_admin()));

drop policy if exists "diet_plans_admin_manage_all"
  on public.diet_plans;
create policy "diet_plans_admin_manage_all"
on public.diet_plans
for all
to authenticated
using ((select private.is_general_admin()))
with check ((select private.is_general_admin()));

drop policy if exists "progress_entries_admin_manage_all"
  on public.progress_entries;
create policy "progress_entries_admin_manage_all"
on public.progress_entries
for all
to authenticated
using ((select private.is_general_admin()))
with check ((select private.is_general_admin()));

drop policy if exists "workout_plans_admin_delete"
  on public.workout_plans;
create policy "workout_plans_admin_delete"
on public.workout_plans
for delete
to authenticated
using ((select private.is_general_admin()));

notify pgrst, 'reload schema';

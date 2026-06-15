set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function public.assign_routine_to_client(
  p_routine_id uuid,
  p_client_id uuid,
  p_duration_weeks integer,
  p_start_date date default current_date
)
returns uuid
language plpgsql
security invoker
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
  if not private.has_specialty(
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

  -- Serialize assignments for the same client inside this transaction.
  select client_profile.assigned_trainer_id
  into v_trainer_id
  from public.client_profiles as client_profile
  where client_profile.profile_id = p_client_id
  for update of client_profile;

  if v_trainer_id is null then
    raise exception
      'El cliente no tiene un entrenador asignado.'
      using errcode = '23503';
  end if;

  v_is_general_admin := private.is_general_admin();

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

revoke all on function public.assign_routine_to_client(
  uuid,
  uuid,
  integer,
  date
) from public, anon;
grant execute on function public.assign_routine_to_client(
  uuid,
  uuid,
  integer,
  date
) to authenticated;

notify pgrst, 'reload schema';

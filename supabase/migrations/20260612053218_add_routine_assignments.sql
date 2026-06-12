alter table public.workout_plans
  add column if not exists routine_id uuid
    references public.routines(id) on delete restrict,
  add column if not exists duration_weeks integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_plans_duration_weeks_check'
      and conrelid = 'public.workout_plans'::regclass
  ) then
    alter table public.workout_plans
      add constraint workout_plans_duration_weeks_check
      check (
        duration_weeks is null
        or duration_weeks between 1 and 104
      );
  end if;
end;
$$;

create index if not exists workout_plans_routine_id_idx
  on public.workout_plans (routine_id);
create index if not exists workout_plans_client_dates_idx
  on public.workout_plans (client_id, start_date desc, end_date desc);

create or replace function private.can_view_assigned_routine(
  target_routine_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workout_plans wp
    where wp.client_id = (select auth.uid())
      and wp.routine_id = target_routine_id
  )
$$;

create or replace function private.can_view_assigned_exercise(
  target_exercise_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workout_plans wp
    join public.routine_exercises re
      on re.routine_id = wp.routine_id
    where wp.client_id = (select auth.uid())
      and re.exercise_id = target_exercise_id
  )
$$;

revoke all on function private.can_view_assigned_routine(uuid)
  from public, anon;
revoke all on function private.can_view_assigned_exercise(uuid)
  from public, anon;
grant execute on function private.can_view_assigned_routine(uuid)
  to authenticated;
grant execute on function private.can_view_assigned_exercise(uuid)
  to authenticated;

drop policy if exists "routines_select_assigned_clients"
  on public.routines;
create policy "routines_select_assigned_clients"
on public.routines for select to authenticated
using ((select private.can_view_assigned_routine(id)));

drop policy if exists "routine_exercises_select_assigned_clients"
  on public.routine_exercises;
create policy "routine_exercises_select_assigned_clients"
on public.routine_exercises for select to authenticated
using ((select private.can_view_assigned_routine(routine_id)));

drop policy if exists "exercises_select_assigned_clients"
  on public.exercises;
create policy "exercises_select_assigned_clients"
on public.exercises for select to authenticated
using ((select private.can_view_assigned_exercise(id)));

grant insert, update on public.workout_plans to authenticated;

drop policy if exists "workout_plans_insert_training_managers"
  on public.workout_plans;
create policy "workout_plans_insert_training_managers"
on public.workout_plans for insert to authenticated
with check (
  (select private.is_general_admin())
  or (
    (select private.has_specialty(
      'training'::public.professional_specialty
    ))
    and trainer_id = (select auth.uid())
    and exists (
      select 1
      from public.client_profiles cp
      where cp.profile_id = client_id
        and cp.assigned_trainer_id = (select auth.uid())
    )
  )
);

drop policy if exists "workout_plans_update_training_managers"
  on public.workout_plans;
create policy "workout_plans_update_training_managers"
on public.workout_plans for update to authenticated
using (
  (select private.is_general_admin())
  or (
    (select private.has_specialty(
      'training'::public.professional_specialty
    ))
    and trainer_id = (select auth.uid())
    and exists (
      select 1
      from public.client_profiles cp
      where cp.profile_id = client_id
        and cp.assigned_trainer_id = (select auth.uid())
    )
  )
)
with check (
  (select private.is_general_admin())
  or (
    (select private.has_specialty(
      'training'::public.professional_specialty
    ))
    and trainer_id = (select auth.uid())
    and exists (
      select 1
      from public.client_profiles cp
      where cp.profile_id = client_id
        and cp.assigned_trainer_id = (select auth.uid())
    )
  )
);

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
  v_routine public.routines%rowtype;
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

  select *
  into v_routine
  from public.routines
  where id = p_routine_id
    and is_active;

  if v_routine.id is null then
    raise exception
      'La rutina no existe o esta inactiva.'
      using errcode = 'P0002';
  end if;

  select assigned_trainer_id
  into v_trainer_id
  from public.client_profiles
  where profile_id = p_client_id;

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
    v_routine.id,
    v_routine.name,
    v_routine.description,
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

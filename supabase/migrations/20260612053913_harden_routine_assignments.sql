create or replace function private.can_view_assigned_routine(
  target_routine_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.client_has_service(
    (select auth.uid()),
    'training'::public.service_area
  )
  and exists (
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
  select private.client_has_service(
    (select auth.uid()),
    'training'::public.service_area
  )
  and exists (
    select 1
    from public.workout_plans wp
    join public.routine_exercises re
      on re.routine_id = wp.routine_id
    where wp.client_id = (select auth.uid())
      and re.exercise_id = target_exercise_id
  )
$$;

drop policy if exists "workout_plans_insert_training_managers"
  on public.workout_plans;
create policy "workout_plans_insert_training_managers"
on public.workout_plans for insert to authenticated
with check (
  (
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
  and routine_id is not null
  and duration_weeks between 1 and 104
  and status = 'active'::public.plan_status
  and start_date is not null
  and end_date = start_date + (duration_weeks * 7 - 1)
  and exists (
    select 1
    from public.routines r
    where r.id = routine_id
      and r.is_active
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
  (
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
  and routine_id is not null
  and duration_weeks between 1 and 104
  and status in (
    'active'::public.plan_status,
    'archived'::public.plan_status
  )
  and start_date is not null
  and end_date = start_date + (duration_weeks * 7 - 1)
  and (
    status = 'archived'::public.plan_status
    or exists (
      select 1
      from public.routines r
      where r.id = routine_id
        and r.is_active
    )
  )
);

notify pgrst, 'reload schema';

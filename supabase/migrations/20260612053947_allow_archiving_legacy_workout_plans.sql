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
  and (
    status = 'archived'::public.plan_status
    or (
      status = 'active'::public.plan_status
      and routine_id is not null
      and duration_weeks between 1 and 104
      and start_date is not null
      and end_date = start_date + (duration_weeks * 7 - 1)
      and exists (
        select 1
        from public.routines r
        where r.id = routine_id
          and r.is_active
      )
    )
  )
);

drop policy if exists "exercises_select_training_managers"
  on public.exercises;
drop policy if exists "exercises_select_assigned_clients"
  on public.exercises;
create policy "exercises_select_authorized_accounts"
on public.exercises for select to authenticated
using (
  (select private.has_specialty(
    'training'::public.professional_specialty
  ))
  or (select private.can_view_assigned_exercise(id))
);

drop policy if exists "routines_select_training_managers"
  on public.routines;
drop policy if exists "routines_select_assigned_clients"
  on public.routines;
create policy "routines_select_authorized_accounts"
on public.routines for select to authenticated
using (
  (select private.has_specialty(
    'training'::public.professional_specialty
  ))
  or (select private.can_view_assigned_routine(id))
);

drop policy if exists "routine_exercises_select_training_managers"
  on public.routine_exercises;
drop policy if exists "routine_exercises_select_assigned_clients"
  on public.routine_exercises;
create policy "routine_exercises_select_authorized_accounts"
on public.routine_exercises for select to authenticated
using (
  (select private.has_specialty(
    'training'::public.professional_specialty
  ))
  or (select private.can_view_assigned_routine(routine_id))
);

set lock_timeout = '5s';
set statement_timeout = '30s';

drop policy if exists habits_select_related_accounts on public.habits;
create policy habits_select_related_accounts
on public.habits
for select
to authenticated
using (
  created_by = (select auth.uid())
  or (select private.is_general_admin())
  or (
    active is true
    and (select private.has_specialty(
      'nutrition'::public.professional_specialty
    ))
  )
  or exists (
    select 1
    from public.habit_assignments ha
    where ha.habit_id = habits.id
      and (
        (
          ha.client_id = (select auth.uid())
          and private.client_has_service(
            ha.client_id,
            'nutrition'::public.service_area
          )
        )
        or private.is_client_assigned_to_current_professional(
          ha.client_id,
          'nutrition'::public.service_area
        )
      )
  )
);

notify pgrst, 'reload schema';

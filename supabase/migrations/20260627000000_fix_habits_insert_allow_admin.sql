set lock_timeout = '5s';
set statement_timeout = '30s';

drop policy if exists habits_insert_nutrition_managers on public.habits;
create policy habits_insert_nutrition_managers
on public.habits
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (
    (select private.is_general_admin())
    or (select private.has_specialty('nutrition'::public.professional_specialty))
  )
);

notify pgrst, 'reload schema';

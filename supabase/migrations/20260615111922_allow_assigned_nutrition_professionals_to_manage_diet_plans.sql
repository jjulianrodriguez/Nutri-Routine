set lock_timeout = '5s';
set statement_timeout = '30s';

drop policy if exists "diet_plans_insert_nutrition_professionals"
  on public.diet_plans;
drop policy if exists "diet_plans_update_nutrition_professionals"
  on public.diet_plans;
drop policy if exists "diet_plans_delete_nutrition_professionals"
  on public.diet_plans;

create policy "diet_plans_insert_nutrition_professionals"
on public.diet_plans
for insert
to authenticated
with check (
  (select private.has_specialty(
    'nutrition'::public.professional_specialty
  ))
  and nutritionist_id = (select auth.uid())
  and exists (
    select 1
    from public.client_profiles client_profile
    where client_profile.profile_id = diet_plans.client_id
      and client_profile.assigned_nutritionist_id = (select auth.uid())
  )
);

create policy "diet_plans_update_nutrition_professionals"
on public.diet_plans
for update
to authenticated
using (
  (select private.has_specialty(
    'nutrition'::public.professional_specialty
  ))
  and nutritionist_id = (select auth.uid())
  and exists (
    select 1
    from public.client_profiles client_profile
    where client_profile.profile_id = diet_plans.client_id
      and client_profile.assigned_nutritionist_id = (select auth.uid())
  )
)
with check (
  (select private.has_specialty(
    'nutrition'::public.professional_specialty
  ))
  and nutritionist_id = (select auth.uid())
  and exists (
    select 1
    from public.client_profiles client_profile
    where client_profile.profile_id = diet_plans.client_id
      and client_profile.assigned_nutritionist_id = (select auth.uid())
  )
);

create policy "diet_plans_delete_nutrition_professionals"
on public.diet_plans
for delete
to authenticated
using (
  (select private.has_specialty(
    'nutrition'::public.professional_specialty
  ))
  and nutritionist_id = (select auth.uid())
  and exists (
    select 1
    from public.client_profiles client_profile
    where client_profile.profile_id = diet_plans.client_id
      and client_profile.assigned_nutritionist_id = (select auth.uid())
  )
);

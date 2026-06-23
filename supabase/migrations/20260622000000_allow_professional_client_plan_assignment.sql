set lock_timeout = '5s';
set statement_timeout = '30s';

drop policy if exists "profiles_select_visible_to_account"
  on public.profiles;
create policy "profiles_select_visible_to_account"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_general_admin())
  or (
    role = 'client'::public.profile_role
    and (select private.is_privileged())
  )
  or (
    role in (
      'admin'::public.profile_role,
      'professional'::public.profile_role
    )
    and (select private.is_privileged())
  )
);

drop policy if exists "client_profiles_select_own_or_assigned"
  on public.client_profiles;
drop policy if exists "client_profiles_select_own_or_privileged"
  on public.client_profiles;
create policy "client_profiles_select_own_or_assigned"
on public.client_profiles
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or (select private.is_general_admin())
  or (select private.is_privileged())
);

drop policy if exists "client_profiles_insert_authorized_managers"
  on public.client_profiles;
create policy "client_profiles_insert_authorized_managers"
on public.client_profiles
for insert
to authenticated
with check (
  (select private.is_general_admin())
  or (
    (
      assigned_nutritionist_id is not null
      or assigned_trainer_id is not null
    )
    and (
      assigned_nutritionist_id is null
      or (
        (select private.has_specialty(
          'nutrition'::public.professional_specialty
        ))
        and assigned_nutritionist_id = (select auth.uid())
      )
    )
    and (
      assigned_trainer_id is null
      or (
        (select private.has_specialty(
          'training'::public.professional_specialty
        ))
        and assigned_trainer_id = (select auth.uid())
      )
    )
  )
);

drop policy if exists "client_profiles_update_authorized_managers"
  on public.client_profiles;
create policy "client_profiles_update_authorized_managers"
on public.client_profiles
for update
to authenticated
using (
  (select private.is_general_admin())
  or (
    (select private.has_specialty('nutrition'::public.professional_specialty))
    and (
      assigned_nutritionist_id = (select auth.uid())
      or assigned_nutritionist_id is null
    )
  )
  or (
    (select private.has_specialty('training'::public.professional_specialty))
    and (
      assigned_trainer_id = (select auth.uid())
      or assigned_trainer_id is null
    )
  )
)
with check (
  (select private.is_general_admin())
  or (
    (select private.has_specialty('nutrition'::public.professional_specialty))
    and (
      assigned_nutritionist_id = (select auth.uid())
      or assigned_nutritionist_id is null
    )
  )
  or (
    (select private.has_specialty('training'::public.professional_specialty))
    and (
      assigned_trainer_id = (select auth.uid())
      or assigned_trainer_id is null
    )
  )
);

notify pgrst, 'reload schema';

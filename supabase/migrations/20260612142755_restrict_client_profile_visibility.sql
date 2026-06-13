grant select (
  profile_id,
  assigned_nutritionist_id,
  assigned_trainer_id,
  birth_date,
  gender,
  phone,
  created_at,
  updated_at
) on public.client_profiles to authenticated;

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
    and exists (
      select 1
      from public.client_profiles cp
      where cp.profile_id = profiles.id
        and (
          cp.assigned_nutritionist_id = (select auth.uid())
          or cp.assigned_trainer_id = (select auth.uid())
        )
    )
  )
  or (
    role in (
      'admin'::public.profile_role,
      'professional'::public.profile_role
    )
    and (select private.is_privileged())
  )
);

drop policy if exists "client_profiles_select_own_or_privileged"
  on public.client_profiles;
drop policy if exists "client_profiles_select_own_or_assigned"
  on public.client_profiles;
create policy "client_profiles_select_own_or_assigned"
on public.client_profiles
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or (select private.is_general_admin())
  or assigned_nutritionist_id = (select auth.uid())
  or assigned_trainer_id = (select auth.uid())
);

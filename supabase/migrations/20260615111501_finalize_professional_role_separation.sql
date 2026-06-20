set lock_timeout = '5s';
set statement_timeout = '30s';

update public.profiles profile
set role = 'professional'::public.profile_role
where profile.role = 'admin'::public.profile_role
  and exists (
    select 1
    from public.professional_profiles professional
    where professional.profile_id = profile.id
  );

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'::public.profile_role
  )
$$;

comment on function public.is_admin() is
  'Legacy server-only compatibility helper. True only for the universal admin role.';

create or replace function public.has_specialty(
  required_specialty public.professional_specialty
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    left join public.professional_profiles professional
      on professional.profile_id = profile.id
    where profile.id = (select auth.uid())
      and (
        profile.role = 'admin'::public.profile_role
        or (
          profile.role = 'professional'::public.profile_role
          and professional.is_active
          and (
            professional.specialty = required_specialty
            or professional.specialty =
              'both'::public.professional_specialty
          )
        )
      )
  )
$$;

comment on function public.has_specialty(
  public.professional_specialty
) is
  'Legacy server-only compatibility helper. Admin bypasses specialty; active professionals are specialty-scoped.';

revoke all on function public.is_admin()
  from public, anon, authenticated;
revoke all on function public.has_specialty(
  public.professional_specialty
) from public, anon, authenticated;

grant execute on function public.is_admin() to service_role;
grant execute on function public.has_specialty(
  public.professional_specialty
) to service_role;

notify pgrst, 'reload schema';

do $$
begin
  if to_regclass('public.client_profiles') is not null then
    execute 'alter table public.client_profiles enable row level security';
    execute 'revoke insert, update, delete on public.client_profiles from authenticated';
    execute 'grant select on public.client_profiles to authenticated';

    execute 'drop policy if exists "client_profiles_select_own_or_privileged" on public.client_profiles';
    execute $policy$
      create policy "client_profiles_select_own_or_privileged"
      on public.client_profiles
      for select
      to authenticated
      using (
        (select auth.uid()) = profile_id
        or exists (
          select 1
          from public.profiles current_profile
          where current_profile.id = (select auth.uid())
            and current_profile.role::text in ('admin', 'professional')
        )
      )
    $policy$;
  end if;

  if to_regclass('public.professional_profiles') is not null then
    execute 'alter table public.professional_profiles enable row level security';
    execute 'grant select on public.professional_profiles to authenticated';

    execute 'drop policy if exists "professional_profiles_select_own_or_privileged" on public.professional_profiles';
    execute $policy$
      create policy "professional_profiles_select_own_or_privileged"
      on public.professional_profiles
      for select
      to authenticated
      using (
        (select auth.uid()) = profile_id
        or exists (
          select 1
          from public.profiles current_profile
          where current_profile.id = (select auth.uid())
            and current_profile.role::text in ('admin', 'professional')
        )
      )
    $policy$;
  end if;
end;
$$;

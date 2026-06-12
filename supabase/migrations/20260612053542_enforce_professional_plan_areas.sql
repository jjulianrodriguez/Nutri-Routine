create or replace function private.is_assignable_professional(
  target_profile_id uuid,
  required_specialty public.professional_specialty
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    left join public.professional_profiles professional
      on professional.profile_id = profile.id
    where profile.id = target_profile_id
      and profile.role in (
        'admin'::public.profile_role,
        'professional'::public.profile_role
      )
      and (
        (
          profile.role = 'admin'::public.profile_role
          and professional.profile_id is null
        )
        or professional.specialty = required_specialty
        or professional.specialty = 'both'::public.professional_specialty
      )
  )
$$;

revoke all on function private.is_assignable_professional(
  uuid,
  public.professional_specialty
) from public, anon;
grant execute on function private.is_assignable_professional(
  uuid,
  public.professional_specialty
) to authenticated;

create or replace function private.enforce_client_profile_area_permissions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_is_general_admin boolean := private.is_general_admin();
  actor_specialty public.professional_specialty :=
    private.current_professional_specialty();
begin
  if not actor_is_general_admin and actor_specialty is null then
    raise exception 'Only authorized professionals can manage client plans.'
      using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    if not exists (
      select 1
      from public.profiles profile
      where profile.id = new.profile_id
        and profile.role = 'client'::public.profile_role
    ) then
      raise exception 'Plans can only be assigned to client accounts.'
        using errcode = '42501';
    end if;

    if not actor_is_general_admin
      and actor_specialty = 'nutrition'::public.professional_specialty
      and new.assigned_trainer_id is not null then
      raise exception 'Nutrition professionals cannot activate training plans.'
        using errcode = '42501';
    end if;

    if not actor_is_general_admin
      and actor_specialty = 'training'::public.professional_specialty
      and new.assigned_nutritionist_id is not null then
      raise exception 'Training professionals cannot activate nutrition plans.'
        using errcode = '42501';
    end if;
  elsif tg_op = 'UPDATE' then
    if not actor_is_general_admin
      and actor_specialty = 'nutrition'::public.professional_specialty
      and new.assigned_trainer_id is distinct from old.assigned_trainer_id then
      raise exception 'Nutrition professionals cannot modify training plans.'
        using errcode = '42501';
    end if;

    if not actor_is_general_admin
      and actor_specialty = 'training'::public.professional_specialty
      and new.assigned_nutritionist_id
        is distinct from old.assigned_nutritionist_id then
      raise exception 'Training professionals cannot modify nutrition plans.'
        using errcode = '42501';
    end if;
  elsif tg_op = 'DELETE' then
    if not actor_is_general_admin
      and actor_specialty = 'nutrition'::public.professional_specialty
      and old.assigned_trainer_id is not null then
      raise exception 'Nutrition professionals cannot remove training plans.'
        using errcode = '42501';
    end if;

    if not actor_is_general_admin
      and actor_specialty = 'training'::public.professional_specialty
      and old.assigned_nutritionist_id is not null then
      raise exception 'Training professionals cannot remove nutrition plans.'
        using errcode = '42501';
    end if;

    return old;
  end if;

  if tg_op = 'INSERT' then
    if new.assigned_nutritionist_id is not null
      and not private.is_assignable_professional(
        new.assigned_nutritionist_id,
        'nutrition'::public.professional_specialty
      ) then
      raise exception 'The selected nutrition professional is not assignable.'
        using errcode = '42501';
    end if;

    if new.assigned_trainer_id is not null
      and not private.is_assignable_professional(
        new.assigned_trainer_id,
        'training'::public.professional_specialty
      ) then
      raise exception 'The selected training professional is not assignable.'
        using errcode = '42501';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.assigned_nutritionist_id
      is distinct from old.assigned_nutritionist_id
      and new.assigned_nutritionist_id is not null
      and not private.is_assignable_professional(
        new.assigned_nutritionist_id,
        'nutrition'::public.professional_specialty
      ) then
      raise exception 'The selected nutrition professional is not assignable.'
        using errcode = '42501';
    end if;

    if new.assigned_trainer_id is distinct from old.assigned_trainer_id
      and new.assigned_trainer_id is not null
      and not private.is_assignable_professional(
        new.assigned_trainer_id,
        'training'::public.professional_specialty
      ) then
      raise exception 'The selected training professional is not assignable.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_client_profile_area_permissions()
  from public, anon, authenticated;

drop trigger if exists enforce_client_profile_area_permissions
  on public.client_profiles;
create trigger enforce_client_profile_area_permissions
before insert or update or delete on public.client_profiles
for each row
execute function private.enforce_client_profile_area_permissions();

alter table public.profiles enable row level security;
alter table public.client_profiles enable row level security;

revoke all on public.client_profiles from anon;
revoke all on public.client_profiles from authenticated;
grant select (
  profile_id,
  assigned_nutritionist_id,
  assigned_trainer_id
) on public.client_profiles to authenticated;
grant insert (
  profile_id,
  assigned_nutritionist_id,
  assigned_trainer_id
) on public.client_profiles to authenticated;
grant update (
  assigned_nutritionist_id,
  assigned_trainer_id
) on public.client_profiles to authenticated;
grant delete on public.client_profiles to authenticated;

drop policy if exists "profiles_select_visible_to_account"
  on public.profiles;
create policy "profiles_select_visible_to_account"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (
    (select private.is_privileged())
    and role in (
      'client'::public.profile_role,
      'admin'::public.profile_role,
      'professional'::public.profile_role
    )
  )
);

drop policy if exists "client_profiles_select_own_or_assigned"
  on public.client_profiles;
create policy "client_profiles_select_own_or_privileged"
on public.client_profiles
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or (select private.is_privileged())
);

drop policy if exists "client_profiles_insert_general_admin"
  on public.client_profiles;
drop policy if exists "client_profiles_update_general_admin"
  on public.client_profiles;
drop policy if exists "client_profiles_delete_general_admin"
  on public.client_profiles;
drop policy if exists "client_profiles_insert_by_area"
  on public.client_profiles;
drop policy if exists "client_profiles_update_by_area"
  on public.client_profiles;
drop policy if exists "client_profiles_delete_by_area"
  on public.client_profiles;

create policy "client_profiles_insert_by_area"
on public.client_profiles
for insert
to authenticated
with check (
  (select private.has_specialty('nutrition'::public.professional_specialty))
  or (select private.has_specialty('training'::public.professional_specialty))
);

create policy "client_profiles_update_by_area"
on public.client_profiles
for update
to authenticated
using (
  (select private.has_specialty('nutrition'::public.professional_specialty))
  or (select private.has_specialty('training'::public.professional_specialty))
)
with check (
  (select private.has_specialty('nutrition'::public.professional_specialty))
  or (select private.has_specialty('training'::public.professional_specialty))
);

create policy "client_profiles_delete_by_area"
on public.client_profiles
for delete
to authenticated
using (
  (select private.is_general_admin())
  or (select private.current_professional_specialty())
    = 'both'::public.professional_specialty
  or (
    (select private.current_professional_specialty())
      = 'nutrition'::public.professional_specialty
    and assigned_trainer_id is null
  )
  or (
    (select private.current_professional_specialty())
      = 'training'::public.professional_specialty
    and assigned_nutritionist_id is null
  )
);

notify pgrst, 'reload schema';

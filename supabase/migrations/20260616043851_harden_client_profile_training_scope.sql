set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function private.enforce_client_profile_area_permissions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
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

    if not actor_is_general_admin and (
      new.birth_date is not null
      or new.gender is not null
      or new.phone is not null
      or new.notes is not null
    ) then
      raise exception 'Professionals can only manage service assignments.'
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

    if not actor_is_general_admin
      and new.assigned_nutritionist_id is not null
      and new.assigned_nutritionist_id is distinct from actor_id then
      raise exception 'Professionals can only assign nutrition plans to themselves.'
        using errcode = '42501';
    end if;

    if not actor_is_general_admin
      and new.assigned_trainer_id is not null
      and new.assigned_trainer_id is distinct from actor_id then
      raise exception 'Professionals can only assign training plans to themselves.'
        using errcode = '42501';
    end if;
  elsif tg_op = 'UPDATE' then
    if not actor_is_general_admin and (
      new.profile_id is distinct from old.profile_id
      or new.birth_date is distinct from old.birth_date
      or new.gender is distinct from old.gender
      or new.phone is distinct from old.phone
      or new.notes is distinct from old.notes
    ) then
      raise exception 'Professionals can only manage service assignments.'
        using errcode = '42501';
    end if;

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

    if not actor_is_general_admin
      and new.assigned_nutritionist_id is distinct from old.assigned_nutritionist_id
      and old.assigned_nutritionist_id is not null
      and old.assigned_nutritionist_id is distinct from actor_id then
      raise exception 'You can only modify your own nutrition assignment.'
        using errcode = '42501';
    end if;

    if not actor_is_general_admin
      and new.assigned_trainer_id is distinct from old.assigned_trainer_id
      and old.assigned_trainer_id is not null
      and old.assigned_trainer_id is distinct from actor_id then
      raise exception 'You can only modify your own training assignment.'
        using errcode = '42501';
    end if;

    if not actor_is_general_admin
      and new.assigned_nutritionist_id is not null
      and new.assigned_nutritionist_id is distinct from actor_id then
      raise exception 'Professionals can only assign nutrition plans to themselves.'
        using errcode = '42501';
    end if;

    if not actor_is_general_admin
      and new.assigned_trainer_id is not null
      and new.assigned_trainer_id is distinct from actor_id then
      raise exception 'Professionals can only assign training plans to themselves.'
        using errcode = '42501';
    end if;
  elsif tg_op = 'DELETE' then
    if not actor_is_general_admin
      and old.assigned_nutritionist_id is not null
      and old.assigned_nutritionist_id is distinct from actor_id then
      raise exception 'You can only remove your own nutrition assignment.'
        using errcode = '42501';
    end if;

    if not actor_is_general_admin
      and old.assigned_trainer_id is not null
      and old.assigned_trainer_id is distinct from actor_id then
      raise exception 'You can only remove your own training assignment.'
        using errcode = '42501';
    end if;

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

drop policy if exists "client_profiles_insert_by_area"
  on public.client_profiles;
drop policy if exists "client_profiles_update_by_area"
  on public.client_profiles;
drop policy if exists "client_profiles_delete_by_area"
  on public.client_profiles;
drop policy if exists "client_profiles_insert_authorized_managers"
  on public.client_profiles;
drop policy if exists "client_profiles_update_authorized_managers"
  on public.client_profiles;
drop policy if exists "client_profiles_delete_authorized_managers"
  on public.client_profiles;

create policy "client_profiles_insert_authorized_managers"
on public.client_profiles
for insert
to authenticated
with check ((select private.is_general_admin()));

create policy "client_profiles_update_authorized_managers"
on public.client_profiles
for update
to authenticated
using (
  (select private.is_general_admin())
  or (
    (select private.has_specialty('nutrition'::public.professional_specialty))
    and assigned_nutritionist_id = (select auth.uid())
  )
  or (
    (select private.has_specialty('training'::public.professional_specialty))
    and assigned_trainer_id = (select auth.uid())
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

create policy "client_profiles_delete_authorized_managers"
on public.client_profiles
for delete
to authenticated
using (
  (select private.is_general_admin())
  or (
    (select private.has_specialty('nutrition'::public.professional_specialty))
    and assigned_nutritionist_id = (select auth.uid())
    and assigned_trainer_id is null
  )
  or (
    (select private.has_specialty('training'::public.professional_specialty))
    and assigned_trainer_id = (select auth.uid())
    and assigned_nutritionist_id is null
  )
  or (
    (select private.has_specialty('nutrition'::public.professional_specialty))
    and (select private.has_specialty('training'::public.professional_specialty))
    and assigned_nutritionist_id = (select auth.uid())
    and assigned_trainer_id = (select auth.uid())
  )
);

notify pgrst, 'reload schema';

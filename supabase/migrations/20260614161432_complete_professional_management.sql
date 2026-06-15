set lock_timeout = '5s';
set statement_timeout = '30s';

alter table public.professional_profiles
  add column if not exists is_active boolean not null default true;

update public.profiles profile
set role = 'professional'::public.profile_role
where profile.role = 'admin'::public.profile_role
  and exists (
    select 1
    from public.professional_profiles professional
    where professional.profile_id = profile.id
  );

create or replace function private.current_professional_specialty()
returns public.professional_specialty
language sql
stable
security definer
set search_path = ''
as $$
  select professional.specialty
  from public.professional_profiles professional
  join public.profiles profile
    on profile.id = professional.profile_id
  where professional.profile_id = (select auth.uid())
    and professional.is_active
    and profile.role = 'professional'::public.profile_role
$$;

create or replace function private.is_privileged()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_general_admin()
    or exists (
      select 1
      from public.profiles profile
      join public.professional_profiles professional
        on professional.profile_id = profile.id
      where profile.id = (select auth.uid())
        and profile.role = 'professional'::public.profile_role
        and professional.is_active
    )
$$;

create or replace function private.has_specialty(
  required_specialty public.professional_specialty
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_general_admin()
    or exists (
      select 1
      from public.profiles profile
      join public.professional_profiles professional
        on professional.profile_id = profile.id
      where profile.id = (select auth.uid())
        and profile.role = 'professional'::public.profile_role
        and professional.is_active
        and (
          professional.specialty = required_specialty
          or professional.specialty = 'both'::public.professional_specialty
        )
    )
$$;

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
      and (
        (
          profile.role = 'admin'::public.profile_role
          and professional.profile_id is null
        )
        or (
          profile.role = 'professional'::public.profile_role
          and professional.is_active
          and (
            professional.specialty = required_specialty
            or professional.specialty = 'both'::public.professional_specialty
          )
        )
      )
  )
$$;

create or replace function private.is_client_assigned_to_current_professional(
  client_profile_id uuid,
  required_area public.service_area
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_general_admin()
    or exists (
      select 1
      from public.client_profiles client
      where client.profile_id = client_profile_id
        and (
          (
            required_area = 'nutrition'::public.service_area
            and client.assigned_nutritionist_id = (select auth.uid())
            and private.has_specialty(
              'nutrition'::public.professional_specialty
            )
          )
          or (
            required_area = 'training'::public.service_area
            and client.assigned_trainer_id = (select auth.uid())
            and private.has_specialty(
              'training'::public.professional_specialty
            )
          )
          or (
            required_area = 'general'::public.service_area
            and (
              (
                client.assigned_nutritionist_id = (select auth.uid())
                and private.has_specialty(
                  'nutrition'::public.professional_specialty
                )
              )
              or (
                client.assigned_trainer_id = (select auth.uid())
                and private.has_specialty(
                  'training'::public.professional_specialty
                )
              )
            )
          )
        )
    )
$$;

create or replace function private.validate_professional_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_role public.profile_role;
begin
  select profile.role
  into profile_role
  from public.profiles profile
  where profile.id = new.profile_id;

  if profile_role is distinct from 'professional'::public.profile_role then
    raise exception
      'Las cuentas profesionales deben usar el rol professional.'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE'
    and new.specialty is distinct from old.specialty then
    if new.specialty not in (
      'nutrition'::public.professional_specialty,
      'both'::public.professional_specialty
    ) and exists (
      select 1
      from public.client_profiles client
      where client.assigned_nutritionist_id = old.profile_id
    ) then
      raise exception
        'No se puede quitar nutricion mientras existan clientes asignados.'
        using errcode = '23514';
    end if;

    if new.specialty not in (
      'training'::public.professional_specialty,
      'both'::public.professional_specialty
    ) and exists (
      select 1
      from public.client_profiles client
      where client.assigned_trainer_id = old.profile_id
    ) then
      raise exception
        'No se puede quitar entrenamiento mientras existan clientes asignados.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.validate_professional_profile()
  from public, anon, authenticated;

drop trigger if exists validate_professional_profile
  on public.professional_profiles;
create trigger validate_professional_profile
before insert or update on public.professional_profiles
for each row
execute function private.validate_professional_profile();

create or replace function private.protect_profile_role()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
    and coalesce((select auth.role()), '') <> 'service_role'
    and current_user <> 'postgres' then
    raise exception 'No puedes modificar el rol de la cuenta.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_profile_role()
  from public, anon, authenticated;

drop trigger if exists protect_profile_role
  on public.profiles;
create trigger protect_profile_role
before update of role on public.profiles
for each row
execute function private.protect_profile_role();

notify pgrst, 'reload schema';

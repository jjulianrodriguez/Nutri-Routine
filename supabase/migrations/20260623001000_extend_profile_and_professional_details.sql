set lock_timeout = '5s';
set statement_timeout = '30s';

alter table public.profile_personal_details
  add column if not exists body_fat_percentage numeric(5, 2),
  add column if not exists body_measurements text,
  add column if not exists injuries text,
  add column if not exists allergies text,
  add column if not exists important_medications text,
  add column if not exists dietary_restrictions text,
  add column if not exists professional_notes text;

alter table public.professional_profiles
  add column if not exists professional_phone text,
  add column if not exists professional_links text,
  add column if not exists experience text,
  add column if not exists certifications text,
  add column if not exists focus_areas text[] not null default '{}',
  add column if not exists availability_schedule text,
  add column if not exists availability_days text,
  add column if not exists availability_note text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profile_personal_details_body_fat_check'
      and conrelid = 'public.profile_personal_details'::regclass
  ) then
    alter table public.profile_personal_details
      add constraint profile_personal_details_body_fat_check
      check (
        body_fat_percentage is null
        or body_fat_percentage > 0
        and body_fat_percentage <= 100
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profile_personal_details_body_measurements_check'
      and conrelid = 'public.profile_personal_details'::regclass
  ) then
    alter table public.profile_personal_details
      add constraint profile_personal_details_body_measurements_check
      check (
        body_measurements is null
        or char_length(body_measurements) <= 4000
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profile_personal_details_health_notes_check'
      and conrelid = 'public.profile_personal_details'::regclass
  ) then
    alter table public.profile_personal_details
      add constraint profile_personal_details_health_notes_check
      check (
        (injuries is null or char_length(injuries) <= 4000)
        and (allergies is null or char_length(allergies) <= 4000)
        and (
          important_medications is null
          or char_length(important_medications) <= 4000
        )
        and (
          dietary_restrictions is null
          or char_length(dietary_restrictions) <= 4000
        )
        and (
          professional_notes is null
          or char_length(professional_notes) <= 4000
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'professional_profiles_public_details_check'
      and conrelid = 'public.professional_profiles'::regclass
  ) then
    alter table public.professional_profiles
      add constraint professional_profiles_public_details_check
      check (
        (professional_phone is null or char_length(professional_phone) <= 40)
        and (professional_links is null or char_length(professional_links) <= 1000)
        and (experience is null or char_length(experience) <= 4000)
        and (certifications is null or char_length(certifications) <= 4000)
        and (
          availability_schedule is null
          or char_length(availability_schedule) <= 4000
        )
        and (
          availability_days is null
          or char_length(availability_days) <= 1000
        )
        and (
          availability_note is null
          or char_length(availability_note) <= 1000
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'professional_profiles_focus_areas_check'
      and conrelid = 'public.professional_profiles'::regclass
  ) then
    alter table public.professional_profiles
      add constraint professional_profiles_focus_areas_check
      check (
        cardinality(focus_areas) <= 8
        and focus_areas <@ array[
          'fat_loss',
          'hypertrophy',
          'digestive_health',
          'body_recomposition',
          'performance',
          'other'
        ]::text[]
      );
  end if;
end;
$$;

comment on column public.profile_personal_details.body_fat_percentage is
  'Optional sensitive body fat percentage. Access is restricted by RLS.';
comment on column public.profile_personal_details.body_measurements is
  'Optional sensitive body measurements by muscle group or body area.';
comment on column public.profile_personal_details.injuries is
  'Optional sensitive injury history. Access is restricted by RLS.';
comment on column public.profile_personal_details.allergies is
  'Optional sensitive allergy information. Access is restricted by RLS.';
comment on column public.profile_personal_details.important_medications is
  'Optional sensitive medication notes. Access is restricted by RLS.';
comment on column public.profile_personal_details.dietary_restrictions is
  'Optional sensitive dietary restrictions. Access is restricted by RLS.';
comment on column public.profile_personal_details.professional_notes is
  'Optional sensitive notes intended for assigned professionals.';

grant update (
  bio,
  professional_phone,
  professional_links,
  experience,
  certifications,
  focus_areas,
  availability_schedule,
  availability_days,
  availability_note
) on public.professional_profiles to authenticated;

drop policy if exists "professional_profiles_update_own_details"
  on public.professional_profiles;
create policy "professional_profiles_update_own_details"
on public.professional_profiles
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

notify pgrst, 'reload schema';

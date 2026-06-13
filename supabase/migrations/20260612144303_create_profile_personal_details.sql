set lock_timeout = '5s';
set statement_timeout = '30s';

create table if not exists public.profile_personal_details (
  profile_id uuid primary key
    references public.profiles(id) on delete cascade,
  phone text,
  birth_date date,
  gender text,
  gender_description text,
  weight_kg numeric(6, 2),
  height_cm numeric(5, 2),
  medical_conditions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_personal_details_phone_check check (
    phone is null
    or (
      char_length(phone) between 5 and 40
      and phone ~ '^[0-9+() .-]+$'
    )
  ),
  constraint profile_personal_details_birth_date_check check (
    birth_date is null or birth_date <= current_date
  ),
  constraint profile_personal_details_gender_check check (
    gender is null
    or gender in (
      'male',
      'female',
      'non_binary',
      'prefer_not_to_say',
      'self_described'
    )
  ),
  constraint profile_personal_details_gender_description_check check (
    (
      gender = 'self_described'
      and char_length(btrim(coalesce(gender_description, ''))) between 1 and 120
    )
    or (
      gender is distinct from 'self_described'
      and gender_description is null
    )
  ),
  constraint profile_personal_details_weight_check check (
    weight_kg is null or weight_kg > 0 and weight_kg <= 1000
  ),
  constraint profile_personal_details_height_check check (
    height_cm is null or height_cm > 0 and height_cm <= 300
  ),
  constraint profile_personal_details_medical_conditions_check check (
    medical_conditions is null
    or char_length(medical_conditions) <= 4000
  )
);

comment on table public.profile_personal_details is
  'Optional private personal details for every authenticated profile.';
comment on column public.profile_personal_details.medical_conditions is
  'Optional sensitive health information. Access is restricted by RLS.';

drop trigger if exists set_profile_personal_details_updated_at
  on public.profile_personal_details;
create trigger set_profile_personal_details_updated_at
before update on public.profile_personal_details
for each row
execute function public.set_updated_at();

insert into public.profile_personal_details (
  profile_id,
  phone,
  birth_date,
  gender,
  gender_description
)
select
  cp.profile_id,
  case
    when btrim(coalesce(cp.phone, '')) ~ '^[0-9+() .-]{5,40}$'
    then btrim(cp.phone)
    else null
  end,
  case
    when cp.birth_date <= current_date then cp.birth_date
    else null
  end,
  case
    when lower(btrim(cp.gender)) in ('masculino', 'male') then 'male'
    when lower(btrim(cp.gender)) in ('femenino', 'female') then 'female'
    when lower(btrim(cp.gender)) in (
      'no binario',
      'no binaria',
      'non binary',
      'non_binary'
    ) then 'non_binary'
    when lower(btrim(cp.gender)) in (
      'prefiero no decir',
      'prefer not to say',
      'prefer_not_to_say'
    ) then 'prefer_not_to_say'
    when cp.gender is not null and btrim(cp.gender) <> '' then 'self_described'
    else null
  end,
  case
    when cp.gender is not null
      and btrim(cp.gender) <> ''
      and lower(btrim(cp.gender)) not in (
        'masculino',
        'male',
        'femenino',
        'female',
        'no binario',
        'no binaria',
        'non binary',
        'non_binary',
        'prefiero no decir',
        'prefer not to say',
        'prefer_not_to_say'
      )
    then left(btrim(cp.gender), 120)
    else null
  end
from public.client_profiles cp
where cp.phone is not null
  or cp.birth_date is not null
  or cp.gender is not null
on conflict (profile_id) do nothing;

alter table public.profile_personal_details enable row level security;

revoke all on public.profile_personal_details
  from public, anon, authenticated;
grant select, insert, update, delete
  on public.profile_personal_details
  to authenticated;

drop policy if exists "profile_personal_details_select_allowed"
  on public.profile_personal_details;
create policy "profile_personal_details_select_allowed"
on public.profile_personal_details
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or (
    select private.is_client_assigned_to_current_professional(
      profile_id,
      'general'::public.service_area
    )
  )
);

drop policy if exists "profile_personal_details_insert_own"
  on public.profile_personal_details;
create policy "profile_personal_details_insert_own"
on public.profile_personal_details
for insert
to authenticated
with check (profile_id = (select auth.uid()));

drop policy if exists "profile_personal_details_update_own"
  on public.profile_personal_details;
create policy "profile_personal_details_update_own"
on public.profile_personal_details
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

drop policy if exists "profile_personal_details_delete_own"
  on public.profile_personal_details;
create policy "profile_personal_details_delete_own"
on public.profile_personal_details
for delete
to authenticated
using (profile_id = (select auth.uid()));

notify pgrst, 'reload schema';

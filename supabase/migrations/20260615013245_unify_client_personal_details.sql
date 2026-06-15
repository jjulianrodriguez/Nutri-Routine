set lock_timeout = '5s';
set statement_timeout = '30s';

with legacy_personal_details as (
  select
    cp.profile_id,
    case
      when btrim(coalesce(cp.phone, '')) ~ '^[0-9+() .-]{5,40}$'
      then btrim(cp.phone)
      else null
    end as phone,
    case
      when cp.birth_date <= current_date then cp.birth_date
      else null
    end as birth_date,
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
      when cp.gender is not null and btrim(cp.gender) <> ''
      then 'self_described'
      else null
    end as gender,
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
    end as gender_description
  from public.client_profiles cp
),
valid_legacy_personal_details as (
  select *
  from legacy_personal_details
  where phone is not null
    or birth_date is not null
    or gender is not null
)
insert into public.profile_personal_details (
  profile_id,
  phone,
  birth_date,
  gender,
  gender_description
)
select
  profile_id,
  phone,
  birth_date,
  gender,
  gender_description
from valid_legacy_personal_details
on conflict (profile_id) do update
set
  phone = coalesce(
    public.profile_personal_details.phone,
    excluded.phone
  ),
  birth_date = coalesce(
    public.profile_personal_details.birth_date,
    excluded.birth_date
  ),
  gender = coalesce(
    public.profile_personal_details.gender,
    excluded.gender
  ),
  gender_description = case
    when public.profile_personal_details.gender is null
    then excluded.gender_description
    else public.profile_personal_details.gender_description
  end,
  updated_at = now()
where (
  public.profile_personal_details.phone is null
  and excluded.phone is not null
)
or (
  public.profile_personal_details.birth_date is null
  and excluded.birth_date is not null
)
or (
  public.profile_personal_details.gender is null
  and excluded.gender is not null
);

comment on column public.client_profiles.phone is
  'Legacy personal field. New reads and writes use profile_personal_details.phone.';
comment on column public.client_profiles.birth_date is
  'Legacy personal field. New reads and writes use profile_personal_details.birth_date.';
comment on column public.client_profiles.gender is
  'Legacy personal field. New reads and writes use profile_personal_details.gender and gender_description.';

notify pgrst, 'reload schema';

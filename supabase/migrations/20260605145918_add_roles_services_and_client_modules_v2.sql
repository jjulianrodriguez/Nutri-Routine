alter type public.profile_role add value if not exists 'admin';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'professional_specialty' and typnamespace = 'public'::regnamespace) then
    create type public.professional_specialty as enum ('nutrition', 'training', 'both');
  end if;

  if not exists (select 1 from pg_type where typname = 'service_area' and typnamespace = 'public'::regnamespace) then
    create type public.service_area as enum ('nutrition', 'training', 'general');
  end if;

  if not exists (select 1 from pg_type where typname = 'plan_status' and typnamespace = 'public'::regnamespace) then
    create type public.plan_status as enum ('draft', 'active', 'archived');
  end if;
end $$;

create table if not exists public.professional_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  specialty public.professional_specialty not null,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  assigned_nutritionist_id uuid references public.profiles(id) on delete set null,
  assigned_trainer_id uuid references public.profiles(id) on delete set null,
  birth_date date,
  gender text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_has_at_least_one_service check (
    assigned_nutritionist_id is not null
    or assigned_trainer_id is not null
  )
);

create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  nutritionist_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  description text,
  status public.plan_status not null default 'draft',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint diet_dates_valid check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  description text,
  status public.plan_status not null default 'draft',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_dates_valid check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  area public.service_area not null default 'general',
  title text not null check (char_length(title) between 1 and 180),
  description text,
  file_url text not null check (char_length(file_url) between 1 and 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.professional_profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.diet_plans enable row level security;
alter table public.workout_plans enable row level security;
alter table public.resources enable row level security;

create index if not exists idx_client_profiles_nutritionist on public.client_profiles(assigned_nutritionist_id);
create index if not exists idx_client_profiles_trainer on public.client_profiles(assigned_trainer_id);
create index if not exists idx_diet_plans_client on public.diet_plans(client_id);
create index if not exists idx_diet_plans_nutritionist on public.diet_plans(nutritionist_id);
create index if not exists idx_workout_plans_client on public.workout_plans(client_id);
create index if not exists idx_workout_plans_trainer on public.workout_plans(trainer_id);
create index if not exists idx_resources_client on public.resources(client_id);
create index if not exists idx_resources_uploaded_by on public.resources(uploaded_by);
create index if not exists idx_resources_area on public.resources(area);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_professional_profiles_updated_at on public.professional_profiles;
create trigger set_professional_profiles_updated_at
before update on public.professional_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_client_profiles_updated_at on public.client_profiles;
create trigger set_client_profiles_updated_at
before update on public.client_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_diet_plans_updated_at on public.diet_plans;
create trigger set_diet_plans_updated_at
before update on public.diet_plans
for each row
execute function public.set_updated_at();

drop trigger if exists set_workout_plans_updated_at on public.workout_plans;
create trigger set_workout_plans_updated_at
before update on public.workout_plans
for each row
execute function public.set_updated_at();

drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();

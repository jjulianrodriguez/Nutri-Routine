create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;
grant usage on schema private to authenticated;

create or replace function private.current_profile_role()
returns public.profile_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
$$;

create or replace function private.current_professional_specialty()
returns public.professional_specialty
language sql
stable
security definer
set search_path = ''
as $$
  select pp.specialty
  from public.professional_profiles pp
  where pp.profile_id = (select auth.uid())
$$;

create or replace function private.is_privileged()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('admin'::public.profile_role, 'professional'::public.profile_role)
  )
$$;

create or replace function private.is_general_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.professional_profiles pp on pp.profile_id = p.id
    where p.id = (select auth.uid())
      and p.role = 'admin'::public.profile_role
      and pp.profile_id is null
  )
$$;

create or replace function private.has_specialty(required_specialty public.professional_specialty)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.professional_profiles pp on pp.profile_id = p.id
    where p.id = (select auth.uid())
      and p.role in ('admin'::public.profile_role, 'professional'::public.profile_role)
      and (
        (p.role = 'admin'::public.profile_role and pp.profile_id is null)
        or pp.specialty = required_specialty
        or pp.specialty = 'both'::public.professional_specialty
      )
  )
$$;

create or replace function private.can_manage_resource_area(required_area public.service_area)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when required_area = 'nutrition'::public.service_area then private.has_specialty('nutrition'::public.professional_specialty)
    when required_area = 'training'::public.service_area then private.has_specialty('training'::public.professional_specialty)
    else private.has_specialty('nutrition'::public.professional_specialty)
      or private.has_specialty('training'::public.professional_specialty)
  end
$$;

create or replace function private.client_has_service(target_client_id uuid, required_area public.service_area)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.client_profiles cp
    where cp.profile_id = target_client_id
      and (
        (required_area = 'nutrition'::public.service_area and cp.assigned_nutritionist_id is not null)
        or (required_area = 'training'::public.service_area and cp.assigned_trainer_id is not null)
        or (
          required_area = 'general'::public.service_area
          and (cp.assigned_nutritionist_id is not null or cp.assigned_trainer_id is not null)
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
      from public.client_profiles cp
      where cp.profile_id = client_profile_id
        and (
          (required_area = 'nutrition'::public.service_area and cp.assigned_nutritionist_id = (select auth.uid()))
          or (required_area = 'training'::public.service_area and cp.assigned_trainer_id = (select auth.uid()))
          or (
            required_area = 'general'::public.service_area
            and (
              cp.assigned_nutritionist_id = (select auth.uid())
              or cp.assigned_trainer_id = (select auth.uid())
            )
          )
        )
    )
$$;

revoke all on function private.current_profile_role() from public, anon, authenticated;
revoke all on function private.current_professional_specialty() from public, anon, authenticated;
revoke all on function private.is_privileged() from public, anon, authenticated;
revoke all on function private.is_general_admin() from public, anon, authenticated;
revoke all on function private.has_specialty(public.professional_specialty) from public, anon, authenticated;
revoke all on function private.can_manage_resource_area(public.service_area) from public, anon, authenticated;
revoke all on function private.client_has_service(uuid, public.service_area) from public, anon, authenticated;
revoke all on function private.is_client_assigned_to_current_professional(uuid, public.service_area) from public, anon, authenticated;

grant execute on function private.current_profile_role() to authenticated;
grant execute on function private.current_professional_specialty() to authenticated;
grant execute on function private.is_privileged() to authenticated;
grant execute on function private.is_general_admin() to authenticated;
grant execute on function private.has_specialty(public.professional_specialty) to authenticated;
grant execute on function private.can_manage_resource_area(public.service_area) to authenticated;
grant execute on function private.client_has_service(uuid, public.service_area) to authenticated;
grant execute on function private.is_client_assigned_to_current_professional(uuid, public.service_area) to authenticated;

revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.has_specialty(public.professional_specialty) from public, anon, authenticated;
revoke all on function public.is_client_assigned_to_current_professional(uuid, public.service_area) from public, anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

revoke all on public.profiles from anon;
revoke all on public.professional_profiles from anon;
revoke all on public.client_profiles from anon;
revoke all on public.diet_plans from anon;
revoke all on public.workout_plans from anon;
revoke all on public.resources from anon;

revoke all on public.profiles from authenticated;
revoke all on public.professional_profiles from authenticated;
revoke all on public.client_profiles from authenticated;
revoke all on public.diet_plans from authenticated;
revoke all on public.workout_plans from authenticated;
revoke all on public.resources from authenticated;

grant select on public.profiles to authenticated;
grant insert (id, full_name, role, avatar_url) on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
grant select on public.professional_profiles to authenticated;
grant select on public.client_profiles to authenticated;
grant select on public.diet_plans to authenticated;
grant select on public.workout_plans to authenticated;
grant select on public.resources to authenticated;

create index if not exists blog_posts_author_id_idx on public.blog_posts (author_id);

alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.diet_plans enable row level security;
alter table public.workout_plans enable row level security;
alter table public.resources enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_clients_for_professionals" on public.profiles;
drop policy if exists "profiles_select_visible_to_account" on public.profiles;
create policy "profiles_select_visible_to_account"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or private.is_general_admin()
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
    role in ('admin'::public.profile_role, 'professional'::public.profile_role)
    and private.is_privileged()
  )
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  id = (select auth.uid())
  and role = 'client'::public.profile_role
);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = 'client'::public.profile_role);

drop policy if exists "Admins manage professional profiles" on public.professional_profiles;
drop policy if exists "Professionals can read professional profiles" on public.professional_profiles;
drop policy if exists "professional_profiles_select_visible_to_account" on public.professional_profiles;
create policy "professional_profiles_select_visible_to_account"
on public.professional_profiles
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or private.is_privileged()
);

drop policy if exists "Admins manage client profiles" on public.client_profiles;
drop policy if exists "Clients and assigned professionals read client profiles" on public.client_profiles;
drop policy if exists "Clients update own client profile" on public.client_profiles;
drop policy if exists "client_profiles_select_own_or_assigned" on public.client_profiles;
create policy "client_profiles_select_own_or_assigned"
on public.client_profiles
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or private.is_general_admin()
  or assigned_nutritionist_id = (select auth.uid())
  or assigned_trainer_id = (select auth.uid())
);

drop policy if exists "Diet plans visible to client nutritionist and admins" on public.diet_plans;
drop policy if exists "Nutrition admins manage diet plans" on public.diet_plans;
drop policy if exists "diet_plans_select_related_accounts" on public.diet_plans;
create policy "diet_plans_select_related_accounts"
on public.diet_plans
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(client_id, 'nutrition'::public.service_area)
  )
  or nutritionist_id = (select auth.uid())
  or private.is_general_admin()
);

drop policy if exists "Workout plans visible to client trainer and admins" on public.workout_plans;
drop policy if exists "Training admins manage workout plans" on public.workout_plans;
drop policy if exists "workout_plans_select_related_accounts" on public.workout_plans;
create policy "workout_plans_select_related_accounts"
on public.workout_plans
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(client_id, 'training'::public.service_area)
  )
  or trainer_id = (select auth.uid())
  or private.is_general_admin()
);

drop policy if exists "Admins manage resources" on public.resources;
drop policy if exists "Assigned professionals manage client resources" on public.resources;
drop policy if exists "Resources visible to related users and admins" on public.resources;
drop policy if exists "resources_select_related_accounts" on public.resources;
create policy "resources_select_related_accounts"
on public.resources
for select
to authenticated
using (
  uploaded_by = (select auth.uid())
  or (
    client_id = (select auth.uid())
    and private.client_has_service(client_id, area)
  )
  or (
    client_id is null
    and id is not null
    and exists (
      select 1
      from public.client_profiles cp
      where cp.profile_id = (select auth.uid())
        and (
          (resources.area = 'nutrition'::public.service_area and cp.assigned_nutritionist_id is not null)
          or (resources.area = 'training'::public.service_area and cp.assigned_trainer_id is not null)
          or (
            resources.area = 'general'::public.service_area
            and (cp.assigned_nutritionist_id is not null or cp.assigned_trainer_id is not null)
          )
        )
    )
  )
  or private.is_client_assigned_to_current_professional(client_id, area)
  or (
    client_id is null
    and private.can_manage_resource_area(area)
  )
  or private.is_general_admin()
);

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'appointment_status'
  ) then
    create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled');
  end if;
end;
$$;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  area public.service_area not null default 'general'::public.service_area,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.appointment_status not null default 'scheduled'::public.appointment_status,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_title_check check (char_length(title) between 1 and 180),
  constraint appointments_dates_valid check (ends_at is null or ends_at >= starts_at)
);

create table if not exists public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  recorded_by uuid references public.profiles(id) on delete set null,
  area public.service_area not null default 'general'::public.service_area,
  metric_type text not null,
  metric_value numeric,
  metric_unit text,
  note text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint progress_entries_metric_type_check check (char_length(metric_type) between 1 and 80),
  constraint progress_entries_metric_unit_check check (metric_unit is null or char_length(metric_unit) <= 32)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  area public.service_area not null default 'general'::public.service_area,
  subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_subject_check check (subject is null or char_length(subject) <= 180)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_check check (char_length(body) between 1 and 4000)
);

create index if not exists appointments_client_id_idx on public.appointments (client_id);
create index if not exists appointments_professional_id_idx on public.appointments (professional_id);
create index if not exists appointments_starts_at_idx on public.appointments (starts_at);
create index if not exists progress_entries_client_id_recorded_at_idx on public.progress_entries (client_id, recorded_at desc);
create index if not exists progress_entries_recorded_by_idx on public.progress_entries (recorded_by) where recorded_by is not null;
create index if not exists conversations_client_id_idx on public.conversations (client_id);
create index if not exists conversations_professional_id_idx on public.conversations (professional_id);
create index if not exists messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at desc);
create index if not exists messages_sender_id_idx on public.messages (sender_id);

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row
execute function public.set_updated_at();

drop trigger if exists set_progress_entries_updated_at on public.progress_entries;
create trigger set_progress_entries_updated_at
before update on public.progress_entries
for each row
execute function public.set_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();

alter table public.appointments enable row level security;
alter table public.progress_entries enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on public.appointments from anon, authenticated;
revoke all on public.progress_entries from anon, authenticated;
revoke all on public.conversations from anon, authenticated;
revoke all on public.messages from anon, authenticated;

grant select on public.appointments to authenticated;
grant select on public.progress_entries to authenticated;
grant select on public.conversations to authenticated;
grant select on public.messages to authenticated;

drop policy if exists "appointments_select_related_accounts" on public.appointments;
create policy "appointments_select_related_accounts"
on public.appointments
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(client_id, area)
  )
  or professional_id = (select auth.uid())
  or private.is_client_assigned_to_current_professional(client_id, area)
  or private.is_general_admin()
);

drop policy if exists "progress_entries_select_related_accounts" on public.progress_entries;
create policy "progress_entries_select_related_accounts"
on public.progress_entries
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(client_id, area)
  )
  or recorded_by = (select auth.uid())
  or private.is_client_assigned_to_current_professional(client_id, area)
  or private.is_general_admin()
);

drop policy if exists "conversations_select_related_accounts" on public.conversations;
create policy "conversations_select_related_accounts"
on public.conversations
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(client_id, area)
  )
  or professional_id = (select auth.uid())
  or private.is_client_assigned_to_current_professional(client_id, area)
  or private.is_general_admin()
);

drop policy if exists "messages_select_conversation_participants" on public.messages;
create policy "messages_select_conversation_participants"
on public.messages
for select
to authenticated
using (
  sender_id = (select auth.uid())
  or exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (
        (c.client_id = (select auth.uid()) and private.client_has_service(c.client_id, c.area))
        or c.professional_id = (select auth.uid())
        or private.is_client_assigned_to_current_professional(c.client_id, c.area)
        or private.is_general_admin()
      )
  )
);

notify pgrst, 'reload schema';

set lock_timeout = '5s';
set statement_timeout = '30s';

create table if not exists public.workout_day_progress (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  workout_plan_id uuid not null references public.workout_plans(id) on delete cascade,
  workout_date date not null,
  cycle_day integer not null,
  completed_exercise_ids text[] not null default '{}'::text[],
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_day_progress_cycle_day_check
    check (cycle_day between 1 and 366),
  constraint workout_day_progress_completed_at_check
    check (completed_at is null or cardinality(completed_exercise_ids) > 0),
  constraint workout_day_progress_client_plan_day_key
    unique (client_id, workout_plan_id, workout_date, cycle_day)
);

create index if not exists workout_day_progress_client_date_idx
  on public.workout_day_progress (client_id, workout_date desc);

create index if not exists workout_day_progress_plan_date_idx
  on public.workout_day_progress (workout_plan_id, workout_date desc);

drop trigger if exists set_workout_day_progress_updated_at
  on public.workout_day_progress;

create trigger set_workout_day_progress_updated_at
before update on public.workout_day_progress
for each row
execute function public.set_updated_at();

alter table public.workout_day_progress enable row level security;

revoke all on public.workout_day_progress from anon, authenticated;
grant select, insert on public.workout_day_progress to authenticated;
grant update (completed_exercise_ids, completed_at)
  on public.workout_day_progress to authenticated;

drop policy if exists workout_day_progress_select_related_accounts
  on public.workout_day_progress;

create policy workout_day_progress_select_related_accounts
on public.workout_day_progress
for select
to authenticated
using (
  client_id = (select auth.uid())
  or private.is_client_assigned_to_current_professional(
    client_id,
    'training'::public.service_area
  )
  or (select private.is_general_admin())
);

drop policy if exists workout_day_progress_insert_own_active_plan
  on public.workout_day_progress;

create policy workout_day_progress_insert_own_active_plan
on public.workout_day_progress
for insert
to authenticated
with check (
  client_id = (select auth.uid())
  and private.client_has_service(client_id, 'training'::public.service_area)
  and exists (
    select 1
    from public.workout_plans wp
    where wp.id = workout_day_progress.workout_plan_id
      and wp.client_id = workout_day_progress.client_id
      and wp.status = 'active'::public.plan_status
  )
);

drop policy if exists workout_day_progress_update_own_active_plan
  on public.workout_day_progress;

create policy workout_day_progress_update_own_active_plan
on public.workout_day_progress
for update
to authenticated
using (
  client_id = (select auth.uid())
)
with check (
  client_id = (select auth.uid())
  and private.client_has_service(client_id, 'training'::public.service_area)
  and exists (
    select 1
    from public.workout_plans wp
    where wp.id = workout_day_progress.workout_plan_id
      and wp.client_id = workout_day_progress.client_id
      and wp.status = 'active'::public.plan_status
  )
);

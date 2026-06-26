set lock_timeout = '5s';
set statement_timeout = '30s';

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  description text check (description is null or char_length(description) <= 800),
  created_by uuid not null references public.profiles(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_assignments (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid not null references public.profiles(id) on delete cascade,
  active boolean not null default true,
  days_of_week integer[] not null default array[1, 2, 3, 4, 5],
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habit_assignments_days_weekdays_check
    check (
      cardinality(days_of_week) > 0
      and days_of_week <@ array[1, 2, 3, 4, 5]
    ),
  constraint habit_assignments_dates_valid
    check (end_date is null or end_date >= start_date)
);

create table if not exists public.habit_progress (
  id uuid primary key default gen_random_uuid(),
  habit_assignment_id uuid not null references public.habit_assignments(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habit_progress_weekday_check
    check (extract(isodow from date) between 1 and 5),
  constraint habit_progress_completed_at_check
    check (
      (completed and completed_at is not null)
      or (not completed and completed_at is null)
    ),
  constraint habit_progress_assignment_client_date_key
    unique (habit_assignment_id, client_id, date)
);

create index if not exists habits_created_by_idx
  on public.habits (created_by);

create index if not exists habits_active_idx
  on public.habits (active)
  where active = true;

create index if not exists habit_assignments_client_active_idx
  on public.habit_assignments (client_id, active, start_date);

create index if not exists habit_assignments_assigned_by_idx
  on public.habit_assignments (assigned_by);

create unique index if not exists habit_assignments_active_client_habit_key
  on public.habit_assignments (client_id, habit_id)
  where active = true;

create index if not exists habit_progress_client_date_idx
  on public.habit_progress (client_id, date desc);

create index if not exists habit_progress_assignment_date_idx
  on public.habit_progress (habit_assignment_id, date desc);

drop trigger if exists set_habits_updated_at on public.habits;
create trigger set_habits_updated_at
before update on public.habits
for each row
execute function public.set_updated_at();

drop trigger if exists set_habit_assignments_updated_at
  on public.habit_assignments;
create trigger set_habit_assignments_updated_at
before update on public.habit_assignments
for each row
execute function public.set_updated_at();

drop trigger if exists set_habit_progress_updated_at
  on public.habit_progress;
create trigger set_habit_progress_updated_at
before update on public.habit_progress
for each row
execute function public.set_updated_at();

alter table public.habits enable row level security;
alter table public.habit_assignments enable row level security;
alter table public.habit_progress enable row level security;

revoke all on public.habits from anon, authenticated;
revoke all on public.habit_assignments from anon, authenticated;
revoke all on public.habit_progress from anon, authenticated;

grant select, insert, update, delete on public.habits to authenticated;
grant select, insert, update, delete on public.habit_assignments to authenticated;
grant select, insert on public.habit_progress to authenticated;
grant update (completed, completed_at) on public.habit_progress to authenticated;

drop policy if exists habits_select_related_accounts on public.habits;
create policy habits_select_related_accounts
on public.habits
for select
to authenticated
using (
  created_by = (select auth.uid())
  or (select private.is_general_admin())
  or exists (
    select 1
    from public.habit_assignments ha
    where ha.habit_id = habits.id
      and (
        (
          ha.client_id = (select auth.uid())
          and private.client_has_service(
            ha.client_id,
            'nutrition'::public.service_area
          )
        )
        or private.is_client_assigned_to_current_professional(
          ha.client_id,
          'nutrition'::public.service_area
        )
      )
  )
);

drop policy if exists habits_insert_nutrition_managers on public.habits;
create policy habits_insert_nutrition_managers
on public.habits
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.has_specialty(
    'nutrition'::public.professional_specialty
  ))
);

drop policy if exists habits_update_nutrition_managers on public.habits;
create policy habits_update_nutrition_managers
on public.habits
for update
to authenticated
using (
  created_by = (select auth.uid())
  or (select private.is_general_admin())
)
with check (
  (
    created_by = (select auth.uid())
    and (select private.has_specialty(
      'nutrition'::public.professional_specialty
    ))
  )
  or (select private.is_general_admin())
);

drop policy if exists habits_delete_nutrition_managers on public.habits;
create policy habits_delete_nutrition_managers
on public.habits
for delete
to authenticated
using (
  created_by = (select auth.uid())
  or (select private.is_general_admin())
);

drop policy if exists habit_assignments_select_related_accounts
  on public.habit_assignments;
create policy habit_assignments_select_related_accounts
on public.habit_assignments
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(client_id, 'nutrition'::public.service_area)
  )
  or assigned_by = (select auth.uid())
  or private.is_client_assigned_to_current_professional(
    client_id,
    'nutrition'::public.service_area
  )
  or (select private.is_general_admin())
);

drop policy if exists habit_assignments_insert_nutrition_managers
  on public.habit_assignments;
create policy habit_assignments_insert_nutrition_managers
on public.habit_assignments
for insert
to authenticated
with check (
  (
    (select private.is_general_admin())
    or (
      assigned_by = (select auth.uid())
      and (select private.has_specialty(
        'nutrition'::public.professional_specialty
      ))
      and private.is_client_assigned_to_current_professional(
        client_id,
        'nutrition'::public.service_area
      )
    )
  )
  and exists (
    select 1
    from public.habits h
    where h.id = habit_assignments.habit_id
      and h.active = true
  )
);

drop policy if exists habit_assignments_update_nutrition_managers
  on public.habit_assignments;
create policy habit_assignments_update_nutrition_managers
on public.habit_assignments
for update
to authenticated
using (
  (select private.is_general_admin())
  or (
    assigned_by = (select auth.uid())
    and private.is_client_assigned_to_current_professional(
      client_id,
      'nutrition'::public.service_area
    )
  )
)
with check (
  (
    active = false
    or exists (
      select 1
      from public.habits h
      where h.id = habit_assignments.habit_id
        and h.active = true
    )
  )
  and (
    (select private.is_general_admin())
    or (
      assigned_by = (select auth.uid())
      and (select private.has_specialty(
        'nutrition'::public.professional_specialty
      ))
      and private.is_client_assigned_to_current_professional(
        client_id,
        'nutrition'::public.service_area
      )
    )
  )
);

drop policy if exists habit_assignments_delete_nutrition_managers
  on public.habit_assignments;
create policy habit_assignments_delete_nutrition_managers
on public.habit_assignments
for delete
to authenticated
using (
  (select private.is_general_admin())
  or (
    assigned_by = (select auth.uid())
    and private.is_client_assigned_to_current_professional(
      client_id,
      'nutrition'::public.service_area
    )
  )
);

drop policy if exists habit_progress_select_related_accounts
  on public.habit_progress;
create policy habit_progress_select_related_accounts
on public.habit_progress
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(client_id, 'nutrition'::public.service_area)
  )
  or private.is_client_assigned_to_current_professional(
    client_id,
    'nutrition'::public.service_area
  )
  or (select private.is_general_admin())
);

drop policy if exists habit_progress_insert_own_assignment
  on public.habit_progress;
create policy habit_progress_insert_own_assignment
on public.habit_progress
for insert
to authenticated
with check (
  client_id = (select auth.uid())
  and private.client_has_service(client_id, 'nutrition'::public.service_area)
  and exists (
    select 1
    from public.habit_assignments ha
    where ha.id = habit_progress.habit_assignment_id
      and ha.client_id = habit_progress.client_id
      and ha.active = true
      and habit_progress.date >= ha.start_date
      and (ha.end_date is null or habit_progress.date <= ha.end_date)
      and extract(isodow from habit_progress.date)::integer = any(ha.days_of_week)
  )
);

drop policy if exists habit_progress_update_own_assignment
  on public.habit_progress;
create policy habit_progress_update_own_assignment
on public.habit_progress
for update
to authenticated
using (
  client_id = (select auth.uid())
)
with check (
  client_id = (select auth.uid())
  and private.client_has_service(client_id, 'nutrition'::public.service_area)
  and exists (
    select 1
    from public.habit_assignments ha
    where ha.id = habit_progress.habit_assignment_id
      and ha.client_id = habit_progress.client_id
      and ha.active = true
      and habit_progress.date >= ha.start_date
      and (ha.end_date is null or habit_progress.date <= ha.end_date)
      and extract(isodow from habit_progress.date)::integer = any(ha.days_of_week)
  )
);

notify pgrst, 'reload schema';

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  difficulty text,
  muscle_group text not null default 'General',
  exercise_type text not null default 'General',
  multimedia_url text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercises_name_length_check check (char_length(name) between 2 and 140),
  constraint exercises_description_length_check check (
    description is null or char_length(description) <= 1200
  ),
  constraint exercises_category_length_check check (char_length(category) between 2 and 80),
  constraint exercises_difficulty_check check (
    difficulty is null or difficulty in ('beginner', 'intermediate', 'advanced')
  )
);

alter table public.exercises
  add column if not exists muscle_group text not null default 'General',
  add column if not exists exercise_type text not null default 'General',
  add column if not exists multimedia_url text,
  add column if not exists is_active boolean not null default true;

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  difficulty text not null,
  category text not null,
  target_audience text not null,
  is_active boolean not null default true,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routines_name_length_check check (char_length(name) between 2 and 160),
  constraint routines_description_length_check check (
    char_length(description) between 2 and 2000
  ),
  constraint routines_difficulty_check check (
    difficulty in ('beginner', 'intermediate', 'advanced')
  ),
  constraint routines_category_length_check check (
    char_length(category) between 2 and 80
  ),
  constraint routines_target_audience_length_check check (
    char_length(target_audience) between 2 and 160
  )
);

create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  series integer,
  repetitions text,
  rest_seconds integer,
  duration_minutes integer,
  notes text,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routine_exercises_series_check check (
    series is null or series between 1 and 100
  ),
  constraint routine_exercises_repetitions_length_check check (
    repetitions is null or char_length(repetitions) <= 80
  ),
  constraint routine_exercises_rest_seconds_check check (
    rest_seconds is null or rest_seconds between 0 and 86400
  ),
  constraint routine_exercises_duration_minutes_check check (
    duration_minutes is null or duration_minutes between 1 and 1440
  ),
  constraint routine_exercises_notes_length_check check (
    notes is null or char_length(notes) <= 1000
  ),
  constraint routine_exercises_position_check check (position >= 0),
  constraint routine_exercises_routine_exercise_key unique (
    routine_id,
    exercise_id
  ),
  constraint routine_exercises_routine_position_key unique (
    routine_id,
    position
  )
);

create index if not exists exercises_created_by_idx
  on public.exercises (created_by);
create index if not exists exercises_category_name_idx
  on public.exercises (category, name);
create index if not exists exercises_active_name_idx
  on public.exercises (is_active, name);
create index if not exists routines_creator_id_idx
  on public.routines (creator_id);
create index if not exists routines_active_updated_at_idx
  on public.routines (is_active, updated_at desc);
create index if not exists routine_exercises_exercise_id_idx
  on public.routine_exercises (exercise_id);

drop trigger if exists set_exercises_updated_at on public.exercises;
create trigger set_exercises_updated_at
before update on public.exercises
for each row execute function private.set_current_timestamp_updated_at();

drop trigger if exists set_routines_updated_at on public.routines;
create trigger set_routines_updated_at
before update on public.routines
for each row execute function private.set_current_timestamp_updated_at();

drop trigger if exists set_routine_exercises_updated_at
  on public.routine_exercises;
create trigger set_routine_exercises_updated_at
before update on public.routine_exercises
for each row execute function private.set_current_timestamp_updated_at();

alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;

revoke all on public.exercises from anon, authenticated;
revoke all on public.routines from anon, authenticated;
revoke all on public.routine_exercises from anon, authenticated;

grant select, insert, update, delete on public.exercises to authenticated;
grant select, insert, update, delete on public.routines to authenticated;
grant select, insert, update, delete on public.routine_exercises to authenticated;
grant usage on schema private to authenticated;
grant execute on function private.has_specialty(public.professional_specialty)
  to authenticated;

drop policy if exists "exercises_select_visible" on public.exercises;
drop policy if exists "exercises_select_training_managers" on public.exercises;
create policy "exercises_select_training_managers"
on public.exercises for select to authenticated
using (
  (select private.has_specialty('training'::public.professional_specialty))
);

drop policy if exists "exercises_insert_training_managers" on public.exercises;
create policy "exercises_insert_training_managers"
on public.exercises for insert to authenticated
with check (
  (select private.has_specialty('training'::public.professional_specialty))
  and created_by = (select auth.uid())
);

drop policy if exists "exercises_update_owner_or_general_admin"
  on public.exercises;
drop policy if exists "exercises_update_training_managers"
  on public.exercises;
create policy "exercises_update_training_managers"
on public.exercises for update to authenticated
using (
  (select private.has_specialty('training'::public.professional_specialty))
)
with check (
  (select private.has_specialty('training'::public.professional_specialty))
);

drop policy if exists "exercises_delete_training_managers"
  on public.exercises;
create policy "exercises_delete_training_managers"
on public.exercises for delete to authenticated
using (
  (select private.has_specialty('training'::public.professional_specialty))
);

drop policy if exists "routines_select_training_managers"
  on public.routines;
create policy "routines_select_training_managers"
on public.routines for select to authenticated
using (
  (select private.has_specialty('training'::public.professional_specialty))
);

drop policy if exists "routines_insert_training_managers"
  on public.routines;
create policy "routines_insert_training_managers"
on public.routines for insert to authenticated
with check (
  (select private.has_specialty('training'::public.professional_specialty))
  and creator_id = (select auth.uid())
);

drop policy if exists "routines_update_training_managers"
  on public.routines;
create policy "routines_update_training_managers"
on public.routines for update to authenticated
using (
  (select private.has_specialty('training'::public.professional_specialty))
)
with check (
  (select private.has_specialty('training'::public.professional_specialty))
);

drop policy if exists "routines_delete_training_managers"
  on public.routines;
create policy "routines_delete_training_managers"
on public.routines for delete to authenticated
using (
  (select private.has_specialty('training'::public.professional_specialty))
);

drop policy if exists "routine_exercises_select_training_managers"
  on public.routine_exercises;
create policy "routine_exercises_select_training_managers"
on public.routine_exercises for select to authenticated
using (
  (select private.has_specialty('training'::public.professional_specialty))
);

drop policy if exists "routine_exercises_insert_training_managers"
  on public.routine_exercises;
create policy "routine_exercises_insert_training_managers"
on public.routine_exercises for insert to authenticated
with check (
  (select private.has_specialty('training'::public.professional_specialty))
);

drop policy if exists "routine_exercises_update_training_managers"
  on public.routine_exercises;
create policy "routine_exercises_update_training_managers"
on public.routine_exercises for update to authenticated
using (
  (select private.has_specialty('training'::public.professional_specialty))
)
with check (
  (select private.has_specialty('training'::public.professional_specialty))
);

drop policy if exists "routine_exercises_delete_training_managers"
  on public.routine_exercises;
create policy "routine_exercises_delete_training_managers"
on public.routine_exercises for delete to authenticated
using (
  (select private.has_specialty('training'::public.professional_specialty))
);

create or replace function public.save_routine(
  p_routine_id uuid,
  p_name text,
  p_description text,
  p_difficulty text,
  p_category text,
  p_target_audience text,
  p_is_active boolean,
  p_exercises jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_routine_id uuid;
  v_item jsonb;
  v_exercise_id uuid;
  v_position integer := 0;
begin
  if not private.has_specialty(
    'training'::public.professional_specialty
  ) then
    raise exception 'No tienes permisos para gestionar rutinas.'
      using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_exercises, '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_exercises, '[]'::jsonb)) = 0 then
    raise exception 'La rutina debe incluir al menos un ejercicio.'
      using errcode = '22023';
  end if;

  if p_routine_id is null then
    insert into public.routines (
      name,
      description,
      difficulty,
      category,
      target_audience,
      is_active,
      creator_id
    ) values (
      btrim(p_name),
      btrim(p_description),
      p_difficulty,
      btrim(p_category),
      btrim(p_target_audience),
      coalesce(p_is_active, true),
      auth.uid()
    )
    returning id into v_routine_id;
  else
    update public.routines
    set
      name = btrim(p_name),
      description = btrim(p_description),
      difficulty = p_difficulty,
      category = btrim(p_category),
      target_audience = btrim(p_target_audience),
      is_active = coalesce(p_is_active, true)
    where id = p_routine_id
    returning id into v_routine_id;

    if v_routine_id is null then
      raise exception 'La rutina no existe o no esta disponible.'
        using errcode = 'P0002';
    end if;

    delete from public.routine_exercises
    where routine_id = v_routine_id;
  end if;

  for v_item in select value from jsonb_array_elements(p_exercises)
  loop
    v_exercise_id := nullif(v_item ->> 'exerciseId', '')::uuid;

    if v_exercise_id is null then
      raise exception
        'Todas las rutinas deben usar ejercicios existentes.'
        using errcode = '22023';
    end if;

    if not exists (
      select 1
      from public.exercises
      where id = v_exercise_id
        and is_active
    ) then
      raise exception
        'Uno de los ejercicios seleccionados no existe o esta inactivo.'
        using errcode = '23503';
    end if;

    insert into public.routine_exercises (
      routine_id,
      exercise_id,
      series,
      repetitions,
      rest_seconds,
      duration_minutes,
      notes,
      position
    ) values (
      v_routine_id,
      v_exercise_id,
      nullif(v_item ->> 'series', '')::integer,
      nullif(btrim(coalesce(v_item ->> 'repetitions', '')), ''),
      nullif(v_item ->> 'restSeconds', '')::integer,
      nullif(v_item ->> 'durationMinutes', '')::integer,
      nullif(btrim(coalesce(v_item ->> 'notes', '')), ''),
      v_position
    );

    v_position := v_position + 1;
  end loop;

  return v_routine_id;
end;
$$;

revoke all on function public.save_routine(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean,
  jsonb
) from public, anon;

grant execute on function public.save_routine(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean,
  jsonb
) to authenticated;

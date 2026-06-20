set lock_timeout = '5s';
set statement_timeout = '30s';

alter table public.workout_templates
  add column if not exists identifier text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_templates_identifier_length_check'
      and conrelid = 'public.workout_templates'::regclass
  ) then
    alter table public.workout_templates
      add constraint workout_templates_identifier_length_check
      check (
        identifier is null
        or (
          identifier = btrim(identifier)
          and char_length(identifier) between 1 and 160
        )
      );
  end if;
end
$$;

create unique index if not exists workout_templates_identifier_unique_idx
  on public.workout_templates (lower(identifier))
  where identifier is not null;

comment on column public.workout_templates.identifier is
  'Optional internal identifier visible only to authorized training managers.';

revoke select on table public.workout_templates from authenticated;
grant select (
  id,
  name,
  description,
  cycle_days,
  is_active,
  creator_id,
  created_at,
  updated_at
) on table public.workout_templates to authenticated;

create or replace function private.list_manageable_workout_template_identifiers()
returns table (
  id uuid,
  identifier text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    template.id,
    template.identifier
  from public.workout_templates template
  where private.has_specialty(
    'training'::public.professional_specialty
  )
$$;

revoke all on function private.list_manageable_workout_template_identifiers()
  from public, anon, authenticated;
grant execute on function private.list_manageable_workout_template_identifiers()
  to authenticated;

create or replace function public.list_manageable_workout_template_identifiers()
returns table (
  id uuid,
  identifier text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from private.list_manageable_workout_template_identifiers()
$$;

revoke all on function public.list_manageable_workout_template_identifiers()
  from public, anon;
grant execute on function public.list_manageable_workout_template_identifiers()
  to authenticated;

drop function if exists public.save_workout_template(
  uuid,
  text,
  text,
  integer,
  boolean,
  jsonb
);

create function public.save_workout_template(
  p_template_id uuid,
  p_name text,
  p_identifier text,
  p_description text,
  p_cycle_days integer,
  p_is_active boolean,
  p_days jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_template_id uuid;
begin
  if not private.has_specialty(
    'training'::public.professional_specialty
  ) then
    raise exception
      'No tienes permisos para gestionar plantillas.'
      using errcode = '42501';
  end if;

  if p_cycle_days is null or p_cycle_days not between 1 and 31 then
    raise exception
      'La cantidad de dias debe estar entre 1 y 31.'
      using errcode = '22023';
  end if;

  if p_days is null
    or jsonb_typeof(p_days) <> 'array'
    or jsonb_array_length(p_days) <> p_cycle_days then
    raise exception
      'Cada dia del ciclo debe tener un entrenamiento.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_days) as day
    where not (day ? 'dayNumber')
      or not (day ? 'routineId')
      or (day->>'dayNumber') !~ '^[0-9]+$'
      or (day->>'routineId') !~* '^[0-9a-f-]{36}$'
      or (day->>'dayNumber')::integer not between 1 and p_cycle_days
      or (
        nullif(day->>'weekday', '') is not null
        and day->>'weekday' not in (
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        )
      )
  ) then
    raise exception
      'La configuracion de dias no es valida.'
      using errcode = '22023';
  end if;

  if (
    select count(distinct (day->>'dayNumber')::integer)
    from jsonb_array_elements(p_days) as day
  ) <> p_cycle_days then
    raise exception
      'Los dias del ciclo deben ser unicos y consecutivos.'
      using errcode = '23505';
  end if;

  if (
    select count(*)
    from jsonb_array_elements(p_days) as day
    where nullif(day->>'weekday', '') is not null
  ) <> (
    select count(distinct day->>'weekday')
    from jsonb_array_elements(p_days) as day
    where nullif(day->>'weekday', '') is not null
  ) then
    raise exception
      'No puedes repetir un dia especifico en la misma plantilla.'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_days) as day
    left join public.routines routine
      on routine.id = (day->>'routineId')::uuid
     and routine.is_active
    where routine.id is null
  ) then
    raise exception
      'Uno de los entrenamientos no existe o esta inactivo.'
      using errcode = '23503';
  end if;

  if p_template_id is null then
    insert into public.workout_templates (
      name,
      identifier,
      description,
      cycle_days,
      is_active,
      creator_id
    ) values (
      btrim(p_name),
      nullif(btrim(coalesce(p_identifier, '')), ''),
      nullif(btrim(coalesce(p_description, '')), ''),
      p_cycle_days,
      coalesce(p_is_active, true),
      (select auth.uid())
    )
    returning id into v_template_id;
  else
    update public.workout_templates
    set name = btrim(p_name),
        identifier = nullif(btrim(coalesce(p_identifier, '')), ''),
        description = nullif(btrim(coalesce(p_description, '')), ''),
        cycle_days = p_cycle_days,
        is_active = coalesce(p_is_active, true)
    where id = p_template_id
    returning id into v_template_id;

    if v_template_id is null then
      raise exception
        'La plantilla no existe o no esta disponible.'
        using errcode = 'P0002';
    end if;

    delete from public.workout_template_days
    where template_id = v_template_id;
  end if;

  insert into public.workout_template_days (
    template_id,
    day_number,
    routine_id,
    weekday
  )
  select
    v_template_id,
    (day->>'dayNumber')::integer,
    (day->>'routineId')::uuid,
    nullif(day->>'weekday', '')
  from jsonb_array_elements(p_days) as day
  order by (day->>'dayNumber')::integer;

  return v_template_id;
end;
$$;

revoke all on function public.save_workout_template(
  uuid,
  text,
  text,
  text,
  integer,
  boolean,
  jsonb
) from public, anon;
grant execute on function public.save_workout_template(
  uuid,
  text,
  text,
  text,
  integer,
  boolean,
  jsonb
) to authenticated;

drop function if exists public.list_manageable_routine_identifiers();
drop function if exists private.list_manageable_routine_identifiers();

drop index if exists public.routines_identifier_unique_idx;
alter table public.routines
  drop constraint if exists routines_identifier_length_check;

comment on column public.routines.identifier is
  'Deprecated legacy value retained for data preservation. New writes are blocked.';

revoke insert, update on table public.routines from authenticated;
grant insert (
  name,
  description,
  difficulty,
  category,
  target_audience,
  is_active,
  creator_id
) on table public.routines to authenticated;
grant update (
  name,
  description,
  difficulty,
  category,
  target_audience,
  is_active,
  updated_at
) on table public.routines to authenticated;

drop function if exists public.save_routine(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  jsonb
);

create function public.save_routine(
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
  v_exercise_is_active boolean;
  v_existing_exercise_ids uuid[] := '{}'::uuid[];
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
    select coalesce(
      array_agg(relation.exercise_id),
      '{}'::uuid[]
    )
    into v_existing_exercise_ids
    from public.routine_exercises relation
    where relation.routine_id = p_routine_id;

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
  end if;

  for v_item in select value from jsonb_array_elements(p_exercises)
  loop
    v_exercise_id := nullif(v_item ->> 'exerciseId', '')::uuid;

    if v_exercise_id is null then
      raise exception
        'Todas las rutinas deben usar ejercicios existentes.'
        using errcode = '22023';
    end if;

    select exercise.is_active
    into v_exercise_is_active
    from public.exercises exercise
    where exercise.id = v_exercise_id;

    if not found then
      raise exception
        'Uno de los ejercicios seleccionados ya no existe.'
        using errcode = 'P0002';
    end if;

    if not v_exercise_is_active
      and not (
        p_routine_id is not null
        and v_exercise_id = any(v_existing_exercise_ids)
      ) then
      raise exception
        'No puedes agregar un ejercicio desactivado a una rutina.'
        using errcode = '55000';
    end if;
  end loop;

  if p_routine_id is not null then
    delete from public.routine_exercises
    where routine_id = v_routine_id;
  end if;

  for v_item in select value from jsonb_array_elements(p_exercises)
  loop
    v_exercise_id := nullif(v_item ->> 'exerciseId', '')::uuid;

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

create or replace function private.build_routine_snapshot(
  target_routine_id uuid,
  captured_at timestamp with time zone,
  snapshot_source text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'version', 1,
    'capturedAt', coalesce(captured_at, pg_catalog.now()),
    'source', case
      when snapshot_source = 'backfill' then 'backfill'
      else 'assignment'
    end,
    'routine', jsonb_build_object(
      'id', routine.id,
      'name', routine.name,
      'description', routine.description,
      'difficulty', routine.difficulty,
      'category', routine.category,
      'targetAudience', routine.target_audience,
      'isActive', routine.is_active,
      'createdAt', routine.created_at,
      'updatedAt', routine.updated_at,
      'creator', jsonb_build_object(
        'id', routine.creator_id,
        'name', coalesce(creator.full_name, 'Profesional')
      )
    ),
    'exercises', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', relation.id,
          'position', relation.position,
          'series', relation.series,
          'repetitions', relation.repetitions,
          'restSeconds', relation.rest_seconds,
          'durationMinutes', relation.duration_minutes,
          'notes', relation.notes,
          'exercise', jsonb_build_object(
            'id', exercise.id,
            'name', exercise.name,
            'description', exercise.description,
            'difficulty', exercise.difficulty,
            'muscleGroup', exercise.muscle_group,
            'category', exercise.category,
            'exerciseType', exercise.exercise_type,
            'multimediaUrl', exercise.multimedia_url,
            'isActive', exercise.is_active
          )
        )
        order by relation.position
      )
      from public.routine_exercises relation
      join public.exercises exercise
        on exercise.id = relation.exercise_id
      where relation.routine_id = routine.id
    ), '[]'::jsonb)
  )
  from public.routines routine
  left join public.profiles creator
    on creator.id = routine.creator_id
  where routine.id = target_routine_id
$$;

revoke all on function private.build_routine_snapshot(
  uuid,
  timestamp with time zone,
  text
) from public, anon, authenticated;

notify pgrst, 'reload schema';

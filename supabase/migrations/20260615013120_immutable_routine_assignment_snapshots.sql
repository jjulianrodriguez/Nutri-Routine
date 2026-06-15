set lock_timeout = '5s';
set statement_timeout = '30s';

alter table public.workout_plans
  add column if not exists routine_snapshot jsonb;

comment on column public.workout_plans.routine_snapshot is
  'Immutable copy of the assigned routine and its exercises used by training history.';

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
      'identifier', routine.identifier,
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

update public.workout_plans workout_plan
set routine_snapshot = private.build_routine_snapshot(
  workout_plan.routine_id,
  workout_plan.created_at,
  'backfill'
)
where workout_plan.routine_id is not null
  and workout_plan.routine_snapshot is null;

create or replace function private.capture_workout_plan_routine_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.routine_snapshot := private.build_routine_snapshot(
    new.routine_id,
    coalesce(new.created_at, pg_catalog.now()),
    'assignment'
  );

  if new.routine_snapshot is null then
    raise exception
      'No se pudo crear la copia historica de la rutina.'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

revoke all on function private.capture_workout_plan_routine_snapshot()
  from public, anon, authenticated;

drop trigger if exists capture_workout_plan_routine_snapshot
  on public.workout_plans;
create trigger capture_workout_plan_routine_snapshot
before insert on public.workout_plans
for each row
when (new.routine_id is not null)
execute function private.capture_workout_plan_routine_snapshot();

create or replace function private.prevent_routine_snapshot_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.routine_snapshot is distinct from old.routine_snapshot then
    raise exception
      'La copia historica de la rutina no se puede modificar.'
      using errcode = '22000';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_routine_snapshot_changes()
  from public, anon, authenticated;

drop trigger if exists prevent_routine_snapshot_changes
  on public.workout_plans;
create trigger prevent_routine_snapshot_changes
before update of routine_snapshot on public.workout_plans
for each row
execute function private.prevent_routine_snapshot_changes();

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'workout_plans_routine_snapshot_shape_check'
      and conrelid = 'public.workout_plans'::regclass
  ) then
    alter table public.workout_plans
      add constraint workout_plans_routine_snapshot_shape_check
      check (
        routine_snapshot is null
        or (
          pg_catalog.jsonb_typeof(routine_snapshot) = 'object'
          and routine_snapshot ->> 'version' = '1'
          and pg_catalog.jsonb_typeof(routine_snapshot -> 'routine') = 'object'
          and pg_catalog.jsonb_typeof(routine_snapshot -> 'exercises') = 'array'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'workout_plans_routine_snapshot_presence_check'
      and conrelid = 'public.workout_plans'::regclass
  ) then
    alter table public.workout_plans
      add constraint workout_plans_routine_snapshot_presence_check
      check (routine_id is null or routine_snapshot is not null);
  end if;
end
$$;

notify pgrst, 'reload schema';

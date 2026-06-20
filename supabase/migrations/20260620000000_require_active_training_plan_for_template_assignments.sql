set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function public.assign_workout_template_to_client(
  p_template_id uuid,
  p_client_id uuid,
  p_duration_weeks integer,
  p_start_date date default current_date
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_assignment_id uuid;
  v_end_date date;
  v_is_general_admin boolean;
  v_snapshot jsonb;
  v_template_cycle_days integer;
  v_template_description text;
  v_template_id uuid;
  v_template_name text;
  v_trainer_id uuid;
begin
  v_is_general_admin := private.is_general_admin();

  if not private.has_specialty(
    'training'::public.professional_specialty
  ) then
    raise exception
      'No tienes permisos para asignar plantillas.'
      using errcode = '42501';
  end if;

  if p_duration_weeks is null
    or p_duration_weeks not between 1 and 104 then
    raise exception
      'La duracion debe estar entre 1 y 104 semanas.'
      using errcode = '22023';
  end if;

  select
    template.id,
    template.name,
    template.description,
    template.cycle_days
  into
    v_template_id,
    v_template_name,
    v_template_description,
    v_template_cycle_days
  from public.workout_templates template
  where template.id = p_template_id
    and template.is_active;

  if v_template_id is null then
    raise exception
      'La plantilla no existe o esta inactiva.'
      using errcode = 'P0002';
  end if;

  if (
    select count(*)
    from public.workout_template_days template_day
    join public.routines routine
      on routine.id = template_day.routine_id
     and routine.is_active
    where template_day.template_id = v_template_id
  ) <> v_template_cycle_days then
    raise exception
      'La plantilla tiene dias incompletos o entrenamientos inactivos.'
      using errcode = '23503';
  end if;

  if not exists (
    select 1
    from public.profiles client_profile
    where client_profile.id = p_client_id
      and client_profile.role = 'client'::public.profile_role
  ) then
    raise exception
      'La cuenta seleccionada no es un cliente valido.'
      using errcode = '23503';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_client_id::text, 0)
  );

  select client_profile.assigned_trainer_id
  into v_trainer_id
  from public.client_profiles client_profile
  where client_profile.profile_id = p_client_id;

  if v_trainer_id is null then
    raise exception
      'El cliente seleccionado no tiene un plan de entrenamiento activo.'
      using errcode = '23503';
  end if;

  if not v_is_general_admin
    and v_trainer_id <> (select auth.uid()) then
    raise exception
      'Solo puedes asignar plantillas a tus clientes.'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'version', 1,
    'template', jsonb_build_object(
      'id', v_template_id,
      'name', v_template_name,
      'description', v_template_description,
      'cycleDays', v_template_cycle_days
    ),
    'days', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'dayNumber', template_day.day_number,
          'routine', jsonb_build_object(
            'id', routine.id,
            'name', routine.name,
            'description', routine.description,
            'difficulty', routine.difficulty,
            'category', routine.category,
            'targetAudience', routine.target_audience,
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
        )
        order by template_day.day_number
      )
      from public.workout_template_days template_day
      join public.routines routine
        on routine.id = template_day.routine_id
      where template_day.template_id = v_template_id
    ), '[]'::jsonb)
  ) into v_snapshot;

  update public.workout_plans
  set status = 'archived'::public.plan_status
  where client_id = p_client_id
    and status = 'active'::public.plan_status
    and (
      v_is_general_admin
      or trainer_id = (select auth.uid())
    );

  v_end_date :=
    coalesce(p_start_date, current_date)
    + (p_duration_weeks * 7 - 1);

  insert into public.workout_plans (
    client_id,
    trainer_id,
    routine_id,
    template_id,
    template_snapshot,
    title,
    description,
    status,
    start_date,
    end_date,
    duration_weeks
  ) values (
    p_client_id,
    v_trainer_id,
    null,
    v_template_id,
    v_snapshot,
    v_template_name,
    v_template_description,
    'active'::public.plan_status,
    coalesce(p_start_date, current_date),
    v_end_date,
    p_duration_weeks
  )
  returning id into v_assignment_id;

  return v_assignment_id;
end;
$$;

revoke all on function public.assign_workout_template_to_client(
  uuid,
  uuid,
  integer,
  date
) from public, anon;
grant execute on function public.assign_workout_template_to_client(
  uuid,
  uuid,
  integer,
  date
) to authenticated;

notify pgrst, 'reload schema';

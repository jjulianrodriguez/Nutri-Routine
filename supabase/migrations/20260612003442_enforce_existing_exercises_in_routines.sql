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

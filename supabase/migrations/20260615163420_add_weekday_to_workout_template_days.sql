set lock_timeout = '5s';
set statement_timeout = '30s';

alter table public.workout_template_days
  add column if not exists weekday text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_template_days_weekday_check'
      and conrelid = 'public.workout_template_days'::regclass
  ) then
    alter table public.workout_template_days
      add constraint workout_template_days_weekday_check
      check (
        weekday is null
        or weekday in (
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        )
      );
  end if;
end
$$;

create unique index if not exists
  workout_template_days_template_weekday_key
  on public.workout_template_days (template_id, weekday)
  where weekday is not null;

comment on column public.workout_template_days.weekday is
  'Optional weekday label for this position in a workout template cycle.';

create or replace function public.save_workout_template(
  p_template_id uuid,
  p_name text,
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
      description,
      cycle_days,
      is_active,
      creator_id
    ) values (
      btrim(p_name),
      nullif(btrim(coalesce(p_description, '')), ''),
      p_cycle_days,
      coalesce(p_is_active, true),
      (select auth.uid())
    )
    returning id into v_template_id;
  else
    update public.workout_templates
    set name = btrim(p_name),
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
  integer,
  boolean,
  jsonb
) from public, anon;
grant execute on function public.save_workout_template(
  uuid,
  text,
  text,
  integer,
  boolean,
  jsonb
) to authenticated;

create or replace function private.enrich_template_snapshot_weekdays(
  snapshot jsonb,
  source_template_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when snapshot is null
      or jsonb_typeof(snapshot->'days') <> 'array' then snapshot
    else jsonb_set(
      snapshot,
      '{days}',
      coalesce((
        select jsonb_agg(
          case
            when snapshot_day.value ? 'weekday' then snapshot_day.value
            else jsonb_set(
              snapshot_day.value,
              '{weekday}',
              coalesce(to_jsonb(template_day.weekday), 'null'::jsonb),
              true
            )
          end
          order by snapshot_day.ordinality
        )
        from jsonb_array_elements(
          snapshot->'days'
        ) with ordinality as snapshot_day(value, ordinality)
        left join public.workout_template_days template_day
          on template_day.template_id = source_template_id
         and template_day.day_number =
           (snapshot_day.value->>'dayNumber')::integer
      ), '[]'::jsonb),
      true
    )
  end
$$;

revoke all on function private.enrich_template_snapshot_weekdays(jsonb, uuid)
  from public, anon, authenticated;

create or replace function private.include_workout_plan_template_weekdays()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.template_snapshot :=
    private.enrich_template_snapshot_weekdays(
      new.template_snapshot,
      new.template_id
    );

  return new;
end;
$$;

revoke all on function private.include_workout_plan_template_weekdays()
  from public, anon, authenticated;

drop trigger if exists include_workout_plan_template_weekdays
  on public.workout_plans;
create trigger include_workout_plan_template_weekdays
before insert on public.workout_plans
for each row
execute function private.include_workout_plan_template_weekdays();

update public.workout_plans
set template_snapshot =
  private.enrich_template_snapshot_weekdays(
    template_snapshot,
    template_id
  )
where template_snapshot is not null;

notify pgrst, 'reload schema';

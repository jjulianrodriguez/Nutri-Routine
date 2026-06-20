set lock_timeout = '5s';
set statement_timeout = '30s';

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null
    constraint workout_templates_name_length_check
    check (char_length(btrim(name)) between 2 and 160),
  description text
    constraint workout_templates_description_length_check
    check (
      description is null
      or char_length(btrim(description)) <= 2000
    ),
  cycle_days integer not null
    constraint workout_templates_cycle_days_check
    check (cycle_days between 1 and 31),
  is_active boolean not null default true,
  creator_id uuid not null
    references public.profiles(id) on delete restrict,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.workout_template_days (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null
    references public.workout_templates(id) on delete cascade,
  day_number integer not null
    constraint workout_template_days_day_number_check
    check (day_number between 1 and 31),
  routine_id uuid not null
    references public.routines(id) on delete restrict,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint workout_template_days_template_day_key
    unique (template_id, day_number)
);

alter table public.workout_plans
  add column if not exists template_id uuid
    references public.workout_templates(id) on delete set null,
  add column if not exists template_snapshot jsonb;

comment on table public.workout_templates is
  'Reusable weekly or cyclical training templates.';
comment on table public.workout_template_days is
  'Ordered training assigned to each day of a workout template cycle.';
comment on column public.workout_plans.template_snapshot is
  'Immutable template, day, training, and exercise copy used by assignment history.';

create index if not exists workout_templates_creator_id_idx
  on public.workout_templates (creator_id);
create index if not exists workout_templates_active_updated_at_idx
  on public.workout_templates (is_active, updated_at desc);
create index if not exists workout_template_days_template_id_idx
  on public.workout_template_days (template_id, day_number);
create index if not exists workout_template_days_routine_id_idx
  on public.workout_template_days (routine_id);
create index if not exists workout_plans_template_id_idx
  on public.workout_plans (template_id);

drop trigger if exists set_workout_templates_updated_at
  on public.workout_templates;
create trigger set_workout_templates_updated_at
before update on public.workout_templates
for each row
execute function private.set_current_timestamp_updated_at();

drop trigger if exists set_workout_template_days_updated_at
  on public.workout_template_days;
create trigger set_workout_template_days_updated_at
before update on public.workout_template_days
for each row
execute function private.set_current_timestamp_updated_at();

create or replace function private.can_view_assigned_template(
  target_template_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.client_has_service(
    (select auth.uid()),
    'training'::public.service_area
  )
  and exists (
    select 1
    from public.workout_plans assignment
    where assignment.client_id = (select auth.uid())
      and assignment.template_id = target_template_id
  )
$$;

create or replace function private.can_view_assigned_routine(
  target_routine_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.client_has_service(
    (select auth.uid()),
    'training'::public.service_area
  )
  and (
    exists (
      select 1
      from public.workout_plans assignment
      where assignment.client_id = (select auth.uid())
        and assignment.routine_id = target_routine_id
    )
    or exists (
      select 1
      from public.workout_plans assignment
      join public.workout_template_days template_day
        on template_day.template_id = assignment.template_id
      where assignment.client_id = (select auth.uid())
        and template_day.routine_id = target_routine_id
    )
  )
$$;

create or replace function private.can_view_assigned_exercise(
  target_exercise_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.client_has_service(
    (select auth.uid()),
    'training'::public.service_area
  )
  and exists (
    select 1
    from public.routine_exercises relation
    where relation.exercise_id = target_exercise_id
      and private.can_view_assigned_routine(relation.routine_id)
  )
$$;

revoke all on function private.can_view_assigned_template(uuid)
  from public, anon;
revoke all on function private.can_view_assigned_routine(uuid)
  from public, anon;
revoke all on function private.can_view_assigned_exercise(uuid)
  from public, anon;
grant execute on function private.can_view_assigned_template(uuid)
  to authenticated;
grant execute on function private.can_view_assigned_routine(uuid)
  to authenticated;
grant execute on function private.can_view_assigned_exercise(uuid)
  to authenticated;

alter table public.workout_templates enable row level security;
alter table public.workout_template_days enable row level security;

grant select, insert, update, delete
  on public.workout_templates to authenticated;
grant select, insert, update, delete
  on public.workout_template_days to authenticated;

drop policy if exists "workout_templates_select_authorized_accounts"
  on public.workout_templates;
create policy "workout_templates_select_authorized_accounts"
on public.workout_templates for select to authenticated
using (
  (select private.has_specialty(
    'training'::public.professional_specialty
  ))
  or (select private.can_view_assigned_template(id))
);

drop policy if exists "workout_templates_insert_training_managers"
  on public.workout_templates;
create policy "workout_templates_insert_training_managers"
on public.workout_templates for insert to authenticated
with check (
  (select private.has_specialty(
    'training'::public.professional_specialty
  ))
  and creator_id = (select auth.uid())
);

drop policy if exists "workout_templates_update_training_managers"
  on public.workout_templates;
create policy "workout_templates_update_training_managers"
on public.workout_templates for update to authenticated
using ((select private.has_specialty(
  'training'::public.professional_specialty
)))
with check ((select private.has_specialty(
  'training'::public.professional_specialty
)));

drop policy if exists "workout_templates_delete_training_managers"
  on public.workout_templates;
create policy "workout_templates_delete_training_managers"
on public.workout_templates for delete to authenticated
using ((select private.has_specialty(
  'training'::public.professional_specialty
)));

drop policy if exists "workout_template_days_select_authorized_accounts"
  on public.workout_template_days;
create policy "workout_template_days_select_authorized_accounts"
on public.workout_template_days for select to authenticated
using (
  (select private.has_specialty(
    'training'::public.professional_specialty
  ))
  or (select private.can_view_assigned_template(template_id))
);

drop policy if exists "workout_template_days_insert_training_managers"
  on public.workout_template_days;
create policy "workout_template_days_insert_training_managers"
on public.workout_template_days for insert to authenticated
with check ((select private.has_specialty(
  'training'::public.professional_specialty
)));

drop policy if exists "workout_template_days_update_training_managers"
  on public.workout_template_days;
create policy "workout_template_days_update_training_managers"
on public.workout_template_days for update to authenticated
using ((select private.has_specialty(
  'training'::public.professional_specialty
)))
with check ((select private.has_specialty(
  'training'::public.professional_specialty
)));

drop policy if exists "workout_template_days_delete_training_managers"
  on public.workout_template_days;
create policy "workout_template_days_delete_training_managers"
on public.workout_template_days for delete to authenticated
using ((select private.has_specialty(
  'training'::public.professional_specialty
)));

create or replace function private.archive_template_assignments_on_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.workout_plans
  set status = 'archived'::public.plan_status
  where template_id = old.id
    and status <> 'archived'::public.plan_status;

  return old;
end;
$$;

revoke all on function private.archive_template_assignments_on_delete()
  from public, anon, authenticated;

drop trigger if exists archive_template_assignments_before_delete
  on public.workout_templates;
create trigger archive_template_assignments_before_delete
before delete on public.workout_templates
for each row
execute function private.archive_template_assignments_on_delete();

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
    routine_id
  )
  select
    v_template_id,
    (day->>'dayNumber')::integer,
    (day->>'routineId')::uuid
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
  v_template public.workout_templates%rowtype;
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

  select *
  into v_template
  from public.workout_templates
  where id = p_template_id
    and is_active;

  if v_template.id is null then
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
    where template_day.template_id = v_template.id
  ) <> v_template.cycle_days then
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
    if v_is_general_admin then
      v_trainer_id := (select auth.uid());
    else
      raise exception
        'El cliente no tiene un entrenador asignado.'
        using errcode = '23503';
    end if;
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
      'id', v_template.id,
      'name', v_template.name,
      'description', v_template.description,
      'cycleDays', v_template.cycle_days
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
      where template_day.template_id = v_template.id
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
    v_template.id,
    v_snapshot,
    v_template.name,
    v_template.description,
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

drop policy if exists "workout_plans_insert_training_managers"
  on public.workout_plans;
create policy "workout_plans_insert_training_managers"
on public.workout_plans for insert to authenticated
with check (
  (
    (select private.is_general_admin())
    or (
      (select private.has_specialty(
        'training'::public.professional_specialty
      ))
      and workout_plans.trainer_id = (select auth.uid())
      and exists (
        select 1
        from public.client_profiles client_profile
        where client_profile.profile_id = workout_plans.client_id
          and client_profile.assigned_trainer_id = (select auth.uid())
      )
    )
  )
  and workout_plans.duration_weeks between 1 and 104
  and workout_plans.status = 'active'::public.plan_status
  and workout_plans.start_date is not null
  and workout_plans.end_date =
    workout_plans.start_date + (workout_plans.duration_weeks * 7 - 1)
  and (
    (
      workout_plans.routine_id is not null
      and workout_plans.template_id is null
      and exists (
        select 1
        from public.routines routine
        where routine.id = workout_plans.routine_id
          and routine.is_active
      )
    )
    or (
      workout_plans.template_id is not null
      and workout_plans.routine_id is null
      and workout_plans.template_snapshot is not null
      and exists (
        select 1
        from public.workout_templates template
        where template.id = workout_plans.template_id
          and template.is_active
      )
    )
  )
);

drop policy if exists "workout_plans_update_training_managers"
  on public.workout_plans;
create policy "workout_plans_update_training_managers"
on public.workout_plans for update to authenticated
using (
  (select private.is_general_admin())
  or (
    (select private.has_specialty(
      'training'::public.professional_specialty
    ))
    and workout_plans.trainer_id = (select auth.uid())
    and exists (
      select 1
      from public.client_profiles client_profile
      where client_profile.profile_id = workout_plans.client_id
        and client_profile.assigned_trainer_id = (select auth.uid())
    )
  )
)
with check (
  (
    (select private.is_general_admin())
    or (
      (select private.has_specialty(
        'training'::public.professional_specialty
      ))
      and workout_plans.trainer_id = (select auth.uid())
      and exists (
        select 1
        from public.client_profiles client_profile
        where client_profile.profile_id = workout_plans.client_id
          and client_profile.assigned_trainer_id = (select auth.uid())
      )
    )
  )
  and (
    workout_plans.status = 'archived'::public.plan_status
    or (
      workout_plans.status = 'active'::public.plan_status
      and workout_plans.duration_weeks between 1 and 104
      and workout_plans.start_date is not null
      and workout_plans.end_date =
        workout_plans.start_date
        + (workout_plans.duration_weeks * 7 - 1)
      and (
        (
          workout_plans.routine_id is not null
          and workout_plans.template_id is null
          and exists (
            select 1
            from public.routines routine
            where routine.id = workout_plans.routine_id
              and routine.is_active
          )
        )
        or (
          workout_plans.template_id is not null
          and workout_plans.routine_id is null
          and workout_plans.template_snapshot is not null
          and exists (
            select 1
            from public.workout_templates template
            where template.id = workout_plans.template_id
              and template.is_active
          )
        )
      )
    )
  )
);

notify pgrst, 'reload schema';

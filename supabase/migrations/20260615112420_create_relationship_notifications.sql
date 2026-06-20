create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null
    references public.profiles(id) on delete cascade,
  actor_id uuid
    references public.profiles(id) on delete set null,
  event_type text not null,
  message text not null,
  destination_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_event_type_check
    check (
      event_type = btrim(event_type)
      and char_length(event_type) between 1 and 80
      and event_type ~ '^[a-z0-9_]+$'
    ),
  constraint notifications_message_check
    check (
      message = btrim(message)
      and char_length(message) between 1 and 500
    ),
  constraint notifications_destination_path_check
    check (
      destination_path ~ '^/app(/|$)'
      and char_length(destination_path) <= 500
    ),
  constraint notifications_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

comment on table public.notifications is
  'In-app relationship events visible only to their recipient.';
comment on column public.notifications.destination_path is
  'Validated internal application path opened when the notification is selected.';

create index notifications_recipient_created_at_idx
  on public.notifications (recipient_id, created_at desc);
create index notifications_recipient_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;
create index notifications_actor_id_idx
  on public.notifications (actor_id)
  where actor_id is not null;

alter table public.notifications enable row level security;

revoke all on public.notifications from public, anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (
  (select auth.uid()) is not null
  and recipient_id = (select auth.uid())
);

create policy "notifications_mark_own_read"
on public.notifications
for update
to authenticated
using (
  (select auth.uid()) is not null
  and recipient_id = (select auth.uid())
)
with check (
  recipient_id = (select auth.uid())
  and read_at is not null
);

create or replace function private.create_notification(
  p_recipient_id uuid,
  p_event_type text,
  p_message text,
  p_destination_path text,
  p_metadata jsonb default '{}'::jsonb,
  p_actor_id uuid default auth.uid()
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_notification_id uuid;
begin
  if p_recipient_id is null
    or p_recipient_id = p_actor_id
    or not exists (
      select 1
      from public.profiles profile
      where profile.id = p_recipient_id
    ) then
    return null;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    event_type,
    message,
    destination_path,
    metadata
  ) values (
    p_recipient_id,
    p_actor_id,
    btrim(p_event_type),
    btrim(p_message),
    p_destination_path,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_notification_id;

  return v_notification_id;
end;
$$;

revoke all on function private.create_notification(
  uuid,
  text,
  text,
  text,
  jsonb,
  uuid
) from public, anon, authenticated;

create or replace function public.mark_notification_read(
  p_notification_id uuid
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_destination_path text;
begin
  update public.notifications notification
  set read_at = coalesce(notification.read_at, now())
  where notification.id = p_notification_id
    and notification.recipient_id = (select auth.uid())
  returning notification.destination_path into v_destination_path;

  return v_destination_path;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated_count bigint;
begin
  update public.notifications notification
  set read_at = now()
  where notification.recipient_id = (select auth.uid())
    and notification.read_at is null;

  get diagnostics v_updated_count = row_count;
  return v_updated_count;
end;
$$;

revoke all on function public.mark_notification_read(uuid)
  from public, anon, authenticated;
revoke all on function public.mark_all_notifications_read()
  from public, anon, authenticated;
grant execute on function public.mark_notification_read(uuid)
  to authenticated;
grant execute on function public.mark_all_notifications_read()
  to authenticated;

create or replace function private.notify_client_relationship_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_client_id uuid;
  v_client_name text;
  v_new_nutritionist_id uuid;
  v_new_nutritionist_name text;
  v_new_trainer_id uuid;
  v_new_trainer_name text;
  v_old_nutritionist_id uuid;
  v_old_trainer_id uuid;
begin
  if tg_op = 'INSERT' then
    v_client_id := new.profile_id;
    v_new_nutritionist_id := new.assigned_nutritionist_id;
    v_new_trainer_id := new.assigned_trainer_id;
  elsif tg_op = 'UPDATE' then
    v_client_id := new.profile_id;
    v_old_nutritionist_id := old.assigned_nutritionist_id;
    v_old_trainer_id := old.assigned_trainer_id;
    v_new_nutritionist_id := new.assigned_nutritionist_id;
    v_new_trainer_id := new.assigned_trainer_id;
  else
    v_client_id := old.profile_id;
    v_old_nutritionist_id := old.assigned_nutritionist_id;
    v_old_trainer_id := old.assigned_trainer_id;
  end if;

  select coalesce(nullif(btrim(profile.full_name), ''), 'un cliente')
  into v_client_name
  from public.profiles profile
  where profile.id = v_client_id;

  if v_new_nutritionist_id is not null then
    select coalesce(
      nullif(btrim(profile.full_name), ''),
      'tu profesional de nutricion'
    )
    into v_new_nutritionist_name
    from public.profiles profile
    where profile.id = v_new_nutritionist_id;
  end if;

  if v_new_trainer_id is not null then
    select coalesce(
      nullif(btrim(profile.full_name), ''),
      'tu profesional de entrenamiento'
    )
    into v_new_trainer_name
    from public.profiles profile
    where profile.id = v_new_trainer_id;
  end if;

  if v_old_nutritionist_id is distinct from v_new_nutritionist_id then
    if v_old_nutritionist_id is not null then
      perform private.create_notification(
        v_old_nutritionist_id,
        'nutrition_professional_unassigned',
        format(
          'La asignacion de nutricion con %s finalizo.',
          v_client_name
        ),
        '/app/clientes',
        jsonb_build_object(
          'clientId', v_client_id,
          'service', 'nutrition'
        ),
        v_actor_id
      );
    end if;

    if v_new_nutritionist_id is not null then
      perform private.create_notification(
        v_new_nutritionist_id,
        'nutrition_professional_assigned',
        format(
          'Se te asigno %s como cliente de nutricion.',
          v_client_name
        ),
        format('/app/clientes/%s', v_client_id),
        jsonb_build_object(
          'clientId', v_client_id,
          'service', 'nutrition'
        ),
        v_actor_id
      );
    end if;

    perform private.create_notification(
      v_client_id,
      case
        when v_new_nutritionist_id is null
          then 'nutrition_plan_deactivated'
        when v_old_nutritionist_id is null
          then 'nutrition_plan_activated'
        else 'nutrition_professional_changed'
      end,
      case
        when v_new_nutritionist_id is null
          then 'Tu plan de nutricion fue desactivado.'
        when v_old_nutritionist_id is null
          then format(
            'Tu plan de nutricion fue activado con %s.',
            v_new_nutritionist_name
          )
        else format(
          'Tu profesional de nutricion cambio a %s.',
          v_new_nutritionist_name
        )
      end,
      '/app/nutricion',
      jsonb_build_object(
        'professionalId', v_new_nutritionist_id,
        'service', 'nutrition'
      ),
      v_actor_id
    );
  end if;

  if v_old_trainer_id is distinct from v_new_trainer_id then
    if v_old_trainer_id is not null then
      perform private.create_notification(
        v_old_trainer_id,
        'training_professional_unassigned',
        format(
          'La asignacion de entrenamiento con %s finalizo.',
          v_client_name
        ),
        '/app/clientes',
        jsonb_build_object(
          'clientId', v_client_id,
          'service', 'training'
        ),
        v_actor_id
      );
    end if;

    if v_new_trainer_id is not null then
      perform private.create_notification(
        v_new_trainer_id,
        'training_professional_assigned',
        format(
          'Se te asigno %s como cliente de entrenamiento.',
          v_client_name
        ),
        format('/app/clientes/%s', v_client_id),
        jsonb_build_object(
          'clientId', v_client_id,
          'service', 'training'
        ),
        v_actor_id
      );
    end if;

    perform private.create_notification(
      v_client_id,
      case
        when v_new_trainer_id is null
          then 'training_plan_deactivated'
        when v_old_trainer_id is null
          then 'training_plan_activated'
        else 'training_professional_changed'
      end,
      case
        when v_new_trainer_id is null
          then 'Tu plan de entrenamiento fue desactivado.'
        when v_old_trainer_id is null
          then format(
            'Tu plan de entrenamiento fue activado con %s.',
            v_new_trainer_name
          )
        else format(
          'Tu profesional de entrenamiento cambio a %s.',
          v_new_trainer_name
        )
      end,
      '/app/entrenamiento',
      jsonb_build_object(
        'professionalId', v_new_trainer_id,
        'service', 'training'
      ),
      v_actor_id
    );
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_client_relationship_change()
  from public, anon, authenticated;

drop trigger if exists notify_client_relationship_change
  on public.client_profiles;
create trigger notify_client_relationship_change
after insert or update of assigned_nutritionist_id, assigned_trainer_id
  or delete on public.client_profiles
for each row
execute function private.notify_client_relationship_change();

create or replace function private.notify_workout_plan_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_client_name text;
  v_event_type text;
  v_item_label text;
  v_message text;
begin
  if tg_op = 'INSERT' and new.status <> 'active'::public.plan_status then
    return new;
  end if;

  if tg_op = 'UPDATE' and not (
    old.status = 'active'::public.plan_status
    and new.status = 'archived'::public.plan_status
  ) then
    return new;
  end if;

  select coalesce(nullif(btrim(profile.full_name), ''), 'el cliente')
  into v_client_name
  from public.profiles profile
  where profile.id = new.client_id;

  v_item_label := case
    when new.template_id is not null then 'la plantilla'
    else 'la rutina'
  end;

  if tg_op = 'INSERT' then
    v_event_type := case
      when new.template_id is not null
        then 'workout_template_assigned'
      else 'routine_assigned'
    end;
    v_message := format(
      'Se te asigno %s "%s".',
      v_item_label,
      new.title
    );
  else
    v_event_type := case
      when new.template_id is not null
        then 'workout_template_unassigned'
      else 'routine_unassigned'
    end;
    v_message := format(
      '%s "%s" fue archivada y se conservo en tu historial.',
      initcap(v_item_label),
      new.title
    );
  end if;

  perform private.create_notification(
    new.client_id,
    v_event_type,
    v_message,
    format('/app/entrenamiento/historial/%s', new.id),
    jsonb_build_object(
      'assignmentId', new.id,
      'routineId', new.routine_id,
      'templateId', new.template_id
    ),
    v_actor_id
  );

  perform private.create_notification(
    new.trainer_id,
    v_event_type,
    case
      when tg_op = 'INSERT' then format(
        'Se asigno %s "%s" a %s.',
        v_item_label,
        new.title,
        v_client_name
      )
      else format(
        'Se archivo %s "%s" de %s.',
        v_item_label,
        new.title,
        v_client_name
      )
    end,
    '/app/entrenamiento/asignaciones',
    jsonb_build_object(
      'assignmentId', new.id,
      'clientId', new.client_id,
      'routineId', new.routine_id,
      'templateId', new.template_id
    ),
    v_actor_id
  );

  return new;
end;
$$;

revoke all on function private.notify_workout_plan_change()
  from public, anon, authenticated;

drop trigger if exists notify_workout_plan_change
  on public.workout_plans;
create trigger notify_workout_plan_change
after insert or update of status on public.workout_plans
for each row
execute function private.notify_workout_plan_change();

create or replace function private.notify_diet_plan_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_client_name text;
  v_event_type text;
  v_message text;
begin
  if tg_op = 'INSERT' and new.status <> 'active'::public.plan_status then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = new.status then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.status <> 'active'::public.plan_status
    and new.status <> 'active'::public.plan_status then
    return new;
  end if;

  select coalesce(nullif(btrim(profile.full_name), ''), 'el cliente')
  into v_client_name
  from public.profiles profile
  where profile.id = new.client_id;

  if new.status = 'active'::public.plan_status then
    v_event_type := 'nutrition_plan_assigned';
    v_message := format(
      'Tu plan nutricional "%s" esta disponible.',
      new.title
    );
  else
    v_event_type := 'nutrition_plan_archived';
    v_message := format(
      'Tu plan nutricional "%s" fue archivado.',
      new.title
    );
  end if;

  perform private.create_notification(
    new.client_id,
    v_event_type,
    v_message,
    '/app/nutricion',
    jsonb_build_object('dietPlanId', new.id),
    v_actor_id
  );

  perform private.create_notification(
    new.nutritionist_id,
    v_event_type,
    case
      when new.status = 'active'::public.plan_status then format(
        'El plan nutricional "%s" de %s fue activado.',
        new.title,
        v_client_name
      )
      else format(
        'El plan nutricional "%s" de %s fue archivado.',
        new.title,
        v_client_name
      )
    end,
    format('/app/clientes/%s', new.client_id),
    jsonb_build_object(
      'clientId', new.client_id,
      'dietPlanId', new.id
    ),
    v_actor_id
  );

  return new;
end;
$$;

revoke all on function private.notify_diet_plan_change()
  from public, anon, authenticated;

drop trigger if exists notify_diet_plan_change
  on public.diet_plans;
create trigger notify_diet_plan_change
after insert or update of status on public.diet_plans
for each row
execute function private.notify_diet_plan_change();

create or replace function private.notify_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_event_type text;
  v_message text;
begin
  if tg_op = 'INSERT' then
    v_event_type := 'appointment_created';
    v_message := format('Se creo la cita "%s".', new.title);
  elsif old.status <> 'cancelled'::public.appointment_status
    and new.status = 'cancelled'::public.appointment_status then
    v_event_type := 'appointment_cancelled';
    v_message := format('La cita "%s" fue cancelada.', new.title);
  elsif old.starts_at is distinct from new.starts_at
    or old.ends_at is distinct from new.ends_at then
    v_event_type := 'appointment_rescheduled';
    v_message := format('La cita "%s" fue reprogramada.', new.title);
  else
    return new;
  end if;

  perform private.create_notification(
    new.client_id,
    v_event_type,
    v_message,
    '/app/calendario',
    jsonb_build_object('appointmentId', new.id),
    v_actor_id
  );

  perform private.create_notification(
    new.professional_id,
    v_event_type,
    v_message,
    '/app/calendario',
    jsonb_build_object(
      'appointmentId', new.id,
      'clientId', new.client_id
    ),
    v_actor_id
  );

  return new;
end;
$$;

revoke all on function private.notify_appointment_change()
  from public, anon, authenticated;

drop trigger if exists notify_appointment_change
  on public.appointments;
create trigger notify_appointment_change
after insert or update of status, starts_at, ends_at
  on public.appointments
for each row
execute function private.notify_appointment_change();

create or replace function private.notify_resource_available()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
begin
  if new.client_id is not null then
    perform private.create_notification(
      new.client_id,
      'resource_available',
      format('Tienes disponible el recurso "%s".', new.title),
      '/app/recursos',
      jsonb_build_object(
        'area', new.area,
        'resourceId', new.id
      ),
      v_actor_id
    );

    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    event_type,
    message,
    destination_path,
    metadata
  )
  select
    client_profile.profile_id,
    v_actor_id,
    'resource_available',
    format('Tienes disponible el recurso "%s".', new.title),
    '/app/recursos',
    jsonb_build_object(
      'area', new.area,
      'resourceId', new.id
    )
  from public.client_profiles client_profile
  where client_profile.profile_id is distinct from v_actor_id
    and (
      (
        new.area = 'nutrition'::public.service_area
        and client_profile.assigned_nutritionist_id is not null
      )
      or (
        new.area = 'training'::public.service_area
        and client_profile.assigned_trainer_id is not null
      )
      or (
        new.area = 'general'::public.service_area
        and (
          client_profile.assigned_nutritionist_id is not null
          or client_profile.assigned_trainer_id is not null
        )
      )
    );

  return new;
end;
$$;

revoke all on function private.notify_resource_available()
  from public, anon, authenticated;

drop trigger if exists notify_resource_available
  on public.resources;
create trigger notify_resource_available
after insert on public.resources
for each row
execute function private.notify_resource_available();

create or replace function private.notify_progress_recorded()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.create_notification(
    new.client_id,
    'progress_recorded',
    'Se registro una nueva actualizacion en tu progreso.',
    '/app/progreso',
    jsonb_build_object(
      'area', new.area,
      'progressEntryId', new.id
    ),
    coalesce(new.recorded_by, (select auth.uid()))
  );

  return new;
end;
$$;

revoke all on function private.notify_progress_recorded()
  from public, anon, authenticated;

drop trigger if exists notify_progress_recorded
  on public.progress_entries;
create trigger notify_progress_recorded
after insert on public.progress_entries
for each row
execute function private.notify_progress_recorded();

notify pgrst, 'reload schema';

set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function private.notify_nutrition_client_group(
  p_actor_id uuid,
  p_event_type text,
  p_message text,
  p_destination_path text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
begin
  for v_client_id in
    select client_profile.profile_id
    from public.client_profiles client_profile
    where client_profile.profile_id is distinct from p_actor_id
      and client_profile.assigned_nutritionist_id is not null
      and (
        (select private.is_general_admin())
        or client_profile.assigned_nutritionist_id = p_actor_id
      )
  loop
    if not exists (
      select 1
      from public.notifications notification
      where notification.recipient_id = v_client_id
        and notification.event_type = p_event_type
        and notification.metadata @> coalesce(p_metadata, '{}'::jsonb)
        and notification.created_at > now() - interval '5 minutes'
    ) then
      perform private.create_notification(
        v_client_id,
        p_event_type,
        p_message,
        p_destination_path,
        p_metadata,
        p_actor_id
      );
    end if;
  end loop;
end;
$$;

revoke all on function private.notify_nutrition_client_group(
  uuid,
  text,
  text,
  text,
  jsonb
) from public, anon, authenticated;

create or replace function private.notify_nutrition_document_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_event_type text;
  v_has_other_active_plan boolean := false;
  v_message text;
  v_metadata jsonb := jsonb_build_object('documentId', new.id);
begin
  if new.document_type = 'meal_plan'::public.nutrition_document_type then
    if new.client_id is null then
      return new;
    end if;

    if tg_op = 'INSERT' and new.status = 'active'::public.nutrition_document_status then
      select exists (
        select 1
        from public.nutrition_documents document
        where document.id <> new.id
          and document.client_id = new.client_id
          and document.document_type = 'meal_plan'::public.nutrition_document_type
          and document.status = 'active'::public.nutrition_document_status
      )
      into v_has_other_active_plan;

      v_event_type := case
        when v_has_other_active_plan then 'nutrition_meal_plan_updated'
        else 'nutrition_meal_plan_assigned'
      end;
      v_message := case
        when v_has_other_active_plan then 'Tu plan de alimentacion fue actualizado.'
        else 'Tienes un nuevo plan de alimentacion disponible.'
      end;
    elsif tg_op = 'UPDATE'
      and old.status <> 'active'::public.nutrition_document_status
      and new.status = 'active'::public.nutrition_document_status then
      v_event_type := 'nutrition_meal_plan_assigned';
      v_message := 'Tienes un nuevo plan de alimentacion disponible.';
    elsif tg_op = 'UPDATE'
      and old.status = 'active'::public.nutrition_document_status
      and new.status = 'active'::public.nutrition_document_status
      and (
        old.storage_path is distinct from new.storage_path
        or old.title is distinct from new.title
      ) then
      v_event_type := 'nutrition_meal_plan_updated';
      v_message := 'Tu plan de alimentacion fue actualizado.';
    elsif tg_op = 'UPDATE'
      and old.status = 'active'::public.nutrition_document_status
      and new.status = 'inactive'::public.nutrition_document_status then
      select exists (
        select 1
        from public.nutrition_documents document
        where document.id <> new.id
          and document.client_id = new.client_id
          and document.document_type = 'meal_plan'::public.nutrition_document_type
          and document.status = 'active'::public.nutrition_document_status
      )
      into v_has_other_active_plan;

      if v_has_other_active_plan then
        return new;
      end if;

      v_event_type := 'nutrition_meal_plan_deactivated';
      v_message := 'Tu plan de alimentacion fue desactivado.';
    end if;

    if v_event_type is not null
      and not exists (
        select 1
        from public.notifications notification
        where notification.recipient_id = new.client_id
          and notification.event_type = v_event_type
          and notification.metadata @> v_metadata
          and notification.created_at > now() - interval '5 minutes'
      ) then
      perform private.create_notification(
        new.client_id,
        v_event_type,
        v_message,
        '/app/nutricion',
        v_metadata,
        v_actor_id
      );
    end if;
  elsif new.document_type = 'educational_library'::public.nutrition_document_type then
    if tg_op = 'INSERT'
      and new.status = 'active'::public.nutrition_document_status then
      v_event_type := 'nutrition_educational_resource_created';
      v_message := 'Se agrego un nuevo recurso educativo a tu biblioteca.';
    elsif tg_op = 'UPDATE'
      and old.status <> 'active'::public.nutrition_document_status
      and new.status = 'active'::public.nutrition_document_status then
      v_event_type := 'nutrition_educational_resource_created';
      v_message := 'Se agrego un nuevo recurso educativo a tu biblioteca.';
    elsif tg_op = 'UPDATE'
      and old.status = 'active'::public.nutrition_document_status
      and new.status = 'active'::public.nutrition_document_status
      and (
        old.storage_path is distinct from new.storage_path
        or old.title is distinct from new.title
        or old.folder_id is distinct from new.folder_id
      ) then
      v_event_type := 'nutrition_educational_resource_updated';
      v_message := 'Se actualizo un recurso educativo de tu biblioteca.';
    end if;

    if v_event_type is not null then
      perform private.notify_nutrition_client_group(
        v_actor_id,
        v_event_type,
        v_message,
        '/app/recursos?area=nutrition',
        v_metadata
      );
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_nutrition_document_change()
  from public, anon, authenticated;

drop trigger if exists notify_nutrition_document_change
  on public.nutrition_documents;
create trigger notify_nutrition_document_change
after insert or update of status, title, storage_path, folder_id
  on public.nutrition_documents
for each row
execute function private.notify_nutrition_document_change();

drop trigger if exists notify_nutrition_folder_change
  on public.nutrition_document_folders;
drop function if exists private.notify_nutrition_folder_change();

create or replace function private.notify_habit_assignment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_event_type text;
  v_message text;
  v_metadata jsonb := jsonb_build_object(
    'assignmentId', new.id,
    'habitId', new.habit_id
  );
begin
  if tg_op = 'INSERT' and new.active is true then
    v_event_type := 'nutrition_habit_assigned';
    v_message := 'Se te asigno un nuevo habito de nutricion.';
  elsif tg_op = 'UPDATE'
    and old.active is false
    and new.active is true then
    v_event_type := 'nutrition_habit_assigned';
    v_message := 'Se te asigno un nuevo habito de nutricion.';
  elsif tg_op = 'UPDATE'
    and old.active is true
    and new.active is false then
    v_event_type := 'nutrition_habit_removed';
    v_message := 'Un habito de nutricion fue desactivado de tu plan.';
  elsif tg_op = 'UPDATE'
    and new.active is true
    and (
      old.habit_id is distinct from new.habit_id
      or old.days_of_week is distinct from new.days_of_week
      or old.start_date is distinct from new.start_date
      or old.end_date is distinct from new.end_date
    ) then
    v_event_type := 'nutrition_habit_updated';
    v_message := 'Se actualizo un habito de nutricion que tienes asignado.';
  end if;

  if v_event_type is not null
    and not exists (
      select 1
      from public.notifications notification
      where notification.recipient_id = new.client_id
        and notification.event_type = v_event_type
        and notification.metadata @> v_metadata
        and notification.created_at > now() - interval '5 minutes'
    ) then
    perform private.create_notification(
      new.client_id,
      v_event_type,
      v_message,
      '/app/nutricion/habitos',
      v_metadata,
      v_actor_id
    );
  end if;

  return new;
end;
$$;

revoke all on function private.notify_habit_assignment_change()
  from public, anon, authenticated;

drop trigger if exists notify_habit_assignment_change
  on public.habit_assignments;
create trigger notify_habit_assignment_change
after insert or update of active, habit_id, days_of_week, start_date, end_date
  on public.habit_assignments
for each row
execute function private.notify_habit_assignment_change();

create or replace function private.notify_habit_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_client_id uuid;
  v_event_type text;
  v_message text;
  v_metadata jsonb := jsonb_build_object('habitId', new.id);
begin
  if old.active is true and new.active is false then
    v_event_type := 'nutrition_habit_removed';
    v_message := 'Un habito de nutricion asignado fue desactivado de tu plan.';
  elsif old.title is distinct from new.title
    or old.description is distinct from new.description
    or old.active is distinct from new.active then
    v_event_type := 'nutrition_habit_updated';
    v_message := 'Se actualizo un habito de nutricion que tienes asignado.';
  else
    return new;
  end if;

  for v_client_id in
    select distinct assignment.client_id
    from public.habit_assignments assignment
    join public.client_profiles client_profile
      on client_profile.profile_id = assignment.client_id
    where assignment.habit_id = new.id
      and assignment.active is true
      and assignment.client_id is distinct from v_actor_id
      and (
        (select private.is_general_admin())
        or client_profile.assigned_nutritionist_id = v_actor_id
      )
  loop
    if not exists (
      select 1
      from public.notifications notification
      where notification.recipient_id = v_client_id
        and notification.event_type = v_event_type
        and notification.metadata @> v_metadata
        and notification.created_at > now() - interval '5 minutes'
    ) then
      perform private.create_notification(
        v_client_id,
        v_event_type,
        v_message,
        '/app/nutricion/habitos',
        v_metadata,
        v_actor_id
      );
    end if;
  end loop;

  return new;
end;
$$;

revoke all on function private.notify_habit_change()
  from public, anon, authenticated;

drop trigger if exists notify_habit_change
  on public.habits;
create trigger notify_habit_change
after update of title, description, active
  on public.habits
for each row
execute function private.notify_habit_change();

create or replace function private.notify_habit_progress_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_assigned_count int;
  v_client_name text;
  v_completed_count int;
  v_nutritionist_id uuid;
begin
  if new.completed = true and (old.completed is distinct from new.completed) then
    select count(*)
    into v_assigned_count
    from public.habit_assignments assignment
    where assignment.client_id = new.client_id
      and assignment.active = true
      and new.date >= assignment.start_date
      and (assignment.end_date is null or new.date <= assignment.end_date)
      and extract(isodow from new.date)::integer = any(assignment.days_of_week);

    select count(*)
    into v_completed_count
    from public.habit_progress progress
    join public.habit_assignments assignment
      on progress.habit_assignment_id = assignment.id
    where progress.client_id = new.client_id
      and progress.date = new.date
      and progress.completed = true
      and assignment.active = true;

    if v_assigned_count > 0
      and v_completed_count >= v_assigned_count
      and not exists (
        select 1
        from public.notifications notification
        where notification.recipient_id = new.client_id
          and notification.event_type = 'nutrition_habit_progress_perfect'
          and notification.metadata ->> 'date' = new.date::text
      ) then
      perform private.create_notification(
        new.client_id,
        'nutrition_habit_progress_perfect',
        'Completaste todos tus habitos de hoy.',
        '/app/nutricion/habitos',
        jsonb_build_object('date', new.date),
        v_actor_id
      );

      select coalesce(nullif(btrim(profile.full_name), ''), 'Una clienta')
      into v_client_name
      from public.profiles profile
      where profile.id = new.client_id;

      select assigned_nutritionist_id
      into v_nutritionist_id
      from public.client_profiles
      where profile_id = new.client_id;

      if v_nutritionist_id is not null then
        perform private.create_notification(
          v_nutritionist_id,
          'nutrition_client_progress_perfect',
          format('%s completo todos sus habitos de hoy.', v_client_name),
          format('/app/clientes/%s', new.client_id),
          jsonb_build_object('clientId', new.client_id, 'date', new.date),
          v_actor_id
        );
      end if;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_habit_progress_change()
  from public, anon, authenticated;

drop trigger if exists notify_habit_progress_change
  on public.habit_progress;
create trigger notify_habit_progress_change
after update of completed
  on public.habit_progress
for each row
execute function private.notify_habit_progress_change();

notify pgrst, 'reload schema';

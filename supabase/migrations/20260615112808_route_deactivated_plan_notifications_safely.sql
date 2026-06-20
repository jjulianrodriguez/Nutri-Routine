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
  v_destination_path text;
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

  v_destination_path := case
    when p_event_type in (
      'nutrition_plan_deactivated',
      'training_plan_deactivated'
    ) then '/app/configuracion'
    else p_destination_path
  end;

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
    v_destination_path,
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

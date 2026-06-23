set lock_timeout = '5s';
set statement_timeout = '30s';

alter table public.chat_messages
  add column if not exists edited_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz;

update public.chat_messages
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.chat_messages
  alter column updated_at set default now(),
  alter column updated_at set not null;

create or replace function private.refresh_chat_conversation_preview(
  p_conversation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_latest_body text;
  v_latest_created_at timestamptz;
begin
  select
    message.body,
    message.created_at
  into
    v_latest_body,
    v_latest_created_at
  from public.chat_messages message
  where message.conversation_id = p_conversation_id
  order by message.created_at desc, message.id desc
  limit 1;

  update public.chat_conversations conversation
  set
    last_message_at = v_latest_created_at,
    last_message_preview = case
      when v_latest_body is null then null
      else left(v_latest_body, 180)
    end,
    updated_at = now()
  where conversation.id = p_conversation_id;
end;
$$;

revoke all on function private.refresh_chat_conversation_preview(uuid)
  from public, anon, authenticated;

create or replace function public.update_chat_message(
  p_message_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
  v_conversation public.chat_conversations%rowtype;
  v_message public.chat_messages%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required to edit messages.'
      using errcode = '42501';
  end if;

  if char_length(v_body) = 0 then
    raise exception 'Message body cannot be empty.'
      using errcode = '22023';
  end if;

  if char_length(v_body) > 4000 then
    raise exception 'Message body is too long.'
      using errcode = '22023';
  end if;

  select message.*
  into v_message
  from public.chat_messages message
  where message.id = p_message_id;

  if v_message.id is null
    or v_message.sender_id <> (select auth.uid()) then
    raise exception 'You are not allowed to edit this message.'
      using errcode = '42501';
  end if;

  if v_message.deleted_at is not null then
    raise exception 'Deleted messages cannot be edited.'
      using errcode = '22023';
  end if;

  select conversation.*
  into v_conversation
  from public.chat_conversations conversation
  where conversation.id = v_message.conversation_id;

  if v_conversation.id is null
    or not private.can_access_chat(
      v_conversation.client_id,
      v_conversation.professional_id,
      v_conversation.area
    ) then
    raise exception 'You are not allowed to edit this message.'
      using errcode = '42501';
  end if;

  update public.chat_messages message
  set
    body = v_body,
    edited_at = now(),
    updated_at = now()
  where message.id = p_message_id;

  perform private.refresh_chat_conversation_preview(v_message.conversation_id);

  return v_message.conversation_id;
end;
$$;

create or replace function public.delete_chat_message(
  p_message_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation public.chat_conversations%rowtype;
  v_message public.chat_messages%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required to delete messages.'
      using errcode = '42501';
  end if;

  select message.*
  into v_message
  from public.chat_messages message
  where message.id = p_message_id;

  if v_message.id is null
    or v_message.sender_id <> (select auth.uid()) then
    raise exception 'You are not allowed to delete this message.'
      using errcode = '42501';
  end if;

  if v_message.deleted_at is not null then
    return v_message.conversation_id;
  end if;

  select conversation.*
  into v_conversation
  from public.chat_conversations conversation
  where conversation.id = v_message.conversation_id;

  if v_conversation.id is null
    or not private.can_access_chat(
      v_conversation.client_id,
      v_conversation.professional_id,
      v_conversation.area
    ) then
    raise exception 'You are not allowed to delete this message.'
      using errcode = '42501';
  end if;

  update public.chat_messages message
  set
    body = 'Mensaje eliminado',
    deleted_at = now(),
    updated_at = now()
  where message.id = p_message_id;

  perform private.refresh_chat_conversation_preview(v_message.conversation_id);

  return v_message.conversation_id;
end;
$$;

revoke all on function public.update_chat_message(uuid, text)
  from public, anon, authenticated;
revoke all on function public.delete_chat_message(uuid)
  from public, anon, authenticated;

grant execute on function public.update_chat_message(uuid, text)
  to authenticated;
grant execute on function public.delete_chat_message(uuid)
  to authenticated;

create or replace function private.notify_chat_message_received()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_area public.service_area;
  v_client_id uuid;
  v_conversation_id uuid;
  v_event_type text;
  v_professional_id uuid;
  v_recipient_id uuid;
  v_sender_name text;
begin
  select
    conversation.id,
    conversation.client_id,
    conversation.professional_id,
    conversation.area
  into
    v_conversation_id,
    v_client_id,
    v_professional_id,
    v_area
  from public.chat_conversations conversation
  where conversation.id = new.conversation_id;

  if v_conversation_id is null then
    return new;
  end if;

  v_recipient_id := case
    when new.sender_id = v_client_id then v_professional_id
    else v_client_id
  end;

  if v_recipient_id = new.sender_id then
    return new;
  end if;

  if exists (
    select 1
    from public.notifications notification
    where notification.event_type = 'chat_message_received'
      and notification.metadata ->> 'messageId' = new.id::text
  ) then
    return new;
  end if;

  select coalesce(nullif(btrim(profile.full_name), ''), 'un usuario')
  into v_sender_name
  from public.profiles profile
  where profile.id = new.sender_id;

  v_event_type := 'chat_message_received';

  perform private.create_notification(
    v_recipient_id,
    v_event_type,
    case
      when v_area = 'training'::public.service_area then
        format('Nuevo mensaje de entrenamiento de %s.', v_sender_name)
      else
        format('Nuevo mensaje de nutrición de %s.', v_sender_name)
    end,
    format('/app/dashboard?chat=%s', v_conversation_id),
    jsonb_build_object(
      'area', v_area,
      'conversationId', v_conversation_id,
      'messageId', new.id,
      'senderId', new.sender_id
    ),
    new.sender_id
  );

  return new;
end;
$$;

revoke all on function private.notify_chat_message_received()
  from public, anon, authenticated;

notify pgrst, 'reload schema';

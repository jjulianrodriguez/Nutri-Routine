set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function private.update_chat_message_author(
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

create or replace function private.delete_chat_message_author(
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

revoke all on function private.update_chat_message_author(uuid, text)
  from public, anon, authenticated;
revoke all on function private.delete_chat_message_author(uuid)
  from public, anon, authenticated;

grant execute on function private.update_chat_message_author(uuid, text)
  to authenticated;
grant execute on function private.delete_chat_message_author(uuid)
  to authenticated;

create or replace function public.update_chat_message(
  p_message_id uuid,
  p_body text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return private.update_chat_message_author(p_message_id, p_body);
end;
$$;

create or replace function public.delete_chat_message(
  p_message_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return private.delete_chat_message_author(p_message_id);
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

notify pgrst, 'reload schema';

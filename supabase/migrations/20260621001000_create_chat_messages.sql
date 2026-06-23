set lock_timeout = '5s';
set statement_timeout = '30s';

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  area public.service_area not null,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_conversations_area_check check (
    area in (
      'nutrition'::public.service_area,
      'training'::public.service_area
    )
  ),
  constraint chat_conversations_distinct_participants check (
    client_id <> professional_id
  ),
  constraint chat_conversations_last_message_preview_check check (
    last_message_preview is null
    or char_length(last_message_preview) <= 180
  ),
  constraint chat_conversations_unique_participants_area unique (
    client_id,
    professional_id,
    area
  )
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chat_messages_body_check check (
    body = btrim(body)
    and char_length(body) between 1 and 4000
  )
);

create index if not exists chat_conversations_client_area_idx
  on public.chat_conversations (client_id, area, updated_at desc);
create index if not exists chat_conversations_professional_area_idx
  on public.chat_conversations (professional_id, area, updated_at desc);
create index if not exists chat_conversations_last_message_at_idx
  on public.chat_conversations (last_message_at desc nulls last);
create index if not exists chat_messages_conversation_created_idx
  on public.chat_messages (conversation_id, created_at);
create index if not exists chat_messages_sender_id_idx
  on public.chat_messages (sender_id);
create index if not exists chat_messages_unread_idx
  on public.chat_messages (conversation_id, created_at desc)
  where read_at is null;

drop trigger if exists set_chat_conversations_updated_at
  on public.chat_conversations;
create trigger set_chat_conversations_updated_at
before update on public.chat_conversations
for each row
execute function public.set_updated_at();

create or replace function private.is_chat_area(p_area public.service_area)
returns boolean
language sql
immutable
security definer
set search_path = ''
as $$
  select p_area in (
    'nutrition'::public.service_area,
    'training'::public.service_area
  )
$$;

create or replace function private.chat_assignment_matches(
  p_client_id uuid,
  p_professional_id uuid,
  p_area public.service_area
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_chat_area(p_area)
    and exists (
      select 1
      from public.client_profiles client_profile
      join public.profiles client
        on client.id = client_profile.profile_id
      join public.profiles professional
        on professional.id = p_professional_id
      left join public.professional_profiles professional_profile
        on professional_profile.profile_id = professional.id
      where client_profile.profile_id = p_client_id
        and client.role = 'client'::public.profile_role
        and (
          (
            p_area = 'nutrition'::public.service_area
            and client_profile.assigned_nutritionist_id = p_professional_id
          )
          or (
            p_area = 'training'::public.service_area
            and client_profile.assigned_trainer_id = p_professional_id
          )
        )
        and (
          (
            professional.role = 'admin'::public.profile_role
            and professional_profile.profile_id is null
          )
          or (
            professional.role = 'professional'::public.profile_role
            and professional_profile.is_active = true
            and (
              professional_profile.specialty = 'both'::public.professional_specialty
              or (
                p_area = 'nutrition'::public.service_area
                and professional_profile.specialty = 'nutrition'::public.professional_specialty
              )
              or (
                p_area = 'training'::public.service_area
                and professional_profile.specialty = 'training'::public.professional_specialty
              )
            )
          )
        )
    )
$$;

create or replace function private.can_access_chat(
  p_client_id uuid,
  p_professional_id uuid,
  p_area public.service_area
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and private.is_chat_area(p_area)
    and (
      private.is_general_admin()
      or (
        (select auth.uid()) in (p_client_id, p_professional_id)
        and private.chat_assignment_matches(
          p_client_id,
          p_professional_id,
          p_area
        )
      )
    )
$$;

create or replace function private.can_create_chat(
  p_client_id uuid,
  p_professional_id uuid,
  p_area public.service_area
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and private.chat_assignment_matches(
      p_client_id,
      p_professional_id,
      p_area
    )
    and (
      private.is_general_admin()
      or (select auth.uid()) in (p_client_id, p_professional_id)
    )
$$;

revoke all on function private.is_chat_area(public.service_area)
  from public, anon, authenticated;
revoke all on function private.chat_assignment_matches(
  uuid,
  uuid,
  public.service_area
) from public, anon, authenticated;
revoke all on function private.can_access_chat(
  uuid,
  uuid,
  public.service_area
) from public, anon, authenticated;
revoke all on function private.can_create_chat(
  uuid,
  uuid,
  public.service_area
) from public, anon, authenticated;

grant execute on function private.is_chat_area(public.service_area)
  to authenticated;
grant execute on function private.chat_assignment_matches(
  uuid,
  uuid,
  public.service_area
) to authenticated;
grant execute on function private.can_access_chat(
  uuid,
  uuid,
  public.service_area
) to authenticated;
grant execute on function private.can_create_chat(
  uuid,
  uuid,
  public.service_area
) to authenticated;

create or replace function private.touch_chat_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_conversations conversation
  set
    last_message_at = new.created_at,
    last_message_preview = left(new.body, 180),
    updated_at = now()
  where conversation.id = new.conversation_id;

  return new;
end;
$$;

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
        format('Nuevo mensaje de nutricion de %s.', v_sender_name)
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

revoke all on function private.touch_chat_conversation()
  from public, anon, authenticated;
revoke all on function private.notify_chat_message_received()
  from public, anon, authenticated;

drop trigger if exists touch_chat_conversation_after_message
  on public.chat_messages;
create trigger touch_chat_conversation_after_message
after insert on public.chat_messages
for each row
execute function private.touch_chat_conversation();

drop trigger if exists notify_chat_message_received
  on public.chat_messages;
create trigger notify_chat_message_received
after insert on public.chat_messages
for each row
execute function private.notify_chat_message_received();

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

revoke all on public.chat_conversations from public, anon, authenticated;
revoke all on public.chat_messages from public, anon, authenticated;
grant select, insert on public.chat_conversations to authenticated;
grant select, insert on public.chat_messages to authenticated;
grant update (read_at) on public.chat_messages to authenticated;

drop policy if exists "chat_conversations_select_related"
  on public.chat_conversations;
create policy "chat_conversations_select_related"
on public.chat_conversations
for select
to authenticated
using (
  private.can_access_chat(client_id, professional_id, area)
);

drop policy if exists "chat_conversations_insert_related"
  on public.chat_conversations;
create policy "chat_conversations_insert_related"
on public.chat_conversations
for insert
to authenticated
with check (
  private.can_create_chat(client_id, professional_id, area)
);

drop policy if exists "chat_messages_select_related"
  on public.chat_messages;
create policy "chat_messages_select_related"
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_conversations conversation
    where conversation.id = chat_messages.conversation_id
      and private.can_access_chat(
        conversation.client_id,
        conversation.professional_id,
        conversation.area
      )
  )
);

drop policy if exists "chat_messages_insert_related"
  on public.chat_messages;
create policy "chat_messages_insert_related"
on public.chat_messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.chat_conversations conversation
    where conversation.id = chat_messages.conversation_id
      and private.can_access_chat(
        conversation.client_id,
        conversation.professional_id,
        conversation.area
      )
  )
);

drop policy if exists "chat_messages_mark_related_read"
  on public.chat_messages;
create policy "chat_messages_mark_related_read"
on public.chat_messages
for update
to authenticated
using (
  sender_id <> (select auth.uid())
  and exists (
    select 1
    from public.chat_conversations conversation
    where conversation.id = chat_messages.conversation_id
      and private.can_access_chat(
        conversation.client_id,
        conversation.professional_id,
        conversation.area
      )
      and (select auth.uid()) in (
        conversation.client_id,
        conversation.professional_id
      )
  )
)
with check (
  read_at is not null
  and sender_id <> (select auth.uid())
  and exists (
    select 1
    from public.chat_conversations conversation
    where conversation.id = chat_messages.conversation_id
      and private.can_access_chat(
        conversation.client_id,
        conversation.professional_id,
        conversation.area
      )
      and (select auth.uid()) in (
        conversation.client_id,
        conversation.professional_id
      )
  )
);

create or replace function public.ensure_chat_conversation(
  p_client_id uuid,
  p_professional_id uuid,
  p_area public.service_area
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_conversation_id uuid;
begin
  if not private.is_chat_area(p_area) then
    raise exception 'Invalid chat area.'
      using errcode = '22023';
  end if;

  if not private.can_create_chat(
    p_client_id,
    p_professional_id,
    p_area
  ) then
    raise exception 'You are not allowed to open this chat.'
      using errcode = '42501';
  end if;

  select conversation.id
  into v_conversation_id
  from public.chat_conversations conversation
  where conversation.client_id = p_client_id
    and conversation.professional_id = p_professional_id
    and conversation.area = p_area;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  begin
    insert into public.chat_conversations (
      client_id,
      professional_id,
      area
    ) values (
      p_client_id,
      p_professional_id,
      p_area
    )
    returning id into v_conversation_id;
  exception
    when unique_violation then
      select conversation.id
      into v_conversation_id
      from public.chat_conversations conversation
      where conversation.client_id = p_client_id
        and conversation.professional_id = p_professional_id
        and conversation.area = p_area;
  end;

  return v_conversation_id;
end;
$$;

create or replace function public.send_chat_message(
  p_conversation_id uuid,
  p_body text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
  v_conversation public.chat_conversations%rowtype;
  v_message_id uuid;
begin
  if char_length(v_body) = 0 then
    raise exception 'Message body cannot be empty.'
      using errcode = '22023';
  end if;

  if char_length(v_body) > 4000 then
    raise exception 'Message body is too long.'
      using errcode = '22023';
  end if;

  select conversation.*
  into v_conversation
  from public.chat_conversations conversation
  where conversation.id = p_conversation_id;

  if v_conversation.id is null
    or not private.can_access_chat(
      v_conversation.client_id,
      v_conversation.professional_id,
      v_conversation.area
    ) then
    raise exception 'You are not allowed to send messages in this chat.'
      using errcode = '42501';
  end if;

  insert into public.chat_messages (
    conversation_id,
    sender_id,
    body
  ) values (
    p_conversation_id,
    (select auth.uid()),
    v_body
  )
  returning id into v_message_id;

  return v_message_id;
end;
$$;

create or replace function public.mark_chat_conversation_read(
  p_conversation_id uuid
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_conversation public.chat_conversations%rowtype;
  v_updated_count bigint;
begin
  select conversation.*
  into v_conversation
  from public.chat_conversations conversation
  where conversation.id = p_conversation_id;

  if v_conversation.id is null
    or not private.can_access_chat(
      v_conversation.client_id,
      v_conversation.professional_id,
      v_conversation.area
    ) then
    raise exception 'You are not allowed to read this chat.'
      using errcode = '42501';
  end if;

  if (select auth.uid()) not in (
    v_conversation.client_id,
    v_conversation.professional_id
  ) then
    return 0;
  end if;

  update public.chat_messages message
  set read_at = coalesce(message.read_at, now())
  where message.conversation_id = p_conversation_id
    and message.sender_id <> (select auth.uid())
    and message.read_at is null;

  get diagnostics v_updated_count = row_count;
  return v_updated_count;
end;
$$;

revoke all on function public.ensure_chat_conversation(
  uuid,
  uuid,
  public.service_area
) from public, anon, authenticated;
revoke all on function public.send_chat_message(uuid, text)
  from public, anon, authenticated;
revoke all on function public.mark_chat_conversation_read(uuid)
  from public, anon, authenticated;

grant execute on function public.ensure_chat_conversation(
  uuid,
  uuid,
  public.service_area
) to authenticated;
grant execute on function public.send_chat_message(uuid, text)
  to authenticated;
grant execute on function public.mark_chat_conversation_read(uuid)
  to authenticated;

notify pgrst, 'reload schema';

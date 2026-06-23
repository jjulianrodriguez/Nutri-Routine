set lock_timeout = '5s';
set statement_timeout = '30s';

alter table public.chat_messages
  add column if not exists delivered_at timestamptz,
  add column if not exists read_by uuid references public.profiles(id) on delete set null;

update public.chat_messages
set delivered_at = coalesce(delivered_at, created_at, now())
where delivered_at is null;

alter table public.chat_messages
  alter column delivered_at set default now(),
  alter column delivered_at set not null;

create index if not exists chat_messages_read_by_idx
  on public.chat_messages (read_by)
  where read_by is not null;

revoke insert on public.chat_messages from authenticated;
grant insert (conversation_id, sender_id, body)
  on public.chat_messages to authenticated;
grant update (read_at, read_by)
  on public.chat_messages to authenticated;

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
  and read_by = (select auth.uid())
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
  set
    read_at = coalesce(message.read_at, now()),
    read_by = coalesce(message.read_by, (select auth.uid()))
  where message.conversation_id = p_conversation_id
    and message.sender_id <> (select auth.uid())
    and (
      message.read_at is null
      or message.read_by is null
    );

  get diagnostics v_updated_count = row_count;
  return v_updated_count;
end;
$$;

revoke all on function public.mark_chat_conversation_read(uuid)
  from public, anon, authenticated;
grant execute on function public.mark_chat_conversation_read(uuid)
  to authenticated;

notify pgrst, 'reload schema';

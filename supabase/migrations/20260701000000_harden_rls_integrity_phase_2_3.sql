set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function private.can_manage_resource_row(
  target_client_id uuid,
  target_area public.service_area
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_general_admin())
    or (
      (select private.can_manage_resource_area(target_area))
      and (
        target_client_id is null
        or private.is_client_assigned_to_current_professional(
          target_client_id,
          target_area
        )
      )
    )
$$;

revoke all on function private.can_manage_resource_row(
  uuid,
  public.service_area
) from public, anon, authenticated;
grant execute on function private.can_manage_resource_row(
  uuid,
  public.service_area
) to authenticated;

drop policy if exists "profiles_select_visible_to_account"
  on public.profiles;
create policy "profiles_select_visible_to_account"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_general_admin())
  or (
    role = 'client'::public.profile_role
    and private.is_client_assigned_to_current_professional(
      id,
      'general'::public.service_area
    )
  )
  or (
    role in (
      'admin'::public.profile_role,
      'professional'::public.profile_role
    )
    and (select private.is_privileged())
  )
);

drop policy if exists "client_profiles_select_own_or_assigned"
  on public.client_profiles;
drop policy if exists "client_profiles_select_own_or_privileged"
  on public.client_profiles;
create policy "client_profiles_select_own_or_assigned"
on public.client_profiles
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or (select private.is_general_admin())
  or private.is_client_assigned_to_current_professional(
    profile_id,
    'general'::public.service_area
  )
);

drop policy if exists "diet_plans_select_related_accounts"
  on public.diet_plans;
create policy "diet_plans_select_related_accounts"
on public.diet_plans
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(
      client_id,
      'nutrition'::public.service_area
    )
  )
  or private.is_client_assigned_to_current_professional(
    client_id,
    'nutrition'::public.service_area
  )
  or (select private.is_general_admin())
);

drop policy if exists "workout_plans_select_related_accounts"
  on public.workout_plans;
create policy "workout_plans_select_related_accounts"
on public.workout_plans
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(
      client_id,
      'training'::public.service_area
    )
  )
  or private.is_client_assigned_to_current_professional(
    client_id,
    'training'::public.service_area
  )
  or (select private.is_general_admin())
);

drop policy if exists "progress_entries_select_related_accounts"
  on public.progress_entries;
create policy "progress_entries_select_related_accounts"
on public.progress_entries
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(client_id, area)
  )
  or private.is_client_assigned_to_current_professional(client_id, area)
  or (select private.is_general_admin())
);

drop policy if exists "habit_assignments_select_related_accounts"
  on public.habit_assignments;
create policy habit_assignments_select_related_accounts
on public.habit_assignments
for select
to authenticated
using (
  (
    client_id = (select auth.uid())
    and private.client_has_service(
      client_id,
      'nutrition'::public.service_area
    )
  )
  or private.is_client_assigned_to_current_professional(
    client_id,
    'nutrition'::public.service_area
  )
  or (select private.is_general_admin())
);

drop policy if exists "resources_select_allowed_accounts"
  on public.resources;
drop policy if exists "resources_insert_authorized_managers"
  on public.resources;
drop policy if exists "resources_update_authorized_managers"
  on public.resources;
drop policy if exists "resources_delete_authorized_managers"
  on public.resources;

create policy "resources_select_allowed_accounts"
on public.resources
for select
to authenticated
using (
  (select private.is_general_admin())
  or (
    (select private.current_profile_role())
      = 'client'::public.profile_role
    and status = 'active'::public.resource_status
    and (
      client_id is null
      or client_id = (select auth.uid())
    )
    and (select private.client_has_service((select auth.uid()), area))
    and (
      folder_id is null
      or exists (
        select 1
        from public.resource_folders folder
        where folder.id = resources.folder_id
          and folder.active is true
      )
    )
  )
  or (
    (select private.current_profile_role())
      = 'professional'::public.profile_role
    and (select private.can_manage_resource_row(client_id, area))
  )
);

create policy "resources_insert_authorized_managers"
on public.resources
for insert
to authenticated
with check (
  uploaded_by = (select auth.uid())
  and (select private.can_manage_resource_row(client_id, area))
);

create policy "resources_update_authorized_managers"
on public.resources
for update
to authenticated
using ((select private.can_manage_resource_row(client_id, area)))
with check ((select private.can_manage_resource_row(client_id, area)));

create policy "resources_delete_authorized_managers"
on public.resources
for delete
to authenticated
using ((select private.can_manage_resource_row(client_id, area)));

drop policy if exists "resource_pdfs_select_allowed"
  on storage.objects;
drop policy if exists "resource_pdfs_update_managers"
  on storage.objects;
drop policy if exists "resource_pdfs_delete_managers"
  on storage.objects;

create policy "resource_pdfs_select_allowed"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resource-pdfs'
  and exists (
    select 1
    from public.resources res
    where res.storage_bucket = storage.objects.bucket_id
      and res.storage_path = storage.objects.name
      and (
        (select private.is_general_admin())
        or (
          (select private.current_profile_role())
            = 'professional'::public.profile_role
          and (select private.can_manage_resource_row(res.client_id, res.area))
        )
        or (
          (select private.current_profile_role())
            = 'client'::public.profile_role
          and res.status = 'active'::public.resource_status
          and (
            res.client_id is null
            or res.client_id = (select auth.uid())
          )
          and (select private.client_has_service((select auth.uid()), res.area))
          and (
            res.folder_id is null
            or exists (
              select 1
              from public.resource_folders folder
              where folder.id = res.folder_id
                and folder.active is true
            )
          )
        )
      )
  )
);

create policy "resource_pdfs_update_managers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resource-pdfs'
  and exists (
    select 1
    from public.resources res
    where res.storage_bucket = storage.objects.bucket_id
      and res.storage_path = storage.objects.name
      and (select private.can_manage_resource_row(res.client_id, res.area))
  )
)
with check (
  bucket_id = 'resource-pdfs'
  and lower(storage.extension(name)) = 'pdf'
  and exists (
    select 1
    from public.resources res
    where res.storage_bucket = storage.objects.bucket_id
      and res.storage_path = storage.objects.name
      and (select private.can_manage_resource_row(res.client_id, res.area))
  )
);

create policy "resource_pdfs_delete_managers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resource-pdfs'
  and exists (
    select 1
    from public.resources res
    where res.storage_bucket = storage.objects.bucket_id
      and res.storage_path = storage.objects.name
      and (select private.can_manage_resource_row(res.client_id, res.area))
  )
);

create or replace function private.prevent_duplicate_active_meal_plan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.document_type = 'meal_plan'::public.nutrition_document_type
    and new.status = 'active'::public.nutrition_document_status then
    if new.client_id is null then
      raise exception 'Active meal plan documents require a client.'
        using errcode = '23514';
    end if;

    if exists (
      select 1
      from public.nutrition_documents document
      where document.id is distinct from new.id
        and document.client_id = new.client_id
        and document.document_type =
          'meal_plan'::public.nutrition_document_type
        and document.status = 'active'::public.nutrition_document_status
    ) then
      raise exception 'A client can only have one active nutrition PDF plan.'
        using errcode = '23505';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_duplicate_active_meal_plan()
  from public, anon, authenticated;

drop trigger if exists prevent_duplicate_active_meal_plan
  on public.nutrition_documents;
create trigger prevent_duplicate_active_meal_plan
before insert or update of document_type, client_id, status
  on public.nutrition_documents
for each row
execute function private.prevent_duplicate_active_meal_plan();

do $$
begin
  if exists (
    select 1
    from public.nutrition_documents document
    where document.document_type =
      'meal_plan'::public.nutrition_document_type
      and document.status = 'active'::public.nutrition_document_status
      and document.client_id is not null
    group by document.client_id
    having count(*) > 1
  ) then
    raise notice
      'Skipped nutrition_documents_one_active_meal_plan_per_client_idx because duplicate active meal plan PDFs exist. Run supabase/diagnostics/20260701000000_database_audit_phase_2_3.sql.';
  elsif to_regclass(
    'public.nutrition_documents_one_active_meal_plan_per_client_idx'
  ) is null then
    execute $idx$
      create unique index nutrition_documents_one_active_meal_plan_per_client_idx
      on public.nutrition_documents (client_id)
      where document_type = 'meal_plan'::public.nutrition_document_type
        and status = 'active'::public.nutrition_document_status
        and client_id is not null
    $idx$;
  end if;
end $$;

do $$
begin
  if to_regclass(
    'public.nutrition_documents_one_active_meal_plan_per_client_idx'
  ) is not null then
    comment on index
      public.nutrition_documents_one_active_meal_plan_per_client_idx
      is 'Guarantees at most one active nutrition PDF meal plan per client when existing data is clean.';
  end if;
end $$;

create or replace function private.validate_chat_conversation_relationship()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.chat_assignment_matches(
    new.client_id,
    new.professional_id,
    new.area
  ) then
    raise exception
      'Chat conversations must match an active client/professional assignment.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_chat_conversation_relationship()
  from public, anon, authenticated;

drop trigger if exists validate_chat_conversation_relationship
  on public.chat_conversations;
create trigger validate_chat_conversation_relationship
before insert or update of client_id, professional_id, area
  on public.chat_conversations
for each row
execute function private.validate_chat_conversation_relationship();

create or replace function private.validate_chat_message_sender()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
  v_professional_id uuid;
begin
  select
    conversation.client_id,
    conversation.professional_id
  into
    v_client_id,
    v_professional_id
  from public.chat_conversations conversation
  where conversation.id = new.conversation_id;

  if v_client_id is null then
    raise exception 'Chat messages require a valid conversation.'
      using errcode = '23503';
  end if;

  if new.sender_id not in (v_client_id, v_professional_id) then
    raise exception
      'Chat message sender must be one of the conversation participants.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_chat_message_sender()
  from public, anon, authenticated;

drop trigger if exists validate_chat_message_sender
  on public.chat_messages;
create trigger validate_chat_message_sender
before insert or update of conversation_id, sender_id
  on public.chat_messages
for each row
execute function private.validate_chat_message_sender();

create or replace function private.validate_habit_progress_assignment_client()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
begin
  select assignment.client_id
  into v_client_id
  from public.habit_assignments assignment
  where assignment.id = new.habit_assignment_id;

  if v_client_id is null then
    raise exception 'Habit progress requires a valid habit assignment.'
      using errcode = '23503';
  end if;

  if new.client_id <> v_client_id then
    raise exception
      'Habit progress client must match its habit assignment client.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_habit_progress_assignment_client()
  from public, anon, authenticated;

drop trigger if exists validate_habit_progress_assignment_client
  on public.habit_progress;
create trigger validate_habit_progress_assignment_client
before insert or update of habit_assignment_id, client_id
  on public.habit_progress
for each row
execute function private.validate_habit_progress_assignment_client();

notify pgrst, 'reload schema';

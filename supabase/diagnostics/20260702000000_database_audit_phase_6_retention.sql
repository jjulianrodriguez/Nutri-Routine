-- Database audit phase 6: retention, archive readiness, and orphan diagnostics.
-- Read-only by design. This file must not contain insert/update/delete/alter/drop/truncate.

-- 1. Clients assigned to inactive, missing, or wrong-scope professionals.
select
  'assigned_nutritionist' as assignment_type,
  client.profile_id as client_id,
  client.assigned_nutritionist_id as professional_id,
  professional_profile.role as professional_role,
  professional.specialty,
  professional.is_active,
  case
    when professional_profile.id is null then 'missing_profile'
    when professional_profile.role = 'admin'::public.profile_role then 'ok_admin_override'
    when professional_profile.role <> 'professional'::public.profile_role then 'wrong_role'
    when professional.profile_id is null then 'missing_professional_profile'
    when professional.is_active is not true then 'inactive_professional'
    when professional.specialty not in (
      'nutrition'::public.professional_specialty,
      'both'::public.professional_specialty
    ) then 'wrong_specialty'
    else 'unknown'
  end as issue
from public.client_profiles client
left join public.profiles professional_profile
  on professional_profile.id = client.assigned_nutritionist_id
left join public.professional_profiles professional
  on professional.profile_id = client.assigned_nutritionist_id
where client.assigned_nutritionist_id is not null
  and not (
    professional_profile.role = 'admin'::public.profile_role
    or (
      professional_profile.role = 'professional'::public.profile_role
      and professional.is_active is true
      and professional.specialty in (
        'nutrition'::public.professional_specialty,
        'both'::public.professional_specialty
      )
    )
  )
union all
select
  'assigned_trainer' as assignment_type,
  client.profile_id as client_id,
  client.assigned_trainer_id as professional_id,
  professional_profile.role as professional_role,
  professional.specialty,
  professional.is_active,
  case
    when professional_profile.id is null then 'missing_profile'
    when professional_profile.role = 'admin'::public.profile_role then 'ok_admin_override'
    when professional_profile.role <> 'professional'::public.profile_role then 'wrong_role'
    when professional.profile_id is null then 'missing_professional_profile'
    when professional.is_active is not true then 'inactive_professional'
    when professional.specialty not in (
      'training'::public.professional_specialty,
      'both'::public.professional_specialty
    ) then 'wrong_specialty'
    else 'unknown'
  end as issue
from public.client_profiles client
left join public.profiles professional_profile
  on professional_profile.id = client.assigned_trainer_id
left join public.professional_profiles professional
  on professional.profile_id = client.assigned_trainer_id
where client.assigned_trainer_id is not null
  and not (
    professional_profile.role = 'admin'::public.profile_role
    or (
      professional_profile.role = 'professional'::public.profile_role
      and professional.is_active is true
      and professional.specialty in (
        'training'::public.professional_specialty,
        'both'::public.professional_specialty
      )
    )
  )
order by assignment_type, client_id;

-- 2. Duplicate active plans. Workout plans should already be protected by
-- workout_plans_one_active_per_client_idx; this query confirms data health.
select
  'diet_plans' as source_table,
  client_id,
  count(*) as active_count,
  array_agg(id order by created_at desc) as row_ids
from public.diet_plans
where status = 'active'::public.plan_status
group by client_id
having count(*) > 1
union all
select
  'workout_plans' as source_table,
  client_id,
  count(*) as active_count,
  array_agg(id order by created_at desc) as row_ids
from public.workout_plans
where status = 'active'::public.plan_status
group by client_id
having count(*) > 1
order by source_table, client_id;

-- Active nutrition PDF meal-plan duplicates are plan-like and should stay zero
-- before relying on the partial unique index from phase 2/3.
select
  client_id,
  count(*) as active_meal_plan_pdfs,
  array_agg(id order by created_at desc) as document_ids
from public.nutrition_documents
where document_type = 'meal_plan'::public.nutrition_document_type
  and status = 'active'::public.nutrition_document_status
  and client_id is not null
group by client_id
having count(*) > 1
order by client_id;

-- 3. Resources without a valid owner/scope, invalid client, or invalid folder.
select
  resource.id,
  resource.area,
  resource.status,
  resource.kind,
  resource.uploaded_by,
  uploader.role as uploader_role,
  uploader_professional.specialty as uploader_specialty,
  uploader_professional.is_active as uploader_is_active,
  resource.client_id,
  client_profile.role as client_role,
  resource.folder_id,
  folder.active as folder_active,
  folder.area as folder_area,
  case
    when uploader.id is null then 'missing_uploader_profile'
    when resource.client_id is not null and client_profile.id is null then 'missing_client_profile'
    when resource.client_id is not null
      and client_profile.role <> 'client'::public.profile_role then 'client_wrong_role'
    when resource.folder_id is not null and folder.id is null then 'missing_folder'
    when folder.id is not null and folder.active is not true then 'inactive_folder'
    when folder.id is not null and folder.area <> resource.area then 'folder_area_mismatch'
    when uploader.role = 'admin'::public.profile_role then 'ok_admin_owner'
    when uploader.role <> 'professional'::public.profile_role then 'invalid_owner_role'
    when uploader_professional.profile_id is null then 'missing_owner_professional_profile'
    when uploader_professional.is_active is not true then 'inactive_owner'
    when not (
      uploader_professional.specialty = 'both'::public.professional_specialty
      or resource.area = 'general'::public.service_area
      or (
        resource.area = 'nutrition'::public.service_area
        and uploader_professional.specialty = 'nutrition'::public.professional_specialty
      )
      or (
        resource.area = 'training'::public.service_area
        and uploader_professional.specialty = 'training'::public.professional_specialty
      )
    ) then 'owner_wrong_specialty_for_area'
    else 'unknown'
  end as issue
from public.resources resource
left join public.profiles uploader
  on uploader.id = resource.uploaded_by
left join public.professional_profiles uploader_professional
  on uploader_professional.profile_id = resource.uploaded_by
left join public.profiles client_profile
  on client_profile.id = resource.client_id
left join public.resource_folders folder
  on folder.id = resource.folder_id
where uploader.id is null
  or not (
    uploader.role = 'admin'::public.profile_role
    or (
      uploader.role = 'professional'::public.profile_role
      and uploader_professional.is_active is true
      and (
        uploader_professional.specialty = 'both'::public.professional_specialty
        or resource.area = 'general'::public.service_area
        or (
          resource.area = 'nutrition'::public.service_area
          and uploader_professional.specialty =
            'nutrition'::public.professional_specialty
        )
        or (
          resource.area = 'training'::public.service_area
          and uploader_professional.specialty =
            'training'::public.professional_specialty
        )
      )
    )
  )
  or (
    resource.client_id is not null
    and (
      client_profile.id is null
      or client_profile.role <> 'client'::public.profile_role
    )
  )
  or (
    resource.folder_id is not null
    and (
      folder.id is null
      or folder.active is not true
      or folder.area <> resource.area
    )
  )
order by resource.created_at desc;

-- 4. Notifications without a valid recipient. Optional actor issues are reported
-- too because they can break activity context.
select
  notification.id,
  notification.recipient_id,
  recipient.role as recipient_role,
  notification.actor_id,
  actor.role as actor_role,
  notification.event_type,
  notification.created_at,
  notification.read_at,
  case
    when recipient.id is null then 'missing_recipient_profile'
    when notification.actor_id is not null and actor.id is null then 'missing_actor_profile'
    else 'unknown'
  end as issue
from public.notifications notification
left join public.profiles recipient
  on recipient.id = notification.recipient_id
left join public.profiles actor
  on actor.id = notification.actor_id
where recipient.id is null
  or (
    notification.actor_id is not null
    and actor.id is null
  )
order by notification.created_at desc;

-- 5. Messages with invalid conversations or invalid senders.
select
  message.id,
  message.conversation_id,
  message.sender_id,
  conversation.client_id,
  conversation.professional_id,
  conversation.area,
  message.created_at,
  message.deleted_at,
  case
    when conversation.id is null then 'missing_conversation'
    when sender.id is null then 'missing_sender_profile'
    when message.sender_id not in (
      conversation.client_id,
      conversation.professional_id
    ) then 'sender_not_conversation_participant'
    else 'unknown'
  end as issue
from public.chat_messages message
left join public.chat_conversations conversation
  on conversation.id = message.conversation_id
left join public.profiles sender
  on sender.id = message.sender_id
where conversation.id is null
  or sender.id is null
  or message.sender_id not in (
    conversation.client_id,
    conversation.professional_id
  )
order by message.created_at desc;

-- Conversation rows that are structurally invalid. These are not messages by
-- themselves, but they make any messages under them retention-sensitive.
select
  conversation.id,
  conversation.client_id,
  client_profile.role as client_role,
  conversation.professional_id,
  professional_profile.role as professional_role,
  professional.specialty,
  professional.is_active,
  conversation.area,
  conversation.created_at,
  case
    when client_profile.id is null then 'missing_client_profile'
    when client_profile.role <> 'client'::public.profile_role then 'client_wrong_role'
    when professional_profile.id is null then 'missing_professional_profile'
    when professional_profile.role = 'admin'::public.profile_role then 'ok_admin_override'
    when professional_profile.role <> 'professional'::public.profile_role then 'professional_wrong_role'
    when professional.is_active is not true then 'inactive_professional'
    when not (
      professional.specialty = 'both'::public.professional_specialty
      or (
        conversation.area = 'nutrition'::public.service_area
        and professional.specialty = 'nutrition'::public.professional_specialty
      )
      or (
        conversation.area = 'training'::public.service_area
        and professional.specialty = 'training'::public.professional_specialty
      )
    ) then 'professional_wrong_specialty_for_area'
    else 'unknown'
  end as issue
from public.chat_conversations conversation
left join public.profiles client_profile
  on client_profile.id = conversation.client_id
left join public.profiles professional_profile
  on professional_profile.id = conversation.professional_id
left join public.professional_profiles professional
  on professional.profile_id = conversation.professional_id
where client_profile.id is null
  or client_profile.role <> 'client'::public.profile_role
  or not (
    professional_profile.role = 'admin'::public.profile_role
    or (
      professional_profile.role = 'professional'::public.profile_role
      and professional.is_active is true
      and (
        professional.specialty = 'both'::public.professional_specialty
        or (
          conversation.area = 'nutrition'::public.service_area
          and professional.specialty = 'nutrition'::public.professional_specialty
        )
        or (
          conversation.area = 'training'::public.service_area
          and professional.specialty = 'training'::public.professional_specialty
        )
      )
    )
  )
order by conversation.created_at desc;

-- 6. Progress rows without a valid client, or with mismatched assignment/plan.
select
  'progress_entries' as source_table,
  entry.id,
  entry.client_id,
  entry.recorded_at as activity_at,
  case
    when client_profile.id is null then 'missing_client_profile'
    when client_profile.role <> 'client'::public.profile_role then 'client_wrong_role'
    else 'unknown'
  end as issue
from public.progress_entries entry
left join public.profiles client_profile
  on client_profile.id = entry.client_id
where client_profile.id is null
  or client_profile.role <> 'client'::public.profile_role
union all
select
  'habit_progress' as source_table,
  progress.id,
  progress.client_id,
  progress.date::timestamptz as activity_at,
  case
    when client_profile.id is null then 'missing_client_profile'
    when client_profile.role <> 'client'::public.profile_role then 'client_wrong_role'
    when assignment.id is null then 'missing_habit_assignment'
    when assignment.client_id <> progress.client_id then 'assignment_client_mismatch'
    else 'unknown'
  end as issue
from public.habit_progress progress
left join public.profiles client_profile
  on client_profile.id = progress.client_id
left join public.habit_assignments assignment
  on assignment.id = progress.habit_assignment_id
where client_profile.id is null
  or client_profile.role <> 'client'::public.profile_role
  or assignment.id is null
  or assignment.client_id <> progress.client_id
union all
select
  'workout_day_progress' as source_table,
  progress.id,
  progress.client_id,
  progress.workout_date::timestamptz as activity_at,
  case
    when client_profile.id is null then 'missing_client_profile'
    when client_profile.role <> 'client'::public.profile_role then 'client_wrong_role'
    when workout_plan.id is null then 'missing_workout_plan'
    when workout_plan.client_id <> progress.client_id then 'workout_plan_client_mismatch'
    else 'unknown'
  end as issue
from public.workout_day_progress progress
left join public.profiles client_profile
  on client_profile.id = progress.client_id
left join public.workout_plans workout_plan
  on workout_plan.id = progress.workout_plan_id
where client_profile.id is null
  or client_profile.role <> 'client'::public.profile_role
  or workout_plan.id is null
  or workout_plan.client_id <> progress.client_id
order by source_table, activity_at desc;

-- 7. Duplicate active assignments. Habit assignments have a partial unique
-- index, so any rows here indicate existing data drift or failed constraints.
select
  'habit_assignments' as source_table,
  client_id,
  habit_id::text as assignment_key,
  count(*) as active_count,
  array_agg(id order by created_at desc) as row_ids
from public.habit_assignments
where active is true
group by client_id, habit_id
having count(*) > 1
union all
select
  'chat_conversations' as source_table,
  client_id,
  professional_id::text || ':' || area::text as assignment_key,
  count(*) as active_count,
  array_agg(id order by created_at desc) as row_ids
from public.chat_conversations
group by client_id, professional_id, area
having count(*) > 1
order by source_table, client_id;

-- 8. Read-only growth snapshot for retention planning.
select
  source_table,
  count(*) as total_rows,
  count(*) filter (where activity_at >= now() - interval '30 days') as last_30_days,
  count(*) filter (where activity_at >= now() - interval '90 days') as last_90_days,
  count(*) filter (where activity_at < now() - interval '365 days') as older_than_365_days
from (
  select 'chat_messages' as source_table, created_at as activity_at
  from public.chat_messages
  union all
  select 'notifications', created_at
  from public.notifications
  union all
  select 'progress_entries', recorded_at
  from public.progress_entries
  union all
  select 'habit_progress', date::timestamptz
  from public.habit_progress
  union all
  select 'workout_day_progress', workout_date::timestamptz
  from public.workout_day_progress
  union all
  select 'resources', created_at
  from public.resources
  union all
  select 'nutrition_documents', created_at
  from public.nutrition_documents
  union all
  select 'habit_assignments', created_at
  from public.habit_assignments
  union all
  select 'workout_plans', created_at
  from public.workout_plans
  union all
  select 'diet_plans', created_at
  from public.diet_plans
) growth
group by source_table
order by source_table;

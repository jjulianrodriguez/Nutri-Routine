-- Database audit phase 2/3 diagnostics.
-- Read-only checks for RLS, grants, role/specialty scope, and relationship integrity.

with target_tables(table_name) as (
  values
    ('profiles'),
    ('client_profiles'),
    ('professional_profiles'),
    ('diet_plans'),
    ('nutrition_documents'),
    ('resources'),
    ('notifications'),
    ('chat_conversations'),
    ('chat_messages'),
    ('progress_entries'),
    ('habit_assignments'),
    ('habit_progress'),
    ('workout_plans'),
    ('routines'),
    ('exercises')
)
select
  target.table_name,
  coalesce(class.relrowsecurity, false) as rls_enabled,
  coalesce(class.relforcerowsecurity, false) as rls_forced
from target_tables target
left join pg_class class
  on class.relname = target.table_name
left join pg_namespace namespace
  on namespace.oid = class.relnamespace
  and namespace.nspname = 'public'
order by target.table_name;

select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles',
    'client_profiles',
    'professional_profiles',
    'diet_plans',
    'nutrition_documents',
    'resources',
    'notifications',
    'chat_conversations',
    'chat_messages',
    'progress_entries',
    'habit_assignments',
    'habit_progress',
    'workout_plans',
    'routines',
    'exercises'
  )
order by tablename, policyname;

select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name in (
    'profiles',
    'client_profiles',
    'professional_profiles',
    'diet_plans',
    'nutrition_documents',
    'resources',
    'notifications',
    'chat_conversations',
    'chat_messages',
    'progress_entries',
    'habit_assignments',
    'habit_progress',
    'workout_plans',
    'routines',
    'exercises'
  )
order by table_name, grantee, privilege_type;

select
  table_schema,
  table_name,
  column_name,
  grantee,
  privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name in (
    'profiles',
    'client_profiles',
    'professional_profiles',
    'diet_plans',
    'nutrition_documents',
    'resources',
    'notifications',
    'chat_conversations',
    'chat_messages',
    'progress_entries',
    'habit_assignments',
    'habit_progress',
    'workout_plans',
    'routines',
    'exercises'
  )
order by table_name, column_name, grantee, privilege_type;

-- Profiles without a backing auth user should be zero.
select profile.id, profile.role
from public.profiles profile
left join auth.users auth_user
  on auth_user.id = profile.id
where auth_user.id is null;

-- Role table mismatches should be zero.
select professional.profile_id, profile.role, professional.specialty, professional.is_active
from public.professional_profiles professional
left join public.profiles profile
  on profile.id = professional.profile_id
where profile.id is null
  or profile.role <> 'professional'::public.profile_role;

select client.profile_id, profile.role
from public.client_profiles client
left join public.profiles profile
  on profile.id = client.profile_id
where profile.id is null
  or profile.role <> 'client'::public.profile_role;

-- Assigned professionals that are inactive, missing, or have the wrong specialty.
select
  client.profile_id as client_id,
  client.assigned_nutritionist_id as professional_id,
  profile.role,
  professional.specialty,
  professional.is_active
from public.client_profiles client
left join public.profiles profile
  on profile.id = client.assigned_nutritionist_id
left join public.professional_profiles professional
  on professional.profile_id = client.assigned_nutritionist_id
where client.assigned_nutritionist_id is not null
  and not (
    profile.role = 'admin'::public.profile_role
    or (
      profile.role = 'professional'::public.profile_role
      and professional.is_active is true
      and professional.specialty in (
        'nutrition'::public.professional_specialty,
        'both'::public.professional_specialty
      )
    )
  );

select
  client.profile_id as client_id,
  client.assigned_trainer_id as professional_id,
  profile.role,
  professional.specialty,
  professional.is_active
from public.client_profiles client
left join public.profiles profile
  on profile.id = client.assigned_trainer_id
left join public.professional_profiles professional
  on professional.profile_id = client.assigned_trainer_id
where client.assigned_trainer_id is not null
  and not (
    profile.role = 'admin'::public.profile_role
    or (
      profile.role = 'professional'::public.profile_role
      and professional.is_active is true
      and professional.specialty in (
        'training'::public.professional_specialty,
        'both'::public.professional_specialty
      )
    )
  );

-- Nutrition plans linked to non-clients, invalid professionals, or unassigned professionals.
select
  plan.id,
  plan.client_id,
  client_profile.role as client_role,
  plan.nutritionist_id,
  nutritionist_profile.role as nutritionist_role,
  nutritionist.specialty,
  nutritionist.is_active,
  client_assignment.assigned_nutritionist_id
from public.diet_plans plan
left join public.profiles client_profile
  on client_profile.id = plan.client_id
left join public.client_profiles client_assignment
  on client_assignment.profile_id = plan.client_id
left join public.profiles nutritionist_profile
  on nutritionist_profile.id = plan.nutritionist_id
left join public.professional_profiles nutritionist
  on nutritionist.profile_id = plan.nutritionist_id
where client_profile.role is distinct from 'client'::public.profile_role
  or not (
    nutritionist_profile.role = 'admin'::public.profile_role
    or (
      nutritionist_profile.role = 'professional'::public.profile_role
      and nutritionist.is_active is true
      and nutritionist.specialty in (
        'nutrition'::public.professional_specialty,
        'both'::public.professional_specialty
      )
    )
  )
  or (
    plan.status = 'active'::public.plan_status
    and nutritionist_profile.role <> 'admin'::public.profile_role
    and client_assignment.assigned_nutritionist_id is distinct from plan.nutritionist_id
  );

-- Workout plans linked to non-clients, invalid professionals, duplicate active plans, or unassigned trainers.
select
  plan.id,
  plan.client_id,
  client_profile.role as client_role,
  plan.trainer_id,
  trainer_profile.role as trainer_role,
  trainer.specialty,
  trainer.is_active,
  client_assignment.assigned_trainer_id
from public.workout_plans plan
left join public.profiles client_profile
  on client_profile.id = plan.client_id
left join public.client_profiles client_assignment
  on client_assignment.profile_id = plan.client_id
left join public.profiles trainer_profile
  on trainer_profile.id = plan.trainer_id
left join public.professional_profiles trainer
  on trainer.profile_id = plan.trainer_id
where client_profile.role is distinct from 'client'::public.profile_role
  or not (
    trainer_profile.role = 'admin'::public.profile_role
    or (
      trainer_profile.role = 'professional'::public.profile_role
      and trainer.is_active is true
      and trainer.specialty in (
        'training'::public.professional_specialty,
        'both'::public.professional_specialty
      )
    )
  )
  or (
    plan.status = 'active'::public.plan_status
    and trainer_profile.role <> 'admin'::public.profile_role
    and client_assignment.assigned_trainer_id is distinct from plan.trainer_id
  );

select client_id, count(*) as active_workout_plans
from public.workout_plans
where status = 'active'::public.plan_status
group by client_id
having count(*) > 1;

-- Active nutrition PDF meal-plan duplicates. Run before relying on the partial unique index.
select client_id, count(*) as active_meal_plan_pdfs, array_agg(id order by created_at desc) as document_ids
from public.nutrition_documents
where document_type = 'meal_plan'::public.nutrition_document_type
  and status = 'active'::public.nutrition_document_status
  and client_id is not null
group by client_id
having count(*) > 1;

select
  document.id,
  document.document_type,
  document.status,
  document.client_id,
  client_profile.role as client_role,
  document.created_by,
  creator.role as creator_role,
  creator_professional.specialty,
  creator_professional.is_active
from public.nutrition_documents document
left join public.profiles client_profile
  on client_profile.id = document.client_id
left join public.profiles creator
  on creator.id = document.created_by
left join public.professional_profiles creator_professional
  on creator_professional.profile_id = document.created_by
where (
    document.document_type = 'meal_plan'::public.nutrition_document_type
    and client_profile.role is distinct from 'client'::public.profile_role
  )
  or not (
    creator.role = 'admin'::public.profile_role
    or (
      creator.role = 'professional'::public.profile_role
      and creator_professional.is_active is true
      and creator_professional.specialty in (
        'nutrition'::public.professional_specialty,
        'both'::public.professional_specialty
      )
    )
  );

-- Resource ownership and area/scope issues.
select
  resource.id,
  resource.area,
  resource.client_id,
  client_profile.role as client_role,
  resource.uploaded_by,
  uploader.role as uploader_role,
  uploader_professional.specialty,
  uploader_professional.is_active
from public.resources resource
left join public.profiles client_profile
  on client_profile.id = resource.client_id
left join public.profiles uploader
  on uploader.id = resource.uploaded_by
left join public.professional_profiles uploader_professional
  on uploader_professional.profile_id = resource.uploaded_by
left join public.client_profiles client_assignment
  on client_assignment.profile_id = resource.client_id
where (
    resource.client_id is not null
    and client_profile.role is distinct from 'client'::public.profile_role
  )
  or not (
    uploader.role = 'admin'::public.profile_role
    or (
      uploader.role = 'professional'::public.profile_role
      and uploader_professional.is_active is true
      and (
        uploader_professional.specialty = 'both'::public.professional_specialty
        or (
          resource.area = 'nutrition'::public.service_area
          and uploader_professional.specialty = 'nutrition'::public.professional_specialty
        )
        or (
          resource.area = 'training'::public.service_area
          and uploader_professional.specialty = 'training'::public.professional_specialty
        )
        or resource.area = 'general'::public.service_area
      )
    )
  )
  or (
    resource.client_id is not null
    and uploader.role <> 'admin'::public.profile_role
    and not (
      (
        resource.area = 'nutrition'::public.service_area
        and client_assignment.assigned_nutritionist_id = resource.uploaded_by
      )
      or (
        resource.area = 'training'::public.service_area
        and client_assignment.assigned_trainer_id = resource.uploaded_by
      )
      or (
        resource.area = 'general'::public.service_area
        and resource.uploaded_by in (
          client_assignment.assigned_nutritionist_id,
          client_assignment.assigned_trainer_id
        )
      )
    )
  );

select resource.id, resource.folder_id, resource.area, folder.area as folder_area, folder.active
from public.resources resource
join public.resource_folders folder
  on folder.id = resource.folder_id
where folder.area <> resource.area
  or folder.active is not true;

-- Notifications should always have valid recipients and optional valid actors.
select notification.id, notification.recipient_id, notification.actor_id
from public.notifications notification
left join public.profiles recipient
  on recipient.id = notification.recipient_id
left join public.profiles actor
  on actor.id = notification.actor_id
where recipient.id is null
  or (
    notification.actor_id is not null
    and actor.id is null
  );

-- Chat relationships and messages.
select
  conversation.id,
  conversation.client_id,
  client_profile.role as client_role,
  conversation.professional_id,
  professional_profile.role as professional_role,
  professional.specialty,
  professional.is_active,
  conversation.area
from public.chat_conversations conversation
left join public.profiles client_profile
  on client_profile.id = conversation.client_id
left join public.client_profiles client_assignment
  on client_assignment.profile_id = conversation.client_id
left join public.profiles professional_profile
  on professional_profile.id = conversation.professional_id
left join public.professional_profiles professional
  on professional.profile_id = conversation.professional_id
where client_profile.role is distinct from 'client'::public.profile_role
  or not (
    conversation.area in (
      'nutrition'::public.service_area,
      'training'::public.service_area
    )
  )
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
  or (
    conversation.area = 'nutrition'::public.service_area
    and client_assignment.assigned_nutritionist_id is distinct from conversation.professional_id
  )
  or (
    conversation.area = 'training'::public.service_area
    and client_assignment.assigned_trainer_id is distinct from conversation.professional_id
  );

select
  message.id,
  message.conversation_id,
  message.sender_id,
  conversation.client_id,
  conversation.professional_id
from public.chat_messages message
left join public.chat_conversations conversation
  on conversation.id = message.conversation_id
where conversation.id is null
  or message.sender_id not in (
    conversation.client_id,
    conversation.professional_id
  );

-- Progress and habits.
select
  entry.id,
  entry.client_id,
  client_profile.role as client_role,
  entry.recorded_by,
  recorder.role as recorder_role,
  recorder_professional.specialty,
  recorder_professional.is_active,
  entry.area
from public.progress_entries entry
left join public.profiles client_profile
  on client_profile.id = entry.client_id
left join public.profiles recorder
  on recorder.id = entry.recorded_by
left join public.professional_profiles recorder_professional
  on recorder_professional.profile_id = entry.recorded_by
left join public.client_profiles client_assignment
  on client_assignment.profile_id = entry.client_id
where client_profile.role is distinct from 'client'::public.profile_role
  or (
    entry.recorded_by is not null
    and recorder.role <> 'admin'::public.profile_role
    and entry.recorded_by <> entry.client_id
    and not (
      recorder.role = 'professional'::public.profile_role
      and recorder_professional.is_active is true
      and (
        (
          entry.area = 'nutrition'::public.service_area
          and recorder_professional.specialty in (
            'nutrition'::public.professional_specialty,
            'both'::public.professional_specialty
          )
          and client_assignment.assigned_nutritionist_id = entry.recorded_by
        )
        or (
          entry.area = 'training'::public.service_area
          and recorder_professional.specialty in (
            'training'::public.professional_specialty,
            'both'::public.professional_specialty
          )
          and client_assignment.assigned_trainer_id = entry.recorded_by
        )
        or (
          entry.area = 'general'::public.service_area
          and (
            client_assignment.assigned_nutritionist_id = entry.recorded_by
            or client_assignment.assigned_trainer_id = entry.recorded_by
          )
        )
      )
    )
  );

select client_id, habit_id, count(*) as active_assignments, array_agg(id order by created_at desc) as assignment_ids
from public.habit_assignments
where active is true
group by client_id, habit_id
having count(*) > 1;

select
  assignment.id,
  assignment.client_id,
  client_profile.role as client_role,
  assignment.assigned_by,
  assigner.role as assigner_role,
  assigner_professional.specialty,
  assigner_professional.is_active
from public.habit_assignments assignment
left join public.profiles client_profile
  on client_profile.id = assignment.client_id
left join public.profiles assigner
  on assigner.id = assignment.assigned_by
left join public.professional_profiles assigner_professional
  on assigner_professional.profile_id = assignment.assigned_by
left join public.client_profiles client_assignment
  on client_assignment.profile_id = assignment.client_id
where client_profile.role is distinct from 'client'::public.profile_role
  or not (
    assigner.role = 'admin'::public.profile_role
    or (
      assigner.role = 'professional'::public.profile_role
      and assigner_professional.is_active is true
      and assigner_professional.specialty in (
        'nutrition'::public.professional_specialty,
        'both'::public.professional_specialty
      )
      and client_assignment.assigned_nutritionist_id = assignment.assigned_by
    )
  );

select
  progress.id,
  progress.habit_assignment_id,
  progress.client_id as progress_client_id,
  assignment.client_id as assignment_client_id
from public.habit_progress progress
left join public.habit_assignments assignment
  on assignment.id = progress.habit_assignment_id
where assignment.id is null
  or progress.client_id <> assignment.client_id;

-- Catalog ownership role checks.
select exercise.id, exercise.created_by, profile.role, professional.specialty, professional.is_active
from public.exercises exercise
left join public.profiles profile
  on profile.id = exercise.created_by
left join public.professional_profiles professional
  on professional.profile_id = exercise.created_by
where not (
  profile.role = 'admin'::public.profile_role
  or (
    profile.role = 'professional'::public.profile_role
    and professional.is_active is true
    and professional.specialty in (
      'training'::public.professional_specialty,
      'both'::public.professional_specialty
    )
  )
);

select routine.id, routine.creator_id, profile.role, professional.specialty, professional.is_active
from public.routines routine
left join public.profiles profile
  on profile.id = routine.creator_id
left join public.professional_profiles professional
  on professional.profile_id = routine.creator_id
where not (
  profile.role = 'admin'::public.profile_role
  or (
    profile.role = 'professional'::public.profile_role
    and professional.is_active is true
    and professional.specialty in (
      'training'::public.professional_specialty,
      'both'::public.professional_specialty
    )
  )
);

set lock_timeout = '5s';
set statement_timeout = '30s';

create table if not exists public.user_settings (
  profile_id uuid primary key
    references public.profiles(id) on delete cascade,
  allow_assigned_professionals_personal_info boolean not null default true,
  allow_assigned_professionals_health_data boolean not null default true,
  allow_assigned_professionals_sensitive_notes boolean not null default true,
  notifications_enabled boolean not null default true,
  notify_messages boolean not null default true,
  notify_appointments boolean not null default true,
  notify_plan_changes boolean not null default true,
  notify_assignments boolean not null default true,
  theme text not null default 'light',
  text_size text not null default 'normal',
  reduced_motion boolean not null default false,
  time_format text not null default '24h',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_theme_check check (theme in ('light', 'dark')),
  constraint user_settings_text_size_check check (text_size in ('normal', 'large')),
  constraint user_settings_time_format_check check (time_format in ('12h', '24h'))
);

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();

insert into public.user_settings (profile_id)
select profile.id
from public.profiles profile
on conflict (profile_id) do nothing;

alter table public.user_settings enable row level security;

revoke all on public.user_settings from public, anon, authenticated;
grant select, insert, update on public.user_settings to authenticated;

drop policy if exists "user_settings_select_allowed" on public.user_settings;
create policy "user_settings_select_allowed"
on public.user_settings
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or (select private.is_general_admin())
  or (
    select private.is_client_assigned_to_current_professional(
      profile_id,
      'general'::public.service_area
    )
  )
);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
on public.user_settings
for insert
to authenticated
with check (profile_id = (select auth.uid()));

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
on public.user_settings
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

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
  v_event_type text := btrim(p_event_type);
  v_notification_id uuid;
  v_settings public.user_settings%rowtype;
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

  select *
  into v_settings
  from public.user_settings settings
  where settings.profile_id = p_recipient_id;

  if coalesce(v_settings.notifications_enabled, true) is false then
    return null;
  end if;

  if v_event_type like 'chat\_%' escape '\'
    and coalesce(v_settings.notify_messages, true) is false then
    return null;
  end if;

  if (
      v_event_type like 'appointment\_%' escape '\'
      or v_event_type like '%reminder%'
    )
    and coalesce(v_settings.notify_appointments, true) is false then
    return null;
  end if;

  if (
      v_event_type in (
        'nutrition_plan_activated',
        'nutrition_plan_archived',
        'nutrition_plan_deactivated',
        'training_plan_activated',
        'training_plan_deactivated',
        'workout_template_unassigned',
        'workout_template_updated',
        'routine_unassigned',
        'routine_updated'
      )
      or v_event_type like '%plan\_updated%' escape '\'
    )
    and coalesce(v_settings.notify_plan_changes, true) is false then
    return null;
  end if;

  if (
      v_event_type like '%\_assigned' escape '\'
      or v_event_type like '%professional\_%' escape '\'
      or v_event_type = 'resource_available'
    )
    and coalesce(v_settings.notify_assignments, true) is false then
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
    v_event_type,
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

notify pgrst, 'reload schema';

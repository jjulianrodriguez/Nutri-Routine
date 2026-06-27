set lock_timeout = '5s';
set statement_timeout = '30s';

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'resource_kind'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.resource_kind as enum (
      'external_link',
      'pdf'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'resource_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.resource_status as enum (
      'active',
      'inactive'
    );
  end if;
end $$;

grant usage on type public.resource_kind to authenticated;
grant usage on type public.resource_status to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'resource-pdfs',
  'resource-pdfs',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.resource_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  area public.service_area not null default 'general',
  created_by uuid not null references public.profiles(id) on delete restrict,
  active boolean not null default true,
  legacy_nutrition_folder_id uuid references public.nutrition_document_folders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resource_folders_legacy_nutrition_folder_id_key'
      and conrelid = 'public.resource_folders'::regclass
  ) then
    alter table public.resource_folders
      add constraint resource_folders_legacy_nutrition_folder_id_key
      unique (legacy_nutrition_folder_id);
  end if;
end $$;

alter table public.resource_folders
  drop constraint if exists resource_folders_name_length_check;
alter table public.resource_folders
  add constraint resource_folders_name_length_check
  check (char_length(btrim(name)) between 1 and 120) not valid;

alter table public.resource_folders
  drop constraint if exists resource_folders_description_length_check;
alter table public.resource_folders
  add constraint resource_folders_description_length_check
  check (
    description is null
    or char_length(btrim(description)) <= 500
  ) not valid;

alter table public.resources
  add column if not exists kind public.resource_kind not null default 'external_link';
alter table public.resources
  add column if not exists folder_id uuid;
alter table public.resources
  add column if not exists storage_bucket text;
alter table public.resources
  add column if not exists storage_path text;
alter table public.resources
  add column if not exists file_name text;
alter table public.resources
  add column if not exists file_size bigint;
alter table public.resources
  add column if not exists mime_type text;
alter table public.resources
  add column if not exists status public.resource_status not null default 'active';
alter table public.resources
  add column if not exists legacy_nutrition_document_id uuid;

alter table public.resources
  alter column file_url drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_folder_id_fkey'
      and conrelid = 'public.resources'::regclass
  ) then
    alter table public.resources
      add constraint resources_folder_id_fkey
      foreign key (folder_id)
      references public.resource_folders(id)
      on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_legacy_nutrition_document_id_fkey'
      and conrelid = 'public.resources'::regclass
  ) then
    alter table public.resources
      add constraint resources_legacy_nutrition_document_id_fkey
      foreign key (legacy_nutrition_document_id)
      references public.nutrition_documents(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_legacy_nutrition_document_id_key'
      and conrelid = 'public.resources'::regclass
  ) then
    alter table public.resources
      add constraint resources_legacy_nutrition_document_id_key
      unique (legacy_nutrition_document_id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'resources_storage_object_key'
      and conrelid = 'public.resources'::regclass
  ) then
    alter table public.resources
      add constraint resources_storage_object_key
      unique (storage_bucket, storage_path);
  end if;
end $$;

alter table public.resources
  drop constraint if exists resources_external_url_check;
alter table public.resources
  add constraint resources_external_url_check
  check (
    kind <> 'external_link'::public.resource_kind
    or (
      file_url is not null
      and char_length(btrim(file_url)) between 1 and 2048
      and btrim(file_url) ~* '^https?://[^[:space:]]+$'
    )
  ) not valid;

alter table public.resources
  drop constraint if exists resources_pdf_metadata_check;
alter table public.resources
  add constraint resources_pdf_metadata_check
  check (
    (
      kind = 'external_link'::public.resource_kind
      and folder_id is null
      and storage_bucket is null
      and storage_path is null
      and file_name is null
      and file_size is null
      and mime_type is null
    )
    or (
      kind = 'pdf'::public.resource_kind
      and file_url is null
      and storage_bucket is not null
      and storage_path is not null
      and file_name is not null
      and file_size is not null
      and mime_type = 'application/pdf'
    )
  ) not valid;

alter table public.resources
  drop constraint if exists resources_pdf_size_check;
alter table public.resources
  add constraint resources_pdf_size_check
  check (
    kind <> 'pdf'::public.resource_kind
    or (file_size > 0 and file_size <= 10485760)
  ) not valid;

alter table public.resources
  drop constraint if exists resources_pdf_extension_check;
alter table public.resources
  add constraint resources_pdf_extension_check
  check (
    kind <> 'pdf'::public.resource_kind
    or (
      lower(file_name) like '%.pdf'
      and lower(storage_path) like '%.pdf'
    )
  ) not valid;

create index if not exists idx_resource_folders_area
  on public.resource_folders(area);
create index if not exists idx_resource_folders_active
  on public.resource_folders(active);
create index if not exists idx_resource_folders_created_by
  on public.resource_folders(created_by);
create index if not exists idx_resources_folder
  on public.resources(folder_id);
create index if not exists idx_resources_kind_status
  on public.resources(kind, status);

drop trigger if exists set_resource_folders_updated_at
  on public.resource_folders;
create trigger set_resource_folders_updated_at
before update on public.resource_folders
for each row
execute function public.set_updated_at();

create or replace function private.prepare_resource_folder()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name := btrim(new.name);
  new.description := nullif(btrim(coalesce(new.description, '')), '');

  if tg_op = 'UPDATE' then
    new.area := old.area;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.legacy_nutrition_folder_id := old.legacy_nutrition_folder_id;
  end if;

  return new;
end;
$$;

create or replace function private.prepare_resource()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_folder_area public.service_area;
begin
  new.title := btrim(new.title);
  new.description := nullif(btrim(coalesce(new.description, '')), '');
  new.file_url := nullif(btrim(coalesce(new.file_url, '')), '');
  new.storage_bucket := nullif(btrim(coalesce(new.storage_bucket, '')), '');
  new.storage_path := nullif(btrim(coalesce(new.storage_path, '')), '');
  new.file_name := nullif(btrim(coalesce(new.file_name, '')), '');
  new.mime_type := nullif(btrim(coalesce(new.mime_type, '')), '');

  if tg_op = 'UPDATE' then
    new.kind := old.kind;
    new.uploaded_by := old.uploaded_by;
    new.client_id := old.client_id;
    new.created_at := old.created_at;

    if old.legacy_nutrition_document_id is not null
      and new.storage_path is distinct from old.storage_path then
      new.legacy_nutrition_document_id := null;
    else
      new.legacy_nutrition_document_id := old.legacy_nutrition_document_id;
    end if;
  end if;

  if new.kind = 'external_link'::public.resource_kind then
    new.folder_id := null;
    new.storage_bucket := null;
    new.storage_path := null;
    new.file_name := null;
    new.file_size := null;
    new.mime_type := null;
  else
    new.file_url := null;
    new.storage_bucket := coalesce(new.storage_bucket, 'resource-pdfs');
    new.mime_type := 'application/pdf';

    if new.folder_id is not null then
      select folder.area
      into v_folder_area
      from public.resource_folders folder
      where folder.id = new.folder_id;

      if v_folder_area is null then
        raise exception 'La carpeta seleccionada no existe.';
      end if;

      if v_folder_area <> new.area then
        raise exception 'La carpeta seleccionada no pertenece al area del recurso.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prepare_resource_folder
  on public.resource_folders;
create trigger prepare_resource_folder
before insert or update on public.resource_folders
for each row
execute function private.prepare_resource_folder();

drop trigger if exists prepare_resource on public.resources;
create trigger prepare_resource
before insert or update on public.resources
for each row
execute function private.prepare_resource();

revoke all on function private.prepare_resource_folder()
  from public, anon, authenticated;
revoke all on function private.prepare_resource()
  from public, anon, authenticated;

alter table public.resource_folders enable row level security;
alter table public.resources enable row level security;

revoke all on public.resource_folders from anon;
revoke all on public.resource_folders from authenticated;

grant select on public.resource_folders to authenticated;
grant insert (
  name,
  description,
  area,
  created_by,
  active
) on public.resource_folders to authenticated;
grant update (
  name,
  description,
  active
) on public.resource_folders to authenticated;
grant delete on public.resource_folders to authenticated;

grant select on public.resources to authenticated;
grant insert (
  area,
  client_id,
  description,
  file_name,
  file_size,
  file_url,
  folder_id,
  kind,
  mime_type,
  status,
  storage_bucket,
  storage_path,
  title,
  uploaded_by
) on public.resources to authenticated;
grant update (
  area,
  description,
  file_name,
  file_size,
  file_url,
  folder_id,
  mime_type,
  status,
  storage_bucket,
  storage_path,
  title
) on public.resources to authenticated;
grant delete on public.resources to authenticated;

drop policy if exists "resource_folders_select_allowed"
  on public.resource_folders;
drop policy if exists "resource_folders_insert_managers"
  on public.resource_folders;
drop policy if exists "resource_folders_update_managers"
  on public.resource_folders;
drop policy if exists "resource_folders_delete_managers"
  on public.resource_folders;

create policy "resource_folders_select_allowed"
on public.resource_folders
for select
to authenticated
using (
  (select private.is_general_admin())
  or (
    (select private.current_profile_role())
      = 'professional'::public.profile_role
    and (select private.can_manage_resource_area(area))
  )
  or (
    active is true
    and (select private.client_has_service((select auth.uid()), area))
  )
);

create policy "resource_folders_insert_managers"
on public.resource_folders
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.can_manage_resource_area(area))
);

create policy "resource_folders_update_managers"
on public.resource_folders
for update
to authenticated
using ((select private.can_manage_resource_area(area)))
with check ((select private.can_manage_resource_area(area)));

create policy "resource_folders_delete_managers"
on public.resource_folders
for delete
to authenticated
using ((select private.can_manage_resource_area(area)));

drop policy if exists "resources_select_allowed_accounts"
  on public.resources;
drop policy if exists "resources_insert_admins"
  on public.resources;
drop policy if exists "resources_update_admins"
  on public.resources;
drop policy if exists "resources_delete_admins"
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
    and (
      select private.client_has_service(
        (select auth.uid()),
        area
      )
    )
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
    and (select private.can_manage_resource_area(area))
  )
);

create policy "resources_insert_authorized_managers"
on public.resources
for insert
to authenticated
with check (
  (select private.can_manage_resource_area(area))
  and uploaded_by = (select auth.uid())
);

create policy "resources_update_authorized_managers"
on public.resources
for update
to authenticated
using ((select private.can_manage_resource_area(area)))
with check ((select private.can_manage_resource_area(area)));

create policy "resources_delete_authorized_managers"
on public.resources
for delete
to authenticated
using ((select private.can_manage_resource_area(area)));

drop policy if exists "resource_pdfs_select_allowed"
  on storage.objects;
drop policy if exists "resource_pdfs_insert_managers"
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
          and (select private.can_manage_resource_area(res.area))
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

create policy "resource_pdfs_insert_managers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resource-pdfs'
  and lower(storage.extension(name)) = 'pdf'
  and (select private.can_manage_resource_area('general'::public.service_area))
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
      and (select private.can_manage_resource_area(res.area))
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
      and (select private.can_manage_resource_area(res.area))
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
      and (select private.can_manage_resource_area(res.area))
  )
);

create or replace function private.notify_resource_available()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
begin
  if new.status <> 'active'::public.resource_status then
    return new;
  end if;

  if new.legacy_nutrition_document_id is not null then
    return new;
  end if;

  if new.client_id is not null then
    perform private.create_notification(
      new.client_id,
      'resource_available',
      format('Tienes disponible el recurso "%s".', new.title),
      '/app/recursos',
      jsonb_build_object(
        'area', new.area,
        'kind', new.kind,
        'resourceId', new.id
      ),
      v_actor_id
    );

    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    event_type,
    message,
    destination_path,
    metadata
  )
  select
    client_profile.profile_id,
    v_actor_id,
    'resource_available',
    format('Tienes disponible el recurso "%s".', new.title),
    '/app/recursos',
    jsonb_build_object(
      'area', new.area,
      'kind', new.kind,
      'resourceId', new.id
    )
  from public.client_profiles client_profile
  where client_profile.profile_id is distinct from v_actor_id
    and (
      (
        new.area = 'nutrition'::public.service_area
        and client_profile.assigned_nutritionist_id is not null
      )
      or (
        new.area = 'training'::public.service_area
        and client_profile.assigned_trainer_id is not null
      )
      or (
        new.area = 'general'::public.service_area
        and (
          client_profile.assigned_nutritionist_id is not null
          or client_profile.assigned_trainer_id is not null
        )
      )
    );

  return new;
end;
$$;

revoke all on function private.notify_resource_available()
  from public, anon, authenticated;

insert into public.resource_folders (
  name,
  description,
  area,
  created_by,
  active,
  legacy_nutrition_folder_id,
  created_at,
  updated_at
)
select
  folder.name,
  null,
  'nutrition'::public.service_area,
  folder.created_by,
  folder.active,
  folder.id,
  folder.created_at,
  folder.updated_at
from public.nutrition_document_folders folder
on conflict (legacy_nutrition_folder_id) do nothing;

insert into public.resources (
  title,
  description,
  area,
  kind,
  folder_id,
  storage_bucket,
  storage_path,
  file_name,
  file_size,
  mime_type,
  uploaded_by,
  status,
  legacy_nutrition_document_id,
  created_at,
  updated_at
)
select
  document.title,
  document.description,
  'nutrition'::public.service_area,
  'pdf'::public.resource_kind,
  folder.id,
  'nutrition-pdfs',
  document.storage_path,
  document.file_name,
  document.file_size,
  document.mime_type,
  document.created_by,
  case
    when document.status = 'inactive'::public.nutrition_document_status then 'inactive'::public.resource_status
    else 'active'::public.resource_status
  end,
  document.id,
  document.created_at,
  document.updated_at
from public.nutrition_documents document
join public.resource_folders folder
  on folder.legacy_nutrition_folder_id = document.folder_id
where document.document_type = 'educational_library'::public.nutrition_document_type
on conflict (legacy_nutrition_document_id) do nothing;

notify pgrst, 'reload schema';

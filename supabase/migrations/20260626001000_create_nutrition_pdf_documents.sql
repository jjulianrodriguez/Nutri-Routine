set lock_timeout = '5s';
set statement_timeout = '30s';

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'nutrition_document_type'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.nutrition_document_type as enum (
      'meal_plan',
      'educational_library'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'nutrition_document_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.nutrition_document_status as enum (
      'active',
      'inactive'
    );
  end if;
end $$;

grant usage on type public.nutrition_document_type to authenticated;
grant usage on type public.nutrition_document_status to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'nutrition-pdfs',
  'nutrition-pdfs',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.nutrition_document_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_document_folders_name_length_check
    check (char_length(btrim(name)) between 1 and 120)
);

create table if not exists public.nutrition_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  document_type public.nutrition_document_type not null,
  folder_id uuid references public.nutrition_document_folders(id) on delete restrict,
  client_id uuid references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  status public.nutrition_document_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nutrition_documents_title_length_check
    check (char_length(btrim(title)) between 1 and 180),
  constraint nutrition_documents_description_length_check
    check (description is null or char_length(btrim(description)) <= 2000),
  constraint nutrition_documents_pdf_mime_check
    check (mime_type = 'application/pdf'),
  constraint nutrition_documents_pdf_extension_check
    check (lower(file_name) like '%.pdf' and lower(storage_path) like '%.pdf'),
  constraint nutrition_documents_file_size_check
    check (file_size > 0 and file_size <= 10485760),
  constraint nutrition_documents_type_scope_check
    check (
      (
        document_type = 'meal_plan'::public.nutrition_document_type
        and client_id is not null
        and folder_id is null
      )
      or (
        document_type = 'educational_library'::public.nutrition_document_type
        and client_id is null
        and folder_id is not null
      )
    )
);

create index if not exists idx_nutrition_document_folders_active
  on public.nutrition_document_folders(active);
create index if not exists idx_nutrition_documents_type_status
  on public.nutrition_documents(document_type, status);
create index if not exists idx_nutrition_documents_client
  on public.nutrition_documents(client_id);
create index if not exists idx_nutrition_documents_folder
  on public.nutrition_documents(folder_id);
create index if not exists idx_nutrition_documents_created_by
  on public.nutrition_documents(created_by);

drop trigger if exists set_nutrition_document_folders_updated_at
  on public.nutrition_document_folders;
create trigger set_nutrition_document_folders_updated_at
before update on public.nutrition_document_folders
for each row
execute function public.set_updated_at();

drop trigger if exists set_nutrition_documents_updated_at
  on public.nutrition_documents;
create trigger set_nutrition_documents_updated_at
before update on public.nutrition_documents
for each row
execute function public.set_updated_at();

create or replace function private.prepare_nutrition_document_folder()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name := btrim(new.name);

  if tg_op = 'UPDATE' then
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

create or replace function private.prepare_nutrition_document()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.title := btrim(new.title);
  new.description := nullif(btrim(coalesce(new.description, '')), '');
  new.file_name := btrim(new.file_name);
  new.storage_path := btrim(new.storage_path);

  if tg_op = 'UPDATE' then
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.document_type := old.document_type;
    new.client_id := old.client_id;

    if old.document_type = 'meal_plan'::public.nutrition_document_type then
      new.folder_id := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prepare_nutrition_document_folder
  on public.nutrition_document_folders;
create trigger prepare_nutrition_document_folder
before insert or update on public.nutrition_document_folders
for each row
execute function private.prepare_nutrition_document_folder();

drop trigger if exists prepare_nutrition_document
  on public.nutrition_documents;
create trigger prepare_nutrition_document
before insert or update on public.nutrition_documents
for each row
execute function private.prepare_nutrition_document();

create or replace function private.can_manage_nutrition_documents()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_general_admin())
    or (select private.has_specialty('nutrition'::public.professional_specialty))
$$;

create or replace function private.can_manage_nutrition_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_general_admin())
    or (
      (select private.has_specialty('nutrition'::public.professional_specialty))
      and exists (
        select 1
        from public.client_profiles client_profile
        where client_profile.profile_id = target_client_id
          and client_profile.assigned_nutritionist_id = (select auth.uid())
      )
    )
$$;

revoke all on function private.prepare_nutrition_document_folder()
  from public, anon, authenticated;
revoke all on function private.prepare_nutrition_document()
  from public, anon, authenticated;
revoke all on function private.can_manage_nutrition_documents()
  from public, anon, authenticated;
revoke all on function private.can_manage_nutrition_client(uuid)
  from public, anon, authenticated;

grant execute on function private.can_manage_nutrition_documents()
  to authenticated;
grant execute on function private.can_manage_nutrition_client(uuid)
  to authenticated;

alter table public.nutrition_document_folders enable row level security;
alter table public.nutrition_documents enable row level security;

revoke all on public.nutrition_document_folders from anon;
revoke all on public.nutrition_document_folders from authenticated;
revoke all on public.nutrition_documents from anon;
revoke all on public.nutrition_documents from authenticated;

grant select on public.nutrition_document_folders to authenticated;
grant insert (name, created_by, active)
  on public.nutrition_document_folders to authenticated;
grant update (name, active)
  on public.nutrition_document_folders to authenticated;
grant delete on public.nutrition_document_folders to authenticated;

grant select on public.nutrition_documents to authenticated;
grant insert (
  title,
  description,
  document_type,
  folder_id,
  client_id,
  storage_path,
  file_name,
  file_size,
  mime_type,
  created_by,
  status
) on public.nutrition_documents to authenticated;
grant update (
  title,
  description,
  folder_id,
  storage_path,
  file_name,
  file_size,
  mime_type,
  status
) on public.nutrition_documents to authenticated;
grant delete on public.nutrition_documents to authenticated;

drop policy if exists "nutrition_document_folders_select_allowed"
  on public.nutrition_document_folders;
drop policy if exists "nutrition_document_folders_insert_managers"
  on public.nutrition_document_folders;
drop policy if exists "nutrition_document_folders_update_managers"
  on public.nutrition_document_folders;
drop policy if exists "nutrition_document_folders_delete_managers"
  on public.nutrition_document_folders;

create policy "nutrition_document_folders_select_allowed"
on public.nutrition_document_folders
for select
to authenticated
using (
  (select private.can_manage_nutrition_documents())
  or (
    active is true
    and (select private.client_has_service(
      (select auth.uid()),
      'nutrition'::public.service_area
    ))
  )
);

create policy "nutrition_document_folders_insert_managers"
on public.nutrition_document_folders
for insert
to authenticated
with check (
  (select private.can_manage_nutrition_documents())
  and created_by = (select auth.uid())
);

create policy "nutrition_document_folders_update_managers"
on public.nutrition_document_folders
for update
to authenticated
using ((select private.can_manage_nutrition_documents()))
with check ((select private.can_manage_nutrition_documents()));

create policy "nutrition_document_folders_delete_managers"
on public.nutrition_document_folders
for delete
to authenticated
using ((select private.can_manage_nutrition_documents()));

drop policy if exists "nutrition_documents_select_allowed"
  on public.nutrition_documents;
drop policy if exists "nutrition_documents_insert_managers"
  on public.nutrition_documents;
drop policy if exists "nutrition_documents_update_managers"
  on public.nutrition_documents;
drop policy if exists "nutrition_documents_delete_managers"
  on public.nutrition_documents;

create policy "nutrition_documents_select_allowed"
on public.nutrition_documents
for select
to authenticated
using (
  (select private.is_general_admin())
  or (
    document_type = 'meal_plan'::public.nutrition_document_type
    and (select private.can_manage_nutrition_client(client_id))
  )
  or (
    document_type = 'educational_library'::public.nutrition_document_type
    and (select private.can_manage_nutrition_documents())
  )
  or (
    status = 'active'::public.nutrition_document_status
    and (
      (
        document_type = 'meal_plan'::public.nutrition_document_type
        and client_id = (select auth.uid())
      )
      or (
        document_type = 'educational_library'::public.nutrition_document_type
        and (select private.client_has_service(
          (select auth.uid()),
          'nutrition'::public.service_area
        ))
      )
    )
  )
);

create policy "nutrition_documents_insert_managers"
on public.nutrition_documents
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (
    (
      document_type = 'meal_plan'::public.nutrition_document_type
      and (select private.can_manage_nutrition_client(client_id))
    )
    or (
      document_type = 'educational_library'::public.nutrition_document_type
      and (select private.can_manage_nutrition_documents())
    )
  )
);

create policy "nutrition_documents_update_managers"
on public.nutrition_documents
for update
to authenticated
using (
  (
    document_type = 'meal_plan'::public.nutrition_document_type
    and (select private.can_manage_nutrition_client(client_id))
  )
  or (
    document_type = 'educational_library'::public.nutrition_document_type
    and (select private.can_manage_nutrition_documents())
  )
)
with check (
  (
    document_type = 'meal_plan'::public.nutrition_document_type
    and (select private.can_manage_nutrition_client(client_id))
  )
  or (
    document_type = 'educational_library'::public.nutrition_document_type
    and (select private.can_manage_nutrition_documents())
  )
);

create policy "nutrition_documents_delete_managers"
on public.nutrition_documents
for delete
to authenticated
using (
  (
    document_type = 'meal_plan'::public.nutrition_document_type
    and (select private.can_manage_nutrition_client(client_id))
  )
  or (
    document_type = 'educational_library'::public.nutrition_document_type
    and (select private.can_manage_nutrition_documents())
  )
);

drop policy if exists "nutrition_pdfs_select_allowed"
  on storage.objects;
drop policy if exists "nutrition_pdfs_insert_managers"
  on storage.objects;
drop policy if exists "nutrition_pdfs_update_managers"
  on storage.objects;
drop policy if exists "nutrition_pdfs_delete_managers"
  on storage.objects;

create policy "nutrition_pdfs_select_allowed"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'nutrition-pdfs'
  and (
    (select private.is_general_admin())
    or exists (
      select 1
      from public.nutrition_documents document
      where document.storage_path = storage.objects.name
        and (
          (
            document.document_type = 'meal_plan'::public.nutrition_document_type
            and (select private.can_manage_nutrition_client(document.client_id))
          )
          or (
            document.document_type = 'educational_library'::public.nutrition_document_type
            and (select private.can_manage_nutrition_documents())
          )
        )
    )
    or exists (
      select 1
      from public.nutrition_documents document
      where document.storage_path = storage.objects.name
        and document.status = 'active'::public.nutrition_document_status
        and (
          (
            document.document_type = 'meal_plan'::public.nutrition_document_type
            and document.client_id = (select auth.uid())
          )
          or (
            document.document_type = 'educational_library'::public.nutrition_document_type
            and (select private.client_has_service(
              (select auth.uid()),
              'nutrition'::public.service_area
            ))
          )
        )
    )
  )
);

create policy "nutrition_pdfs_insert_managers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'nutrition-pdfs'
  and lower(storage.extension(name)) = 'pdf'
  and (select private.can_manage_nutrition_documents())
);

create policy "nutrition_pdfs_update_managers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'nutrition-pdfs'
  and (select private.can_manage_nutrition_documents())
)
with check (
  bucket_id = 'nutrition-pdfs'
  and lower(storage.extension(name)) = 'pdf'
  and (select private.can_manage_nutrition_documents())
);

create policy "nutrition_pdfs_delete_managers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'nutrition-pdfs'
  and (select private.can_manage_nutrition_documents())
);

notify pgrst, 'reload schema';

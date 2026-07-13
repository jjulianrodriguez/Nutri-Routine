set lock_timeout = '5s';
set statement_timeout = '30s';

alter table public.resources
  drop constraint if exists resources_pdf_metadata_check;
alter table public.resources
  add constraint resources_pdf_metadata_check
  check (
    (
      kind = 'external_link'::public.resource_kind
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

  if new.kind = 'external_link'::public.resource_kind then
    new.storage_bucket := null;
    new.storage_path := null;
    new.file_name := null;
    new.file_size := null;
    new.mime_type := null;
  else
    new.file_url := null;
    new.storage_bucket := coalesce(new.storage_bucket, 'resource-pdfs');
    new.mime_type := 'application/pdf';
  end if;

  return new;
end;
$$;

comment on function private.prepare_resource() is
  'Normalizes resource rows and validates optional folders for both PDFs and external links.';

notify pgrst, 'reload schema';

-- Phase 4/5 database audit: indexes for real list filters and ordered reads.
-- This migration intentionally avoids RLS, permissions, and functional schema changes.

create index if not exists resources_area_status_updated_at_idx
  on public.resources (area, status, updated_at desc);

create index if not exists resources_folder_status_updated_at_idx
  on public.resources (folder_id, status, updated_at desc)
  where folder_id is not null;

create index if not exists nutrition_documents_client_type_status_created_at_idx
  on public.nutrition_documents (client_id, document_type, status, created_at desc)
  where client_id is not null;

create index if not exists progress_entries_client_area_recorded_at_idx
  on public.progress_entries (client_id, area, recorded_at desc);

create index if not exists habit_assignments_client_dates_idx
  on public.habit_assignments (client_id, start_date, end_date);

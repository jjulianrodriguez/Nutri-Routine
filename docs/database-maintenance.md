# Database maintenance: retention, archive readiness, and orphan diagnostics

Scope: phase 6 of the database audit. This document is intentionally limited to
diagnosis, retention strategy, and safe future migration proposals.

Guarantees for this phase:

- No data deletion was performed.
- No `delete`, destructive `update`, truncation, database reset, or remote
  Supabase command was run.
- No UI, RLS policy, or remote database change is included here.
- The diagnostic SQL file is read-only: `supabase/diagnostics/20260702000000_database_audit_phase_6_retention.sql`.

## Existing archive/status fields

| Area | Existing fields | Current safe use |
| --- | --- | --- |
| Chat messages | `deleted_at` | Use only for user/message soft-delete semantics. Do not reuse it as retention archive state. |
| Notifications | `read_at` | Candidate filter for old read notifications. No archive timestamp exists yet. |
| Diet/workout plans | `status` = `draft`, `active`, `archived` | Use `archived` for inactive/old plan assignments. |
| Resources | `status` = `active`, `inactive` | Use `inactive` to hide/retire resources without deleting metadata or storage objects. |
| Nutrition PDFs | `status` = `active`, `inactive` | Use `inactive` to retire old PDFs without deleting rows or files. |
| Habits | `active` | Use `false` for retired catalog habits. |
| Habit assignments | `active`, `end_date` | Use `active = false` and `end_date` for inactive assignments. |
| Resource/document folders | `active` | Use `false` to retire folders without deleting contained metadata. |
| Progress history | none | Keep raw history unless a later migration adds explicit archive metadata. |

## Diagnostic queries

Run the read-only diagnostic SQL locally or paste it into a read-only SQL session:

```text
supabase/diagnostics/20260702000000_database_audit_phase_6_retention.sql
```

The file checks:

- Clients assigned to inactive, missing, wrong-role, or wrong-specialty professionals.
- Duplicate active rows in `diet_plans` and `workout_plans`.
- Duplicate active meal-plan PDFs in `nutrition_documents`.
- Resources with missing/invalid owners, invalid clients, inactive/mismatched folders, or wrong professional scope.
- Notifications with missing recipients or missing optional actors.
- Chat messages with missing conversations, missing senders, or senders outside the conversation.
- Chat conversations with invalid client/professional relationships.
- Progress rows in `progress_entries`, `habit_progress`, and `workout_day_progress` without a valid client or with mismatched assignment/plan.
- Duplicate active `habit_assignments` and duplicate client/professional/area chat conversations.
- Growth snapshots for the high-volume tables.

Expected result for orphan/duplicate diagnostics: zero rows unless legacy data
already drifted before constraints existed.

## Retention strategy

| Data area | Hot retention | Archive candidate | Safe action now | Later action if product approves |
| --- | --- | --- | --- | --- |
| Messages | 12-24 months in normal reads | `chat_messages.created_at < now() - interval '24 months'` and `deleted_at is null` | Diagnose volume only. Do not set `deleted_at` for retention. | Add `archived_at`; update app reads to exclude archived rows where appropriate. |
| Notifications | 90-180 days for read notifications | `read_at is not null` and `created_at < now() - interval '180 days'` | Diagnose volume only. Keep unread notifications. | Add `archived_at`; optionally archive old read rows in batches. |
| Progress history | Keep raw history at least 24-36 months | Very old `progress_entries`, `habit_progress`, `workout_day_progress` | Keep raw data; it is user health/training history. | Add archive metadata or summary tables before hiding old raw rows. |
| Habit assignments | Active/current plus recent inactive | `active is false` and `coalesce(end_date, updated_at::date) < current_date - interval '365 days'` | Use existing `active`/`end_date`; no delete. | Add `archived_at` for auditability if inactive rows become noisy. |
| Resources | Active user-facing resources | `status = 'inactive'` and old `updated_at` | Use `status = 'inactive'`; preserve row and storage metadata. | Add `archived_at`; review storage cleanup separately with manual approval. |
| Nutrition PDFs | Active PDFs plus relevant historical PDFs | `status = 'inactive'` and old `updated_at` | Use `status = 'inactive'`; do not delete storage objects. | Add `archived_at`; only delete objects after an explicit legal/product policy. |
| Old plan assignments | Current active plan plus archived history | `status = 'archived'` and old `updated_at` | Use existing `status = 'archived'`. | Add `archived_at` to preserve when archival happened. |

## Safe migration proposal, not applied

The current schema has status/active fields for several entities, but lacks a
consistent `archived_at` timestamp. If the product needs a true archive state,
use an additive migration like this. It does not delete data and does not modify
RLS.

```sql
alter table public.chat_messages
  add column if not exists archived_at timestamptz;

alter table public.notifications
  add column if not exists archived_at timestamptz;

alter table public.progress_entries
  add column if not exists archived_at timestamptz;

alter table public.habit_progress
  add column if not exists archived_at timestamptz;

alter table public.workout_day_progress
  add column if not exists archived_at timestamptz;

alter table public.habit_assignments
  add column if not exists archived_at timestamptz;

alter table public.resources
  add column if not exists archived_at timestamptz;

alter table public.nutrition_documents
  add column if not exists archived_at timestamptz;

alter table public.diet_plans
  add column if not exists archived_at timestamptz;

alter table public.workout_plans
  add column if not exists archived_at timestamptz;

comment on column public.chat_messages.archived_at is
  'Retention archive marker. Null means not archived. Does not replace deleted_at.';

comment on column public.notifications.archived_at is
  'Retention archive marker for old read notifications.';

comment on column public.progress_entries.archived_at is
  'Retention archive marker for historical progress entries.';

comment on column public.habit_progress.archived_at is
  'Retention archive marker for historical habit progress rows.';

comment on column public.workout_day_progress.archived_at is
  'Retention archive marker for historical workout completion rows.';

comment on column public.habit_assignments.archived_at is
  'Retention archive marker for inactive historical habit assignments.';

comment on column public.resources.archived_at is
  'Retention archive marker for inactive resources. Does not delete storage objects.';

comment on column public.nutrition_documents.archived_at is
  'Retention archive marker for inactive PDF documents. Does not delete storage objects.';

comment on column public.diet_plans.archived_at is
  'Retention archive marker for archived diet plans.';

comment on column public.workout_plans.archived_at is
  'Retention archive marker for archived workout plans.';
```

Optional indexes should be added only after checking table sizes and the real
filters used by the app. For larger production tables, create indexes during a
low-traffic window or use a concurrent-index workflow compatible with the
migration runner.

## Risk notes

- `diet_plans` can currently have duplicate active plans per client unless a
  future partial unique index is added after data is clean.
- `workout_plans` already has a partial unique active-plan index in local
  migrations; duplicate rows should be zero unless legacy drift exists.
- `habit_assignments` already has a partial unique active assignment index;
  duplicate active rows should be zero.
- `deleted_at` on chat messages is a user-facing soft delete marker, not a
  retention archive marker.
- PDF/resource rows reference storage objects. Archiving metadata must not imply
  storage deletion without a separate explicit policy.
- Any future app behavior that hides `archived_at is not null` rows must update
  data queries and tests deliberately; RLS should remain unchanged unless a
  separate security review asks for it.

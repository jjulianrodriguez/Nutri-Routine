set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function private.archive_routine_assignments_on_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.workout_plans
  set status = 'archived'::public.plan_status
  where routine_id = old.id
    and status <> 'archived'::public.plan_status;

  return old;
end;
$$;

revoke all on function private.archive_routine_assignments_on_delete()
  from public, anon, authenticated;

drop trigger if exists archive_routine_assignments_before_delete
  on public.routines;
create trigger archive_routine_assignments_before_delete
before delete on public.routines
for each row
execute function private.archive_routine_assignments_on_delete();

alter table public.workout_plans
  drop constraint if exists workout_plans_routine_id_fkey;

alter table public.workout_plans
  add constraint workout_plans_routine_id_fkey
  foreign key (routine_id)
  references public.routines(id)
  on delete set null;

notify pgrst, 'reload schema';

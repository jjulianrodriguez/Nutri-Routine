set lock_timeout = '5s';
set statement_timeout = '30s';

-- 1. Alter check constraint in habit_assignments to allow weekend days (6 and 7)
alter table public.habit_assignments drop constraint if exists habit_assignments_days_weekdays_check;
alter table public.habit_assignments add constraint habit_assignments_days_weekdays_check
  check (
    cardinality(days_of_week) > 0
    and days_of_week <@ array[1, 2, 3, 4, 5, 6, 7]
  );

-- 2. Alter check constraint in habit_progress to allow marks on weekend dates
alter table public.habit_progress drop constraint if exists habit_progress_weekday_check;
alter table public.habit_progress add constraint habit_progress_weekday_check
  check (extract(isodow from date) between 1 and 7);

notify pgrst, 'reload schema';

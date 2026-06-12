alter table public.exercises
  add column if not exists muscle_group text not null default 'General',
  add column if not exists exercise_type text not null default 'General',
  add column if not exists multimedia_url text,
  add column if not exists is_active boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'routine_catalog_muscle_group_length_check'
      and conrelid = 'public.exercises'::regclass
  ) then
    alter table public.exercises
      add constraint routine_catalog_muscle_group_length_check
      check (char_length(muscle_group) between 2 and 100);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'routine_catalog_exercise_type_length_check'
      and conrelid = 'public.exercises'::regclass
  ) then
    alter table public.exercises
      add constraint routine_catalog_exercise_type_length_check
      check (char_length(exercise_type) between 2 and 100);
  end if;
end;
$$;

create index if not exists exercises_active_name_idx
  on public.exercises (is_active, name);

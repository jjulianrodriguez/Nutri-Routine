set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function private.valid_exercise_multimedia_urls(
  value text[]
)
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select
    cardinality(value) <= 3
    and coalesce(
      (
        select bool_and(
          url = btrim(url)
          and char_length(url) between 1 and 2048
          and url ~* '^https?://[^[:space:]]+$'
          and url !~* '^https?://[^/]*@'
          and url !~* '^https?://(localhost|127\.0\.0\.1|\[?::1\]?)([:/]|$)'
          and url !~* '^https?://[^/]+\.local([:/]|$)'
        )
        from unnest(value) as url
      ),
      true
    )
    and cardinality(value) = (
      select count(distinct lower(url))::integer
      from unnest(value) as url
    )
$$;

alter table public.exercises
  add column if not exists multimedia_urls text[]
    not null default '{}'::text[];

update public.exercises
set multimedia_urls = array[btrim(multimedia_url)]
where multimedia_url is not null
  and btrim(multimedia_url) <> ''
  and cardinality(multimedia_urls) = 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'exercises_multimedia_urls_valid_check'
      and conrelid = 'public.exercises'::regclass
  ) then
    alter table public.exercises
      add constraint exercises_multimedia_urls_valid_check
      check (private.valid_exercise_multimedia_urls(multimedia_urls));
  end if;
end;
$$;

create or replace function private.sync_exercise_multimedia_urls()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if cardinality(new.multimedia_urls) = 0
      and nullif(btrim(new.multimedia_url), '') is not null then
      new.multimedia_urls := array[btrim(new.multimedia_url)];
    else
      new.multimedia_url := new.multimedia_urls[1];
    end if;
  elsif new.multimedia_urls is distinct from old.multimedia_urls then
    new.multimedia_url := new.multimedia_urls[1];
  elsif new.multimedia_url is distinct from old.multimedia_url then
    if nullif(btrim(new.multimedia_url), '') is null then
      new.multimedia_urls := '{}'::text[];
      new.multimedia_url := null;
    else
      new.multimedia_url := btrim(new.multimedia_url);
      new.multimedia_urls := array[new.multimedia_url];
    end if;
  else
    new.multimedia_url := new.multimedia_urls[1];
  end if;

  return new;
end;
$$;

drop trigger if exists sync_exercise_multimedia_urls
  on public.exercises;
create trigger sync_exercise_multimedia_urls
before insert or update of multimedia_url, multimedia_urls
on public.exercises
for each row
execute function private.sync_exercise_multimedia_urls();

comment on column public.exercises.multimedia_urls is
  'Up to three validated external HTTP or HTTPS multimedia URLs.';
comment on column public.exercises.multimedia_url is
  'Legacy compatibility field synchronized with multimedia_urls[1].';

revoke all on function private.valid_exercise_multimedia_urls(text[])
  from public, anon, authenticated;
grant execute on function private.valid_exercise_multimedia_urls(text[])
  to authenticated;

revoke all on function private.sync_exercise_multimedia_urls()
  from public, anon, authenticated;

grant select (multimedia_urls), insert (multimedia_urls), update (multimedia_urls)
  on public.exercises to authenticated;

notify pgrst, 'reload schema';

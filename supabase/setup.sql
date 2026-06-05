create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'profile_role'
  ) then
    create type public.profile_role as enum ('professional', 'client');
  end if;
end;
$$;

grant usage on type public.profile_role to anon;
grant usage on type public.profile_role to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.profile_role not null default 'client'::public.profile_role,
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint profiles_full_name_length_check check (
    full_name is null
    or char_length(full_name) between 2 and 120
  ),
  constraint profiles_avatar_url_length_check check (
    avatar_url is null
    or char_length(avatar_url) <= 2048
  )
);

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists created_at timestamptz not null default timezone('utc'::text, now());

alter table public.profiles
  add column if not exists role public.profile_role not null default 'client'::public.profile_role;

alter table public.profiles
  drop constraint if exists profiles_role_check;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
      and udt_name <> 'profile_role'
  ) then
    alter table public.profiles
      alter column role drop default;

    alter table public.profiles
      alter column role type public.profile_role
      using (
        case role::text
          when 'professional' then 'professional'::public.profile_role
          when 'client' then 'client'::public.profile_role
          when 'coach' then 'professional'::public.profile_role
          else 'client'::public.profile_role
        end
      );
  end if;
end;
$$;

alter table public.profiles
  alter column role set default 'client'::public.profile_role;

alter table public.profiles
  alter column role set not null;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  published_at timestamptz,
  read_time_minutes integer not null default 1,
  published boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint blog_posts_title_length_check check (char_length(title) between 1 and 180),
  constraint blog_posts_slug_length_check check (char_length(slug) between 1 and 220),
  constraint blog_posts_excerpt_length_check check (char_length(excerpt) between 1 and 500),
  constraint blog_posts_category_length_check check (char_length(category) between 1 and 80),
  constraint blog_posts_read_time_minutes_check check (read_time_minutes > 0)
);

create unique index if not exists blog_posts_slug_key
  on public.blog_posts (slug);

create index if not exists blog_posts_published_at_idx
  on public.blog_posts (published_at desc, created_at desc)
  where published is true;

create or replace function private.current_profile_role()
returns public.profile_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.profile_role;
begin
  requested_role :=
    case
      when new.raw_user_meta_data ->> 'role' in ('professional', 'client')
        then (new.raw_user_meta_data ->> 'role')::public.profile_role
      else 'client'::public.profile_role
    end;

  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    requested_role,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), '')
  )
  on conflict (id) do update
  set
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = coalesce(public.profiles.role, excluded.role),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

revoke all on function private.current_profile_role() from public;
revoke all on function private.current_profile_role() from anon;
revoke all on function private.current_profile_role() from authenticated;
revoke all on function private.handle_new_user() from public;
revoke all on function private.handle_new_user() from anon;
revoke all on function private.handle_new_user() from authenticated;

grant usage on schema private to authenticated;
grant execute on function private.current_profile_role() to authenticated;

alter table public.profiles enable row level security;
alter table public.blog_posts enable row level security;

revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
revoke all on public.blog_posts from anon;
revoke all on public.blog_posts from authenticated;

grant usage on schema public to anon;
grant usage on schema public to authenticated;

grant select on public.profiles to authenticated;
grant insert (id, full_name, role, avatar_url) on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_select_clients_for_professionals" on public.profiles;
create policy "profiles_select_clients_for_professionals"
on public.profiles
for select
to authenticated
using (
  role = 'client'::public.profile_role
  and private.current_profile_role() = 'professional'::public.profile_role
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "blog_posts_select_published" on public.blog_posts;
create policy "blog_posts_select_published"
on public.blog_posts
for select
to anon, authenticated
using (published is true);

drop policy if exists "blog_posts_select_all_professionals" on public.blog_posts;
create policy "blog_posts_select_all_professionals"
on public.blog_posts
for select
to authenticated
using (private.current_profile_role() = 'professional'::public.profile_role);

drop policy if exists "blog_posts_insert_professionals" on public.blog_posts;
create policy "blog_posts_insert_professionals"
on public.blog_posts
for insert
to authenticated
with check (
  private.current_profile_role() = 'professional'::public.profile_role
  and (select auth.uid()) = author_id
);

drop policy if exists "blog_posts_update_professionals" on public.blog_posts;
create policy "blog_posts_update_professionals"
on public.blog_posts
for update
to authenticated
using (private.current_profile_role() = 'professional'::public.profile_role)
with check (private.current_profile_role() = 'professional'::public.profile_role);

drop policy if exists "blog_posts_delete_professionals" on public.blog_posts;
create policy "blog_posts_delete_professionals"
on public.blog_posts
for delete
to authenticated
using (private.current_profile_role() = 'professional'::public.profile_role);

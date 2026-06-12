alter table public.blog_posts
  add column if not exists is_pinned boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_content_length_check'
      and conrelid = 'public.blog_posts'::regclass
  ) then
    alter table public.blog_posts
      add constraint blog_posts_content_length_check
      check (char_length(btrim(content)) between 1 and 50000);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_pinned_requires_published_check'
      and conrelid = 'public.blog_posts'::regclass
  ) then
    alter table public.blog_posts
      add constraint blog_posts_pinned_requires_published_check
      check (not is_pinned or published);
  end if;
end;
$$;

create unique index if not exists blog_posts_single_pinned_idx
  on public.blog_posts (is_pinned)
  where is_pinned is true;

create index if not exists blog_posts_public_order_idx
  on public.blog_posts (is_pinned desc, published_at desc, created_at desc)
  where published is true;

create index if not exists blog_posts_author_id_idx
  on public.blog_posts (author_id);

create or replace function private.is_blog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'::public.profile_role
  )
$$;

create or replace function private.prepare_blog_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.title := btrim(new.title);
  new.slug := lower(btrim(new.slug));
  new.excerpt := btrim(new.excerpt);
  new.content := btrim(new.content);
  new.category := btrim(new.category);
  new.updated_at := now();

  if tg_op = 'UPDATE' then
    new.author_id := old.author_id;
    new.created_at := old.created_at;
  end if;

  if new.is_pinned then
    new.published := true;
  end if;

  if not new.published then
    new.is_pinned := false;
  elsif new.published_at is null then
    new.published_at := now();
  end if;

  if new.is_pinned then
    update public.blog_posts
    set
      is_pinned = false,
      updated_at = now()
    where is_pinned is true
      and id <> new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists prepare_blog_post on public.blog_posts;
create trigger prepare_blog_post
before insert or update on public.blog_posts
for each row
execute function private.prepare_blog_post();

revoke all on function private.is_blog_admin() from public;
revoke all on function private.is_blog_admin() from anon;
revoke all on function private.is_blog_admin() from authenticated;
revoke all on function private.prepare_blog_post() from public;
revoke all on function private.prepare_blog_post() from anon;
revoke all on function private.prepare_blog_post() from authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_blog_admin() to authenticated;

alter table public.blog_posts enable row level security;

revoke all on public.blog_posts from anon;
revoke all on public.blog_posts from authenticated;

grant select on public.blog_posts to anon;
grant select, insert, update on public.blog_posts to authenticated;

drop policy if exists "blog_posts_select_published" on public.blog_posts;
drop policy if exists "blog_posts_select_all_professionals" on public.blog_posts;
drop policy if exists "blog_posts_insert_professionals" on public.blog_posts;
drop policy if exists "blog_posts_update_professionals" on public.blog_posts;
drop policy if exists "blog_posts_delete_professionals" on public.blog_posts;
drop policy if exists "blog_posts_select_all_admins" on public.blog_posts;
drop policy if exists "blog_posts_insert_admins" on public.blog_posts;
drop policy if exists "blog_posts_update_admins" on public.blog_posts;

create policy "blog_posts_select_published"
on public.blog_posts
for select
to anon, authenticated
using (published is true);

create policy "blog_posts_select_all_admins"
on public.blog_posts
for select
to authenticated
using ((select private.is_blog_admin()));

create policy "blog_posts_insert_admins"
on public.blog_posts
for insert
to authenticated
with check (
  (select private.is_blog_admin())
  and author_id = (select auth.uid())
);

create policy "blog_posts_update_admins"
on public.blog_posts
for update
to authenticated
using ((select private.is_blog_admin()))
with check ((select private.is_blog_admin()));

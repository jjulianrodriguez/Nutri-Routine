set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function private.can_manage_blog_posts()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_privileged())
$$;

comment on function private.can_manage_blog_posts() is
  'True for universal admins and active professional accounts that can manage operational blog content.';

revoke all on function private.can_manage_blog_posts()
  from public, anon, authenticated;
grant execute on function private.can_manage_blog_posts()
  to authenticated;

grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;

drop policy if exists "blog_posts_select_published" on public.blog_posts;
drop policy if exists "blog_posts_select_all_admins" on public.blog_posts;
drop policy if exists "blog_posts_select_published_anon" on public.blog_posts;
drop policy if exists "blog_posts_select_authenticated" on public.blog_posts;
drop policy if exists "blog_posts_insert_admins" on public.blog_posts;
drop policy if exists "blog_posts_update_admins" on public.blog_posts;
drop policy if exists "blog_posts_delete_admins" on public.blog_posts;
drop policy if exists "blog_posts_insert_managers" on public.blog_posts;
drop policy if exists "blog_posts_update_managers" on public.blog_posts;
drop policy if exists "blog_posts_delete_managers" on public.blog_posts;

create policy "blog_posts_select_published_anon"
on public.blog_posts
for select
to anon
using (published is true);

create policy "blog_posts_select_authenticated"
on public.blog_posts
for select
to authenticated
using (
  published is true
  or (select private.can_manage_blog_posts())
);

create policy "blog_posts_insert_managers"
on public.blog_posts
for insert
to authenticated
with check (
  (select private.can_manage_blog_posts())
  and author_id = (select auth.uid())
);

create policy "blog_posts_update_managers"
on public.blog_posts
for update
to authenticated
using ((select private.can_manage_blog_posts()))
with check ((select private.can_manage_blog_posts()));

create policy "blog_posts_delete_managers"
on public.blog_posts
for delete
to authenticated
using ((select private.can_manage_blog_posts()));

drop policy if exists "resources_select_allowed_accounts"
  on public.resources;
drop policy if exists "resources_insert_admins"
  on public.resources;
drop policy if exists "resources_update_admins"
  on public.resources;
drop policy if exists "resources_delete_admins"
  on public.resources;
drop policy if exists "resources_insert_authorized_managers"
  on public.resources;
drop policy if exists "resources_update_authorized_managers"
  on public.resources;
drop policy if exists "resources_delete_authorized_managers"
  on public.resources;

create policy "resources_select_allowed_accounts"
on public.resources
for select
to authenticated
using (
  (select private.is_general_admin())
  or (
    (select private.current_profile_role())
      = 'client'::public.profile_role
    and (
      client_id is null
      or client_id = (select auth.uid())
    )
    and (
      select private.client_has_service(
        (select auth.uid()),
        area
      )
    )
  )
  or (
    (select private.current_profile_role())
      = 'professional'::public.profile_role
    and (select private.can_manage_resource_area(area))
  )
);

create policy "resources_insert_authorized_managers"
on public.resources
for insert
to authenticated
with check (
  (select private.can_manage_resource_area(area))
  and uploaded_by = (select auth.uid())
);

create policy "resources_update_authorized_managers"
on public.resources
for update
to authenticated
using ((select private.can_manage_resource_area(area)))
with check ((select private.can_manage_resource_area(area)));

create policy "resources_delete_authorized_managers"
on public.resources
for delete
to authenticated
using ((select private.can_manage_resource_area(area)));

notify pgrst, 'reload schema';

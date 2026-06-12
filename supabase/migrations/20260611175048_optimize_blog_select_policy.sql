drop policy if exists "blog_posts_select_published" on public.blog_posts;
drop policy if exists "blog_posts_select_all_admins" on public.blog_posts;
drop policy if exists "blog_posts_select_published_anon" on public.blog_posts;
drop policy if exists "blog_posts_select_authenticated" on public.blog_posts;

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
  or (select private.is_blog_admin())
);

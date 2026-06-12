grant delete on public.blog_posts to authenticated;

drop policy if exists "blog_posts_delete_admins" on public.blog_posts;
create policy "blog_posts_delete_admins"
on public.blog_posts
for delete
to authenticated
using ((select private.is_blog_admin()));

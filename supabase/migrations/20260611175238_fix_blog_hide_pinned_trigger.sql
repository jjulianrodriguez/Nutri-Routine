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

  if tg_op = 'UPDATE'
    and old.published is true
    and new.published is false
  then
    new.is_pinned := false;
  elsif new.is_pinned then
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

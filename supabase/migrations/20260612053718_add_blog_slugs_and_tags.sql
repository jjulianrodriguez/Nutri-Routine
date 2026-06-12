alter table public.blog_posts
  add column if not exists tags text[];

update public.blog_posts
set tags = '{}'::text[]
where tags is null;

alter table public.blog_posts
  alter column tags set default '{}'::text[],
  alter column tags set not null;

do $$
declare
  blog_row record;
  base_slug text;
  candidate_slug text;
  suffix integer;
begin
  for blog_row in
    select id, title, slug
    from public.blog_posts
    where slug is null
      or btrim(slug) = ''
      or slug <> lower(btrim(slug))
      or lower(btrim(slug)) !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  loop
    base_slug := left(
      trim(both '-' from regexp_replace(
        translate(
          lower(coalesce(blog_row.title, 'blog')),
          'áàäâãéèëêíìïîóòöôõúùüûñç',
          'aaaaaeeeeiiiiooooouuuunc'
        ),
        '[^a-z0-9]+',
        '-',
        'g'
      )),
      190
    );

    if base_slug = '' then
      base_slug := 'blog';
    end if;

    candidate_slug := base_slug;
    suffix := 2;

    while exists (
      select 1
      from public.blog_posts
      where slug = candidate_slug
        and id <> blog_row.id
    ) loop
      candidate_slug := left(
        base_slug,
        190 - char_length(suffix::text) - 1
      ) || '-' || suffix::text;
      suffix := suffix + 1;
    end loop;

    update public.blog_posts
    set slug = candidate_slug
    where id = blog_row.id;
  end loop;
end;
$$;

alter table public.blog_posts
  alter column slug set not null;

create unique index if not exists blog_posts_slug_key
  on public.blog_posts (slug);

create or replace function private.valid_blog_tags(value text[])
returns boolean
language sql
immutable
strict
set search_path = ''
as $$
  select
    cardinality(value) <= 12
    and coalesce(
      (
        select bool_and(
          tag = lower(btrim(tag))
          and char_length(tag) between 1 and 40
        )
        from unnest(value) as tag
      ),
      true
    )
    and cardinality(value) = (
      select count(distinct tag)::integer
      from unnest(value) as tag
    )
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_slug_format_check'
      and conrelid = 'public.blog_posts'::regclass
  ) then
    alter table public.blog_posts
      add constraint blog_posts_slug_format_check
      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'blog_posts_tags_valid_check'
      and conrelid = 'public.blog_posts'::regclass
  ) then
    alter table public.blog_posts
      add constraint blog_posts_tags_valid_check
      check (private.valid_blog_tags(tags));
  end if;
end;
$$;

revoke all on function private.valid_blog_tags(text[]) from public;
revoke all on function private.valid_blog_tags(text[]) from anon;
revoke all on function private.valid_blog_tags(text[]) from authenticated;
grant execute on function private.valid_blog_tags(text[]) to authenticated;

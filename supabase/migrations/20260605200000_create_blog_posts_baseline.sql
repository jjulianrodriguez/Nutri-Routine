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

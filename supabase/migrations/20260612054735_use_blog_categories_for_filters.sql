alter table public.blog_posts
  drop constraint if exists blog_posts_slug_format_check;

comment on column public.blog_posts.slug is
  'Identificador interno autogenerado para la ruta publica del detalle; no es editable desde la UI.';

comment on column public.blog_posts.category is
  'Categoria principal editable usada por los filtros visuales del blog publico.';

comment on column public.blog_posts.tags is
  'Columna conservada por compatibilidad con la implementacion anterior; la UI actual usa category.';

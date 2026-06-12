alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables
  from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences
  from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions
  from public;

alter default privileges for role postgres in schema public
  revoke execute on functions
  from anon, authenticated;

drop policy if exists "client_profiles_select_own_or_privileged"
  on public.client_profiles;
drop policy if exists "professional_profiles_select_own_or_privileged"
  on public.professional_profiles;

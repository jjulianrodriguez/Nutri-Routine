set lock_timeout = '5s';
set statement_timeout = '30s';

drop table if exists public.messages;
drop table if exists public.conversations;

notify pgrst, 'reload schema';

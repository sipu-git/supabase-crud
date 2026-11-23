-- Supabase Auth owns the credential table at auth.users.
-- This app-facing table stores optional profile fields and references auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, update on public.profiles to authenticated;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Every task belongs to its Supabase Auth user.
alter table public.tasks
  add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.tasks alter column user_id set default auth.uid();
alter table public.tasks enable row level security;
revoke all on public.tasks from anon;
grant select, insert, update, delete on public.tasks to authenticated;

drop policy if exists "Allow demo anon task access" on public.tasks;
drop policy if exists "Demo anon full access" on public.tasks;

drop policy if exists "Users can read their own tasks" on public.tasks;
create policy "Users can read their own tasks"
on public.tasks for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own tasks" on public.tasks;
create policy "Users can create their own tasks"
on public.tasks for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
on public.tasks for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
on public.tasks for delete to authenticated
using ((select auth.uid()) = user_id);

-- If id uses a serial/identity sequence, authenticated inserts need sequence access.
do $$
declare
  task_id_sequence text;
begin
  task_id_sequence := pg_get_serial_sequence('public.tasks', 'id');
  if task_id_sequence is not null then
    execute format('grant usage, select on sequence %s to authenticated', task_id_sequence);
  end if;
end;
$$;

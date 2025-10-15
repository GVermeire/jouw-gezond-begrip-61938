-- RLS-safe role assignment and verification improvements
-- 1) Helper to check if a user already has any role
create or replace function public.has_any_role(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id
  );
$$;

-- 2) Ensure RLS is enabled (no-op if already enabled)
alter table public.user_roles enable row level security;

-- 3) Allow authenticated users to insert exactly one role for themselves
--    (blocked if they already have any role)
drop policy if exists "Users can insert own role once" on public.user_roles;
create policy "Users can insert own role once"
on public.user_roles
for insert
to authenticated
with check (
  auth.uid() = user_id
  and not public.has_any_role(auth.uid())
);

-- 4) Enforce single role per user at the DB level (unique index on user_id)
create unique index if not exists idx_user_roles_user_id_unique
on public.user_roles(user_id);

-- 5) Optional RPC to set initial role (respects RLS)
create or replace function public.set_initial_role(_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (auth.uid(), _role);
end;
$$;
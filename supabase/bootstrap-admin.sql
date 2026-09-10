-- =====================================================================
-- VELLOURA — allowlist a Seller Center admin (run once per admin)
-- =====================================================================
-- Run in the Supabase SQL Editor AFTER the user exists in
-- Authentication → Users (create the owner there first, with a strong
-- password — never reuse an old/demo password).
--
-- Replace OWNER_EMAIL below with the owner's sign-in email, keeping the
-- quotes, then run the whole file. Re-running it is safe.

insert into public.admin_users (user_id)
select u.id
from auth.users u
where lower(u.email) = lower('OWNER_EMAIL')
on conflict (user_id) do nothing;

-- Verify (should list the owner's UUID and created_at):
select user_id, created_at from public.admin_users;

-- To remove an admin later (keeps the auth user, only drops access):
-- delete from public.admin_users where user_id = 'UUID-HERE';

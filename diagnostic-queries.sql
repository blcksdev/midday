-- ============================================
-- DIAGNOSTIC - Check what's in your database
-- ============================================
-- Run each query separately to see what exists
-- ============================================

-- 1. Check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'philipp.fuchs@blcks.at';

-- 2. Check if user exists in public.users
SELECT id, email, full_name, team_id 
FROM public.users 
WHERE id = '0dbe1105-a63a-4e4e-bdc4-3862d4183d08';

-- 3. Check all teams
SELECT id, name, email, plan 
FROM public.teams 
WHERE email = 'philipp.fuchs@blcks.at';

-- 4. Check users_on_team
SELECT user_id, team_id, role 
FROM public.users_on_team 
WHERE user_id = '0dbe1105-a63a-4e4e-bdc4-3862d4183d08';

-- 5. Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- DIRECT USER SETUP - SIMPLE VERSION
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check if user exists in auth
SELECT id, email FROM auth.users WHERE email = 'philipp.fuchs@blcks.at';

-- Step 2: Create team (run this separately)
INSERT INTO public.teams (name, email, plan)
VALUES ('Test Team', 'philipp.fuchs@blcks.at', 'trial')
ON CONFLICT DO NOTHING
RETURNING id;

-- Step 3: After running step 2, copy the team ID and user ID from step 1
-- Then run this (replace the UUIDs with actual values):

-- INSERT INTO public.users (id, full_name, email, team_id, locale)
-- VALUES (
--   '0dbe1105-a63a-4e4e-bdc4-3862d4183d08',  -- Replace with your user ID from step 1
--   'Philipp Fuchs',
--   'philipp.fuchs@blcks.at',
--   'YOUR_TEAM_ID_HERE',  -- Replace with team ID from step 2
--   'en'
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   full_name = EXCLUDED.full_name,
--   email = EXCLUDED.email,
--   team_id = EXCLUDED.team_id;

-- Step 4: Add user to team (replace UUIDs)
-- INSERT INTO public.users_on_team (user_id, team_id, role)
-- VALUES (
--   '0dbe1105-a63a-4e4e-bdc4-3862d4183d08',  -- Replace with your user ID
--   'YOUR_TEAM_ID_HERE',  -- Replace with your team ID
--   'owner'
-- )
-- ON CONFLICT DO NOTHING;

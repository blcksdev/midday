-- Quick Setup Script for Support System
-- Run this in Supabase SQL Editor if you encounter "Failed to get user team" error

-- Step 1: Check if you have a team
-- Replace 'your-email@example.com' with your actual email
DO $$
DECLARE
    v_user_id uuid;
    v_team_id uuid;
    v_user_email text := 'philipp.fuchs@blcks.at'; -- CHANGE THIS!
BEGIN
    -- Get user ID from email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User not found with email: %', v_user_email;
        RAISE NOTICE 'Please update the v_user_email variable with your actual email';
        RETURN;
    END IF;

    RAISE NOTICE 'User ID: %', v_user_id;

    -- Check if user is already in a team
    SELECT team_id INTO v_team_id
    FROM users_on_team
    WHERE user_id = v_user_id;

    IF v_team_id IS NOT NULL THEN
        RAISE NOTICE 'User is already in team: %', v_team_id;
        RAISE NOTICE 'No action needed!';
        RETURN;
    END IF;

    -- User is not in a team, let's create one
    RAISE NOTICE 'User is not in a team. Creating a new team...';

    -- Create a new team
    INSERT INTO teams (name, email)
    VALUES ('My Team', v_user_email)
    RETURNING id INTO v_team_id;

    RAISE NOTICE 'Created team with ID: %', v_team_id;

    -- Add user to the team
    INSERT INTO users_on_team (user_id, team_id, role)
    VALUES (v_user_id, v_team_id, 'owner');

    RAISE NOTICE 'Added user to team as owner';
    RAISE NOTICE 'Setup complete! You can now create support tickets.';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RAISE NOTICE 'Please check the error message above and ensure all tables exist';
END $$;

-- Step 2: Verify the setup
-- This query should return your user with team information
SELECT 
    u.id as user_id,
    u.email,
    uot.team_id,
    uot.role,
    t.name as team_name
FROM auth.users u
LEFT JOIN users_on_team uot ON u.id = uot.user_id
LEFT JOIN teams t ON uot.team_id = t.id
WHERE u.email = 'philipp.fuchs@blcks.at'; -- CHANGE THIS to match above!

-- If the query above shows NULL for team_id, the script didn't work
-- In that case, run this manual version:

/*
-- Manual Setup (uncomment and run if automatic script fails)

-- 1. Get your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
-- Copy the ID from the result

-- 2. Create a team (or use existing team ID)
INSERT INTO teams (name, email)
VALUES ('My Team', 'your-email@example.com')
RETURNING id;
-- Copy the team ID from the result

-- 3. Add yourself to the team
INSERT INTO users_on_team (user_id, team_id, role)
VALUES (
    'YOUR_USER_ID_HERE',  -- Replace with user ID from step 1
    'YOUR_TEAM_ID_HERE',  -- Replace with team ID from step 2
    'owner'
);

-- 4. Verify
SELECT * FROM users_on_team WHERE user_id = 'YOUR_USER_ID_HERE';
*/

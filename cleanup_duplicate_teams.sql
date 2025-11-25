-- Cleanup Script: Remove Duplicate Teams and User-Team Relationships
-- This will clean up your database to have 1 user in 1 team
-- Run this in Supabase SQL Editor

-- IMPORTANT: Change this email to your actual email
DO $$
DECLARE
    v_user_id uuid;
    v_user_email text := 'philipp.fuchs@blcks.at'; -- Your email
    v_keep_team_id uuid;
    v_delete_team_id uuid;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User not found with email: %', v_user_email;
        RETURN;
    END IF;

    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Starting cleanup...';

    -- Get the two team IDs
    SELECT team_id INTO v_keep_team_id
    FROM users_on_team
    WHERE user_id = v_user_id
    ORDER BY created_at ASC  -- Keep the oldest team
    LIMIT 1;

    SELECT team_id INTO v_delete_team_id
    FROM users_on_team
    WHERE user_id = v_user_id
    AND team_id != v_keep_team_id
    LIMIT 1;

    RAISE NOTICE 'Keeping team: %', v_keep_team_id;
    RAISE NOTICE 'Will delete team: %', v_delete_team_id;

    -- Step 1: Delete duplicate entries in users_on_team for the team we're keeping
    DELETE FROM users_on_team
    WHERE user_id = v_user_id
    AND team_id = v_keep_team_id
    AND id NOT IN (
        SELECT id FROM users_on_team
        WHERE user_id = v_user_id
        AND team_id = v_keep_team_id
        ORDER BY created_at ASC
        LIMIT 1
    );

    RAISE NOTICE 'Removed duplicate entries for team: %', v_keep_team_id;

    -- Step 2: Delete all entries for the team we're deleting
    DELETE FROM users_on_team
    WHERE team_id = v_delete_team_id;

    RAISE NOTICE 'Removed all entries for team: %', v_delete_team_id;

    -- Step 3: Delete the team itself (cascade will handle related records)
    DELETE FROM teams
    WHERE id = v_delete_team_id;

    RAISE NOTICE 'Deleted team: %', v_delete_team_id;

    -- Step 4: Verify cleanup
    RAISE NOTICE '=== CLEANUP COMPLETE ===';
    RAISE NOTICE 'Remaining teams: %', (SELECT COUNT(*) FROM teams WHERE id = v_keep_team_id);
    RAISE NOTICE 'Remaining user-team entries: %', (SELECT COUNT(*) FROM users_on_team WHERE user_id = v_user_id);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during cleanup: %', SQLERRM;
        RAISE NOTICE 'Rolling back...';
        RAISE EXCEPTION '%', SQLERRM;
END $$;

-- Verify the cleanup worked
SELECT 
    u.id as user_id,
    u.email,
    uot.team_id,
    uot.role,
    t.name as team_name,
    COUNT(*) OVER (PARTITION BY u.id) as user_team_count
FROM auth.users u
JOIN users_on_team uot ON u.id = uot.user_id
JOIN teams t ON uot.team_id = t.id
WHERE u.email = 'philipp.fuchs@blcks.at';

-- This should return exactly 1 row
-- If it returns more than 1 row, run the script again or use the manual cleanup guide

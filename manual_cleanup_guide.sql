-- Manual Cleanup Guide
-- Use this if the automatic cleanup script doesn't work

-- Step 1: See what you have
SELECT 
    'TEAMS' as table_name,
    id,
    name,
    email,
    created_at
FROM teams
ORDER BY created_at;

SELECT 
    'USERS_ON_TEAM' as table_name,
    id,
    user_id,
    team_id,
    role,
    created_at
FROM users_on_team
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'philipp.fuchs@blcks.at')
ORDER BY created_at;

-- Step 2: Decide which team to keep
-- Look at the results above and decide which team_id you want to KEEP
-- Copy that team_id for the next steps

-- Step 3: Delete duplicate users_on_team entries
-- Replace 'TEAM_ID_TO_KEEP' with the actual team ID you want to keep
DELETE FROM users_on_team
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'philipp.fuchs@blcks.at')
AND team_id = 'TEAM_ID_TO_KEEP'
AND id NOT IN (
    SELECT id FROM users_on_team
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'philipp.fuchs@blcks.at')
    AND team_id = 'TEAM_ID_TO_KEEP'
    ORDER BY created_at ASC
    LIMIT 1
);

-- Step 4: Delete entries for teams you DON'T want
-- Replace 'TEAM_ID_TO_DELETE' with the team ID you want to remove
DELETE FROM users_on_team
WHERE team_id = 'TEAM_ID_TO_DELETE';

-- Step 5: Delete the team itself
DELETE FROM teams
WHERE id = 'TEAM_ID_TO_DELETE';

-- Step 6: Verify - should return exactly 1 row
SELECT 
    u.id as user_id,
    u.email,
    uot.team_id,
    uot.role,
    t.name as team_name
FROM auth.users u
JOIN users_on_team uot ON u.id = uot.user_id
JOIN teams t ON uot.team_id = t.id
WHERE u.email = 'philipp.fuchs@blcks.at';

-- If you see exactly 1 row, you're done! ✅

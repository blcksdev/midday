-- ============================================
-- COMPLETE USER SETUP - ALL IN ONE
-- ============================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- Then click RUN
-- ============================================

DO $$
DECLARE
    v_user_id uuid := '0dbe1105-a63a-4e4e-bdc4-3862d4183d08';  -- Your user ID from the error
    v_team_id uuid;
    v_team_exists boolean;
    v_user_exists boolean;
BEGIN
    -- Check if user exists in auth
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
        RAISE EXCEPTION 'User % not found in auth.users. Please create user in Supabase Auth first.', v_user_id;
    END IF;
    
    RAISE NOTICE 'User found in auth.users: %', v_user_id;
    
    -- Check if team already exists
    SELECT id INTO v_team_id 
    FROM public.teams 
    WHERE email = 'philipp.fuchs@blcks.at'
    LIMIT 1;
    
    IF v_team_id IS NULL THEN
        -- Create new team
        INSERT INTO public.teams (name, email, plan)
        VALUES ('Test Team', 'philipp.fuchs@blcks.at', 'trial')
        RETURNING id INTO v_team_id;
        
        RAISE NOTICE 'Created new team: %', v_team_id;
    ELSE
        RAISE NOTICE 'Using existing team: %', v_team_id;
    END IF;
    
    -- Create or update user profile
    INSERT INTO public.users (id, full_name, email, team_id, locale)
    VALUES (v_user_id, 'Philipp Fuchs', 'philipp.fuchs@blcks.at', v_team_id, 'en')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        team_id = EXCLUDED.team_id;
    
    RAISE NOTICE 'Created/Updated user profile';
    
    -- Add user to team
    INSERT INTO public.users_on_team (user_id, team_id, role)
    VALUES (v_user_id, v_team_id, 'owner')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added user to team';
    
    -- Verify setup
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SETUP COMPLETE!';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Team ID: %', v_team_id;
    RAISE NOTICE 'Email: philipp.fuchs@blcks.at';
    RAISE NOTICE 'Password: testuser';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'You can now login at http://localhost:3001/login';
    
END $$;

-- Verify the setup worked
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.team_id,
    t.name as team_name,
    uot.role
FROM public.users u
LEFT JOIN public.teams t ON u.team_id = t.id
LEFT JOIN public.users_on_team uot ON u.id = uot.user_id AND u.team_id = uot.team_id
WHERE u.email = 'philipp.fuchs@blcks.at';

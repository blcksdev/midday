-- Add RLS policy to allow users to read their own team memberships
-- Run this in Supabase SQL Editor

-- Enable RLS on users_on_team if not already enabled
ALTER TABLE users_on_team ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own team memberships" ON users_on_team;

-- Create policy to allow users to read their own team memberships
CREATE POLICY "Users can view their own team memberships"
    ON users_on_team
    FOR SELECT
    USING (auth.uid() = user_id);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'users_on_team'
AND policyname = 'Users can view their own team memberships';

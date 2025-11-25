-- Enable Realtime for Support Tables
-- Run this in Supabase SQL Editor

-- Step 1: Set replica identity to FULL (required for Realtime)
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER TABLE support_tickets REPLICA IDENTITY FULL;

-- Step 2: Add tables to the Realtime publication
-- This tells Supabase to broadcast changes for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;

-- Step 3: Verify the tables are in the publication
SELECT 
    schemaname,
    tablename,
    'Added to Realtime' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('support_messages', 'support_tickets');

-- You should see both tables listed above
-- If you see 2 rows, Realtime is enabled! ✅

-- Step 4: Check replica identity
SELECT 
    c.relname as table_name,
    CASE 
        WHEN relreplident = 'f' THEN 'FULL (✅ Correct for Realtime)'
        WHEN relreplident = 'd' THEN 'DEFAULT (❌ Need to set to FULL)'
        ELSE 'OTHER'
    END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname IN ('support_messages', 'support_tickets');

-- Both should show "FULL (✅ Correct for Realtime)"

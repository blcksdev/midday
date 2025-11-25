-- Fix Support Messages RLS Policies
-- Run this in Supabase SQL Editor to allow message sending and viewing

-- First, let's check if the tables exist and have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('support_tickets', 'support_messages');

-- Enable RLS if not already enabled
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view messages from their tickets" ON support_messages;
DROP POLICY IF EXISTS "Users can send messages to their tickets" ON support_messages;
DROP POLICY IF EXISTS "Users can update read status on messages" ON support_messages;

-- SUPPORT TICKETS POLICIES
-- Policy: Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
    ON support_tickets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create their own tickets
CREATE POLICY "Users can create their own tickets"
    ON support_tickets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tickets
CREATE POLICY "Users can update their own tickets"
    ON support_tickets
    FOR UPDATE
    USING (auth.uid() = user_id);

-- SUPPORT MESSAGES POLICIES
-- Policy: Users can view messages from their tickets
CREATE POLICY "Users can view messages from their tickets"
    ON support_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = support_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Policy: Users can send messages to their tickets
CREATE POLICY "Users can send messages to their tickets"
    ON support_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = support_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
        AND sender_id = auth.uid()
        AND sender_type = 'customer'
    );

-- Policy: Users can update read status on messages
CREATE POLICY "Users can update read status on messages"
    ON support_messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = support_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('support_tickets', 'support_messages')
ORDER BY tablename, policyname;

-- Test query: Check if you can see your tickets
SELECT id, subject, status, created_at
FROM support_tickets
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Success message
SELECT 'RLS policies created successfully! You should now be able to send and view messages.' as status;

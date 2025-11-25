-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message TEXT,
    unread_count INTEGER NOT NULL DEFAULT 0
);

-- Support Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_team_id ON support_tickets(team_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_updated_at ON support_tickets(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at ASC);

-- Row Level Security (RLS) Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

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

-- Function to update ticket's updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE support_tickets
    SET updated_at = NOW()
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ticket timestamp when a message is added
CREATE TRIGGER update_ticket_on_message
    AFTER INSERT ON support_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_support_ticket_timestamp();

-- Function to update unread count
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sender_type = 'admin' AND NEW.read = FALSE THEN
        UPDATE support_tickets
        SET unread_count = unread_count + 1
        WHERE id = NEW.ticket_id;
    END IF;
    
    IF OLD.read = FALSE AND NEW.read = TRUE AND NEW.sender_type = 'admin' THEN
        UPDATE support_tickets
        SET unread_count = GREATEST(unread_count - 1, 0)
        WHERE id = NEW.ticket_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update unread count
CREATE TRIGGER update_unread_count_trigger
    AFTER INSERT OR UPDATE ON support_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_count();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON support_tickets TO authenticated;
GRANT ALL ON support_messages TO authenticated;

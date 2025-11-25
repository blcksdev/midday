# Support Section Implementation

This document describes the implementation of the real-time support chat system for the customer portal.

## Overview

The support section allows customers to:
- Create support tickets
- Send messages to admins in real-time
- View ticket history with status badges
- See unread message counts
- Track ticket status (open, in_progress, resolved, closed)

## Features

### Customer Side (Implemented)
- **Sidebar**: Lists all support tickets with status badges and unread counts
- **Chat Interface**: Real-time messaging with admins
- **Ticket Creation**: Create new support tickets
- **Message History**: View all messages in a ticket
- **Real-time Updates**: Messages appear instantly using Supabase Realtime
- **Read Receipts**: Messages are marked as read automatically

### Admin Side (To be implemented in admin panel)
- View all tickets from all customers
- Respond to customer messages
- Update ticket status
- Mark tickets as resolved/closed

## Database Schema

### Tables

#### `support_tickets`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `team_id` (UUID, Foreign Key to teams)
- `subject` (TEXT)
- `status` (TEXT: 'open', 'in_progress', 'resolved', 'closed')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `last_message` (TEXT)
- `unread_count` (INTEGER)

#### `support_messages`
- `id` (UUID, Primary Key)
- `ticket_id` (UUID, Foreign Key to support_tickets)
- `sender_id` (UUID, Foreign Key to auth.users)
- `sender_type` (TEXT: 'customer', 'admin')
- `content` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `read` (BOOLEAN)

## Setup Instructions

### 1. Run Database Migration

Execute the SQL migration file in your Supabase SQL Editor:

```bash
# The migration file is located at:
# supabase_support_migration.sql
```

Or run it directly in Supabase Dashboard:
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `supabase_support_migration.sql`
4. Execute the SQL

### 2. Enable Realtime

In your Supabase Dashboard:
1. Go to Database → Replication
2. Enable replication for:
   - `support_tickets`
   - `support_messages`

### 3. Verify RLS Policies

The migration automatically sets up Row Level Security (RLS) policies:
- Users can only see their own tickets
- Users can only send messages to their own tickets
- Admins will need separate policies (to be added in admin panel)

## Components

### Main Components
- `Support` - Main wrapper component
- `SupportView` - Combines sidebar and chat interface
- `SupportSidebar` - Displays ticket list
- `SupportChatInterface` - Chat UI with message input

### Hooks
- `useSupportTickets` - Manages ticket list with real-time updates
- `useSupportMessages` - Manages messages with real-time updates

## Usage

### Customer Flow
1. Navigate to `/support` from the main menu
2. Click "New Ticket" to create a support request
3. Type message and press Enter or click send button
4. Messages appear in real-time
5. View ticket status in the sidebar

### Admin Flow (To be implemented)
1. Admin panel shows all tickets from all customers
2. Admin can select a ticket to view conversation
3. Admin can respond to messages
4. Admin can update ticket status
5. Status changes reflect in real-time for customers

## Real-time Features

The system uses Supabase Realtime for:
- **New Messages**: Appear instantly for both customer and admin
- **Ticket Updates**: Status changes sync immediately
- **Unread Counts**: Update automatically when messages are read
- **Ticket List**: New tickets appear without refresh

## Styling

The support section follows the existing dashboard design:
- Uses the same color scheme and typography
- Responsive layout
- Dark mode support
- Consistent with other sections (Inbox, Transactions, etc.)

## Next Steps for Admin Panel

To complete the support system, implement in the admin panel:

1. **Admin Dashboard**
   - View all tickets from all customers
   - Filter by status, customer, date
   - Search functionality

2. **Admin RLS Policies**
   ```sql
   -- Add policies for admin users to view all tickets
   CREATE POLICY "Admins can view all tickets"
       ON support_tickets
       FOR SELECT
       USING (
           EXISTS (
               SELECT 1 FROM users
               WHERE users.id = auth.uid()
               AND users.role = 'admin'
           )
       );
   ```

3. **Admin Message Sending**
   - Allow admins to send messages with `sender_type = 'admin'`
   - Update ticket status
   - Add internal notes (optional)

4. **Notifications**
   - Email notifications for new tickets
   - Push notifications for new messages
   - Admin notification system

## Troubleshooting

### Messages not appearing in real-time
- Check if Realtime is enabled for both tables in Supabase
- Verify RLS policies are correctly set up
- Check browser console for errors

### Cannot create tickets
- Verify user is authenticated
- Check if user has a team_id in the users table
- Review RLS policies

### Unread counts not updating
- Check if the trigger `update_unread_count_trigger` is active
- Verify the function `update_unread_count()` exists

## Security Considerations

- All data access is controlled by RLS policies
- Users can only access their own tickets and messages
- Admin access requires proper role-based policies
- Message content is not encrypted (consider encryption for sensitive data)

## Performance Optimization

- Indexes are created on frequently queried columns
- Messages are loaded per ticket (not all at once)
- Realtime subscriptions are scoped to specific tickets
- Cleanup of old subscriptions on component unmount

# Support System - Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Failed to get user team" Error

**Symptom**: When clicking "New Ticket", you get an error: `Failed to get user team`

**Cause**: The user is not associated with a team in the `users_on_team` table.

**Solution**:

1. **Check if user is in a team**:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM users_on_team WHERE user_id = 'YOUR_USER_ID';
```

2. **If no result, add user to a team**:
```sql
-- First, get or create a team
INSERT INTO teams (id, name, email)
VALUES (gen_random_uuid(), 'My Team', 'team@example.com')
RETURNING id;

-- Then add user to the team (replace with actual IDs)
INSERT INTO users_on_team (user_id, team_id, role)
VALUES ('YOUR_USER_ID', 'YOUR_TEAM_ID', 'owner');
```

3. **Verify the fix**:
```sql
-- Check that user is now in a team
SELECT u.id, u.email, uot.team_id, t.name as team_name
FROM auth.users u
JOIN users_on_team uot ON u.id = uot.user_id
JOIN teams t ON uot.team_id = t.id
WHERE u.id = 'YOUR_USER_ID';
```

### Issue: Support Tables Don't Exist

**Symptom**: Errors mentioning `support_tickets` or `support_messages` table not found

**Solution**:
1. Run the migration SQL: `supabase_support_migration.sql`
2. Verify tables exist in Supabase Dashboard → Database → Tables

### Issue: Messages Not Appearing in Real-time

**Symptom**: Messages don't appear without refreshing the page

**Solution**:
1. Enable Realtime in Supabase Dashboard → Database → Replication
2. Enable for both `support_tickets` and `support_messages` tables
3. Refresh the page and try again

### Issue: RLS Policy Errors

**Symptom**: Errors about permissions or RLS policies

**Solution**:
1. Ensure RLS is enabled on both tables
2. Run the RLS policies from the migration SQL
3. Verify policies exist in Supabase Dashboard → Database → Policies

### Issue: Cannot Create Tickets (Permission Denied)

**Symptom**: Permission denied when creating tickets

**Solution**:
1. Check RLS policies are correct
2. Ensure user is authenticated
3. Verify user has a team_id in `users_on_team` table

### Issue: Unread Counts Not Updating

**Symptom**: Unread message counts don't change

**Solution**:
1. Check if trigger `update_unread_count_trigger` exists
2. Verify function `update_unread_count()` is created
3. Re-run the trigger creation from migration SQL

## Database Schema Requirements

The support system requires:

1. **Tables**:
   - `support_tickets`
   - `support_messages`
   - `users_on_team` (should already exist)
   - `teams` (should already exist)

2. **User Must Be in a Team**:
   - Every user must have an entry in `users_on_team`
   - This links the user to a team via `team_id`

3. **Realtime Enabled**:
   - Both support tables must have replication enabled

## Quick Diagnostic Script

Run this in Supabase SQL Editor to check your setup:

```sql
-- Check if support tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('support_tickets', 'support_messages');

-- Check if current user is in a team
SELECT 
    auth.uid() as user_id,
    uot.team_id,
    t.name as team_name
FROM users_on_team uot
JOIN teams t ON uot.team_id = t.id
WHERE uot.user_id = auth.uid();

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('support_tickets', 'support_messages');

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('support_tickets', 'support_messages');
```

## Getting Your User ID

To find your user ID for the SQL queries above:

1. **In Browser Console** (while logged in):
```javascript
// Run in browser console
const { data } = await (await fetch('/api/auth/session')).json();
console.log('User ID:', data?.user?.id);
```

2. **In Supabase Dashboard**:
   - Go to Authentication → Users
   - Find your email
   - Copy the UUID

## Need More Help?

1. Check browser console for detailed error messages
2. Check Supabase logs in Dashboard → Logs
3. Verify all migration SQL was executed successfully
4. Ensure Realtime is enabled for both tables
5. Check that user is part of a team in `users_on_team`

## Reporting Issues

When reporting issues, please include:
- Error message (full text)
- Browser console logs
- Supabase table structure (screenshot)
- User's team status (from diagnostic script)
- Steps to reproduce

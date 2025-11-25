# Database Cleanup - Fix Duplicate Teams

## Problem
You have:
- 1 user (philipp.fuchs@blcks.at)
- 2 teams (duplicates)
- 4 entries in users_on_team (all for the same user)

This is causing the "Could not determine your team" error.

## Solution: Clean Up the Database

### Option 1: Automatic Cleanup (Recommended)

1. Open Supabase SQL Editor
2. Open file: `cleanup_duplicate_teams.sql`
3. Verify the email is correct: `philipp.fuchs@blcks.at`
4. Copy and paste the entire script
5. Click "Run"
6. Check the output - it should say "CLEANUP COMPLETE"
7. The verification query at the end should return exactly 1 row

### Option 2: Manual Cleanup (If automatic fails)

1. Open Supabase SQL Editor
2. Open file: `manual_cleanup_guide.sql`
3. Follow the step-by-step instructions in the comments
4. Run each query one at a time
5. Replace the placeholder IDs with actual team IDs

## After Cleanup

Once you have exactly 1 user in 1 team:

### Step 1: Add RLS Policy
Run the script in `fix_users_on_team_rls.sql` to allow users to read their team memberships.

### Step 2: Test Support Tickets
1. Navigate to `/support`
2. Click "New Ticket"
3. Should work now! ✅

## Verification

After cleanup, this query should return exactly 1 row:

```sql
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
```

## Files Created

1. **cleanup_duplicate_teams.sql** - Automatic cleanup script
2. **manual_cleanup_guide.sql** - Manual step-by-step guide
3. **fix_users_on_team_rls.sql** - RLS policy fix (run after cleanup)

## Order of Operations

1. ✅ Clean up duplicates (this file)
2. ✅ Add RLS policy (`fix_users_on_team_rls.sql`)
3. ✅ Test creating support tickets
4. ✅ Remove debug console.log statements (optional)

## Why This Happened

The duplicate teams were likely created by:
- Running the setup script multiple times
- Testing team creation
- Database migration issues

This is normal during development! The cleanup will fix it.

## Need Help?

If the cleanup doesn't work:
1. Check Supabase logs for errors
2. Share the error message
3. We can do a manual cleanup together

---

**Ready to clean up?** Start with `cleanup_duplicate_teams.sql`! 🧹

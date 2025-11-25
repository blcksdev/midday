# Support Section - Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy contents from `supabase_support_migration.sql`
3. Click "Run" to execute

### Step 2: Enable Realtime
1. Go to Database → Replication in Supabase
2. Find `support_tickets` table → Toggle ON
3. Find `support_messages` table → Toggle ON

### Step 3: Test It!
1. Navigate to `http://localhost:3001/support`
2. Click "New Ticket"
3. Send a test message
4. ✅ Done!

## 📁 What Was Added

```
✅ Main Menu
   - Support icon added
   - Support menu item added
   - Route: /support

✅ Components (6 files)
   - Support page
   - Support wrapper
   - Support view
   - Support sidebar
   - Support chat interface
   - 2 custom hooks

✅ Database
   - support_tickets table
   - support_messages table
   - RLS policies
   - Triggers & functions

✅ Documentation
   - Implementation guide
   - Admin example
   - This quick start
```

## 🎯 Key Features

### For Customers
- ✅ Create support tickets
- ✅ Send messages in real-time
- ✅ View ticket history
- ✅ See status badges
- ✅ Track unread messages

### Real-time Magic
- ✅ Messages appear instantly
- ✅ No page refresh needed
- ✅ Works for both customer & admin
- ✅ Auto-updates everywhere

## 🔧 How to Use

### Customer Side (Already Done!)
```tsx
// Just navigate to /support
// Everything works out of the box!
```

### Admin Side (Next Step)
```tsx
// Copy code from: ADMIN_SUPPORT_EXAMPLE.tsx
// Add to your admin panel
// Run admin SQL policies
// Done!
```

## 📊 Database Tables

### support_tickets
```sql
id              UUID
user_id         UUID (FK to auth.users)
team_id         UUID (FK to teams)
subject         TEXT
status          TEXT (open|in_progress|resolved|closed)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
last_message    TEXT
unread_count    INTEGER
```

### support_messages
```sql
id              UUID
ticket_id       UUID (FK to support_tickets)
sender_id       UUID (FK to auth.users)
sender_type     TEXT (customer|admin)
content         TEXT
created_at      TIMESTAMPTZ
read            BOOLEAN
```

## 🎨 UI Components Used

```tsx
// From @midday/ui
- Button
- Textarea
- Icons (Support, Add, Email, etc.)
- cn (className utility)

// From Next.js
- useRouter
- useSearchParams

// From date-fns
- formatDistanceToNow

// From Supabase
- createClient
- Realtime subscriptions
```

## 🐛 Troubleshooting

### Problem: "Support icon not found"
**Solution**: TypeScript needs to recompile. Restart dev server.

### Problem: "Cannot create ticket"
**Solution**: 
- Check user is logged in
- Verify user has team_id
- Check RLS policies

### Problem: "Messages not real-time"
**Solution**:
- Enable Realtime in Supabase
- Check browser console for errors
- Verify subscriptions are active

### Problem: "Database error"
**Solution**:
- Run migration SQL again
- Check all tables exist
- Verify RLS policies are enabled

## 📞 Admin Panel Integration

### Required SQL (Add to Supabase)
```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Update your admin user
UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';

-- Then run the admin policies from ADMIN_SUPPORT_EXAMPLE.tsx
```

### Use Admin Hooks
```tsx
import { useAdminSupportTickets, useAdminSupportMessages } from './admin-hooks';

// In your admin component
const { tickets, updateTicketStatus } = useAdminSupportTickets();
const { messages, sendAdminMessage } = useAdminSupportMessages(ticketId);
```

## ✅ Checklist

Before going live:
- [ ] Database migration executed
- [ ] Realtime enabled for both tables
- [ ] Test ticket creation works
- [ ] Test message sending works
- [ ] Test real-time updates work
- [ ] Admin panel integrated
- [ ] Admin can see all tickets
- [ ] Admin can respond to messages
- [ ] Status updates work
- [ ] Email notifications (optional)

## 📚 Full Documentation

For detailed information, see:
- `SUPPORT_IMPLEMENTATION.md` - Complete guide
- `ADMIN_SUPPORT_EXAMPLE.tsx` - Admin integration
- `SUPPORT_SUMMARY.md` - Full summary
- `supabase_support_migration.sql` - Database schema

## 🎉 That's It!

You now have a fully functional real-time support system!

**Customer side**: ✅ Complete
**Admin side**: 📝 Example provided (ready to integrate)

---

**Need help?** Check the documentation files or review the code comments.

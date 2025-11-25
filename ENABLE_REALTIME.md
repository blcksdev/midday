# Modern Supabase Realtime Setup

## Current Implementation

The support system uses **Supabase Realtime with `postgres_changes`** which is the modern, recommended approach for listening to database changes.

## How It Works

### Code Implementation
```typescript
supabase
  .channel(`support_messages_${ticketId}`)
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "support_messages",
    filter: `ticket_id=eq.${ticketId}`,
  }, (payload) => {
    // New message received!
    setMessages((prev) => [...prev, payload.new]);
  })
  .subscribe();
```

This is the **correct modern approach** - no need for the old "Replication" tab!

## Debugging Realtime

### Step 1: Check Browser Console

After sending a message, you should see these logs:

```
[Realtime] Setting up subscription for ticket: <ticket-id>
[Realtime] Subscription status: SUBSCRIBED
[Realtime] ✅ Successfully subscribed to changes
[Realtime] New message received: { ... }
```

### Step 2: If You See Errors

**Error: "CHANNEL_ERROR"**
- Check Supabase project is running
- Verify API keys are correct
- Check network connection

**Error: "TIMED_OUT"**
- Supabase might be slow
- Try refreshing the page
- Check Supabase status page

**No logs at all**
- Check browser console is open (F12)
- Verify you're on the `/support` page
- Make sure a ticket is selected

## Supabase Dashboard - Modern Realtime

In newer Supabase projects:

### Option 1: Realtime is Enabled by Default
- Most new projects have Realtime enabled automatically
- No configuration needed!
- Just use the code (which we already have)

### Option 2: Check Realtime Settings
1. Go to Supabase Dashboard
2. Navigate to **Database → Realtime** (not Replication)
3. You might see options to add triggers or configure Realtime
4. For `postgres_changes`, no additional setup is usually needed

### Option 3: Verify via SQL
```sql
-- Check if Realtime is enabled
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- If it exists, Realtime is enabled!
```

## Testing Realtime

### Test 1: Console Logs
1. Open browser console (F12)
2. Navigate to `/support`
3. Select a ticket
4. Look for `[Realtime]` logs
5. Should see "✅ Successfully subscribed"

### Test 2: Send Message
1. Type a message
2. Click send
3. Check console for "[Realtime] New message received"
4. Message should appear immediately in the chat

### Test 3: Two Windows
1. Open `/support` in two browser windows
2. Log in as same user
3. Send message in window 1
4. Should appear in window 2 instantly

## Common Issues

### Issue: Messages appear after switching tickets
**Cause:** Realtime subscription not connecting
**Fix:** Check console logs for errors

### Issue: "CHANNEL_ERROR" in console
**Cause:** Connection to Supabase Realtime failed
**Solutions:**
1. Check internet connection
2. Verify Supabase project is running
3. Check API keys in `.env`
4. Try refreshing the page

### Issue: "TIMED_OUT" in console
**Cause:** Supabase Realtime took too long to connect
**Solutions:**
1. Refresh the page
2. Check Supabase status
3. Try again in a few minutes

### Issue: No console logs at all
**Cause:** Code not running or console not open
**Solutions:**
1. Open browser console (F12)
2. Navigate to `/support`
3. Select a ticket
4. Check for `[Realtime]` logs

## Advanced: Manual Realtime Configuration

If Realtime is not working, you can manually enable it:

### Via SQL
```sql
-- Enable Realtime for support tables
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER TABLE support_tickets REPLICA IDENTITY FULL;

-- Add tables to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
```

### Via Supabase Dashboard
1. Go to **Database → Realtime**
2. Look for "Realtime Triggers" or similar
3. Add triggers for `support_messages` and `support_tickets`
4. Save changes

## Verification Checklist

- [ ] Browser console shows `[Realtime]` logs
- [ ] Status shows "SUBSCRIBED"
- [ ] Sending message shows "New message received" log
- [ ] Message appears immediately in chat
- [ ] Two-window test works (message appears in both)

## Next Steps

1. **Check Console Logs** - Open F12 and look for `[Realtime]` logs
2. **Send a Test Message** - Should see logs and message appear
3. **If Not Working** - Share the console logs with me
4. **If Working** - Remove debug logs later (optional)

---

**The implementation is correct!** Modern Supabase Realtime works differently than the old "Replication" tab. The code uses the right approach (`postgres_changes`). Just check the console logs to see what's happening!

# Support System Testing Checklist

## Pre-Testing Setup

### Database Setup
- [ ] Supabase project is running
- [ ] Migration SQL has been executed
- [ ] Tables `support_tickets` and `support_messages` exist
- [ ] RLS policies are enabled
- [ ] Triggers are active
- [ ] Indexes are created

### Realtime Setup
- [ ] Realtime is enabled for `support_tickets`
- [ ] Realtime is enabled for `support_messages`
- [ ] Replication is confirmed in Supabase Dashboard

### Application Setup
- [ ] Dashboard dev server is running (`bun run dev`)
- [ ] No TypeScript errors in console
- [ ] Support menu item appears in sidebar
- [ ] Support icon displays correctly

## Customer Portal Testing

### Navigation
- [ ] Click "Support" in main menu
- [ ] Page loads at `/support`
- [ ] No console errors
- [ ] Sidebar appears on left
- [ ] Empty state shows when no tickets

### Ticket Creation
- [ ] Click "New Ticket" button
- [ ] New ticket appears in sidebar
- [ ] Ticket has default subject "New Support Request"
- [ ] Ticket status is "open"
- [ ] Ticket is auto-selected
- [ ] URL updates with `?ticketId=...`

### Message Sending
- [ ] Type message in input box
- [ ] Press Enter to send
- [ ] Message appears in chat
- [ ] Message shows on right side (customer)
- [ ] Timestamp displays correctly
- [ ] Input box clears after sending
- [ ] Can send multiple messages
- [ ] Shift+Enter creates new line

### Real-time Updates (Single User)
- [ ] Send message
- [ ] Message appears instantly
- [ ] No page refresh needed
- [ ] Ticket `updated_at` updates
- [ ] Ticket `last_message` updates in sidebar

### Ticket List
- [ ] Create multiple tickets
- [ ] All tickets appear in sidebar
- [ ] Tickets ordered by `updated_at` (newest first)
- [ ] Click different tickets to switch
- [ ] Selected ticket highlights
- [ ] Messages load for selected ticket

### Status Badges
- [ ] "open" badge shows green
- [ ] Status displays correctly
- [ ] Badge styling matches design

### UI/UX
- [ ] Sidebar has fixed width (320px)
- [ ] Chat area is responsive
- [ ] Scrolling works in message area
- [ ] Auto-scroll to latest message
- [ ] Loading states show correctly
- [ ] Empty states show correctly
- [ ] Dark mode works (if applicable)

## Real-time Testing (Two Users)

### Setup
- [ ] Open two browser windows/tabs
- [ ] Log in as customer in Window 1
- [ ] Log in as admin in Window 2 (or use admin panel)
- [ ] Both users viewing same ticket

### Customer → Admin
- [ ] Customer sends message in Window 1
- [ ] Message appears in Window 1 instantly
- [ ] Message appears in Window 2 instantly
- [ ] Timestamp is correct
- [ ] Message shows as "customer" type

### Admin → Customer
- [ ] Admin sends message in Window 2
- [ ] Message appears in Window 2 instantly
- [ ] Message appears in Window 1 instantly
- [ ] Message shows on left side (admin)
- [ ] Unread count increases for customer
- [ ] Badge appears in sidebar

### Status Updates
- [ ] Admin changes ticket status
- [ ] Status updates in customer view
- [ ] Badge color changes
- [ ] No page refresh needed

### Unread Counts
- [ ] Admin sends message
- [ ] Unread count increases in sidebar
- [ ] Customer opens ticket
- [ ] Unread count decreases to 0
- [ ] Badge disappears

## Database Testing

### Data Integrity
- [ ] Open Supabase Table Editor
- [ ] Check `support_tickets` table
- [ ] Verify ticket data is correct
- [ ] Check `support_messages` table
- [ ] Verify message data is correct
- [ ] Verify foreign keys are correct

### RLS Policies
- [ ] Customer can only see their tickets
- [ ] Customer cannot see other users' tickets
- [ ] Customer can only send to their tickets
- [ ] Admin can see all tickets (if policy added)

### Triggers
- [ ] Send message
- [ ] Check `support_tickets.updated_at` updated
- [ ] Check `support_tickets.last_message` updated
- [ ] Admin sends message
- [ ] Check `unread_count` increased

## Error Handling

### Network Errors
- [ ] Disconnect internet
- [ ] Try to send message
- [ ] Error handling works
- [ ] Reconnect internet
- [ ] Messages sync correctly

### Authentication Errors
- [ ] Log out user
- [ ] Try to access `/support`
- [ ] Redirects to login (or shows error)
- [ ] Log back in
- [ ] Can access support again

### Invalid Data
- [ ] Try to send empty message
- [ ] Button is disabled
- [ ] Try to send very long message
- [ ] Message sends correctly
- [ ] Try to access non-existent ticket
- [ ] Shows appropriate error

## Performance Testing

### Load Testing
- [ ] Create 10+ tickets
- [ ] Sidebar loads quickly
- [ ] Scrolling is smooth
- [ ] Switching tickets is fast

### Message History
- [ ] Send 50+ messages in a ticket
- [ ] Messages load quickly
- [ ] Scrolling is smooth
- [ ] Auto-scroll works
- [ ] No memory leaks

### Realtime Performance
- [ ] Multiple subscriptions active
- [ ] No duplicate messages
- [ ] Subscriptions cleanup on unmount
- [ ] No console warnings

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

### Mobile Browsers
- [ ] Mobile Chrome
- [ ] Mobile Safari
- [ ] Responsive layout works

## Accessibility

### Keyboard Navigation
- [ ] Tab through interface
- [ ] Enter sends message
- [ ] Escape closes modals (if any)
- [ ] Focus states visible

### Screen Readers
- [ ] Buttons have aria-labels
- [ ] Messages have proper structure
- [ ] Status changes announced

## Admin Panel Testing (After Integration)

### Admin View
- [ ] Admin sees all tickets from all customers
- [ ] Can filter by status
- [ ] Can search tickets
- [ ] Can view customer email

### Admin Actions
- [ ] Can send messages as admin
- [ ] Can update ticket status
- [ ] Can mark as resolved
- [ ] Can close tickets

### Admin Realtime
- [ ] New customer tickets appear instantly
- [ ] Customer messages appear instantly
- [ ] Status updates sync

## Edge Cases

### Concurrent Actions
- [ ] Two users send message simultaneously
- [ ] Both messages appear
- [ ] Correct order maintained

### Long Content
- [ ] Send very long message (1000+ chars)
- [ ] Message displays correctly
- [ ] Wrapping works
- [ ] Scrolling works

### Special Characters
- [ ] Send message with emojis 😀
- [ ] Send message with line breaks
- [ ] Send message with special chars (!@#$%)
- [ ] All display correctly

### Rapid Actions
- [ ] Send 10 messages quickly
- [ ] All messages appear
- [ ] Correct order maintained
- [ ] No duplicates

## Security Testing

### Authorization
- [ ] User A cannot access User B's tickets
- [ ] Direct URL access blocked
- [ ] API calls are authenticated

### Data Validation
- [ ] SQL injection attempts fail
- [ ] XSS attempts are sanitized
- [ ] Input validation works

## Cleanup Testing

### Component Unmount
- [ ] Navigate away from support
- [ ] Realtime subscriptions cleanup
- [ ] No memory leaks
- [ ] Navigate back
- [ ] Everything works again

### Browser Refresh
- [ ] Refresh page while on support
- [ ] State recovers correctly
- [ ] Selected ticket persists (if in URL)
- [ ] Messages reload

## Production Readiness

### Environment Variables
- [ ] Supabase URL is correct
- [ ] Supabase keys are correct
- [ ] Environment is production-ready

### Error Logging
- [ ] Errors are logged
- [ ] Console is clean (no warnings)
- [ ] Error boundaries work

### Performance
- [ ] Initial load is fast
- [ ] No unnecessary re-renders
- [ ] Optimized queries
- [ ] Indexes are used

## Final Checks

### Documentation
- [ ] README is complete
- [ ] Setup instructions are clear
- [ ] API is documented
- [ ] Examples are provided

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code is formatted
- [ ] Comments are helpful

### Deployment
- [ ] Database migration is versioned
- [ ] Rollback plan exists
- [ ] Monitoring is set up
- [ ] Alerts are configured

---

## Test Results Template

```
Date: _______________
Tester: _______________
Environment: _______________

✅ Passed: ___ / ___
❌ Failed: ___ / ___
⚠️  Warnings: ___ / ___

Critical Issues:
1. 
2. 
3. 

Minor Issues:
1. 
2. 
3. 

Notes:


Approved for Production: [ ] Yes  [ ] No
```

---

## Quick Test Script

For rapid testing, run through this minimal checklist:

1. ✅ Create ticket
2. ✅ Send message
3. ✅ See message appear
4. ✅ Create another ticket
5. ✅ Switch between tickets
6. ✅ Send message in second ticket
7. ✅ Verify real-time works
8. ✅ Check database has correct data
9. ✅ Test with admin (if available)
10. ✅ Verify no console errors

If all 10 pass: **Ready for production!** 🎉

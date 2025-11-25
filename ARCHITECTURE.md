# Support System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER PORTAL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐                    ┌────────────────────────┐ │
│  │   Sidebar    │                    │   Chat Interface       │ │
│  ├──────────────┤                    ├────────────────────────┤ │
│  │              │                    │                        │ │
│  │ ┌──────────┐ │                    │  ┌──────────────────┐ │ │
│  │ │ Ticket 1 │ │  ← Selected →      │  │ Message 1        │ │ │
│  │ │  [open]  │ │                    │  │ (Customer)       │ │ │
│  │ └──────────┘ │                    │  └──────────────────┘ │ │
│  │              │                    │                        │ │
│  │ ┌──────────┐ │                    │  ┌──────────────────┐ │ │
│  │ │ Ticket 2 │ │                    │  │ Message 2        │ │ │
│  │ │[resolved]│ │                    │  │ (Admin)          │ │ │
│  │ └──────────┘ │                    │  └──────────────────┘ │ │
│  │              │                    │                        │ │
│  │ [+ New]      │                    │  ┌──────────────────┐ │ │
│  │              │                    │  │ Input Box        │ │ │
│  └──────────────┘                    │  └──────────────────┘ │ │
│                                       └────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↕ Realtime
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐      ┌──────────────────────────┐    │
│  │  support_tickets     │      │  support_messages        │    │
│  ├──────────────────────┤      ├──────────────────────────┤    │
│  │ • id                 │      │ • id                     │    │
│  │ • user_id            │◄─────┤ • ticket_id (FK)         │    │
│  │ • team_id            │      │ • sender_id              │    │
│  │ • subject            │      │ • sender_type            │    │
│  │ • status             │      │ • content                │    │
│  │ • last_message       │      │ • created_at             │    │
│  │ • unread_count       │      │ • read                   │    │
│  └──────────────────────┘      └──────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              RLS Policies & Triggers                     │   │
│  │  • Users see only their tickets                         │   │
│  │  • Auto-update timestamps                               │   │
│  │  • Auto-update unread counts                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↕ Realtime
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐                    ┌────────────────────────┐ │
│  │ All Tickets  │                    │   Admin Chat           │ │
│  ├──────────────┤                    ├────────────────────────┤ │
│  │              │                    │                        │ │
│  │ Customer A   │                    │  View all messages     │ │
│  │  Ticket 1    │  ← Selected →      │  Send admin replies    │ │
│  │  [open]      │                    │  Update status         │ │
│  │              │                    │  Mark as resolved      │ │
│  │ Customer B   │                    │                        │ │
│  │  Ticket 2    │                    │                        │ │
│  │  [in_progress]                    │                        │ │
│  │              │                    │                        │ │
│  └──────────────┘                    └────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Customer Sends Message
```
Customer Types Message
        ↓
Click Send Button
        ↓
useSupportMessages.sendMessage()
        ↓
INSERT into support_messages
        ↓
Trigger: update_support_ticket_timestamp()
        ↓
UPDATE support_tickets.updated_at
        ↓
Supabase Realtime broadcasts INSERT
        ↓
All subscribed clients receive update
        ↓
Message appears in UI (Customer + Admin)
```

### 2. Admin Responds
```
Admin Types Response
        ↓
Click Send Button
        ↓
useAdminSupportMessages.sendAdminMessage()
        ↓
INSERT into support_messages (sender_type='admin')
        ↓
Trigger: update_unread_count()
        ↓
UPDATE support_tickets.unread_count++
        ↓
Supabase Realtime broadcasts INSERT
        ↓
Customer sees new message + unread badge
```

### 3. Real-time Subscription
```
Component Mounts
        ↓
useEffect() runs
        ↓
supabase.channel().on('postgres_changes')
        ↓
Subscribe to table changes
        ↓
Listen for INSERT/UPDATE/DELETE
        ↓
Update local state when events received
        ↓
Component Unmounts
        ↓
supabase.removeChannel()
```

## Component Hierarchy

```
/support (page.tsx)
    ↓
<Support> (index.tsx)
    ↓
<SupportView> (support-view.tsx)
    ↓
    ├── <SupportSidebar> (support-sidebar.tsx)
    │       ↓
    │   useSupportTickets() hook
    │       ↓
    │   Supabase: support_tickets table
    │
    └── <SupportChatInterface> (support-chat-interface.tsx)
            ↓
        useSupportMessages() hook
            ↓
        Supabase: support_messages table
```

## Hook Dependencies

```
useSupportTickets
├── createClient() from @midday/supabase/client
├── useState() for tickets state
├── useEffect() for fetching & subscriptions
└── Returns:
    ├── tickets[]
    ├── isLoading
    └── createNewTicket()

useSupportMessages
├── createClient() from @midday/supabase/client
├── useState() for messages & ticket state
├── useEffect() for fetching & subscriptions
└── Returns:
    ├── messages[]
    ├── ticket
    ├── isLoading
    └── sendMessage()
```

## Security Layers

```
┌─────────────────────────────────────┐
│   1. Authentication (Supabase Auth) │
│      • User must be logged in       │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│   2. Row Level Security (RLS)       │
│      • Users see only their data    │
│      • Admins see all (with policy) │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│   3. Foreign Key Constraints        │
│      • Data integrity enforced      │
│      • Cascade deletes              │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│   4. Type Safety (TypeScript)       │
│      • Compile-time checks          │
│      • Prevents runtime errors      │
└─────────────────────────────────────┘
```

## Performance Optimizations

```
Database Level:
├── Indexes on frequently queried columns
│   ├── user_id
│   ├── ticket_id
│   ├── created_at
│   └── updated_at
│
├── Efficient queries
│   ├── SELECT only needed columns
│   ├── ORDER BY with indexes
│   └── Pagination ready
│
└── Triggers for auto-updates
    ├── Timestamp updates
    └── Unread count updates

Application Level:
├── Real-time subscriptions
│   ├── Scoped to specific tickets
│   ├── Cleanup on unmount
│   └── Prevent memory leaks
│
├── State management
│   ├── Local state for UI
│   ├── Optimistic updates
│   └── Auto-scroll to latest
│
└── Component optimization
    ├── Memoization where needed
    ├── Lazy loading
    └── Code splitting
```

## File Structure Map

```
midday/
├── apps/dashboard/src/
│   ├── app/[locale]/(app)/(sidebar)/
│   │   └── support/
│   │       └── page.tsx ..................... Route handler
│   │
│   ├── components/
│   │   ├── main-menu.tsx .................... Updated with Support
│   │   └── support/
│   │       ├── index.tsx .................... Main wrapper
│   │       ├── support-view.tsx ............. View combiner
│   │       ├── support-sidebar.tsx .......... Ticket list
│   │       └── support-chat-interface.tsx ... Chat UI
│   │
│   └── hooks/
│       ├── use-support-tickets.ts ........... Ticket management
│       └── use-support-messages.ts .......... Message management
│
├── packages/ui/src/components/
│   └── icons.tsx ............................ Updated with Support icon
│
├── supabase_support_migration.sql ........... Database schema
├── SUPPORT_IMPLEMENTATION.md ................ Full documentation
├── ADMIN_SUPPORT_EXAMPLE.tsx ................ Admin integration
├── SUPPORT_SUMMARY.md ....................... Implementation summary
└── QUICK_START.md ........................... Quick setup guide
```

## Technology Stack

```
Frontend:
├── Next.js 14+ (App Router)
├── React 18+
├── TypeScript
├── Tailwind CSS
└── date-fns

Backend:
├── Supabase (PostgreSQL)
├── Supabase Realtime
├── Row Level Security
└── Database Triggers

UI Components:
├── @midday/ui/button
├── @midday/ui/textarea
├── @midday/ui/icons
└── @midday/ui/cn
```

---

This architecture provides:
✅ Real-time updates
✅ Secure data access
✅ Scalable design
✅ Type safety
✅ Performance optimization
✅ Easy maintenance

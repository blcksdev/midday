# Test User Setup Guide

## ✅ What You've Done
- Created a user in Supabase Auth with:
  - Email: `philipp.fuchs@blcks.at`
  - Password: `testuser`

## 🚀 What You Need To Do

### Step 1: Run the SQL Script in Supabase

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file `setup-test-user.sql` (in the root of this project)
4. Copy and paste the entire SQL script
5. Click **Run**

The script will:
- ✅ Find your auth user
- ✅ Create a test team
- ✅ Create your user profile
- ✅ Link the user to the team

### Step 2: Login

1. Go to `http://localhost:3001/login`
2. Enter:
   - Email: `philipp.fuchs@blcks.at`
   - Password: `testuser`
3. Click Login

### Step 3: Start Styling! 🎨

You should now have full access to the dashboard and can work on styling!

## 🔧 Troubleshooting

### If you get "No permission to access this team"
- Make sure you ran the SQL script completely
- Check that the `users_on_team` table has an entry for your user

### If login doesn't work
- Verify the user exists in Supabase Auth (Authentication > Users)
- Make sure email confirmation is disabled or the email is confirmed
- Check the browser console for errors

### To check if everything is set up correctly:

Run this in Supabase SQL Editor:

```sql
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    u.team_id,
    t.name as team_name,
    uot.role
FROM public.users u
LEFT JOIN public.teams t ON u.team_id = t.id
LEFT JOIN public.users_on_team uot ON u.id = uot.user_id AND u.team_id = uot.team_id
WHERE u.email = 'philipp.fuchs@blcks.at';
```

You should see one row with all fields filled in.

## 📝 Notes

- The test user is set up with the "trial" plan
- Team currency is set to EUR (Austria)
- Timezone is set to Europe/Vienna
- The user has "owner" role on the team

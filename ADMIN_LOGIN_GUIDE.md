# Admin Login Guide

## Overview
The Smart Mess System includes a complete admin authentication system that allows hostel administrators to log in with a password to manage menus, create polls, and view ratings.

## How to Access Admin Portal

### Step 1: User Login (if not already logged in)
1. Click **"Login"** button in the sidebar or login page
2. Enter your hostel room number and 4-digit PIN
3. Click **Login**

### Step 2: Navigate to Profile
1. After logging in, click on **Profile** in the sidebar
2. You will see your profile information

### Step 3: Switch to Admin Portal
1. If you're NOT an admin, click the **"Switch to Admin Portal"** button
2. This will open the Admin Login Modal

### Alternative: Direct Admin Login
1. If you see the Sidebar menu, there's also a direct way to trigger admin login
2. The system will prompt you for admin credentials

## Admin Login Credentials

Admin accounts are pre-seeded for each hostel:

| Hostel | Hostel Name | Admin Password |
|--------|-------------|---|
| bh1 | Shivalik BH1 | `bh1admin` |
| bh2 | Aravali BH2 | `bh2admin` |
| gh1 | Aditya GH1 | `gh1admin` |
| gh2 | Avantika GH2 | `gh2admin` |

## Admin Login Modal

When you click to access the admin portal:

1. **Select Hostel**: Choose your hostel from the dropdown
2. **Enter Password**: Type the hostel-specific admin password
3. **Click "Admin Login"**: Submit your credentials

## Admin Dashboard Features

Once logged in as admin, you can:

### 1. Manage Weekly Menu
- Edit breakfast, lunch, snacks, and dinner for each day
- View the current week's menu
- Save menu items (separate items with new lines)

### 2. Create Polls
- Create new polls with multiple options
- Ask questions to residents
- Options must be separated by new lines
- Minimum 2 options required

### 3. View Poll Results
- See total votes across all polls
- Monitor active polls
- View poll statistics

### 4. Dashboard Metrics
- Total poll votes
- Number of active polls
- Current hostel information
- Admin role confirmation

## Admin Logout

To exit the admin portal:
1. Click **"Exit Admin"** button in the Admin Dashboard
2. You'll be returned to the previous view
3. Use the **Logout** button to clear your session

## Security Notes

- Passwords are securely hashed before storage
- Each hostel has an independent admin account
- Admin tokens expire after 24 hours
- All admin actions are authenticated and authorized

## Database Seed Data

Admin accounts are created when you run:
```bash
npm run seed
```

This creates admin users for all four hostels with their respective passwords.

## Troubleshooting

### "Invalid admin credentials" error
- Double-check you've selected the correct hostel
- Verify the password matches the table above
- Ensure the database has been seeded

### "Can't access admin portal"
- First make sure you're logged in as a regular user
- From the profile page, click "Switch to Admin Portal"
- Or directly trigger admin login from the sidebar

## For Developers

### Backend Admin Routes
- `POST /api/auth/admin/login` - Admin authentication
- Menu/Poll updates require `requireRole('admin')` middleware

### Frontend Admin Components
- `AdminLoginModal.jsx` - Handles admin login form
- `AdminPortal.jsx` - Main admin dashboard
- `AuthContext.jsx` - Manages admin authentication state

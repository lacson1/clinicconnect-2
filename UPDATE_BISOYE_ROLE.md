# Update Role for User 'bisoye'

The user "bisoye" is currently showing as "user" role which has limited permissions. Here's how to fix it:

## Option 1: Using the Script (Requires Database Access)

1. **Set up environment variables:**
   ```bash
   export DATABASE_URL="your_database_url_here"
   ```

2. **Run the update script:**
   ```bash
   npx tsx scripts/update-bisoye-role.ts admin
   ```
   
   Or for a different role:
   ```bash
   npx tsx scripts/update-bisoye-role.ts doctor
   npx tsx scripts/update-bisoye-role.ts nurse
   npx tsx scripts/update-bisoye-role.ts superadmin
   ```

## Option 2: Direct SQL Query (If you have database access)

Run this SQL query in your database:

```sql
-- Check current role
SELECT id, username, role, roleId, firstName, lastName 
FROM users 
WHERE username = 'bisoye';

-- Update to admin (change role as needed)
UPDATE users
SET role = 'admin',  -- Options: 'admin', 'doctor', 'nurse', 'superadmin', 'pharmacist', etc.
    updatedAt = NOW()
WHERE username = 'bisoye';

-- Verify the update
SELECT id, username, role, roleId 
FROM users 
WHERE username = 'bisoye';
```

## Option 3: Through User Management UI (Recommended)

1. **Sign in as an admin or superadmin**

2. **Navigate to User Management:**
   - Go to: **Sidebar → Administration → User Management**
   - Or visit: `/user-management`

3. **Find and edit the user:**
   - Search for "bisoye" in the user list
   - Click the **Edit** button (pencil icon) next to "bisoye"
   - Change the **Role** dropdown from "user" to desired role (e.g., "admin", "doctor", "nurse")
   - Click **Save**

4. **Have bisoye sign out and sign back in** to refresh permissions

## Available Roles

- `admin` - Full administrative access
- `superadmin` or `super_admin` - System-wide access
- `doctor` - Clinical access
- `nurse` - Nursing access
- `pharmacist` - Pharmacy access
- `lab_technician` - Laboratory access
- `receptionist` - Front desk access
- `physiotherapist` - Physiotherapy access
- `user` - Limited access (dashboard only)

## After Updating

**Important:** The user "bisoye" must:
1. Sign out completely
2. Sign back in
3. The new role and permissions will be active

The role change takes effect immediately in the database, but the user's session needs to be refreshed to see the new permissions.


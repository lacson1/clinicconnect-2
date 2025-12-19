-- Check current role for user 'bisoye'
SELECT id, username, role, roleId, firstName, lastName, email, organizationId, isActive
FROM users
WHERE username = 'bisoye';

-- Update role to admin (change as needed: 'admin', 'doctor', 'nurse', 'superadmin', etc.)
-- Option 1: Update using legacy role field
UPDATE users
SET role = 'admin',  -- Change to desired role: 'admin', 'doctor', 'nurse', 'superadmin', etc.
    updatedAt = NOW()
WHERE username = 'bisoye';

-- Option 2: Update using RBAC roleId (if you know the role ID)
-- First, check available roles:
SELECT id, name, description FROM roles;

-- Then update with roleId (example: assuming admin role has id = 2)
-- UPDATE users
-- SET roleId = 2,  -- Replace with actual role ID
--     role = 'admin',  -- Keep legacy role field for compatibility
--     updatedAt = NOW()
-- WHERE username = 'bisoye';

-- Verify the update
SELECT id, username, role, roleId, firstName, lastName, email, organizationId, isActive
FROM users
WHERE username = 'bisoye';


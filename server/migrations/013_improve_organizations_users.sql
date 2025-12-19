-- ============================================
-- Organizations and Users Improvements Migration
-- Adds constraints, indexes, and optimizations
-- ============================================

-- 1. Add unique constraint to prevent duplicate user-organization memberships
ALTER TABLE user_organizations 
ADD CONSTRAINT unique_user_organization UNIQUE (user_id, organization_id);

-- 2. Add composite index for faster user-organization lookups
CREATE INDEX IF NOT EXISTS idx_user_orgs_user_org ON user_organizations (user_id, organization_id);

-- 3. Add index for organization lookups by name (for subdomain resolution)
CREATE INDEX IF NOT EXISTS idx_organizations_name_active ON organizations (name, is_active) WHERE is_active = true;

-- 4. Add index for organization lookups by type
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations (type) WHERE is_active = true;

-- 5. Add index for user lookups by organization and active status
CREATE INDEX IF NOT EXISTS idx_users_org_active_role ON users (organization_id, is_active, role) WHERE is_active = true;

-- 6. Add index for organization email lookups (for uniqueness checks)
CREATE INDEX IF NOT EXISTS idx_organizations_email ON organizations (email) WHERE email IS NOT NULL;

-- 7. Add constraint to ensure at least one default organization per user (if they have multiple)
-- Note: This is handled at application level, but we can add a partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_orgs_one_default 
ON user_organizations (user_id) 
WHERE is_default = true;

-- 8. Add foreign key constraint with CASCADE for better referential integrity
-- Note: Check if these constraints already exist before adding
DO $$
BEGIN
  -- Add CASCADE delete for user_organizations when user is deleted
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_organizations_user_id_fkey'
  ) THEN
    ALTER TABLE user_organizations
    ADD CONSTRAINT user_organizations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  -- Add CASCADE delete for user_organizations when organization is deleted
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_organizations_organization_id_fkey'
  ) THEN
    ALTER TABLE user_organizations
    ADD CONSTRAINT user_organizations_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 9. Add check constraint to ensure organization name is not empty
ALTER TABLE organizations 
ADD CONSTRAINT organizations_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);

-- 10. Add check constraint for valid organization types
ALTER TABLE organizations 
ADD CONSTRAINT organizations_valid_type CHECK (type IN ('clinic', 'hospital', 'health_center', 'pharmacy', 'lab', 'other'));

-- 11. Add index for faster organization statistics queries
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations (created_at DESC);

-- 12. Add partial index for active organizations only (most common query)
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations (id, name, type) WHERE is_active = true;

-- 13. Analyze tables to update statistics
ANALYZE organizations;
ANALYZE users;
ANALYZE user_organizations;


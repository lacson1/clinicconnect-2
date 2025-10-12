import { Router } from 'express';
import { db } from '../db';
import { userOrganizations, organizations, users } from '@shared/schema';
import { eq, and, or, ilike, notExists } from 'drizzle-orm';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's organizations (with full org details)
router.get('/user-organizations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userOrgs = await db
      .select({
        organizationId: userOrganizations.organizationId,
        isDefault: userOrganizations.isDefault,
        organization: {
          id: organizations.id,
          name: organizations.name,
          type: organizations.type,
          themeColor: organizations.themeColor
        }
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, req.user.id))
      .orderBy(userOrganizations.isDefault);

    // Transform to match expected format
    const formattedOrgs = userOrgs.map(uo => ({
      organizationId: uo.organizationId,
      isDefault: uo.isDefault,
      organization: {
        id: uo.organization.id,
        name: uo.organization.name,
        type: uo.organization.type || 'clinic',
        themeColor: uo.organization.themeColor || '#3B82F6'
      }
    }));

    res.json(formattedOrgs);
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
});

// Get user's organizations (legacy endpoint with flat structure)
router.get('/my-organizations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userOrgs = await db
      .select({
        id: userOrganizations.id,
        organizationId: userOrganizations.organizationId,
        organizationName: organizations.name,
        organizationType: organizations.type,
        organizationLogo: organizations.logoUrl,
        roleId: userOrganizations.roleId,
        isDefault: userOrganizations.isDefault,
        joinedAt: userOrganizations.joinedAt
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, req.user.id))
      .orderBy(userOrganizations.isDefault);

    res.json(userOrgs);
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
});

// Get current organization
router.get('/current', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const currentOrgId = req.user.currentOrganizationId;
    if (!currentOrgId) {
      return res.status(404).json({ message: 'No organization selected' });
    }

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, currentOrgId));

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(org);
  } catch (error) {
    console.error('Error fetching current organization:', error);
    res.status(500).json({ message: 'Failed to fetch organization' });
  }
});

// Switch organization (POST with body)
router.post('/switch', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user || !req.session) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    // Verify user has access to this organization
    const [userOrg] = await db
      .select()
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, req.user.id),
          eq(userOrganizations.organizationId, organizationId)
        )
      );

    if (!userOrg) {
      return res.status(403).json({ message: 'You do not have access to this organization' });
    }

    // Update session with new organization
    if (req.session.user) {
      req.session.user.currentOrganizationId = organizationId;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Failed to switch organization' });
        }
        res.json({ 
          message: 'Organization switched successfully',
          organizationId
        });
      });
    } else {
      res.status(401).json({ message: 'Session not found' });
    }
  } catch (error) {
    console.error('Error switching organization:', error);
    res.status(500).json({ message: 'Failed to switch organization' });
  }
});

// Switch organization (legacy URL param version)
router.post('/switch/:organizationId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user || !req.session) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const organizationId = parseInt(req.params.organizationId);

    // Verify user has access to this organization
    const [userOrg] = await db
      .select()
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, req.user.id),
          eq(userOrganizations.organizationId, organizationId)
        )
      );

    if (!userOrg) {
      return res.status(403).json({ message: 'You do not have access to this organization' });
    }

    // Update session with new organization
    if (req.session.user) {
      req.session.user.currentOrganizationId = organizationId;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Failed to switch organization' });
        }
        res.json({ 
          message: 'Organization switched successfully',
          organizationId
        });
      });
    } else {
      res.status(401).json({ message: 'Session not found' });
    }
  } catch (error) {
    console.error('Error switching organization:', error);
    res.status(500).json({ message: 'Failed to switch organization' });
  }
});

// Set default organization
router.post('/set-default/:organizationId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const organizationId = parseInt(req.params.organizationId);

    // Verify user has access to this organization
    const [userOrg] = await db
      .select()
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, req.user.id),
          eq(userOrganizations.organizationId, organizationId)
        )
      );

    if (!userOrg) {
      return res.status(403).json({ message: 'You do not have access to this organization' });
    }

    // Remove default from all user's organizations
    await db
      .update(userOrganizations)
      .set({ isDefault: false })
      .where(eq(userOrganizations.userId, req.user.id));

    // Set new default
    await db
      .update(userOrganizations)
      .set({ isDefault: true })
      .where(
        and(
          eq(userOrganizations.userId, req.user.id),
          eq(userOrganizations.organizationId, organizationId)
        )
      );

    res.json({ message: 'Default organization updated successfully' });
  } catch (error) {
    console.error('Error setting default organization:', error);
    res.status(500).json({ message: 'Failed to set default organization' });
  }
});

// Add user to organization (admin only)
router.post('/add-staff', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    if (!['admin', 'superadmin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    const { userId, organizationId, setAsDefault } = req.body;

    if (!userId || !organizationId) {
      return res.status(400).json({ message: 'User ID and Organization ID are required' });
    }

    // Verify the organization exists and admin has access to it
    const currentOrgId = req.user.currentOrganizationId || req.user.organizationId;
    if (organizationId !== currentOrgId) {
      return res.status(403).json({ message: 'You can only add staff to your current organization' });
    }

    // Check if user exists
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already in this organization
    const [existing] = await db
      .select()
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, organizationId)
        )
      );

    if (existing) {
      return res.status(400).json({ message: 'User is already a member of this organization' });
    }

    // Add user to organization
    await db.insert(userOrganizations).values({
      userId,
      organizationId,
      isDefault: setAsDefault || false,
    });

    // If setting as default, remove default from other orgs
    if (setAsDefault) {
      await db
        .update(userOrganizations)
        .set({ isDefault: false })
        .where(
          and(
            eq(userOrganizations.userId, userId),
            eq(userOrganizations.organizationId, organizationId)
          )
        );
    }

    res.json({ 
      message: 'Staff member added to organization successfully',
      userId,
      organizationId
    });
  } catch (error) {
    console.error('Error adding staff to organization:', error);
    res.status(500).json({ message: 'Failed to add staff to organization' });
  }
});

// Search for users to add to organization (admin only)
router.get('/search-staff', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    if (!['admin', 'superadmin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    const { query } = req.query;
    const currentOrgId = req.user.currentOrganizationId || req.user.organizationId;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search for users who are NOT already in the current organization
    const searchResults = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        email: users.email,
        title: users.title
      })
      .from(users)
      .where(
        and(
          or(
            ilike(users.username, `%${query}%`),
            ilike(users.firstName, `%${query}%`),
            ilike(users.lastName, `%${query}%`),
            ilike(users.email, `%${query}%`)
          ),
          // Exclude users already in this organization
          notExists(
            db
              .select()
              .from(userOrganizations)
              .where(
                and(
                  eq(userOrganizations.userId, users.id),
                  eq(userOrganizations.organizationId, currentOrgId!)
                )
              )
          ),
          eq(users.isActive, true) // Only active users
        )
      )
      .limit(20);

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching for staff:', error);
    res.status(500).json({ message: 'Failed to search for staff' });
  }
});

// Get staff members in current organization (admin only)
router.get('/staff-members', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    if (!['admin', 'superadmin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    const currentOrgId = req.user.currentOrganizationId || req.user.organizationId;

    if (!currentOrgId) {
      return res.status(400).json({ message: 'No organization selected' });
    }

    // Get all staff members in the current organization
    const staffMembers = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        email: users.email,
        title: users.title,
        isDefault: userOrganizations.isDefault,
        joinedAt: userOrganizations.joinedAt
      })
      .from(userOrganizations)
      .innerJoin(users, eq(userOrganizations.userId, users.id))
      .where(eq(userOrganizations.organizationId, currentOrgId));

    res.json(staffMembers);
  } catch (error) {
    console.error('Error fetching staff members:', error);
    res.status(500).json({ message: 'Failed to fetch staff members' });
  }
});

// Remove staff from organization (admin only)
router.delete('/remove-staff/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    if (!['admin', 'superadmin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    const userId = parseInt(req.params.userId);
    const currentOrgId = req.user.currentOrganizationId || req.user.organizationId;

    if (!currentOrgId) {
      return res.status(400).json({ message: 'No organization selected' });
    }

    // Don't allow removing self
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot remove yourself from the organization' });
    }

    // Remove user from organization
    await db
      .delete(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, currentOrgId)
        )
      );

    res.json({ message: 'Staff member removed from organization successfully' });
  } catch (error) {
    console.error('Error removing staff from organization:', error);
    res.status(500).json({ message: 'Failed to remove staff from organization' });
  }
});

export default router;

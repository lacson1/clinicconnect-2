import { Express } from 'express';
import { db } from '../db';
import { tabConfigs, insertTabConfigSchema } from '../../shared/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { tenantMiddleware, type TenantRequest } from '../middleware/tenant';

type TabScope = 'system' | 'organization' | 'role' | 'user';

export function setupTabConfigRoutes(app: Express) {
  // Get tab configurations with scope hierarchy resolution
  app.get('/api/tab-configs', authenticateToken, tenantMiddleware, async (req: TenantRequest & AuthRequest, res) => {
    try {
      const organizationId = req.tenant?.id;
      const userId = req.user?.id;
      const roleId = req.user?.roleId;

      if (!organizationId) {
        return res.status(403).json({ error: 'Organization context required' });
      }

      // Fetch tabs in hierarchy order: system -> organization -> role -> user
      const tabs = await db
        .select()
        .from(tabConfigs)
        .where(
          or(
            // System defaults (available to all)
            and(eq(tabConfigs.scope, 'system'), eq(tabConfigs.isSystemDefault, true)),
            // Organization-specific tabs
            and(eq(tabConfigs.scope, 'organization'), eq(tabConfigs.organizationId, organizationId)),
            // Role-specific tabs (if user has a role)
            roleId ? and(eq(tabConfigs.scope, 'role'), eq(tabConfigs.roleId, roleId)) : undefined,
            // User-specific tabs
            userId ? and(eq(tabConfigs.scope, 'user'), eq(tabConfigs.userId, userId)) : undefined
          )
        )
        .orderBy(tabConfigs.displayOrder);

      // Merge tabs by key, preferring more specific scopes
      const tabMap = new Map();
      const scopePriority: Record<TabScope, number> = { system: 1, organization: 2, role: 3, user: 4 };

      for (const tab of tabs) {
        const existing = tabMap.get(tab.key);
        const tabScope = tab.scope as TabScope;
        const existingScope = existing?.scope as TabScope;
        
        if (!existing || scopePriority[tabScope] > scopePriority[existingScope]) {
          tabMap.set(tab.key, tab);
        }
      }

      const mergedTabs = Array.from(tabMap.values())
        .filter(tab => tab.isVisible)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      res.json(mergedTabs);
    } catch (error) {
      console.error('Error fetching tab configs:', error);
      res.status(500).json({ error: 'Failed to fetch tab configurations' });
    }
  });

  // Create a new custom tab
  app.post('/api/tab-configs', authenticateToken, tenantMiddleware, async (req: TenantRequest & AuthRequest, res) => {
    try {
      const organizationId = req.tenant?.id;
      const userId = req.user?.id;

      if (!organizationId) {
        return res.status(403).json({ error: 'Organization context required' });
      }

      const validatedData = insertTabConfigSchema.parse(req.body);

      // Auto-assign IDs based on scope
      const tabData = {
        ...validatedData,
        organizationId: validatedData.scope === 'organization' ? organizationId : null,
        userId: validatedData.scope === 'user' ? userId : null,
        createdBy: userId,
        isSystemDefault: false,
      };

      const [newTab] = await db.insert(tabConfigs).values(tabData).returning();

      res.status(201).json(newTab);
    } catch (error) {
      console.error('Error creating tab config:', error);
      res.status(400).json({ error: 'Failed to create tab configuration' });
    }
  });

  // Update tab configuration
  app.patch('/api/tab-configs/:id', authenticateToken, tenantMiddleware, async (req: TenantRequest & AuthRequest, res) => {
    try {
      const tabId = parseInt(req.params.id);
      const userId = req.user?.id;
      const organizationId = req.tenant?.id;

      const [existingTab] = await db
        .select()
        .from(tabConfigs)
        .where(eq(tabConfigs.id, tabId));

      if (!existingTab) {
        return res.status(404).json({ error: 'Tab configuration not found' });
      }

      if (existingTab.isSystemDefault) {
        return res.status(403).json({ error: 'Cannot modify system default tabs' });
      }

      // Multi-tenant access control: verify ownership
      if (existingTab.scope === 'organization' && existingTab.organizationId !== organizationId) {
        return res.status(403).json({ error: 'Cannot edit another organization\'s tab' });
      }

      if (existingTab.scope === 'role') {
        if (existingTab.organizationId !== organizationId || existingTab.roleId !== req.user?.roleId) {
          return res.status(403).json({ error: 'Cannot edit another role\'s tab' });
        }
      }

      if (existingTab.scope === 'user' && existingTab.userId !== userId) {
        return res.status(403).json({ error: 'Cannot edit another user\'s tab' });
      }

      const { label, icon, isVisible, settings } = req.body;

      const [updatedTab] = await db
        .update(tabConfigs)
        .set({
          label,
          icon,
          isVisible,
          settings,
          updatedAt: new Date(),
        })
        .where(eq(tabConfigs.id, tabId))
        .returning();

      res.json(updatedTab);
    } catch (error) {
      console.error('Error updating tab config:', error);
      res.status(400).json({ error: 'Failed to update tab configuration' });
    }
  });

  // Reorder tabs
  app.patch('/api/tab-configs/reorder', authenticateToken, tenantMiddleware, async (req: TenantRequest & AuthRequest, res) => {
    try {
      const { tabs } = req.body;
      const organizationId = req.tenant?.id;
      const userId = req.user?.id;

      if (!organizationId) {
        return res.status(403).json({ error: 'Organization context required' });
      }

      if (!Array.isArray(tabs)) {
        return res.status(400).json({ error: 'Invalid request format' });
      }

      if (tabs.length === 0) {
        return res.json({ message: 'No tabs to reorder', count: 0 });
      }

      // Fetch all tabs to verify ownership before reordering
      const tabIds = tabs.map(t => t.id);
      const existingTabs = await db
        .select()
        .from(tabConfigs)
        .where(inArray(tabConfigs.id, tabIds));

      // SECURITY: Ensure ALL requested tabs were found
      // If counts don't match, some IDs don't exist or belong to another tenant
      if (existingTabs.length !== tabs.length) {
        return res.status(403).json({ error: 'Cannot reorder tabs that do not belong to your organization' });
      }

      // Verify each tab belongs to current tenant/user
      // SECURITY: Also filter out system defaults to prevent global ordering changes
      for (const tab of existingTabs) {
        // System defaults cannot be reordered (immutable)
        if (tab.isSystemDefault) {
          return res.status(403).json({ error: 'Cannot reorder system default tabs' });
        }

        if (tab.scope === 'organization' && tab.organizationId !== organizationId) {
          return res.status(403).json({ error: 'Cannot reorder another organization\'s tabs' });
        }
        if (tab.scope === 'role') {
          if (tab.organizationId !== organizationId || tab.roleId !== req.user?.roleId) {
            return res.status(403).json({ error: 'Cannot reorder another role\'s tabs' });
          }
        }
        if (tab.scope === 'user' && tab.userId !== userId) {
          return res.status(403).json({ error: 'Cannot reorder another user\'s tabs' });
        }
      }

      const updates = await Promise.all(
        tabs.map(({ id, displayOrder }: { id: number; displayOrder: number }) =>
          db
            .update(tabConfigs)
            .set({ displayOrder, updatedAt: new Date() })
            .where(eq(tabConfigs.id, id))
            .returning()
        )
      );

      res.json({ message: 'Tab order updated successfully', count: updates.length });
    } catch (error) {
      console.error('Error reordering tabs:', error);
      res.status(400).json({ error: 'Failed to reorder tabs' });
    }
  });

  // Delete a custom tab
  app.delete('/api/tab-configs/:id', authenticateToken, tenantMiddleware, async (req: TenantRequest & AuthRequest, res) => {
    try {
      const tabId = parseInt(req.params.id);
      const userId = req.user?.id;
      const organizationId = req.tenant?.id;

      const [existingTab] = await db
        .select()
        .from(tabConfigs)
        .where(eq(tabConfigs.id, tabId));

      if (!existingTab) {
        return res.status(404).json({ error: 'Tab configuration not found' });
      }

      if (existingTab.isSystemDefault) {
        return res.status(403).json({ error: 'Cannot delete system default tabs' });
      }

      // Multi-tenant access control: verify ownership
      if (existingTab.scope === 'organization' && existingTab.organizationId !== organizationId) {
        return res.status(403).json({ error: 'Cannot delete another organization\'s tab' });
      }

      if (existingTab.scope === 'role') {
        if (existingTab.organizationId !== organizationId || existingTab.roleId !== req.user?.roleId) {
          return res.status(403).json({ error: 'Cannot delete another role\'s tab' });
        }
      }

      if (existingTab.scope === 'user' && existingTab.userId !== userId) {
        return res.status(403).json({ error: 'Cannot delete another user\'s tab' });
      }

      await db.delete(tabConfigs).where(eq(tabConfigs.id, tabId));

      res.json({ message: 'Tab deleted successfully' });
    } catch (error) {
      console.error('Error deleting tab config:', error);
      res.status(500).json({ error: 'Failed to delete tab configuration' });
    }
  });

  // Seed tab configurations
  app.post('/api/tab-configs/seed', authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { seedTabConfigs } = await import('../seedTabConfigs');
      const result = await seedTabConfigs();
      res.json(result);
    } catch (error) {
      console.error('Error seeding tab configs:', error);
      res.status(500).json({ error: 'Failed to seed tab configurations' });
    }
  });
}

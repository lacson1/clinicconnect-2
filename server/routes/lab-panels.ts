import { Express } from 'express';
import { db } from '../db';
import { labPanels, labPanelTests, labTests, labDepartments, labOrders, labOrderItems } from '../../shared/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { tenantMiddleware, type TenantRequest } from '../middleware/tenant';

export function setupLabPanelsRoutes(app: Express) {
  app.get('/api/lab-panels', authenticateToken, tenantMiddleware, async (req: TenantRequest, res) => {
    try {
      const organizationId = req.tenant?.id || (req as any).user?.organizationId;
      const { category, isCommon } = req.query;

      let query = db
        .select({
          id: labPanels.id,
          name: labPanels.name,
          code: labPanels.code,
          description: labPanels.description,
          category: labPanels.category,
          totalCost: labPanels.totalCost,
          estimatedTime: labPanels.estimatedTime,
          sampleType: labPanels.sampleType,
          isCommon: labPanels.isCommon,
          isActive: labPanels.isActive,
          departmentId: labPanels.departmentId,
          departmentName: labDepartments.name,
        })
        .from(labPanels)
        .leftJoin(labDepartments, eq(labPanels.departmentId, labDepartments.id))
        .where(and(
          eq(labPanels.isActive, true),
          organizationId ? eq(labPanels.organizationId, organizationId) : undefined
        ))
        .orderBy(desc(labPanels.isCommon), labPanels.name);

      const panels = await query;

      const filteredPanels = panels.filter(panel => {
        if (category && panel.category !== category) return false;
        if (isCommon === 'true' && !panel.isCommon) return false;
        return true;
      });

      res.json(filteredPanels);
    } catch (error) {
      console.error("Error fetching lab panels:", error);
      res.status(500).json({ message: "Failed to fetch lab panels" });
    }
  });

  app.get('/api/lab-panels/:id', authenticateToken, tenantMiddleware, async (req: TenantRequest, res) => {
    try {
      const organizationId = req.tenant?.id || (req as any).user?.organizationId;
      const panelId = parseInt(req.params.id);
      
      const panel = await db
        .select({
          id: labPanels.id,
          name: labPanels.name,
          code: labPanels.code,
          description: labPanels.description,
          category: labPanels.category,
          totalCost: labPanels.totalCost,
          estimatedTime: labPanels.estimatedTime,
          sampleType: labPanels.sampleType,
          preparationInstructions: labPanels.preparationInstructions,
          isCommon: labPanels.isCommon,
          isActive: labPanels.isActive,
          departmentId: labPanels.departmentId,
          departmentName: labDepartments.name,
        })
        .from(labPanels)
        .leftJoin(labDepartments, eq(labPanels.departmentId, labDepartments.id))
        .where(and(
          eq(labPanels.id, panelId),
          organizationId ? eq(labPanels.organizationId, organizationId) : undefined
        ))
        .limit(1);

      if (!panel || panel.length === 0) {
        return res.status(404).json({ message: "Lab panel not found" });
      }

      const tests = await db
        .select({
          id: labTests.id,
          name: labTests.name,
          code: labTests.code,
          loincCode: labTests.loincCode,
          category: labTests.category,
          description: labTests.description,
          units: labTests.units,
          referenceRange: labTests.referenceRange,
          sampleType: labTests.sampleType,
          cost: labTests.cost,
          isRequired: labPanelTests.isRequired,
          displayOrder: labPanelTests.displayOrder,
        })
        .from(labPanelTests)
        .innerJoin(labTests, eq(labPanelTests.testId, labTests.id))
        .where(eq(labPanelTests.panelId, panelId))
        .orderBy(labPanelTests.displayOrder);

      res.json({
        ...panel[0],
        tests,
        testCount: tests.length,
      });
    } catch (error) {
      console.error("Error fetching lab panel details:", error);
      res.status(500).json({ message: "Failed to fetch lab panel details" });
    }
  });

  app.post('/api/lab-orders/from-panel', authenticateToken, tenantMiddleware, async (req: TenantRequest, res) => {
    try {
      const organizationId = req.tenant?.id || (req as any).user?.organizationId;
      const userId = (req as any).user?.id;
      
      if (!userId || !organizationId) {
        return res.status(403).json({ message: "Authentication required" });
      }

      const { patientId, panelId, clinicalNotes, diagnosis, priority = 'routine' } = req.body;

      if (!patientId || !panelId) {
        return res.status(400).json({ message: "Patient ID and Panel ID are required" });
      }

      const panel = await db
        .select()
        .from(labPanels)
        .where(and(
          eq(labPanels.id, panelId),
          organizationId ? eq(labPanels.organizationId, organizationId) : undefined
        ))
        .limit(1);

      if (!panel || panel.length === 0) {
        return res.status(404).json({ message: "Lab panel not found or access denied" });
      }

      const panelTests = await db
        .select({
          testId: labPanelTests.testId,
          isRequired: labPanelTests.isRequired,
        })
        .from(labPanelTests)
        .where(eq(labPanelTests.panelId, panelId));

      if (!panelTests || panelTests.length === 0) {
        return res.status(400).json({ message: "Panel has no associated tests" });
      }

      const testIds = panelTests.map(pt => pt.testId);
      
      const tests = await db
        .select({
          id: labTests.id,
          name: labTests.name,
          cost: labTests.cost,
        })
        .from(labTests)
        .where(inArray(labTests.id, testIds));

      const totalCost = panel[0].totalCost || tests.reduce((sum, test) => {
        const cost = parseFloat(test.cost?.toString() || '0');
        return sum + cost;
      }, 0);

      const order = await db
        .insert(labOrders)
        .values({
          patientId,
          orderedBy: userId,
          status: 'pending',
          priority,
          clinicalNotes: clinicalNotes || `Panel: ${panel[0].name}`,
          diagnosis,
          organizationId,
          totalCost: totalCost.toString(),
        })
        .returning();

      const orderItems = await db
        .insert(labOrderItems)
        .values(
          testIds.map(testId => ({
            labOrderId: order[0].id,
            labTestId: testId,
            status: 'pending',
          }))
        )
        .returning();

      res.status(201).json({
        message: "Lab order created successfully from panel",
        order: order[0],
        orderItems,
        panel: {
          id: panel[0].id,
          name: panel[0].name,
          testCount: testIds.length,
        },
      });
    } catch (error) {
      console.error("Error creating lab order from panel:", error);
      res.status(500).json({ 
        message: "Failed to create lab order from panel",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

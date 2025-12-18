import { Router } from "express";
import { authenticateToken, requireAnyRole, type AuthRequest } from "../middleware/auth";
import { db } from "../db";
import { consultationForms, consultationRecords } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

/**
 * Consultation Forms routes
 * Handles: consultation form CRUD operations
 */
export function setupConsultationFormsRoutes(): Router {
  
  // Get all consultation forms
  router.get("/consultation-forms", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: "Organization context required" });
      }

      const forms = await db
        .select()
        .from(consultationForms)
        .where(eq(consultationForms.organizationId, organizationId))
        .orderBy(desc(consultationForms.createdAt))
        .catch(() => []); // Return empty array if table doesn't exist
      
      res.json(Array.isArray(forms) ? forms : []);
    } catch (error) {
      console.error('Error fetching consultation forms:', error);
      res.json([]); // Return empty array on error
    }
  });

  // Get consultation form by ID
  router.get("/consultation-forms/:id", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const formId = parseInt(req.params.id);
      const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: "Organization context required" });
      }

      const [form] = await db
        .select()
        .from(consultationForms)
        .where(and(
          eq(consultationForms.id, formId),
          eq(consultationForms.organizationId, organizationId)
        ))
        .limit(1);
      
      if (!form) {
        return res.status(404).json({ message: "Consultation form not found" });
      }
      
      res.json(form);
    } catch (error) {
      console.error('Error fetching consultation form:', error);
      res.status(500).json({ message: "Failed to fetch consultation form" });
    }
  });

  return router;
}


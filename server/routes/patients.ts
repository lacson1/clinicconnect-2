import { Router } from "express";
import { authenticateToken, requireAnyRole, type AuthRequest } from "../middleware/auth";
import { storage } from "../storage";
import { insertPatientSchema, insertVisitSchema, patients, visits, vaccinations, prescriptions, labResults, labOrders, vitalSigns, safetyAlerts, auditLogs, consultationRecords, medicalHistory, insertMedicalHistorySchema } from "@shared/schema";
import { z } from "zod";
import { db } from "../db";
import { eq, desc, or, ilike, and, sql } from "drizzle-orm";

const router = Router();

/**
 * Patient management routes
 * Handles: patient CRUD, visits, medical records, search functionality
 */
export function setupPatientRoutes(): Router {
  
  // Create patient - Allow all authenticated users to register patients
  router.post("/patients", authenticateToken, async (req: AuthRequest, res) => {
    try {
      console.log('=== PATIENT REGISTRATION REQUEST ===');
      console.log('req.user:', req.user);
      console.log('req.body:', req.body);
      
      // authenticateToken middleware should always set req.user
      // If it's not set, there's an issue with the middleware
      if (!req.user) {
        console.error('ERROR: req.user is not set after authenticateToken middleware');
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Validate organizationId - use from body if provided, otherwise from user context
      const organizationId = req.body.organizationId || req.user?.organizationId;
      if (!organizationId) {
        return res.status(400).json({ 
          message: "Organization ID is required. Please provide organizationId in request body or ensure your account is assigned to an organization." 
        });
      }
      
      // Check if patient with same phone already exists in this organization
      if (req.body.phone) {
        const existingPatient = await db
          .select()
          .from(patients)
          .where(and(
            eq(patients.phone, req.body.phone),
            eq(patients.organizationId, organizationId)
          ))
          .limit(1);
        
        if (existingPatient.length > 0) {
          return res.status(400).json({ 
            message: "A patient with this phone number already exists in this organization." 
          });
        }
      }
      
      // Add the staff member's organization ID to ensure proper attribution
      const patientData = insertPatientSchema.parse({
        ...req.body,
        organizationId: organizationId
      });
      
      console.log('Creating patient with data:', patientData);
      const patient = await storage.createPatient(patientData);
      console.log('Patient created successfully:', patient.id);
      
      res.json(patient);
    } catch (error) {
      console.error('Patient registration error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      } else if (error instanceof Error) {
        // Handle database constraint errors
        if (error.message.includes('duplicate key') || error.message.includes('UNIQUE constraint')) {
          res.status(400).json({ message: "A patient with this information already exists." });
        } else if (error.message.includes('foreign key') || error.message.includes('organization_id')) {
          res.status(400).json({ message: "Invalid organization ID. The specified organization does not exist." });
        } else {
          res.status(500).json({ message: "Failed to create patient", error: error.message });
        }
      } else {
        res.status(500).json({ message: "Failed to create patient" });
      }
    }
  });

  // Enhanced patients endpoint with analytics
  router.get("/patients/enhanced", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin', 'pharmacist']), async (req: AuthRequest, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      console.error('Error fetching enhanced patients:', error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Patient analytics endpoint
  router.get("/patients/analytics", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin', 'pharmacist']), async (req: AuthRequest, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patient analytics:', error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Main patients listing
  router.get("/patients", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin', 'pharmacist']), async (req: AuthRequest, res) => {
    try {
      const userOrgId = req.user?.organizationId;
      const search = req.query.search as string | undefined;
      
      // Organization-filtered patients (if organizationId is null, show all patients - authentication disabled mode)
      let whereClause = userOrgId ? eq(patients.organizationId, userOrgId) : undefined;
      
      if (search) {
        const searchConditions = [
          ilike(patients.firstName, `%${search}%`),
          ilike(patients.lastName, `%${search}%`),
          ilike(patients.phone, `%${search}%`)
        ];
        if (userOrgId) {
          const combinedClause = and(
            eq(patients.organizationId, userOrgId),
            or(...searchConditions)
          );
          whereClause = combinedClause ?? eq(patients.organizationId, userOrgId);
        } else {
          whereClause = or(...searchConditions);
        }
      }
      
      const patientsResult = await db.select()
        .from(patients)
        .where(whereClause || undefined)
        .orderBy(desc(patients.createdAt));
      
      // Prevent caching to ensure fresh data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json(patientsResult);
    } catch (error) {
      console.error('Error fetching patients:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Search patients for autocomplete
  router.get("/patients/search", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin', 'pharmacist']), async (req: AuthRequest, res) => {
    try {
      const userOrgId = req.user?.organizationId;
      if (!userOrgId) {
        return res.status(400).json({ message: "Organization context required" });
      }
      
      const search = req.query.search as string || "";
      
      let whereClause = eq(patients.organizationId, userOrgId);
      
      if (search) {
        const searchConditions = or(
          ilike(patients.firstName, `%${search}%`),
          ilike(patients.lastName, `%${search}%`),
          ilike(patients.phone, `%${search}%`),
          ilike(patients.email, `%${search}%`)
        );
        whereClause = and(eq(patients.organizationId, userOrgId), searchConditions);
      }
      
      const searchResults = await db.select()
        .from(patients)
        .where(whereClause)
        .limit(20)
        .orderBy(desc(patients.createdAt));
        
      res.json(searchResults);
    } catch (error) {
      console.error("Error searching patients:", error);
      res.status(500).json({ message: "Failed to search patients" });
    }
  });

  // Get all medical history for a patient - MUST be before /patients/:id route (route ordering)
  router.get("/patients/:id/medical-history", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const userOrgId = req.user?.organizationId;
      
      if (!userOrgId) {
        return res.status(403).json({ message: "Organization context required" });
      }
      
      // Verify patient belongs to user's organization
      const [patient] = await db.select().from(patients)
        .where(and(eq(patients.id, patientId), eq(patients.organizationId, userOrgId)))
        .limit(1);
      
      if (!patient) {
        return res.status(403).json({ message: "Access denied - patient not in your organization" });
      }
      
      const historyRecords = await db.select()
        .from(medicalHistory)
        .where(eq(medicalHistory.patientId, patientId))
        .orderBy(desc(medicalHistory.dateOccurred));

      res.json(historyRecords);
    } catch (error) {
      console.error('Error fetching patient medical history:', error);
      res.status(500).json({ message: "Failed to fetch medical history records" });
    }
  });

  router.post("/patients/:id/medical-history", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: "Organization context required" });
      }
      
      // Verify patient belongs to user's organization
      const [patient] = await db.select().from(patients)
        .where(and(eq(patients.id, patientId), eq(patients.organizationId, organizationId)))
        .limit(1);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Use schema validation instead of manual validation
      const validatedData = insertMedicalHistorySchema.parse({
        ...req.body,
        patientId
      });
      
      const [newHistory] = await db.insert(medicalHistory).values(validatedData).returning();

      res.status(201).json(newHistory);
    } catch (error) {
      console.error('Error creating medical history entry:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid medical history data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create medical history entry" });
    }
  });

  router.patch("/patients/:id/medical-history/:historyId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const historyId = parseInt(req.params.historyId);
      const userOrgId = req.user?.organizationId;
      
      if (!userOrgId) {
        return res.status(403).json({ message: "Organization context required" });
      }
      
      // Verify patient belongs to user's organization
      const [patient] = await db.select().from(patients)
        .where(and(eq(patients.id, patientId), eq(patients.organizationId, userOrgId)))
        .limit(1);
      
      if (!patient) {
        return res.status(403).json({ message: "Access denied - patient not in your organization" });
      }
      
      // Validate and sanitize update fields
      const allowedFields = ['condition', 'type', 'dateOccurred', 'status', 'description', 'treatment', 'notes'];
      const sanitizedData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (key in req.body) {
          sanitizedData[key] = req.body[key];
        }
      }
      
      const [updated] = await db.update(medicalHistory)
        .set(sanitizedData)
        .where(and(
          eq(medicalHistory.id, historyId),
          eq(medicalHistory.patientId, patientId)
        ))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Medical history record not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating medical history entry:', error);
      res.status(500).json({ message: "Failed to update medical history entry" });
    }
  });

  router.delete("/patients/:id/medical-history/:historyId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const historyId = parseInt(req.params.historyId);
      const userOrgId = req.user?.organizationId;
      
      if (!userOrgId) {
        return res.status(403).json({ message: "Organization context required" });
      }
      
      // Verify patient belongs to user's organization
      const [patient] = await db.select().from(patients)
        .where(and(eq(patients.id, patientId), eq(patients.organizationId, userOrgId)))
        .limit(1);
      
      if (!patient) {
        return res.status(403).json({ message: "Access denied - patient not in your organization" });
      }
      
      const [deleted] = await db.delete(medicalHistory)
        .where(and(
          eq(medicalHistory.id, historyId),
          eq(medicalHistory.patientId, patientId)
        ))
        .returning();

      if (!deleted) {
        return res.status(404).json({ message: "Medical history record not found" });
      }

      res.json({ message: "Medical history record deleted successfully" });
    } catch (error) {
      console.error('Error deleting medical history entry:', error);
      res.status(500).json({ message: "Failed to delete medical history entry" });
    }
  });

  // Get all clinical notes for a patient - MUST be before /patients/:id route (route ordering)
  router.get("/patients/:id/clinical-notes", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const userOrgId = req.user?.organizationId;
      
      if (!userOrgId) {
        return res.status(403).json({ message: "Organization context required" });
      }
      
      // Verify patient belongs to user's organization
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      if (patient.organizationId !== userOrgId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const notes = await storage.getClinicalNotesByPatient(patientId, userOrgId);
      
      // Return empty array if no notes found (this is valid)
      res.json(notes || []);
    } catch (error) {
      console.error('Error fetching patient clinical notes:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch clinical notes";
      res.status(500).json({ 
        message: "Failed to fetch clinical notes",
        error: errorMessage 
      });
    }
  });

  router.get("/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      if (!patient) {
        res.status(404).json({ message: "Patient not found" });
        return;
      }

      // Calculate age safely with proper null/undefined handling
      const dob = patient.dateOfBirth ? new Date(patient.dateOfBirth) : null;
      let age = null;
      
      if (dob && !isNaN(dob.getTime())) {
        const today = new Date();
        age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        // Ensure age is reasonable (0-150)
        if (age < 0 || age > 150) {
          age = null;
        }
      }

      res.json({
        ...patient,
        age: age
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  // Quick patient summary for doctor workflow
  router.get("/patients/:id/summary", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      
      // Get basic patient info
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Get quick counts and latest data
      const [visitCount, prescriptionCount, labOrderCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(visits).where(eq(visits.patientId, patientId)),
        db.select({ count: sql<number>`count(*)` }).from(prescriptions).where(eq(prescriptions.patientId, patientId)),
        db.select({ count: sql<number>`count(*)` }).from(labOrders).where(eq(labOrders.patientId, patientId))
      ]);

      // Calculate age
      const dob = patient.dateOfBirth ? new Date(patient.dateOfBirth) : null;
      let age = null;
      if (dob && !isNaN(dob.getTime())) {
        const today = new Date();
        age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 0 || age > 150) age = null;
      }

      res.json({
        patient: {
          ...patient,
          age,
          fullName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown'
        },
        summary: {
          totalVisits: visitCount[0]?.count || 0,
          totalPrescriptions: prescriptionCount[0]?.count || 0,
          totalLabOrders: labOrderCount[0]?.count || 0,
          updatedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error("Failed to fetch patient summary:", error);
      res.status(500).json({ message: "Failed to fetch patient summary" });
    }
  });

  // Update patient information
  router.patch("/patients/:id", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Remove any undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const updatedPatient = await storage.updatePatient(id, updateData);
      if (!updatedPatient) {
        res.status(404).json({ message: "Patient not found" });
        return;
      }

      // Log the update action
      await req.auditLogger?.logPatientAction('UPDATE', id, { 
        updatedFields: Object.keys(updateData) 
      });

      res.json(updatedPatient);
    } catch (error) {
      console.error('Error updating patient:', error);
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  // Archive/unarchive patient (placeholder - not fully implemented)
  router.patch("/patients/:id/archive", authenticateToken, requireAnyRole(['doctor', 'admin']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { archived } = req.body;
      
      // Note: Archive functionality not fully implemented in schema
      // This endpoint exists for future implementation
      // For now, just log the action and return success
      
      await req.auditLogger?.logPatientAction(
        archived ? 'ARCHIVE' : 'UNARCHIVE',
        id,
        { archived }
      );

      res.json({ 
        message: `Patient ${archived ? 'archived' : 'unarchived'} successfully (pending implementation)`, 
        patient: { id } 
      });
    } catch (error) {
      console.error('Error archiving patient:', error);
      res.status(500).json({ message: "Failed to archive patient" });
    }
  });

  // === VISIT ROUTES ===

  // Create visit
  router.post("/patients/:id/visits", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      console.log('=== VISIT CREATION DEBUG ===');
      console.log('Patient ID:', patientId);
      console.log('Raw request body:', JSON.stringify(req.body, null, 2));
      console.log('User making request:', req.user?.username, 'Role:', req.user?.role);
      
      // Clean up empty strings to undefined for optional fields and fix field mapping
      const cleanedData = { ...req.body };
      if (cleanedData.heartRate === '') cleanedData.heartRate = undefined;
      if (cleanedData.temperature === '') cleanedData.temperature = undefined;
      if (cleanedData.weight === '') cleanedData.weight = undefined;
      if (cleanedData.followUpDate === '') cleanedData.followUpDate = undefined;
      
      // Fix field name mapping - frontend sends chiefComplaint, backend expects complaint
      if (cleanedData.chiefComplaint !== undefined) {
        cleanedData.complaint = cleanedData.chiefComplaint;
        delete cleanedData.chiefComplaint;
      }
      
      // Fix field name mapping - frontend sends treatmentPlan, backend expects treatment
      if (cleanedData.treatmentPlan !== undefined) {
        cleanedData.treatment = cleanedData.treatmentPlan;
        delete cleanedData.treatmentPlan;
      }
      
      console.log('Cleaned data:', JSON.stringify(cleanedData, null, 2));
      
      // Add the staff member's organization ID to ensure proper letterhead attribution
      const visitData = insertVisitSchema.parse({ 
        ...cleanedData, 
        patientId,
        doctorId: req.user?.id,
        organizationId: req.user?.organizationId
      });
      console.log('Parsed visit data:', JSON.stringify(visitData, null, 2));
      
      const visit = await storage.createVisit(visitData);
      console.log('Visit created successfully:', visit);
      res.json(visit);
    } catch (error: any) {
      console.error('=== VISIT CREATION ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error instance:', error.constructor.name);
      if (error instanceof z.ZodError) {
        console.error('Zod validation errors:', JSON.stringify(error.errors, null, 2));
        res.status(400).json({ message: "Invalid visit data", errors: error.errors });
      } else {
        console.error('Non-Zod error:', error);
        res.status(500).json({ message: "Failed to create visit", error: error.message });
      }
    }
  });

  // Get patient visits
  router.get("/patients/:id/visits", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const visits = await storage.getVisitsByPatient(patientId);
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visits" });
    }
  });

  // Get individual visit
  router.get("/patients/:patientId/visits/:visitId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const visitId = parseInt(req.params.visitId);
      const visit = await storage.getVisitById(visitId);
      
      if (!visit || visit.patientId !== patientId) {
        return res.status(404).json({ message: "Visit not found" });
      }
      
      res.json(visit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visit" });
    }
  });

  // Update visit
  router.patch("/patients/:patientId/visits/:visitId", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const visitId = parseInt(req.params.visitId);
      
      // Clean up empty strings to undefined for optional fields
      const cleanedData = { ...req.body };
      if (cleanedData.heartRate === '') cleanedData.heartRate = undefined;
      if (cleanedData.temperature === '') cleanedData.temperature = undefined;
      if (cleanedData.weight === '') cleanedData.weight = undefined;
      if (cleanedData.followUpDate === '') cleanedData.followUpDate = undefined;
      
      // Remove any undefined fields
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === undefined || cleanedData[key] === '') {
          delete cleanedData[key];
        }
      });

      const updatedVisit = await storage.updateVisit(visitId, cleanedData);
      if (!updatedVisit) {
        return res.status(404).json({ message: "Visit not found" });
      }

      // Log the update action
      await req.auditLogger?.logVisitAction('UPDATE', visitId, { 
        updatedFields: Object.keys(cleanedData) 
      });

      res.json(updatedVisit);
    } catch (error) {
      console.error('Error updating visit:', error);
      res.status(500).json({ message: "Failed to update visit" });
    }
  });

  // === GLOBAL SEARCH (Patient-centric) ===

  // Enhanced global search endpoint - includes patients, vaccinations, prescriptions, lab results
  router.get("/search/global", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin', 'pharmacist']), async (req: AuthRequest, res) => {
    try {
      const userOrgId = req.user?.organizationId;
      if (!userOrgId) {
        return res.status(400).json({ message: "Organization context required" });
      }
      
      const search = req.query.q as string || "";
      const type = req.query.type as string || "all"; // all, patients, vaccinations, prescriptions, labs
      
      if (!search || search.length < 2) {
        return res.json({ results: [], totalCount: 0 });
      }

      const results: any[] = [];

      // Search patients
      if (type === "all" || type === "patients") {
        const patientResults = await db.select({
          id: patients.id,
          type: sql<string>`'patient'`,
          title: patients.firstName,
          subtitle: patients.lastName,
          description: patients.phone,
          metadata: sql<any>`json_object('email', ${patients.email}, 'gender', ${patients.gender}, 'dateOfBirth', ${patients.dateOfBirth})`
        })
        .from(patients)
        .where(and(
          eq(patients.organizationId, userOrgId),
          or(
            ilike(patients.firstName, `%${search}%`),
            ilike(patients.lastName, `%${search}%`),
            ilike(patients.phone, `%${search}%`),
            ilike(patients.email, `%${search}%`)
          )
        ))
        .limit(10);
        
        results.push(...patientResults);
      }

      // Search vaccinations (if needed, can be moved to separate module later)
      if (type === "all" || type === "vaccinations") {
        const vaccinationResults = await db.select({
          id: vaccinations.id,
          type: sql<string>`'vaccination'`,
          title: vaccinations.vaccineName,
          subtitle: sql<string>`'Vaccination'`,
          description: vaccinations.doseNumber,
          metadata: sql<any>`json_object('patientId', ${vaccinations.patientId}, 'administeredDate', ${vaccinations.administeredDate})`
        })
        .from(vaccinations)
        .where(and(
          eq(vaccinations.organizationId, userOrgId),
          ilike(vaccinations.vaccineName, `%${search}%`)
        ))
        .limit(10);
        
        results.push(...vaccinationResults);
      }

      // Search prescriptions (if needed, can be moved to separate module later)
      if (type === "all" || type === "prescriptions") {
        const prescriptionResults = await db.select({
          id: prescriptions.id,
          type: sql<string>`'prescription'`,
          title: prescriptions.medicationName,
          subtitle: sql<string>`'Prescription'`,
          description: prescriptions.dosage,
          metadata: sql<any>`json_object('patientId', ${prescriptions.patientId}, 'prescribedDate', ${prescriptions.prescribedDate})`
        })
        .from(prescriptions)
        .where(and(
          eq(prescriptions.organizationId, userOrgId),
          or(
            ilike(prescriptions.medicationName, `%${search}%`),
            ilike(prescriptions.dosage, `%${search}%`)
          )
        ))
        .limit(10);
        
        results.push(...prescriptionResults);
      }

      // Search lab results (if needed, can be moved to separate module later)
      if (type === "all" || type === "labs") {
        const labResultsData = await db.select({
          id: labResults.id,
          type: sql<string>`'lab_result'`,
          title: labResults.testName,
          subtitle: sql<string>`'Lab Result'`,
          description: labResults.result,
          metadata: sql<any>`json_object('patientId', ${labResults.patientId}, 'testDate', ${labResults.testDate})`
        })
        .from(labResults)
        .where(and(
          eq(labResults.organizationId, userOrgId),
          or(
            ilike(labResults.testName, `%${search}%`),
            ilike(labResults.result, `%${search}%`)
          )
        ))
        .limit(10);
        
        results.push(...labResultsData);
      }

      // Sort results by relevance (exact matches first, then partial matches)
      const sortedResults = results.sort((a, b) => {
        const aExact = a.title.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
        const bExact = b.title.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
        return bExact - aExact;
      });

      res.json({
        results: sortedResults.slice(0, 20),
        totalCount: sortedResults.length,
        searchTerm: search,
        searchType: type
      });
    } catch (error) {
      console.error("Error in global search:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Vital Signs Routes
  router.get("/patients/:id/vitals", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: "Organization context required" });
      }
      
      // Verify patient belongs to the same organization
      const [patient] = await db
        .select()
        .from(patients)
        .where(and(
          eq(patients.id, patientId),
          eq(patients.organizationId, organizationId)
        ))
        .limit(1);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const vitals = await db
        .select()
        .from(vitalSigns)
        .where(and(
          eq(vitalSigns.patientId, patientId),
          eq(vitalSigns.organizationId, organizationId)
        ))
        .orderBy(desc(vitalSigns.recordedAt));
      
      res.json(vitals);
    } catch (error) {
      console.error('Error fetching vitals:', error);
      res.status(500).json({ message: "Failed to fetch vital signs" });
    }
  });

  router.post("/patients/:id/vitals", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const { 
        bloodPressureSystolic,
        bloodPressureDiastolic,
        heartRate,
        temperature,
        respiratoryRate,
        oxygenSaturation,
        weight,
        height
      } = req.body;

      // Get organizationId from user context
      const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;
      if (!organizationId) {
        return res.status(400).json({ message: "Organization context required" });
      }

      const [vital] = await db
        .insert(vitalSigns)
        .values({
          patientId,
          organizationId,
          bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null,
          bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null,
          heartRate: heartRate ? parseInt(heartRate) : null,
          temperature: temperature ? parseFloat(temperature) : null,
          respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
          oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : null,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          recordedAt: new Date(),
          recordedBy: req.user?.username || 'Unknown'
        })
        .returning();

      res.json(vital);
    } catch (error: any) {
      console.error('Error recording vitals:', error);
      
      // Provide more specific error messages
      if (error.code === '23503') {
        return res.status(400).json({ message: "Invalid patient ID or organization" });
      }
      if (error.code === '23502') {
        return res.status(400).json({ message: `Missing required field: ${error.column || 'unknown'}` });
      }
      
      res.status(500).json({ 
        message: "Failed to record vital signs",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Safety Alerts Route
  router.get("/patients/:id/safety-alerts", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: "Organization context required" });
      }

      // Verify patient belongs to the same organization
      const [patient] = await db
        .select()
        .from(patients)
        .where(and(
          eq(patients.id, patientId),
          eq(patients.organizationId, organizationId)
        ))
        .limit(1);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Get safety alerts for patient (if table exists, otherwise return empty array)
      const alerts = await db
        .select()
        .from(safetyAlerts)
        .where(and(
          eq(safetyAlerts.patientId, patientId),
          eq(safetyAlerts.organizationId, organizationId)
        ))
        .orderBy(desc(safetyAlerts.createdAt))
        .catch(() => []); // Return empty array if table doesn't exist
      
      res.json(Array.isArray(alerts) ? alerts : []);
    } catch (error) {
      console.error('Error fetching safety alerts:', error);
      res.json([]); // Return empty array on error
    }
  });

  // Activity Trail Route
  router.get("/patients/:id/activity-trail", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: "Organization context required" });
      }

      // Verify patient belongs to the same organization
      const [patient] = await db
        .select()
        .from(patients)
        .where(and(
          eq(patients.id, patientId),
          eq(patients.organizationId, organizationId)
        ))
        .limit(1);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Get audit logs for patient
      const activityTrail = await db
        .select()
        .from(auditLogs)
        .where(and(
          eq(auditLogs.patientId, patientId),
          eq(auditLogs.organizationId, organizationId)
        ))
        .orderBy(desc(auditLogs.createdAt))
        .limit(100)
        .catch(() => []); // Return empty array if table doesn't exist
      
      res.json(Array.isArray(activityTrail) ? activityTrail : []);
    } catch (error) {
      console.error('Error fetching activity trail:', error);
      res.json([]); // Return empty array on error
    }
  });

  // Consultation Records Route
  router.get("/patients/:id/consultation-records", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ message: "Organization context required" });
      }

      // Verify patient belongs to the same organization
      const [patient] = await db
        .select()
        .from(patients)
        .where(and(
          eq(patients.id, patientId),
          eq(patients.organizationId, organizationId)
        ))
        .limit(1);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Get consultation records for patient
      const records = await db
        .select()
        .from(consultationRecords)
        .where(eq(consultationRecords.patientId, patientId))
        .orderBy(desc(consultationRecords.createdAt))
        .catch(() => []); // Return empty array if table doesn't exist
      
      res.json(Array.isArray(records) ? records : []);
    } catch (error) {
      console.error('Error fetching consultation records:', error);
      res.json([]); // Return empty array on error
    }
  });

  return router;
}
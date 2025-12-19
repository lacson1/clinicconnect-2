import { Router } from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// Create new AI consultation
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { patientId, chiefComplaint } = req.body;
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const userOrgId = req.user.currentOrganizationId || req.user.organizationId;
    
    if (!userOrgId) {
      return res.status(403).json({ message: "Organization context required" });
    }
    
    // Validate patient exists and belongs to the same organization
    const patient = await storage.getPatient(parseInt(patientId));
    if (!patient) {
      return res.status(404).json({ message: "Patient not found. Please create a patient first before starting a consultation." });
    }
    if (patient.organizationId !== userOrgId) {
      return res.status(403).json({ message: "Patient belongs to a different organization" });
    }
    
    const consultationData = {
      patientId: parseInt(patientId),
      providerId: req.user.id,
      chiefComplaint: chiefComplaint || '',
      organizationId: userOrgId,
      status: 'in_progress' as const,
      transcript: []
    };
    
    const consultation = await storage.createAiConsultation(consultationData);
    res.status(201).json(consultation);
  } catch (error) {
    console.error('Error creating AI consultation:', error);
    if (res.headersSent) {
      return;
    }
    res.status(500).json({ message: "Failed to create consultation" });
  }
});

// List AI consultations
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { patientId, status } = req.query;
    const userOrgId = req.user.currentOrganizationId || req.user.organizationId;
    
    if (!userOrgId) {
      return res.status(403).json({ message: "Organization context required" });
    }
    
    const consultations = await storage.getAiConsultations({
      patientId: patientId ? parseInt(patientId as string) : undefined,
      status: status as string,
      organizationId: userOrgId
    });
    
    res.json(consultations);
  } catch (error) {
    console.error('Error fetching AI consultations:', error);
    if (res.headersSent) {
      return;
    }
    res.status(500).json({ message: "Failed to fetch consultations" });
  }
});

// Get single AI consultation
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const id = parseInt(req.params.id);
    const userOrgId = req.user.currentOrganizationId || req.user.organizationId;
    
    if (!userOrgId) {
      return res.status(403).json({ message: "Organization context required" });
    }
    
    const consultation = await storage.getAiConsultation(id, userOrgId);
    
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    
    res.json(consultation);
  } catch (error) {
    console.error('Error fetching AI consultation:', error);
    if (res.headersSent) {
      return;
    }
    res.status(500).json({ message: "Failed to fetch consultation" });
  }
});

export default router;


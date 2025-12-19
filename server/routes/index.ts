import type { Express } from "express";
import { setupPatientRoutes } from "./patients";
import { setupLaboratoryRoutes } from "./laboratory";
import { setupPrescriptionRoutes } from "./prescriptions";
import { setupPatientExtendedRoutes } from "./patient-extended";
import publicApiRouter from "./public-api";
import mobileApiRouter from "./mobile-api";
import apiKeysRouter from "./api-keys";
import apiDocsRouter from "./api-docs";
import accessControlRouter from "./access-control";
import organizationsRouter from "./organizations";
import authRouter from "./auth";
import healthRouter from "./health";
import profileRouter from "./profile";
import { setupTabConfigRoutes } from "./tab-configs";
import { setupTabPresetRoutes } from "./tab-presets";
import { setupVisitRoutes } from "./visits";
import { setupLabResultsRoutes } from "./lab-results";
import { setupMedicinesRoutes } from "./medicines";
import { setupReferralRoutes } from "./referrals";
import { setupVaccinationRoutes } from "./vaccinations";
import { setupAppointmentRoutes } from "./appointments";
import { setupBillingRoutes } from "./billing";
import { setupAnalyticsRoutes } from "./analytics";
import { setupNotificationRoutes } from "./notifications";
import { setupSuggestionRoutes } from "./suggestions";
import { setupSystemRoutes } from "./system";
import { setupIntegrationRoutes } from "./integrations";
import { setupConsultationFormsRoutes } from "./consultation-forms";
import aiConsultationsRouter from "./ai-consultations";
// import { setupPatientPortalRoutes } from "./patient-portal";
// import { setupBillingRoutes } from "./billing";
// import { setupSystemRoutes } from "./system";

/**
 * Sets up all route modules for the healthcare management system
 * This replaces the monolithic routes.ts file with organized, domain-specific modules
 */
export function setupRoutes(app: Express): void {
  console.log("=== SETTING UP MODULAR ROUTES ===");
  
  // Health check routes (for monitoring)
  console.log("Setting up health check routes...");
  if (!healthRouter) {
    throw new Error('healthRouter is not defined');
  }
  app.use('/api/health', healthRouter);
  console.log("✓ Health routes registered at /api/health");
  
  // Authentication routes (must be first for security)
  console.log("Setting up authentication routes...");
  if (!authRouter) {
    throw new Error('authRouter is not defined');
  }
  app.use('/api/auth', authRouter);
  console.log("✓ Auth routes registered at /api/auth");
  
  // Profile routes
  console.log("Setting up profile routes...");
  if (!profileRouter) {
    throw new Error('profileRouter is not defined');
  }
  app.use('/api/profile', profileRouter);
  console.log("✓ Profile routes registered at /api/profile");
  
  // Core healthcare functionality - ONLY modules that exist
  console.log("Setting up patient routes...");
  const patientRouter = setupPatientRoutes();
  app.use('/api', patientRouter);
  
  console.log("Setting up laboratory routes...");
  const laboratoryRouter = setupLaboratoryRoutes();
  app.use('/api', laboratoryRouter);
  
  console.log("Setting up prescription routes...");
  const prescriptionRouter = setupPrescriptionRoutes();
  app.use('/api', prescriptionRouter);
  
  console.log("Setting up patient extended routes (allergies, immunizations, imaging, procedures)...");
  const patientExtendedRouter = setupPatientExtendedRoutes();
  app.use('/api', patientExtendedRouter);
  
  // Visit routes
  console.log("Setting up visit routes...");
  const visitRouter = setupVisitRoutes();
  app.use('/api', visitRouter);
  
  // Lab Results routes
  console.log("Setting up lab results routes...");
  const labResultsRouter = setupLabResultsRoutes();
  app.use('/api', labResultsRouter);
  
  // Medicines routes
  console.log("Setting up medicines routes...");
  const medicinesRouter = setupMedicinesRoutes();
  app.use('/api', medicinesRouter);
  
  // Referrals routes
  console.log("Setting up referrals routes...");
  const referralsRouter = setupReferralRoutes();
  app.use('/api', referralsRouter);
  
  // Vaccinations routes
  console.log("Setting up vaccinations routes...");
  const vaccinationsRouter = setupVaccinationRoutes();
  app.use('/api', vaccinationsRouter);
  
  // Appointments routes
  console.log("Setting up appointments routes...");
  const appointmentsRouter = setupAppointmentRoutes();
  app.use('/api', appointmentsRouter);
  
  // Billing routes
  console.log("Setting up billing routes...");
  const billingRouter = setupBillingRoutes();
  app.use('/api', billingRouter);
  
  // Analytics routes
  console.log("Setting up analytics routes...");
  const analyticsRouter = setupAnalyticsRoutes();
  app.use('/api', analyticsRouter);
  
  // Notifications routes
  console.log("Setting up notifications routes...");
  const notificationsRouter = setupNotificationRoutes();
  app.use('/api', notificationsRouter);
  
  // Suggestions routes
  console.log("Setting up suggestions routes...");
  const suggestionsRouter = setupSuggestionRoutes();
  app.use('/api', suggestionsRouter);
  
  // System routes
  console.log("Setting up system routes...");
  const systemRouter = setupSystemRoutes();
  app.use('/api', systemRouter);
  
  // Integration routes
  console.log("Setting up integration routes...");
  const integrationRouter = setupIntegrationRoutes();
  app.use('/api', integrationRouter);
  
  // Consultation Forms routes
  console.log("Setting up consultation forms routes...");
  const consultationFormsRouter = setupConsultationFormsRoutes();
  app.use('/api', consultationFormsRouter);
  
  // AI Consultations routes
  console.log("Setting up AI consultations routes...");
  app.use('/api/ai-consultations', aiConsultationsRouter);
  console.log("✓ AI consultations routes registered at /api/ai-consultations");
  
  // Public REST API routes
  console.log("Setting up public API routes...");
  app.use('/api/v1', publicApiRouter);
  
  // Mobile-optimized API routes
  console.log("Setting up mobile API routes...");
  app.use('/api/mobile', mobileApiRouter);
  
  // API Keys management routes
  console.log("Setting up API keys management routes...");
  app.use('/api/api-keys', apiKeysRouter);
  
  // API Documentation routes
  console.log("Setting up API documentation routes...");
  app.use('/api/docs', apiDocsRouter);
  
  // Access Control & Role Management routes
  console.log("Setting up access control routes...");
  app.use('/api/access-control', accessControlRouter);
  // Also expose /api/staff as an alias for /api/access-control/staff
  app.use('/api/staff', accessControlRouter);
  
  // Organization Management routes
  console.log("Setting up organization management routes...");
  app.use('/api/organizations', organizationsRouter);
  
  // Tab Configurations routes
  console.log("Setting up tab configurations routes...");
  setupTabConfigRoutes(app);
  
  // Tab Presets routes
  console.log("Setting up tab presets routes...");
  setupTabPresetRoutes(app);
  
  // Note: All modular routes are now set up above.
  // Additional routes from routes.ts (dashboard stats, patient search, etc.)
  // are loaded via registerRoutes() in server/index.ts
  
  console.log("=== MODULAR ROUTES SETUP COMPLETE ===");
}
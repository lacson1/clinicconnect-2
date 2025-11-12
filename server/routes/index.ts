import type { Express } from "express";
import { setupPatientRoutes } from "./patients";
import { setupLaboratoryRoutes } from "./laboratory";
import { setupPrescriptionRoutes } from "./prescriptions";
import publicApiRouter from "./public-api";
import mobileApiRouter from "./mobile-api";
import apiKeysRouter from "./api-keys";
import apiDocsRouter from "./api-docs";
import accessControlRouter from "./access-control";
import organizationsRouter from "./organizations";
import { setupTabConfigRoutes } from "./tab-configs";
// import { setupAppointmentRoutes } from "./appointments";
// import { setupAuthRoutes } from "./auth";
// import { setupAnalyticsRoutes } from "./analytics";
// import { setupIntegrationRoutes } from "./integrations";
// import { setupSuggestionRoutes } from "./suggestions";
// import { setupNotificationRoutes } from "./notifications";
// import { setupPatientPortalRoutes } from "./patient-portal";
// import { setupBillingRoutes } from "./billing";
// import { setupSystemRoutes } from "./system";

/**
 * Sets up all route modules for the healthcare management system
 * This replaces the monolithic routes.ts file with organized, domain-specific modules
 */
export function setupRoutes(app: Express): void {
  console.log("=== SETTING UP MODULAR ROUTES ===");
  
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
  
  // Organization Management routes
  console.log("Setting up organization management routes...");
  app.use('/api/organizations', organizationsRouter);
  
  // Tab Configurations routes
  console.log("Setting up tab configurations routes...");
  setupTabConfigRoutes(app);
  
  // TODO: Add remaining modules as they are created:
  // setupAppointmentRoutes(app);
  // setupAuthRoutes(app);
  // setupAnalyticsRoutes(app);
  // setupBillingRoutes(app);
  // setupIntegrationRoutes(app);
  // setupPatientPortalRoutes(app);
  // setupSuggestionRoutes(app);
  // setupNotificationRoutes(app);
  // setupSystemRoutes(app);
  
  console.log("=== ROUTES SETUP COMPLETE ===");
}
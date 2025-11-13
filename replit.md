# Bluequee - Clinic Management System

## Production Status
**Status:** ✅ Production Ready (as of November 13, 2025)  
**Build:** ✅ Passing  
**Database:** PostgreSQL with real data only  
**Cleanup:** Complete (80+ demo/test files removed)

See `PRODUCTION_CLEANUP_SUMMARY.md` for detailed cleanup documentation.

### Recent Updates (November 13, 2025 - Afternoon)
**Critical Bug Fixes:**
- ✅ Fixed PostgreSQL compatibility issues in patient health metrics endpoints (ReferenceError, date function syntax)
- ✅ Resolved variable name conflict in `/api/patients/:id/health-metrics` causing initialization errors
- ✅ Updated SQL date functions from SQLite syntax to PostgreSQL (`DATE('now')` → `CURRENT_DATE - INTERVAL`, `DATETIME('now')` → `NOW()`)

**UI/UX Improvements:**
- ✅ Fixed calendar DOM nesting warnings using custom DayButton component with proper ARIA attributes
- ✅ Implemented patient billing tab with server-side filtering to prevent cross-patient data leakage
- ✅ Removed 20+ console.log statements from production code (keeping error logging intact)

**Security Enhancements:**
- ✅ Backend route `/api/invoices` now accepts `patientId` query parameter for server-side filtering
- ✅ PatientBillingTab component uses `/api/invoices?patientId=${id}` to fetch only patient-specific data
- ✅ Eliminated client-side filtering that previously exposed all invoices to frontend

## Overview
Bluequee is a comprehensive digital health platform designed for rural healthcare delivery in Southwest Nigeria. Its primary purpose is to provide robust, secure, and user-friendly tools for clinic management, patient care, and administration. Key capabilities include advanced medical communication, intelligent lab result analysis, and enhanced patient engagement, all while ensuring security, compliance, and accessibility. The platform aims to streamline operations related to patient data, appointments, prescriptions, and secure communication.

## User Preferences
- Focus on mobile-first responsive design
- Prioritize healthcare-specific functionality
- Maintain clean, professional interface design
- Ensure security and compliance standards

## System Architecture
**UI/UX Decisions:**
The system adopts a mobile-first responsive design, featuring a clean, professional interface built with Shadcn/UI components and Tailwind CSS. It incorporates a healthcare-card design system, clear UI elements, and WCAG 2.1 compliant accessibility, using color coding for visual hierarchy.

**Technical Implementations:**
- **Frontend:** React TypeScript with Wouter for routing.
- **Backend:** Express.js, offering Public REST API and Mobile API with API key authentication.
- **Database:** PostgreSQL managed via Drizzle ORM, utilizing `pg_trgm` for fuzzy search.
- **State Management:** TanStack Query.
- **Authentication:** Replit Auth (OpenID Connect for social logins) and custom username/password, supported by robust security middleware.
- **Security Headers:** Comprehensive middleware for CSP, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, and HSTS in production.
- **API System:** Public REST API (`/api/v1/*`) and Mobile API (`/api/mobile/*`) with API Key Management, OpenAPI/Swagger Documentation, configurable permissions, and rate limiting.
- **System Design Choices:** Supports multi-tenancy and uses a modular Express Router architecture.

**Feature Specifications:**
- **Enhanced Blood Test Dashboard:** A 4-tab interface with interactive charts (recharts), clinical trend analysis, and mobile responsiveness.
- **Enhanced Medication Management:** Features visual categorization, refill tracking, alerts, and touch-friendly mobile controls. Includes typo-tolerant fuzzy search for medication suggestions using PostgreSQL `pg_trgm`.
- **User Management System:** Provides role-based user creation, permission-based access control, organization-aware operations, and audit logging. Includes comprehensive RBAC with 63+ granular permissions.
- **Patient Management & Portal:** Redesigned interface for patient management with streamlined controls, search, filters, and sorting. A secure, mobile-responsive patient portal offers access to personal health information, lab results, medications, and appointments.
- **Multi-Organization Membership:** Users can belong to multiple organizations with selection on login and in-session switching.
- **Compliance & Export Reports:** Real-time generation of 6 report types (Excel, PDF, CSV, XML) for regulatory compliance and data exports, with filtering options.
- **AI-Powered Consultation Tool:** Leverages GPT-4o (via Replit AI Integrations) for context-aware patient simulations, intelligent SOAP note generation, differential diagnoses, ICD-10 auto-coding, lab test suggestions, clinical safety warnings, confidence scoring, and follow-up intelligence.
- **Laboratory Orders System:** Comprehensive system featuring AI-powered test suggestions (GPT-4o), a standardized test catalog (109 essential tests across 8 departments with LOINC codes and reference ranges), and 12 pre-configured panel groupings optimized for rural Nigerian healthcare. Includes multi-tenant security for both global and organization-specific tests/panels.
- **Dynamic Tab Management System:** Fully integrated production-ready tab customization system for patient overview with multi-tenant security. Features:
  - **Database-Driven Tabs**: 16 seeded system default tabs (overview, visits, lab, medications, vitals, documents, vaccinations, timeline, safety, consultation, med-reviews, communication, etc.)
  - **CRUD API**: Full tab management with scope-aware hierarchy (system → organization → role → user), immutable system defaults, and multi-tenant access control
  - **Patient Overview Integration**: ModernPatientOverview dynamically renders tabs from API with bidirectional key mapping (visits↔record-visit, lab↔labs) for backward compatibility
  - **TabManager Modal**: Settings button provides access to tab customization with visual indicators (system badges), disabled controls for protected tabs, and clear error messaging
  - **Graceful Fallbacks**: Loading states and offline mode with fallback tabs ensure continuous functionality during API failures
  - **Security**: XSS prevention, server-side validation (403 for system tab modifications), client-side guards preventing accidental changes

## External Dependencies
- **Replit Auth:** For OpenID Connect social logins.
- **OpenAI:** Utilized for AI features via Replit AI Integrations.
- **PostgreSQL:** The relational database, with `pg_trgm` extension for fuzzy search.
- **Drizzle ORM:** Used for database interaction.
- **Shadcn/UI:** Provides UI components.
- **Tailwind CSS:** The CSS framework.
- **TanStack Query:** For data fetching and state management.
- **Wouter:** The React router.
- **Express.js:** The backend web framework.
- **Passport.js:** Authentication middleware.
- **connect-pg-simple:** PostgreSQL session store.
- **recharts:** Used for charting and data visualization.
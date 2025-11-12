# Bluequee - Clinic Management System

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
- **Dynamic Tab Management System:** Allows production-ready patient overview tab customization with multi-tenant security. Features CRUD API for tab configurations with scope-aware hierarchy (system → organization → role → user), XSS prevention, and a dynamic tab renderer supporting various content types (builtin_component, markdown, iframe, query_widget).

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
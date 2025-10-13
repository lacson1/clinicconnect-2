# Bluequee - Clinic Management System

## Overview
Bluequee is a comprehensive digital health platform designed for rural healthcare delivery in Southwest Nigeria. It specializes in advanced medical communication, intelligent lab result analysis, and patient engagement. The platform aims to provide a robust, secure, and user-friendly system for clinic management, patient care, and administrative tasks. Key capabilities include patient data management, appointment tracking, prescription management, lab result analysis, and secure communication, with a strong focus on security, compliance, and accessibility.

## User Preferences
- Focus on mobile-first responsive design
- Prioritize healthcare-specific functionality
- Maintain clean, professional interface design
- Ensure security and compliance standards

## System Architecture
**UI/UX Decisions:**
The system adopts a mobile-first responsive design with a clean, professional interface. It utilizes Shadcn/UI components with Tailwind CSS for consistent styling, including a healthcare-card design system. UI elements like navigation, buttons, and forms are designed for clarity and ease of use, with accessibility improvements (WCAG 2.1 compliance) integrated throughout. Color coding is used for navigation groups, document tabs, and visual hierarchy.

**Technical Implementations:**
- **Frontend:** React TypeScript with Wouter for routing.
- **Backend:** Express.js, providing both a comprehensive Public REST API and a lightweight Mobile API, supporting API key authentication.
- **Database:** PostgreSQL managed with Drizzle ORM.
- **State Management:** TanStack Query for efficient data handling.
- **Authentication:** Integrated Replit Auth (OpenID Connect) for social logins (Google, GitHub, X, Apple, Email) alongside a custom username/password system. Features robust security middleware with password validation, login attempt tracking, account lockout, and enhanced session management.
- **API System:** Public REST API (`/api/v1/*`) and Mobile API (`/api/mobile/*`) with API Key Management, OpenAPI/Swagger Documentation, configurable permissions, and rate limiting.
- **Help & Support:** A comprehensive system with FAQs, guides, contact forms, and resource libraries.
- **System Design Choices:** Multi-tenant support with organization-aware operations. Employs a modular Express Router architecture for backend routes (e.g., Patients, Laboratory, Prescriptions).

**Feature Specifications:**
- **Enhanced Blood Test Dashboard:** 4-tab interface with interactive charts (recharts), clinical trend analysis, and mobile responsiveness.
- **Enhanced Medication Management:** Visual categorization, refill tracking, alerts, and touch-friendly mobile controls.
- **User Management System:** Role-based user creation, permission-based access control, organization-aware operations, and audit logging.
- **Patient Management:** Redesigned interface for improved usability with streamlined controls, grid/list views, search, filters, and sorting.
- **Patient Portal:** Secure patient authentication, dashboard, lab results, medications, and appointments, all mobile-responsive.
- **Staff Access Control System:** Comprehensive RBAC system with 63+ granular permissions across 11 categories (Patient Management, Clinical, Laboratory, Pharmacy, Billing, Reports, User Management, Records, System, Appointments, Analytics). Features role management UI for creating/editing roles with custom permission sets, individual and bulk staff role assignment, permission matrix view, and complete audit logging for all access control changes. Supports organization-scoped access control with multi-admin role compatibility (admin, superadmin, super_admin).
- **Multi-Organization Membership:** Users can belong to multiple organizations via the userOrganizations junction table. After login, users with multiple organizations select which one to enter. Organization switching is available via a dropdown in the dashboard header. Session management tracks currentOrganizationId separately from the legacy organizationId field. NOTE: Full multi-tenant isolation requires refactoring all data-loading endpoints to use currentOrganizationId instead of organizationId (tracked as tech debt).
- **Compliance & Export Reports:** Real-time report generation system for regulatory compliance and data exports. Backend API endpoint (POST `/api/compliance/reports/generate`) generates 6 report types with real database data: Patient Registry (Excel), Clinical Audit Trail (PDF), Financial Summary (Excel), Medication Inventory (CSV), Staff Activity (PDF), and Infection Control (XML). Uses ExcelJS for Excel files, jsPDF for PDFs, plain text for CSV, and XML string generation. All reports support optional date range filtering. Frontend component at `/compliance` provides category filtering (regulatory, clinical, financial, operational) and custom report builder. Security: Organization-scoped data access enforced for multi-tenant isolation, audit logs filtered by user organization. Note: Medications table is a global catalog shared across organizations.

## External Dependencies
- **Replit Auth:** For OpenID Connect-based social authentication (Google, GitHub, X, Apple, Email).
- **PostgreSQL:** Relational database system.
- **Drizzle ORM:** Object-Relational Mapper for database interaction.
- **Shadcn/UI:** UI component library.
- **Tailwind CSS:** Utility-first CSS framework.
- **TanStack Query:** Data fetching and state management library.
- **Wouter:** Lightweight React router.
- **Express.js:** Web application framework for Node.js.
- **Passport.js:** Authentication middleware for Node.js (used with OpenID Connect strategy).
- **connect-pg-simple:** PostgreSQL session store for Connect/Express.
- **recharts:** React charting library for data visualization.
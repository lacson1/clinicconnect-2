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
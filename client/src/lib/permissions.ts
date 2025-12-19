/**
 * Permission System for Role-Based Access Control
 * 
 * This file defines all available permissions and provides utilities
 * for checking permissions and roles throughout the application.
 */

// All available permissions in the system
export const PERMISSIONS = {
  // Patient Management
  PATIENTS_VIEW: 'patients.view',
  PATIENTS_CREATE: 'patients.create',
  PATIENTS_EDIT: 'patients.edit',
  PATIENTS_DELETE: 'patients.delete',
  PATIENTS_EXPORT: 'patients.export',
  
  // Appointments
  APPOINTMENTS_VIEW: 'appointments.view',
  APPOINTMENTS_CREATE: 'appointments.create',
  APPOINTMENTS_EDIT: 'appointments.edit',
  APPOINTMENTS_DELETE: 'appointments.delete',
  APPOINTMENTS_CANCEL: 'appointments.cancel',
  
  // Consultations
  CONSULTATIONS_VIEW: 'consultations.view',
  CONSULTATIONS_CREATE: 'consultations.create',
  CONSULTATIONS_EDIT: 'consultations.edit',
  CONSULTATIONS_DELETE: 'consultations.delete',
  
  // Prescriptions
  PRESCRIPTIONS_VIEW: 'prescriptions.view',
  PRESCRIPTIONS_CREATE: 'prescriptions.create',
  PRESCRIPTIONS_EDIT: 'prescriptions.edit',
  PRESCRIPTIONS_DELETE: 'prescriptions.delete',
  PRESCRIPTIONS_DISPENSE: 'prescriptions.dispense',
  
  // Laboratory
  LAB_VIEW: 'lab.view',
  LAB_CREATE: 'lab.create',
  LAB_EDIT: 'lab.edit',
  LAB_DELETE: 'lab.delete',
  LAB_APPROVE: 'lab.approve',
  
  // Pharmacy
  PHARMACY_VIEW: 'pharmacy.view',
  PHARMACY_MANAGE: 'pharmacy.manage',
  PHARMACY_DISPENSE: 'pharmacy.dispense',
  PHARMACY_INVENTORY: 'pharmacy.inventory',
  
  // Billing
  BILLING_VIEW: 'billing.view',
  BILLING_CREATE: 'billing.create',
  BILLING_EDIT: 'billing.edit',
  BILLING_DELETE: 'billing.delete',
  BILLING_APPROVE: 'billing.approve',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_CREATE: 'reports.create',
  REPORTS_EXPORT: 'reports.export',
  
  // User Management
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  
  // Roles & Permissions
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_EDIT: 'roles.edit',
  ROLES_DELETE: 'roles.delete',
  
  // Organization
  ORGANIZATION_VIEW: 'organization.view',
  ORGANIZATION_EDIT: 'organization.edit',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  
  // Audit Logs
  AUDIT_VIEW: 'audit.view',
  
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role definitions with default permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  superadmin: Object.values(PERMISSIONS), // All permissions
  super_admin: Object.values(PERMISSIONS), // All permissions
  
  admin: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.PATIENTS_DELETE,
    PERMISSIONS.PATIENTS_EXPORT,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_DELETE,
    PERMISSIONS.APPOINTMENTS_CANCEL,
    PERMISSIONS.CONSULTATIONS_VIEW,
    PERMISSIONS.CONSULTATIONS_CREATE,
    PERMISSIONS.CONSULTATIONS_EDIT,
    PERMISSIONS.PRESCRIPTIONS_VIEW,
    PERMISSIONS.PRESCRIPTIONS_CREATE,
    PERMISSIONS.PRESCRIPTIONS_EDIT,
    PERMISSIONS.LAB_VIEW,
    PERMISSIONS.LAB_CREATE,
    PERMISSIONS.LAB_EDIT,
    PERMISSIONS.PHARMACY_VIEW,
    PERMISSIONS.PHARMACY_MANAGE,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.BILLING_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_EDIT,
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_EDIT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  
  doctor: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_CANCEL,
    PERMISSIONS.CONSULTATIONS_VIEW,
    PERMISSIONS.CONSULTATIONS_CREATE,
    PERMISSIONS.CONSULTATIONS_EDIT,
    PERMISSIONS.PRESCRIPTIONS_VIEW,
    PERMISSIONS.PRESCRIPTIONS_CREATE,
    PERMISSIONS.PRESCRIPTIONS_EDIT,
    PERMISSIONS.LAB_VIEW,
    PERMISSIONS.LAB_CREATE,
    PERMISSIONS.LAB_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  
  nurse: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.CONSULTATIONS_VIEW,
    PERMISSIONS.CONSULTATIONS_CREATE,
    PERMISSIONS.CONSULTATIONS_EDIT,
    PERMISSIONS.LAB_VIEW,
    PERMISSIONS.LAB_CREATE,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  
  pharmacist: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PRESCRIPTIONS_VIEW,
    PERMISSIONS.PRESCRIPTIONS_DISPENSE,
    PERMISSIONS.PHARMACY_VIEW,
    PERMISSIONS.PHARMACY_MANAGE,
    PERMISSIONS.PHARMACY_DISPENSE,
    PERMISSIONS.PHARMACY_INVENTORY,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  
  receptionist: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.PATIENTS_CREATE,
    PERMISSIONS.PATIENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_CANCEL,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  
  lab_technician: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.LAB_VIEW,
    PERMISSIONS.LAB_CREATE,
    PERMISSIONS.LAB_EDIT,
    PERMISSIONS.LAB_APPROVE,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  
  physiotherapist: [
    PERMISSIONS.PATIENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.CONSULTATIONS_VIEW,
    PERMISSIONS.CONSULTATIONS_CREATE,
    PERMISSIONS.CONSULTATIONS_EDIT,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  
  user: [
    PERMISSIONS.DASHBOARD_VIEW,
  ],
} as const;

// Helper function to check if a role has a permission
export function roleHasPermission(role: string, permission: Permission): boolean {
  const normalizedRole = role?.toLowerCase() || 'user';
  
  // Super admins have all permissions
  if (normalizedRole === 'superadmin' || normalizedRole === 'super_admin') {
    return true;
  }
  
  const rolePerms = ROLE_PERMISSIONS[normalizedRole] || [];
  return rolePerms.includes(permission);
}

// Helper function to check if a role has any of the given permissions
export function roleHasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(permission => roleHasPermission(role, permission));
}

// Helper function to check if a role has all of the given permissions
export function roleHasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(permission => roleHasPermission(role, permission));
}

// Get all permissions for a role
export function getRolePermissions(role: string): Permission[] {
  const normalizedRole = role?.toLowerCase() || 'user';
  
  if (normalizedRole === 'superadmin' || normalizedRole === 'super_admin') {
    return Object.values(PERMISSIONS);
  }
  
  return ROLE_PERMISSIONS[normalizedRole] || [];
}


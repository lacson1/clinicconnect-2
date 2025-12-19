import { type Response, type NextFunction } from 'express';
import { db } from '../db';
import { roles, permissions, rolePermissions, users } from '@shared/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import type { AuthRequest } from './auth';

// Default role permissions mapping (fallback when RBAC is not configured)
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['*'], // All permissions
  super_admin: ['*'],
  admin: [
    'patients.view', 'patients.create', 'patients.edit', 'patients.delete',
    'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.delete',
    'consultations.view', 'consultations.create', 'consultations.edit',
    'prescriptions.view', 'prescriptions.create', 'prescriptions.edit',
    'lab.view', 'lab.create', 'lab.edit',
    'pharmacy.view', 'pharmacy.manage',
    'billing.view', 'billing.create', 'billing.edit',
    'reports.view', 'reports.create', 'reports.export',
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'roles.view', 'roles.create', 'roles.edit',
    'organization.view', 'organization.edit',
    'settings.view', 'settings.edit',
    'audit.view',
    'dashboard.view',
  ],
  doctor: [
    'patients.view', 'patients.create', 'patients.edit',
    'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.cancel',
    'consultations.view', 'consultations.create', 'consultations.edit',
    'prescriptions.view', 'prescriptions.create', 'prescriptions.edit',
    'lab.view', 'lab.create', 'lab.edit',
    'reports.view', 'reports.export',
    'dashboard.view',
  ],
  nurse: [
    'patients.view', 'patients.create', 'patients.edit',
    'appointments.view', 'appointments.create', 'appointments.edit',
    'consultations.view', 'consultations.create', 'consultations.edit',
    'lab.view', 'lab.create',
    'dashboard.view',
  ],
  pharmacist: [
    'patients.view',
    'prescriptions.view', 'prescriptions.dispense',
    'pharmacy.view', 'pharmacy.manage', 'pharmacy.dispense', 'pharmacy.inventory',
    'dashboard.view',
  ],
  receptionist: [
    'patients.view', 'patients.create', 'patients.edit',
    'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.cancel',
    'billing.view', 'billing.create',
    'dashboard.view',
  ],
  lab_technician: [
    'patients.view',
    'lab.view', 'lab.create', 'lab.edit', 'lab.approve',
    'dashboard.view',
  ],
  physiotherapist: [
    'patients.view',
    'appointments.view', 'appointments.create', 'appointments.edit',
    'consultations.view', 'consultations.create', 'consultations.edit',
    'dashboard.view',
  ],
  user: ['dashboard.view'],
};


/**
 * Middleware to check if user has specific permission
 */
export const checkPermission = (permissionName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userPermissions = await getUserPermissionsInternal(
        req.user.id,
        req.user.role,
        req.user.roleId
      );

      // Check if user has all permissions (*) or the specific permission
      if (userPermissions.includes('*') || userPermissions.includes(permissionName)) {
        return next();
      }

      return res.status(403).json({ 
        message: 'Access denied: insufficient permissions',
        required: permissionName,
        userPermissions: userPermissions.length > 0 ? userPermissions : ['none']
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 */
export const checkAnyPermission = (...permissionNames: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userPermissions = await getUserPermissionsInternal(
        req.user.id,
        req.user.role,
        req.user.roleId
      );

      // Check if user has all permissions (*) or any of the required permissions
      if (userPermissions.includes('*') || 
          permissionNames.some(perm => userPermissions.includes(perm))) {
        return next();
      }

      return res.status(403).json({ 
        message: 'Access denied: insufficient permissions',
        required: permissionNames,
        userPermissions: userPermissions.length > 0 ? userPermissions : ['none']
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

/**
 * Middleware to check if user has all of the specified permissions
 */
export const checkAllPermissions = (...permissionNames: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userPermissions = await getUserPermissionsInternal(
        req.user.id,
        req.user.role,
        req.user.roleId
      );

      // Check if user has all permissions (*) or all required permissions
      if (userPermissions.includes('*') || 
          permissionNames.every(perm => userPermissions.includes(perm))) {
        return next();
      }

      return res.status(403).json({ 
        message: 'Access denied: insufficient permissions',
        required: permissionNames,
        userPermissions: userPermissions.length > 0 ? userPermissions : ['none']
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

/**
 * Get all permissions for a user's role
 * @deprecated Use getUserPermissions(userId, userRole, roleId) instead
 */
export async function getUserPermissionsLegacy(userId: number): Promise<string[]> {
  try {
    const user = await db
      .select({ roleId: users.roleId, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) return [];

    // For backward compatibility with admin roles
    if (user[0].role === 'admin' || user[0].role === 'superadmin') {
      const allPermissions = await db.select({ name: permissions.name }).from(permissions);
      return allPermissions.map(p => p.name);
    }

    // Get permissions through RBAC system
    if (user[0].roleId) {
      const userPermissions = await db
        .select({ name: permissions.name })
        .from(rolePermissions)
        .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, user[0].roleId));

      return userPermissions.map(p => p.name);
    }

    return [];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  roleHasPermission, 
  roleHasAnyPermission, 
  roleHasAllPermissions,
  getRolePermissions,
  type Permission 
} from '@/lib/permissions';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

interface PermissionGuardProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGuard - Protects components based on user roles
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  
  if (!user) {
    return <>{fallback}</>;
  }
  
  const normalizedRole = user.role?.toLowerCase() || '';
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
  
  // Super admin has access to everything
  if (normalizedRole === 'superadmin' || normalizedRole === 'super_admin') {
    return <>{children}</>;
  }
  
  if (!normalizedAllowedRoles.includes(normalizedRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * PermissionGuard - Protects components based on user permissions
 */
export function PermissionGuard({ 
  permission, 
  requireAll = false,
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  if (!user) {
    return <>{fallback}</>;
  }
  
  const permissions = Array.isArray(permission) ? permission : [permission];
  
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * useRole - Hook for role-based checks
 */
export function useRole() {
  const { user } = useAuth();
  
  const normalizedRole = user?.role?.toLowerCase() || '';
  
  const hasRole = (role: string) => {
    const normalized = role.toLowerCase();
    return normalizedRole === normalized;
  };
  
  const hasAnyRole = (roles: string[]) => {
    if (!user) return false;
    const normalizedRoles = roles.map(r => r.toLowerCase());
    return normalizedRoles.includes(normalizedRole);
  };
  
  const isSuperAdmin = normalizedRole === 'superadmin' || normalizedRole === 'super_admin';
  
  return {
    user,
    role: normalizedRole,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin: hasRole('admin') || isSuperAdmin,
    isDoctor: hasRole('doctor'),
    isNurse: hasRole('nurse'),
    isPharmacist: hasRole('pharmacist'),
    isPhysiotherapist: hasRole('physiotherapist'),
    isReceptionist: hasRole('receptionist'),
    isLabTechnician: hasRole('lab_technician'),
    isFrontDesk: hasRole('receptionist'), // Alias for receptionist
  };
}

/**
 * usePermissions - Hook for permission-based checks
 * Fetches user permissions from the server and provides permission checking utilities
 */
export function usePermissions() {
  const { user } = useAuth();
  const { role } = useRole();
  
  // Fetch user permissions from server (for RBAC system)
  const { data: serverPermissions = [] } = useQuery<string[]>({
    queryKey: ['/api/access-control/users', user?.id, 'permissions'],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Get default permissions for the role
  const defaultPermissions = useMemo(() => {
    return getRolePermissions(role);
  }, [role]);
  
  // Combine server permissions with default role permissions
  const allPermissions = useMemo(() => {
    const combined = new Set<string>([...defaultPermissions, ...serverPermissions]);
    return Array.from(combined);
  }, [defaultPermissions, serverPermissions]);
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (role === 'superadmin' || role === 'super_admin') {
      return true;
    }
    
    // Check against combined permissions
    return allPermissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };
  
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };
  
  return {
    permissions: allPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: false,
  };
}
import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { organizations, userOrganizations, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "./auth";

export interface OrganizationContextRequest extends AuthRequest {
  organizationContext?: {
    id: number;
    name: string;
    type: string;
    isActive: boolean;
  };
  hasAccess: boolean;
}

// Cache for organization lookups (in-memory, can be replaced with Redis)
const orgCache = new Map<number, { org: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Middleware to resolve and validate organization context
 * Tries multiple methods: session, header, user's default org, user's current org
 */
export async function resolveOrganizationContext(
  req: OrganizationContextRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let organizationId: number | null = null;
    let organization: any = null;

    // Method 1: From session (currentOrganizationId)
    if (req.user.currentOrganizationId) {
      organizationId = req.user.currentOrganizationId;
    }

    // Method 2: From X-Organization-ID header
    if (!organizationId && req.headers["x-organization-id"]) {
      const headerOrgId = parseInt(req.headers["x-organization-id"] as string);
      if (!isNaN(headerOrgId)) {
        organizationId = headerOrgId;
      }
    }

    // Method 3: From user's default organization
    if (!organizationId) {
      const [defaultOrg] = await db
        .select({ organizationId: userOrganizations.organizationId })
        .from(userOrganizations)
        .where(
          and(
            eq(userOrganizations.userId, req.user.id),
            eq(userOrganizations.isDefault, true)
          )
        )
        .limit(1);

      if (defaultOrg) {
        organizationId = defaultOrg.organizationId;
      }
    }

    // Method 4: From user's first organization (fallback)
    if (!organizationId) {
      const [firstOrg] = await db
        .select({ organizationId: userOrganizations.organizationId })
        .from(userOrganizations)
        .where(eq(userOrganizations.userId, req.user.id))
        .limit(1);

      if (firstOrg) {
        organizationId = firstOrg.organizationId;
      }
    }

    // Method 5: From legacy organizationId field (backward compatibility)
    if (!organizationId && req.user.organizationId) {
      organizationId = req.user.organizationId;
    }

    if (!organizationId) {
      return res.status(400).json({
        message: "No organization context available. Please select an organization.",
      });
    }

    // Check cache first
    const cached = orgCache.get(organizationId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      organization = cached.org;
    } else {
      // Fetch organization from database
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }

      organization = org;
      // Cache the result
      orgCache.set(organizationId, { org, timestamp: Date.now() });
    }

    // Verify organization is active
    if (!organization.isActive) {
      return res.status(403).json({
        message: "Organization is inactive. Please contact your administrator.",
      });
    }

    // Verify user has access to this organization
    const hasAccess = await verifyUserOrganizationAccess(
      req.user.id,
      organizationId
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have access to this organization",
      });
    }

    // Attach organization context to request
    req.organizationContext = {
      id: organization.id,
      name: organization.name,
      type: organization.type || "clinic",
      isActive: organization.isActive,
    };
    req.hasAccess = true;

    next();
  } catch (error) {
    // Log error with context (only in development or if it's a real error)
    if (process.env.NODE_ENV === 'development' || error instanceof Error) {
      console.error("Error resolving organization context:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: req.user?.id,
        organizationId: req.user?.currentOrganizationId || req.user?.organizationId,
      });
    }
    
    // Don't send response if headers already sent
    if (res.headersSent) {
      return next(error);
    }
    
    res.status(500).json({ message: "Failed to resolve organization context" });
  }
}

/**
 * Verify user has access to an organization
 */
export async function verifyUserOrganizationAccess(
  userId: number,
  organizationId: number
): Promise<boolean> {
  try {
    // Super admins have access to all organizations
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user && ["superadmin", "super_admin"].includes(user.role)) {
      return true;
    }

    // Check user_organizations table
    const [userOrg] = await db
      .select()
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, organizationId)
        )
      )
      .limit(1);

    return !!userOrg;
  } catch (error) {
    // Log error only in development or if it's a real error
    if (process.env.NODE_ENV === 'development' || error instanceof Error) {
      console.error("Error verifying user organization access:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
        organizationId,
      });
    }
    // Return false on error (fail closed for security)
    return false;
  }
}

/**
 * Middleware to enforce organization context (requires organization to be set)
 */
export function requireOrganizationContext(
  req: OrganizationContextRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.organizationContext) {
    return res.status(400).json({
      message: "Organization context is required for this operation",
    });
  }
  next();
}

/**
 * Helper to get organization-scoped query conditions
 */
export function getOrganizationScope(organizationId: number) {
  return { organizationId };
}

/**
 * Helper to add organization context to data
 */
export function addOrganizationContext<T extends Record<string, any>>(
  data: T,
  organizationId: number
): T & { organizationId: number } {
  return {
    ...data,
    organizationId,
  };
}

/**
 * Clear organization cache (useful when organization is updated)
 */
export function clearOrganizationCache(organizationId?: number) {
  if (organizationId) {
    orgCache.delete(organizationId);
  } else {
    orgCache.clear();
  }
}


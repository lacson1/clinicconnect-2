import { db } from "../db";
import { organizations, userOrganizations, users, patients, visits, prescriptions, labOrders } from "@shared/schema";
import { eq, and, or, ilike, desc, sql, count } from "drizzle-orm";
import { clearOrganizationCache } from "../middleware/organization-context";

export interface CreateOrganizationInput {
  name: string;
  type?: string;
  logoUrl?: string;
  themeColor?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  letterheadConfig?: any;
}

export interface UpdateOrganizationInput extends Partial<CreateOrganizationInput> {
  isActive?: boolean;
}

export interface OrganizationStats {
  totalPatients: number;
  totalUsers: number;
  totalVisits: number;
  totalPrescriptions: number;
  totalLabOrders: number;
}

export class OrganizationService {
  /**
   * Create a new organization
   */
  async create(data: CreateOrganizationInput): Promise<typeof organizations.$inferSelect> {
    // Validate name uniqueness
    const existing = await db
      .select()
      .from(organizations)
      .where(ilike(organizations.name, data.name))
      .limit(1);

    if (existing.length > 0) {
      const error = new Error(`Organization with name "${data.name}" already exists`);
      error.name = 'OrganizationExistsError';
      throw error;
    }

    // Validate email uniqueness if provided
    if (data.email) {
      const existingEmail = await db
        .select()
        .from(organizations)
        .where(eq(organizations.email, data.email))
        .limit(1);

      if (existingEmail.length > 0) {
        throw new Error(`Organization with email "${data.email}" already exists`);
      }
    }

    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: data.name.trim(),
        type: data.type || "clinic",
        logoUrl: data.logoUrl,
        themeColor: data.themeColor || "#3B82F6",
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        letterheadConfig: data.letterheadConfig,
        isActive: true,
      })
      .returning();

    return newOrg;
  }

  /**
   * Update an organization
   */
  async update(
    organizationId: number,
    data: UpdateOrganizationInput
  ): Promise<typeof organizations.$inferSelect> {
    // Check if organization exists
    const [existing] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!existing) {
      const error = new Error("Organization not found");
      error.name = 'OrganizationNotFoundError';
      throw error;
    }

    // Validate name uniqueness if name is being changed
    if (data.name && data.name.trim() !== existing.name) {
      const nameExists = await db
        .select()
        .from(organizations)
        .where(
          and(
            ilike(organizations.name, data.name.trim()),
            sql`${organizations.id} != ${organizationId}`
          )
        )
        .limit(1);

      if (nameExists.length > 0) {
        throw new Error(`Organization with name "${data.name}" already exists`);
      }
    }

    // Validate email uniqueness if email is being changed
    if (data.email && data.email !== existing.email) {
      const emailExists = await db
        .select()
        .from(organizations)
        .where(
          and(
            eq(organizations.email, data.email),
            sql`${organizations.id} != ${organizationId}`
          )
        )
        .limit(1);

      if (emailExists.length > 0) {
        const error = new Error(`Organization with email "${data.email}" already exists`);
        error.name = 'OrganizationExistsError';
        throw error;
      }
    }

    const [updated] = await db
      .update(organizations)
      .set({
        ...data,
        name: data.name?.trim(),
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId))
      .returning();

    // Clear cache
    clearOrganizationCache(organizationId);

    return updated;
  }

  /**
   * Get organization by ID
   */
  async getById(organizationId: number): Promise<typeof organizations.$inferSelect | null> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    return org || null;
  }

  /**
   * Get organization statistics
   */
  async getStats(organizationId: number): Promise<OrganizationStats> {
    // Get counts in parallel for better performance
    const [patientCount, userCount, visitCount, prescriptionCount, labOrderCount] = await Promise.all([
      db.select({ count: count() }).from(patients).where(eq(patients.organizationId, organizationId)),
      db.select({ count: count() }).from(users).where(eq(users.organizationId, organizationId)),
      db.select({ count: count() }).from(visits).where(eq(visits.organizationId, organizationId)),
      db.select({ count: count() }).from(prescriptions).where(eq(prescriptions.organizationId, organizationId)),
      db.select({ count: count() }).from(labOrders).where(eq(labOrders.organizationId, organizationId)),
    ]);

    return {
      totalPatients: Number(patientCount[0]?.count || 0),
      totalUsers: Number(userCount[0]?.count || 0),
      totalVisits: Number(visitCount[0]?.count || 0),
      totalPrescriptions: Number(prescriptionCount[0]?.count || 0),
      totalLabOrders: Number(labOrderCount[0]?.count || 0),
    };
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(userId: number): Promise<Array<{
    organization: typeof organizations.$inferSelect;
    isDefault: boolean;
    roleId: number | null;
    joinedAt: Date | null;
  }>> {
    const userOrgs = await db
      .select({
        organization: organizations,
        isDefault: userOrganizations.isDefault,
        roleId: userOrganizations.roleId,
        joinedAt: userOrganizations.joinedAt,
      })
      .from(userOrganizations)
      .innerJoin(
        organizations,
        eq(userOrganizations.organizationId, organizations.id)
      )
      .where(eq(userOrganizations.userId, userId))
      .orderBy(desc(userOrganizations.isDefault), organizations.name);

    return userOrgs;
  }

  /**
   * Add user to organization
   */
  async addUserToOrganization(
    userId: number,
    organizationId: number,
    roleId?: number,
    setAsDefault: boolean = false
  ): Promise<void> {
    // Check if user is already in organization
    const [existing] = await db
      .select()
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, organizationId)
        )
      )
      .limit(1);

    if (existing) {
      const error = new Error("User is already a member of this organization");
      error.name = 'UserAlreadyMemberError';
      throw error;
    }

    // If setting as default, remove default from other orgs
    if (setAsDefault) {
      await db
        .update(userOrganizations)
        .set({ isDefault: false })
        .where(eq(userOrganizations.userId, userId));
    }

    // Add user to organization
    await db.insert(userOrganizations).values({
      userId,
      organizationId,
      roleId,
      isDefault: setAsDefault,
    });
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(userId: number, organizationId: number): Promise<void> {
    await db
      .delete(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, organizationId)
        )
      );
  }

  /**
   * Set default organization for user
   */
  async setDefaultOrganization(userId: number, organizationId: number): Promise<void> {
    // Verify user has access to this organization
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

    if (!userOrg) {
      const error = new Error("User does not have access to this organization");
      error.name = 'UserAccessDeniedError';
      throw error;
    }

    // Remove default from all user's organizations
    await db
      .update(userOrganizations)
      .set({ isDefault: false })
      .where(eq(userOrganizations.userId, userId));

    // Set new default
    await db
      .update(userOrganizations)
      .set({ isDefault: true })
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, organizationId)
        )
      );
  }

  /**
   * Deactivate organization (soft delete)
   */
  async deactivate(organizationId: number): Promise<void> {
    await db
      .update(organizations)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(organizations.id, organizationId));

    clearOrganizationCache(organizationId);
  }

  /**
   * Activate organization
   */
  async activate(organizationId: number): Promise<void> {
    await db
      .update(organizations)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(organizations.id, organizationId));

    clearOrganizationCache(organizationId);
  }

  /**
   * Search organizations
   */
  async search(query: string, limit: number = 20): Promise<typeof organizations.$inferSelect[]> {
    const results = await db
      .select()
      .from(organizations)
      .where(
        or(
          ilike(organizations.name, `%${query}%`),
          ilike(organizations.email, `%${query}%`),
          ilike(organizations.address, `%${query}%`)
        )
      )
      .limit(limit)
      .orderBy(organizations.name);

    return results;
  }
}

export const organizationService = new OrganizationService();


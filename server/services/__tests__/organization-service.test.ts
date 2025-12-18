import { describe, it, expect, beforeEach, vi } from 'vitest';
import { organizationService } from '../organization-service';
import { db } from '../../db';
import { organizations, userOrganizations, users, patients, visits, prescriptions, labOrders } from '@shared/schema';
import { eq, and, ilike, count } from 'drizzle-orm';

// Mock the database
vi.mock('../../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the cache clearing function
vi.mock('../../middleware/organization-context', () => ({
  clearOrganizationCache: vi.fn(),
}));

describe('OrganizationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new organization successfully', async () => {
      const orgData = {
        name: 'Test Clinic',
        type: 'clinic',
        email: 'test@clinic.com',
        themeColor: '#3B82F6',
      };

      const mockOrg = {
        id: 1,
        ...orgData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock name uniqueness check (no existing org)
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      // Mock email uniqueness check (no existing email)
      const mockEmailSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      // Mock insert
      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockOrg]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSelect as any) // Name check
        .mockReturnValueOnce(mockEmailSelect as any); // Email check

      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      const result = await organizationService.create(orgData);

      expect(result).toEqual(mockOrg);
      expect(db.insert).toHaveBeenCalledWith(organizations);
    });

    it('should throw error if organization name already exists', async () => {
      const orgData = {
        name: 'Existing Clinic',
        type: 'clinic',
      };

      // Mock existing organization
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 1, name: 'Existing Clinic' }]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      await expect(organizationService.create(orgData)).rejects.toThrow(
        'already exists'
      );
    });

    it('should throw error if email already exists', async () => {
      const orgData = {
        name: 'New Clinic',
        email: 'existing@clinic.com',
      };

      // Mock name check (no existing)
      const mockNameSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      // Mock email check (exists)
      const mockEmailSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 1, email: 'existing@clinic.com' }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockNameSelect as any)
        .mockReturnValueOnce(mockEmailSelect as any);

      await expect(organizationService.create(orgData)).rejects.toThrow(
        'already exists'
      );
    });

    it('should trim organization name', async () => {
      const orgData = {
        name: '  Test Clinic  ',
        type: 'clinic',
      };

      const mockOrg = { id: 1, name: 'Test Clinic', ...orgData };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockOrg]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);
      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      await organizationService.create(orgData);

      expect(mockInsert.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Clinic', // Trimmed
        })
      );
    });
  });

  describe('update', () => {
    it('should update organization successfully', async () => {
      const orgId = 1;
      const updateData = {
        name: 'Updated Clinic',
        themeColor: '#FF0000',
      };

      const existingOrg = {
        id: orgId,
        name: 'Old Clinic',
        email: 'old@clinic.com',
      };

      const updatedOrg = {
        ...existingOrg,
        ...updateData,
        updatedAt: new Date(),
      };

      // Mock existing org check
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([existingOrg]),
      };

      // Mock name uniqueness check (no conflict)
      const mockNameSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      // Mock update
      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedOrg]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSelect as any) // Existing check
        .mockReturnValueOnce(mockNameSelect as any); // Name uniqueness

      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      const result = await organizationService.update(orgId, updateData);

      expect(result).toEqual(updatedOrg);
      expect(db.update).toHaveBeenCalledWith(organizations);
    });

    it('should throw error if organization not found', async () => {
      const orgId = 999;
      const updateData = { name: 'Updated' };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // Not found
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      await expect(organizationService.update(orgId, updateData)).rejects.toThrow(
        'not found'
      );
    });
  });

  describe('getById', () => {
    it('should return organization by ID', async () => {
      const orgId = 1;
      const mockOrg = {
        id: orgId,
        name: 'Test Clinic',
        type: 'clinic',
        isActive: true,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrg]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await organizationService.getById(orgId);

      expect(result).toEqual(mockOrg);
    });

    it('should return null if organization not found', async () => {
      const orgId = 999;

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await organizationService.getById(orgId);

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return organization statistics', async () => {
      const orgId = 1;

      // Mock each count query separately
      const mockSelect1 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 10 }]), // patients
      };
      const mockSelect2 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 5 }]), // users
      };
      const mockSelect3 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 20 }]), // visits
      };
      const mockSelect4 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 15 }]), // prescriptions
      };
      const mockSelect5 = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 8 }]), // lab orders
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSelect1 as any)
        .mockReturnValueOnce(mockSelect2 as any)
        .mockReturnValueOnce(mockSelect3 as any)
        .mockReturnValueOnce(mockSelect4 as any)
        .mockReturnValueOnce(mockSelect5 as any);

      const result = await organizationService.getStats(orgId);

      expect(result).toEqual({
        totalPatients: 10,
        totalUsers: 5,
        totalVisits: 20,
        totalPrescriptions: 15,
        totalLabOrders: 8,
      });
    });

    it('should return zeros if no data exists', async () => {
      const orgId = 1;

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await organizationService.getStats(orgId);

      expect(result).toEqual({
        totalPatients: 0,
        totalUsers: 0,
        totalVisits: 0,
        totalPrescriptions: 0,
        totalLabOrders: 0,
      });
    });
  });

  describe('addUserToOrganization', () => {
    it('should add user to organization successfully', async () => {
      const userId = 1;
      const orgId = 2;
      const roleId = 3;

      // Mock existing check (no existing membership)
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      // Mock update (for removing default)
      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      // Mock insert
      const mockInsert = {
        values: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);
      vi.mocked(db.update).mockReturnValue(mockUpdate as any);
      vi.mocked(db.insert).mockReturnValue(mockInsert as any);

      await organizationService.addUserToOrganization(userId, orgId, roleId, true);

      expect(db.insert).toHaveBeenCalledWith(userOrganizations);
    });

    it('should throw error if user already in organization', async () => {
      const userId = 1;
      const orgId = 2;

      // Mock existing membership
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ userId, organizationId: orgId }]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      await expect(
        organizationService.addUserToOrganization(userId, orgId)
      ).rejects.toThrow('already a member');
    });
  });

  describe('removeUserFromOrganization', () => {
    it('should remove user from organization', async () => {
      const userId = 1;
      const orgId = 2;

      const mockDelete = {
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.delete).mockReturnValue(mockDelete as any);

      await organizationService.removeUserFromOrganization(userId, orgId);

      expect(db.delete).toHaveBeenCalledWith(userOrganizations);
    });
  });

  describe('setDefaultOrganization', () => {
    it('should set default organization for user', async () => {
      const userId = 1;
      const orgId = 2;

      // Mock user org check (exists)
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ userId, organizationId: orgId }]),
      };

      // Mock update (remove defaults)
      const mockUpdate1 = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      // Mock update (set new default)
      const mockUpdate2 = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);
      vi.mocked(db.update)
        .mockReturnValueOnce(mockUpdate1 as any)
        .mockReturnValueOnce(mockUpdate2 as any);

      await organizationService.setDefaultOrganization(userId, orgId);

      expect(db.update).toHaveBeenCalledTimes(2);
    });

    it('should throw error if user does not have access', async () => {
      const userId = 1;
      const orgId = 999;

      // Mock user org check (not found)
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      await expect(
        organizationService.setDefaultOrganization(userId, orgId)
      ).rejects.toThrow('does not have access');
    });
  });

  describe('deactivate', () => {
    it('should deactivate organization', async () => {
      const orgId = 1;

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      await organizationService.deactivate(orgId);

      expect(db.update).toHaveBeenCalledWith(organizations);
      expect(mockUpdate.set).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        })
      );
    });
  });

  describe('activate', () => {
    it('should activate organization', async () => {
      const orgId = 1;

      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.update).mockReturnValue(mockUpdate as any);

      await organizationService.activate(orgId);

      expect(db.update).toHaveBeenCalledWith(organizations);
      expect(mockUpdate.set).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        })
      );
    });
  });

  describe('search', () => {
    it('should search organizations by name', async () => {
      const query = 'clinic';
      const mockResults = [
        { id: 1, name: 'Test Clinic', type: 'clinic' },
        { id: 2, name: 'Another Clinic', type: 'clinic' },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockResults),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await organizationService.search(query);

      expect(result).toEqual(mockResults);
      expect(mockSelect.limit).toHaveBeenCalledWith(20);
    });

    it('should respect limit parameter', async () => {
      const query = 'test';
      const limit = 5;

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      await organizationService.search(query, limit);

      expect(mockSelect.limit).toHaveBeenCalledWith(limit);
    });
  });
});


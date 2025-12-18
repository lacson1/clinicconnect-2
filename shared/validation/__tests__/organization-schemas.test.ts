import { describe, it, expect } from 'vitest';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addUserToOrganizationSchema,
  switchOrganizationSchema,
  organizationQuerySchema,
} from '../organization-schemas';

describe('Organization Validation Schemas', () => {
  describe('createOrganizationSchema', () => {
    it('should validate valid organization data', () => {
      const validData = {
        name: 'Test Clinic',
        type: 'clinic',
        email: 'test@clinic.com',
        themeColor: '#3B82F6',
      };

      const result = createOrganizationSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Clinic');
        expect(result.data.type).toBe('clinic');
      }
    });

    it('should require name', () => {
      const invalidData = {
        type: 'clinic',
      };

      const result = createOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should trim organization name', () => {
      const data = {
        name: '  Test Clinic  ',
        type: 'clinic',
      };

      const result = createOrganizationSchema.parse(data);

      expect(result.name).toBe('Test Clinic');
    });

    it('should validate organization type', () => {
      const invalidData = {
        name: 'Test',
        type: 'invalid_type',
      };

      const result = createOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should default to clinic type', () => {
      const data = {
        name: 'Test',
      };

      const result = createOrganizationSchema.parse(data);

      expect(result.type).toBe('clinic');
    });

    it('should validate email format', () => {
      const invalidData = {
        name: 'Test',
        email: 'invalid-email',
      };

      const result = createOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should validate theme color hex format', () => {
      const invalidData = {
        name: 'Test',
        themeColor: 'red', // Invalid hex
      };

      const result = createOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should validate phone format', () => {
      const invalidData = {
        name: 'Test',
        phone: 'abc123', // Invalid format
      };

      const result = createOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should validate website URL', () => {
      const invalidData = {
        name: 'Test',
        website: 'not-a-url',
      };

      const result = createOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should validate name max length', () => {
      const invalidData = {
        name: 'a'.repeat(101), // Too long
        type: 'clinic',
      };

      const result = createOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('updateOrganizationSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        name: 'Updated Name',
      };

      const result = updateOrganizationSchema.safeParse(partialData);

      expect(result.success).toBe(true);
    });

    it('should allow empty object (all fields optional)', () => {
      const result = updateOrganizationSchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it('should validate isActive boolean', () => {
      const data = {
        isActive: true,
      };

      const result = updateOrganizationSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('addUserToOrganizationSchema', () => {
    it('should validate valid input', () => {
      const validData = {
        userId: 1,
        organizationId: 2,
        roleId: 3,
        setAsDefault: true,
      };

      const result = addUserToOrganizationSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should require userId and organizationId', () => {
      const invalidData = {
        userId: 1,
        // Missing organizationId
      };

      const result = addUserToOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should validate positive integers', () => {
      const invalidData = {
        userId: -1,
        organizationId: 0,
      };

      const result = addUserToOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should default setAsDefault to false', () => {
      const data = {
        userId: 1,
        organizationId: 2,
      };

      const result = addUserToOrganizationSchema.parse(data);

      expect(result.setAsDefault).toBe(false);
    });

    it('should allow optional roleId', () => {
      const data = {
        userId: 1,
        organizationId: 2,
        roleId: null,
      };

      const result = addUserToOrganizationSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('switchOrganizationSchema', () => {
    it('should validate valid organization ID', () => {
      const validData = {
        organizationId: 1,
      };

      const result = switchOrganizationSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should require organizationId', () => {
      const invalidData = {};

      const result = switchOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should validate positive integer', () => {
      const invalidData = {
        organizationId: -1,
      };

      const result = switchOrganizationSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('organizationQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const validData = {
        search: 'clinic',
        type: 'clinic',
        isActive: true,
        limit: 20,
        offset: 0,
      };

      const result = organizationQuerySchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should default limit to 20', () => {
      const data = {};

      const result = organizationQuerySchema.parse(data);

      expect(result.limit).toBe(20);
    });

    it('should default offset to 0', () => {
      const data = {};

      const result = organizationQuerySchema.parse(data);

      expect(result.offset).toBe(0);
    });

    it('should coerce string numbers to integers', () => {
      const data = {
        limit: '10',
        offset: '5',
      };

      const result = organizationQuerySchema.parse(data);

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
    });

    it('should validate max limit', () => {
      const invalidData = {
        limit: 101, // Over max
      };

      const result = organizationQuerySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should validate non-negative offset', () => {
      const invalidData = {
        offset: -1,
      };

      const result = organizationQuerySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should validate organization type', () => {
      const invalidData = {
        type: 'invalid_type',
      };

      const result = organizationQuerySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});


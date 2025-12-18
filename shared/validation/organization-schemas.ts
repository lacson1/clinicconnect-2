import { z } from "zod";

/**
 * Organization type enum
 */
export const OrganizationTypeEnum = z.enum([
  "clinic",
  "hospital",
  "health_center",
  "pharmacy",
  "lab",
  "other",
]);

/**
 * Create organization schema
 */
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Organization name must be 100 characters or less")
    .trim(),
  type: OrganizationTypeEnum.default("clinic"),
  logoUrl: z.string().url("Invalid logo URL").optional().nullable(),
  themeColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Theme color must be a valid hex color")
    .default("#3B82F6"),
  address: z.string().max(255, "Address must be 255 characters or less").optional().nullable(),
  phone: z
    .string()
    .max(20, "Phone must be 20 characters or less")
    .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format")
    .optional()
    .nullable(),
  email: z.string().email("Invalid email address").max(100).optional().nullable(),
  website: z.string().url("Invalid website URL").max(255).optional().nullable(),
  letterheadConfig: z
    .object({
      logo: z.string().optional(),
      tagline: z.string().optional(),
      accreditation: z.string().optional(),
      certifications: z.array(z.string()).optional(),
      footerNote: z.string().optional(),
      disclaimer: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      contactLayout: z.enum(["horizontal", "vertical"]).optional(),
      showLogo: z.boolean().optional(),
      showTagline: z.boolean().optional(),
      showAccreditation: z.boolean().optional(),
      showCertifications: z.boolean().optional(),
      headerHeight: z.number().optional(),
      footerHeight: z.number().optional(),
    })
    .optional()
    .nullable(),
});

/**
 * Update organization schema (all fields optional)
 */
export const updateOrganizationSchema = createOrganizationSchema.partial().extend({
  isActive: z.boolean().optional(),
});

/**
 * Add user to organization schema
 */
export const addUserToOrganizationSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  organizationId: z.number().int().positive("Organization ID must be a positive integer"),
  roleId: z.number().int().positive().optional().nullable(),
  setAsDefault: z.boolean().default(false),
});

/**
 * Switch organization schema
 */
export const switchOrganizationSchema = z.object({
  organizationId: z.number().int().positive("Organization ID must be a positive integer"),
});

/**
 * Organization query parameters schema
 */
export const organizationQuerySchema = z.object({
  search: z.string().optional(),
  type: OrganizationTypeEnum.optional(),
  isActive: z.boolean().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddUserToOrganizationInput = z.infer<typeof addUserToOrganizationSchema>;
export type SwitchOrganizationInput = z.infer<typeof switchOrganizationSchema>;
export type OrganizationQueryParams = z.infer<typeof organizationQuerySchema>;


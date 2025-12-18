import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ApiError, sendError } from '../lib/api-response';

/**
 * Validation middleware using Zod schemas
 * Validates request body, query parameters, or route params
 */

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidationOptions {
  /** Strip unknown keys from the validated object (default: true) */
  stripUnknown?: boolean;
  /** Target to validate: body, query, or params (default: body) */
  target?: ValidationTarget;
}

/**
 * Convert Zod error to user-friendly validation errors
 */
function formatZodError(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'value';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  
  return errors;
}

/**
 * Creates a validation middleware for request body
 * 
 * @example
 * const loginSchema = z.object({
 *   username: z.string().min(1, 'Username is required'),
 *   password: z.string().min(8, 'Password must be at least 8 characters'),
 * });
 * 
 * app.post('/login', validate(loginSchema), (req, res) => {
 *   // req.body is typed and validated
 * });
 */
export function validate<T extends ZodSchema>(
  schema: T,
  options: ValidationOptions = {}
) {
  const { stripUnknown = true, target = 'body' } = options;
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[target];
      
      const validated = await schema.parseAsync(dataToValidate);
      
      // Replace the request data with validated (and potentially stripped) data
      if (stripUnknown) {
        req[target] = validated;
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = formatZodError(error);
        return sendError(res, ApiError.validationError(formattedErrors));
      }
      
      // Unexpected error during validation
      console.error('Validation middleware error:', error);
      return sendError(res, ApiError.internal('Validation failed'));
    }
  };
}

/**
 * Validate request body
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return validate(schema, { target: 'body' });
}

/**
 * Validate query parameters
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return validate(schema, { target: 'query' });
}

/**
 * Validate route parameters
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return validate(schema, { target: 'params' });
}

// ============================================
// Common validation schemas
// ============================================

/**
 * Pagination query parameters schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

/**
 * Search query schema
 */
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  search: z.string().min(1).max(100).optional(),
}).transform(data => ({
  searchTerm: data.q || data.search || '',
}));

/**
 * Date range query schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine(
  data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: 'Start date must be before or equal to end date' }
);

// ============================================
// Authentication schemas
// ============================================

export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username or email is required')
    .max(100, 'Username or email must be at most 100 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be at most 128 characters'),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  firstName: z.string()
    .max(50, 'First name must be at most 50 characters')
    .optional(),
  lastName: z.string()
    .max(50, 'Last name must be at most 50 characters')
    .optional(),
  role: z.enum(['doctor', 'nurse', 'pharmacist', 'lab_tech', 'receptionist', 'admin'])
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.union([
  z.object({
    username: z.string()
      .min(1, 'Username is required')
      .max(100, 'Username must be at most 100 characters'),
  }),
  z.object({
    email: z.string()
      .email('Invalid email address')
      .min(1, 'Email is required'),
  }),
]);

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required')
    .max(100, 'Invalid reset token'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============================================
// Patient schemas
// ============================================

export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  gender: z.enum(['male', 'female', 'other'], { 
    errorMap: () => ({ message: 'Gender must be male, female, or other' })
  }),
  phone: z.string().min(1, 'Phone is required').max(20),
  email: z.string().email('Invalid email').optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  allergies: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  title: z.string().max(10).optional().nullable(),
});

export const updatePatientSchema = createPatientSchema.partial();

// ============================================
// Visit schemas
// ============================================

export const createVisitSchema = z.object({
  patientId: z.number().int().positive('Patient ID is required'),
  doctorId: z.number().int().positive().optional(),
  bloodPressure: z.string().max(20).optional().nullable(),
  heartRate: z.number().int().min(0).max(300).optional().nullable(),
  temperature: z.number().min(30).max(45).optional().nullable(),
  weight: z.number().min(0).max(500).optional().nullable(),
  complaint: z.string().max(5000).optional().nullable(),
  diagnosis: z.string().max(5000).optional().nullable(),
  treatment: z.string().max(5000).optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  visitType: z.string().default('consultation'),
  status: z.enum(['draft', 'final']).default('final'),
});

// Export types inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  // Schemas
  paginationSchema,
  idParamSchema,
  searchSchema,
  dateRangeSchema,
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createPatientSchema,
  updatePatientSchema,
  createVisitSchema,
};


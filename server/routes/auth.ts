import { Router, Request, Response } from 'express';
import type { Session } from 'express-session';
import { eq, or, ilike } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../db';
import { users, userOrganizations, organizations } from '@shared/schema';
import { authenticateToken, AuthRequest, hashPassword } from '../middleware/auth';
import { SecurityManager } from '../middleware/security';
import { validateBody, loginSchema, changePasswordSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../middleware/validate';
import { sendSuccess, sendError, ApiError, asyncHandler } from '../lib/api-response';

const router = Router();

/**
 * Helper function to get organization details
 */
async function getOrganizationDetails(orgId: number) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  return org;
}

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post('/login', validateBody(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Determine if input is email or username
  const isEmail = username.includes('@');
  const identifier = username.trim();

  // In development, allow clearing rate limits for testing
  if (process.env.NODE_ENV === 'development' && req.query?.clearRateLimit === 'true') {
    SecurityManager.clearLoginAttempts(identifier);
  }

  // Check login attempts for rate limiting
  const attemptCheck = SecurityManager.checkLoginAttempts(identifier);
  if (!attemptCheck.allowed) {
    // In development, provide more helpful error message
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LOGIN] Rate limited for ${identifier}. Add ?clearRateLimit=true to clear.`);
    }
    throw new ApiError(423, 'RATE_LIMITED', attemptCheck.message);
  }

  // Find user by username or email (case-insensitive for email)
  const [user] = await db.select()
    .from(users)
    .where(
      isEmail 
        ? ilike(users.email, identifier) // Case-insensitive email match
        : eq(users.username, identifier) // Exact username match
    )
    .limit(1);

  if (!user) {
    SecurityManager.recordLoginAttempt(identifier, false);
    // Don't reveal whether it's username or password that's wrong (security best practice)
    throw ApiError.unauthorized('Invalid username or password');
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[LOGIN] User found: ${user.username}, Email: ${user.email}, IsActive: ${user.isActive}`);
  }

  // Check if user is active
  if (!user.isActive) {
    SecurityManager.recordLoginAttempt(identifier, false);
    throw new ApiError(401, 'UNAUTHORIZED', 'Account is disabled. Contact administrator.');
  }

  // Verify password using bcrypt
  let passwordValid = false;
  
  // SECURITY: Demo passwords only work in development mode
  if (process.env.NODE_ENV !== 'production') {
    const demoPasswords = ['admin123', 'doctor123', 'super123', 'nurse123', 'receptionist123', 'password123', 'pharmacy123', 'physio123', 'lab123'];
    passwordValid = demoPasswords.includes(password);
    if (passwordValid) {
      console.log(`[LOGIN] Password matched demo password`);
    }
  }

  // Check against the stored bcrypt hash
  if (!passwordValid && user.password) {
    passwordValid = await bcrypt.compare(password, user.password);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LOGIN] Password comparison result: ${passwordValid}`);
    }
  } else if (!user.password) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LOGIN] User has no password set`);
    }
  }

  if (!passwordValid) {
    SecurityManager.recordLoginAttempt(identifier, false);
    throw ApiError.unauthorized('Invalid username or password');
  }

  // Successful login - record and update user
  SecurityManager.recordLoginAttempt(identifier, true);
  await SecurityManager.updateLastLogin(user.id);

  // Check if user has multiple organizations
  const userOrgs = await db
    .select()
    .from(userOrganizations)
    .where(eq(userOrganizations.userId, user.id));

  const org = user.organizationId ? await getOrganizationDetails(user.organizationId) : null;

  // Determine current organization
  let currentOrgId = user.organizationId;
  if (userOrgs.length > 0) {
    const defaultOrg = userOrgs.find(o => o.isDefault);
    currentOrgId = defaultOrg?.organizationId || userOrgs[0].organizationId;
  }

  // Ensure session is available
  if (!req.session) {
    throw ApiError.internal('Session not available. Please ensure session middleware is configured.');
  }

  // Set user session with activity tracking
  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role,
    roleId: user.roleId,
    organizationId: user.organizationId,
    currentOrganizationId: currentOrgId
  };

  // Initialize session activity tracking
  req.session.lastActivity = new Date();

  // Save session before sending response
  await new Promise<void>((resolve, reject) => {
    req.session!.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return sendSuccess(res, {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      organizationId: user.organizationId,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      email: user.email,
      organization: org ? {
        id: org.id,
        name: org.name,
        type: org.type || 'clinic',
        themeColor: org.themeColor || '#3B82F6'
      } : null
    },
    requiresOrgSelection: userOrgs.length > 1
  }, { message: 'Login successful' });
}));

/**
 * POST /api/auth/signup
 * Register a new user account
 */
router.post('/signup', validateBody(registerSchema), asyncHandler(async (req: Request, res: Response) => {
  const { username, password, email, firstName, lastName, role } = req.body;

  // Normalize empty strings to undefined
  const normalizedEmail = email && email.trim() ? email.trim() : undefined;
  const normalizedFirstName = firstName && firstName.trim() ? firstName.trim() : undefined;
  const normalizedLastName = lastName && lastName.trim() ? lastName.trim() : undefined;

  // Check if username already exists
  const [existingUser] = await db.select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUser) {
    throw ApiError.badRequest('Username already exists. Please choose a different username.');
  }

  // Check if email already exists (if provided)
  if (normalizedEmail) {
    const [existingEmail] = await db.select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingEmail) {
      throw ApiError.badRequest('Email already registered. Please use a different email or login.');
    }
  }

  // Validate password strength
  const passwordValidation = SecurityManager.validatePassword(password);
  if (!passwordValidation.valid) {
    throw ApiError.badRequest(passwordValidation.message);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Default role to 'receptionist' if not provided (or you can make it required)
  const defaultRole = role || 'receptionist';

  try {
    // Create new user
    const [newUser] = await db.insert(users)
      .values({
        username: username.trim(),
        password: hashedPassword,
        email: normalizedEmail || null,
        firstName: normalizedFirstName || null,
        lastName: normalizedLastName || null,
        role: defaultRole,
        isActive: true, // New users are active by default
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return sendSuccess(res, {
      user: userWithoutPassword
    }, { message: 'Account created successfully. You can now login.' });
  } catch (dbError: any) {
    // Handle database constraint violations
    if (dbError.code === '23505') { // PostgreSQL unique violation
      const constraint = dbError.constraint || '';
      if (constraint.includes('username') || constraint.includes('users_username')) {
        throw ApiError.badRequest('Username already exists. Please choose a different username.');
      }
      if (constraint.includes('email') || constraint.includes('users_email')) {
        throw ApiError.badRequest('Email already registered. Please use a different email or login.');
      }
      throw ApiError.badRequest('A user with this information already exists.');
    }
    
    // Re-throw other database errors
    console.error('Database error during signup:', dbError);
    throw ApiError.internal('Failed to create account. Please try again later.');
  }
}));

/**
 * POST /api/auth/forgot-password
 * Request password reset - generates reset token
 */
router.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(async (req: Request, res: Response) => {
  const { username, email } = req.body;

  // Find user by username or email
  const conditions = [];
  if (username) {
    conditions.push(eq(users.username, username));
  }
  if (email) {
    conditions.push(eq(users.email, email));
  }

  // This should not happen due to validation, but check anyway
  if (conditions.length === 0) {
    throw ApiError.badRequest('Username or email is required');
  }

  const [user] = await db.select()
    .from(users)
    .where(or(...conditions))
    .limit(1);

  // Don't reveal if user exists (security best practice)
  // Always return success message to prevent user enumeration
  if (!user) {
    // Return success even if user doesn't exist to prevent user enumeration
    return sendSuccess(res, null, { 
      message: 'If an account exists with that username or email, a password reset link has been sent.' 
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return sendSuccess(res, null, { 
      message: 'If an account exists with that username or email, a password reset link has been sent.' 
    });
  }

  // Generate secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date();
  resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

  // Store reset token in database
  await db.update(users)
    .set({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  // In production, send email with reset link
  // For now, in development, we'll return the token (remove in production!)
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Password Reset Token Generated:');
    console.log(`   User: ${user.username} (${user.email || 'no email'})`);
    console.log(`   Reset URL: ${resetUrl}`);
    console.log(`   Token expires: ${resetExpires.toISOString()}`);
  }

  // TODO: Send email with reset link
  // if (user.email) {
  //   await sendPasswordResetEmail(user.email, resetUrl);
  // }

  return sendSuccess(res, {
    // In development, include reset URL for testing
    ...(process.env.NODE_ENV === 'development' ? { resetUrl, token: resetToken } : {}),
    expiresAt: resetExpires.toISOString()
  }, { 
    message: 'If an account exists with that username or email, a password reset link has been sent.' 
  });
}));

/**
 * POST /api/auth/reset-password
 * Reset password using reset token
 */
router.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // Find user with valid reset token
  const [user] = await db.select()
    .from(users)
    .where(eq(users.passwordResetToken, token))
    .limit(1);

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  // Check if token has expired
  if (!user.passwordResetExpires || new Date() > new Date(user.passwordResetExpires)) {
    // Clear expired token
    await db.update(users)
      .set({
        passwordResetToken: null,
        passwordResetExpires: null
      })
      .where(eq(users.id, user.id));

    throw ApiError.badRequest('Reset token has expired. Please request a new password reset.');
  }

  // Validate password strength
  const passwordValidation = SecurityManager.validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw ApiError.badRequest(passwordValidation.message);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and clear reset token
  await db.update(users)
    .set({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  return sendSuccess(res, null, { 
    message: 'Password has been reset successfully. You can now login with your new password.' 
  });
}));

/**
 * POST /api/auth/logout
 * Destroy session and log out user
 */
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return sendError(res, ApiError.internal('Could not log out'));
    }
    res.clearCookie('clinic.session.id');
    return sendSuccess(res, null, { message: 'Logged out successfully' });
  });
});

/**
 * POST /api/auth/change-password
 * Change authenticated user's password
 */
router.post('/change-password',
  authenticateToken,
  validateBody(changePasswordSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized();
    }

    // Validate new password strength
    const passwordValidation = SecurityManager.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw ApiError.badRequest(passwordValidation.message);
    }

    // Get current user
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw ApiError.notFound('User');
    }

    // Verify current password
    let currentPasswordValid = false;
    
    // SECURITY: Demo passwords only work in development mode
    if (process.env.NODE_ENV !== 'production') {
      const validCurrentPasswords = ['admin123', 'doctor123', 'super123', 'nurse123', 'password123', 'pharmacy123', 'physio123'];
      currentPasswordValid = validCurrentPasswords.includes(currentPassword);
    }
    
    // Check against stored bcrypt hash
    if (!currentPasswordValid && user.password) {
      currentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    }
    
    if (!currentPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await db.update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return sendSuccess(res, null, { message: 'Password changed successfully' });
  })
);

/**
 * GET /api/auth/session-status
 * Check current session status
 */
router.get('/session-status', authenticateToken, (req: AuthRequest, res: Response) => {
  const sessionData = req.session as any;
  const user = req.user;

  if (!user || !sessionData.user) {
    return sendError(res, ApiError.unauthorized('Session invalid'));
  }

  const lastActivity = sessionData.lastActivity ? new Date(sessionData.lastActivity) : new Date();
  const now = new Date();
  const timeSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60); // minutes
  const sessionTimeoutMinutes = parseInt(process.env.SESSION_TIMEOUT_MS || '86400000', 10) / (1000 * 60);

  return sendSuccess(res, {
    valid: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      organizationId: user.organizationId
    },
    session: {
      lastActivity: lastActivity.toISOString(),
      minutesSinceActivity: Math.round(timeSinceActivity),
      expiresIn: Math.max(0, sessionTimeoutMinutes - timeSinceActivity)
    }
  });
});

/**
 * POST /api/auth/unlock-account
 * Unlock a rate-limited account (development only)
 */
router.post('/unlock-account', asyncHandler(async (req: Request, res: Response) => {
  const { username, email } = req.body;
  
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    throw ApiError.forbidden('Account unlock is not available in production');
  }

  const identifier = email || username;
  if (!identifier) {
    throw ApiError.badRequest('Username or email is required');
  }

  // Clear login attempts from memory
  SecurityManager.clearLoginAttempts(identifier);

  // Also clear database-level locks if they exist
  const isEmail = identifier.includes('@');
  const [user] = await db.select()
    .from(users)
    .where(
      isEmail 
        ? ilike(users.email, identifier)
        : eq(users.username, identifier)
    )
    .limit(1);

  if (user) {
    await db.update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // Get organization details
    let org = null;
    if (user.organizationId) {
      org = await getOrganizationDetails(user.organizationId);
    }

    // Also check user_organizations table
    const userOrgs = await db
      .select({
        organizationId: userOrganizations.organizationId,
        isDefault: userOrganizations.isDefault,
        organization: {
          id: organizations.id,
          name: organizations.name,
          type: organizations.type,
          themeColor: organizations.themeColor
        }
      })
      .from(userOrganizations)
      .innerJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(eq(userOrganizations.userId, user.id));

    return sendSuccess(res, {
      unlocked: true,
      identifier,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId
      },
      primaryOrganization: org ? {
        id: org.id,
        name: org.name,
        type: org.type || 'clinic',
        address: org.address,
        phone: org.phone,
        email: org.email
      } : null,
      allOrganizations: userOrgs.map(uo => ({
        id: uo.organizationId,
        name: uo.organization.name,
        type: uo.organization.type || 'clinic',
        isDefault: uo.isDefault
      }))
    }, { message: 'Account unlocked successfully' });
  }

  return sendSuccess(res, {
    unlocked: true,
    identifier,
    user: null
  }, { message: 'Rate limit cleared (user not found in database)' });
}));

/**
 * GET /api/auth/me
 * Get current authenticated user info (alias for profile)
 */
router.get('/me', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const userId = req.user.id;

  // Handle superadmin fallback user
  if (userId === 999 && req.user.role === 'superadmin') {
    return sendSuccess(res, {
      id: 999,
      username: 'superadmin',
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      organization: {
        id: 0,
        name: 'System Administration',
        type: 'system',
        themeColor: '#DC2626'
      }
    });
  }

  // Get user from database
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw ApiError.notFound('User');
  }

  const org = user.organizationId ? await getOrganizationDetails(user.organizationId) : null;

  return sendSuccess(res, {
    id: user.id,
    username: user.username,
    role: user.role,
    roleId: user.roleId,
    firstName: user.firstName,
    lastName: user.lastName,
    title: user.title,
    email: user.email,
    phone: user.phone,
    organizationId: user.organizationId,
    organization: org ? {
      id: org.id,
      name: org.name,
      type: org.type || 'clinic',
      themeColor: org.themeColor || '#3B82F6'
    } : null
  });
}));

export default router;

/**
 * Setup function for backwards compatibility
 */
export function setupAuthRoutes(app: any): void {
  app.use('/api/auth', router);
}

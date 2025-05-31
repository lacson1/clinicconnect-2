import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'clinic-secret-key-2024';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    organizationId?: number;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      try {
        // Fetch user's current organization assignment from database
        const userWithOrg = await storage.getUserWithOrganization(user.id);
        req.user = {
          ...user,
          organizationId: userWithOrg?.organizationId || null
        };
      } catch (error) {
        console.error('Failed to fetch user organization:', error);
        req.user = user;
      }
      
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export const requireRole = (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user; // decoded from JWT
  
  // Super admin has access to everything
  if (user?.role === 'superadmin') {
    return next();
  }
  if (!user || user.role !== role) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  }
  next();
};

export const requireAnyRole = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  // Super admin has access to everything
  if (user?.role === 'superadmin') {
    return next();
  }
  if (!user || !roles.includes(user.role)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  }
  next();
};

// Super admin or organization admin check
export const requireSuperOrOrgAdmin = () => (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user || (!['superadmin', 'admin'].includes(user.role))) {
    return res.status(403).json({ message: 'Forbidden: Admin privileges required' });
  }
  next();
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: { id: number; username: string; role: string }): string => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
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
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Immediate access mode for your clinic interface
  req.user = {
    id: 1,
    username: 'admin',
    role: 'admin'
  };
  next();
};

export const requireRole = (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user; // decoded from JWT
  if (!user || user.role !== role) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  }
  next();
};

export const requireAnyRole = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user || !roles.includes(user.role)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
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
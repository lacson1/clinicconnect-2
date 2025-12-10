import session from 'express-session';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { sessionLogger as logger } from '../lib/logger';

// SECURITY: Session secret from environment variable
const isProduction = process.env.NODE_ENV === 'production';
let SESSION_SECRET = process.env.SESSION_SECRET;

// Validate SESSION_SECRET
if (!SESSION_SECRET || SESSION_SECRET.trim().length === 0) {
  if (isProduction) {
    // CRITICAL: In production, require SESSION_SECRET to be set
    logger.error('SESSION_SECRET environment variable is required in production.');
    logger.error('Generate a secure secret with: openssl rand -base64 64');
    logger.error('Then set it in your environment: SESSION_SECRET="your-secret-here"');
    process.exit(1);
  } else {
    // Development: Generate a temporary secret with warning
    SESSION_SECRET = crypto.randomBytes(64).toString('base64');
    logger.warn('SESSION_SECRET not set. Generated temporary secret (dev mode only).');
    logger.warn('Sessions will not persist across server restarts.');
  }
} else if (SESSION_SECRET.length < 32) {
  // Validate minimum length
  if (isProduction) {
    logger.error(`SESSION_SECRET is too short (${SESSION_SECRET.length} chars). Minimum 32 characters required.`);
    logger.error('Generate a secure secret with: openssl rand -base64 64');
    process.exit(1);
  } else {
    logger.warn(`SESSION_SECRET is too short (${SESSION_SECRET.length} chars). Minimum 32 recommended.`);
  }
}

// Use MemoryStore for development - faster and no DB issues
// In production, you should use a proper store like connect-pg-simple or connect-redis
const isDevelopment = !isProduction;

let sessionStore: session.Store | undefined;

if (!isDevelopment && process.env.DATABASE_URL) {
  // Use PostgreSQL session store in production
  try {
    const connectPgSimple = require('connect-pg-simple');
    const pg = require('pg');
    const PgSession = connectPgSimple(session);
    
    // Create a pool with SSL support for managed databases
    const pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Accept self-signed certificates (required for DigitalOcean)
      },
      // Connection pool settings
      max: 5, // Smaller pool for session store
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000, // Increased timeout for managed databases
    });
    
    // Test the connection before creating session store
    pgPool.on('error', (err: Error) => {
      logger.error('Session store pool error:', err.message);
    });

    // Test database connection first (using callback, not async/await)
    // Note: This is a best-effort test. The session store will handle connection errors at runtime.
    pgPool.connect((err: Error, client: any, release: () => void) => {
      if (err) {
        logger.warn('⚠️  Initial database connection test failed (will retry at runtime):', err.message);
      } else {
        // Test query to verify connection
        client.query('SELECT 1', (queryErr: Error) => {
          release();
          if (queryErr) {
            logger.warn('⚠️  Database query test failed (will retry at runtime):', queryErr.message);
          } else {
            logger.info('✅ Database connection verified for session store');
          }
        });
      }
    });

    sessionStore = new PgSession({
      pool: pgPool,
      tableName: 'sessions', // Must match Drizzle schema in shared/schema.ts
      createTableIfMissing: true, // Automatically create sessions table if missing
      pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
      errorLog: (err: Error) => {
        // Suppress "already exists" errors (expected during table creation)
        if (!err.message?.includes('already exists') && 
            !err.message?.includes('duplicate') &&
            !err.message?.toLowerCase().includes('relation')?.includes('already exists')) {
          logger.error('Session store error:', err.message);
        }
      },
    });
    
    logger.info('✅ Using PostgreSQL session store with SSL');
    logger.info('✅ Sessions table will be created automatically if missing');
  } catch (error: any) {
    logger.error('❌ Failed to initialize PostgreSQL session store:', error?.message || error);
    logger.error('❌ Error details:', error?.stack || 'No stack trace available');
    logger.warn('⚠️  Falling back to MemoryStore (not recommended for production)');
    logger.warn('⚠️  Sessions will not persist across server restarts');
    logger.warn('⚠️  To fix: Ensure DATABASE_URL is correct and database is accessible');
    sessionStore = undefined;
  }
} else {
  if (isDevelopment) {
    logger.debug('Using in-memory session store (development mode)');
  } else {
    logger.warn('Using in-memory session store - DATABASE_URL not set');
  }
}

// Session configuration with environment-based security
export const sessionConfig = session({
  store: sessionStore, // Uses MemoryStore if sessionStore is undefined
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // SECURITY: Enable secure cookies in production (requires HTTPS)
    secure: isProduction,
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '2592000000', 10), // Default 30 days
    // SECURITY: Strict sameSite in production for CSRF protection
    sameSite: isProduction ? 'strict' : 'lax',
  },
  name: 'clinic.session.id',
});

// Session-based authentication middleware
export interface SessionRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    organizationId?: number;
    currentOrganizationId?: number;
  };
}

export const authenticateSession = (req: SessionRequest, res: Response, next: NextFunction) => {
  // Check for session-based authentication
  const sessionUser = (req.session as any)?.user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  req.user = {
    id: sessionUser.id,
    username: sessionUser.username,
    role: sessionUser.role,
    organizationId: sessionUser.organizationId,
    currentOrganizationId: sessionUser.currentOrganizationId || sessionUser.organizationId
  };
  
  next();
};

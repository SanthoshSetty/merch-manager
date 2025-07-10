import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Google OAuth2 Client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Validate JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set in environment variables. Using fallback secret for development.');
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Generate OAuth2 authorization URL
 */
export function getAuthUrl(): string {
  const scopes = [
    'openid',
    'profile',
    'email'
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
  });
}

/**
 * Exchange authorization code for tokens and user info
 */
export async function exchangeCodeForTokens(code: string): Promise<User> {
  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    
    // Get user info using the access token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const user: User = {
      id: payload.sub,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
      verified_email: payload.email_verified || false,
    };

    return user;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw new Error('Failed to authenticate with Google');
  }
}

/**
 * Generate JWT token for user
 */
export function generateJWT(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    verified_email: user.verified_email,
  };

  // Use type assertion to bypass TypeScript issue
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT token and extract user
 */
export function verifyJWT(token: string): User {
  try {
    const decoded = (jwt as any).verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      verified_email: decoded.verified_email,
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Authentication middleware
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ 
      success: false, 
      error: 'Access token required',
      message: 'Please authenticate using Google OAuth'
    });
    return;
  }

  try {
    const user = verifyJWT(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token',
      message: 'Please re-authenticate using Google OAuth'
    });
  }
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const user = verifyJWT(token);
      req.user = user;
    } catch (error) {
      console.log('Optional auth: Invalid token, continuing without user');
    }
  }

  next();
}

/**
 * Admin check middleware (requires specific email domains or users)
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: 'Authentication required',
      message: 'Please authenticate using Google OAuth'
    });
    return;
  }

  // Check if user is admin (you can customize this logic)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const adminDomains = process.env.ADMIN_DOMAINS?.split(',') || [];
  
  const isAdminEmail = adminEmails.includes(req.user.email);
  const isAdminDomain = adminDomains.some(domain => req.user!.email.endsWith(domain));

  if (!isAdminEmail && !isAdminDomain && adminEmails.length > 0) {
    res.status(403).json({ 
      success: false, 
      error: 'Admin access required',
      message: 'You do not have permission to access this resource'
    });
    return;
  }

  next();
}

/**
 * Health check for OAuth configuration
 */
export function getOAuthStatus(): { configured: boolean; issues: string[]; debug?: any } {
  const issues: string[] = [];
  
  if (!process.env.GOOGLE_CLIENT_ID) {
    issues.push('GOOGLE_CLIENT_ID not configured');
  }
  
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    issues.push('GOOGLE_CLIENT_SECRET not configured');
  }
  
  if (!process.env.GOOGLE_REDIRECT_URI) {
    issues.push('GOOGLE_REDIRECT_URI not configured');
  }
  
  if (!process.env.JWT_SECRET) {
    issues.push('JWT_SECRET not configured (using fallback)');
  }

  return {
    configured: issues.length === 0,
    issues,
    debug: {
      clientIdExists: !!process.env.GOOGLE_CLIENT_ID,
      clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 12) + '...',
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    }
  };
}

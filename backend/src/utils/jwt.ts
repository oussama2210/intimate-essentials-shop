import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  adminId: string;
  username: string;
  email: string;
  role: string;
}

interface AdminData {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const generateToken = (admin: AdminData): string => {
  const payload: JwtPayload = {
    adminId: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Use string literal instead of variable
    issuer: 'algeria-ecommerce',
    audience: 'algeria-ecommerce-admin',
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'algeria-ecommerce',
      audience: 'algeria-ecommerce-admin',
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};
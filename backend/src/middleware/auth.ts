import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';
import { SessionManager } from '../utils/session';

const prisma = new PrismaClient();

// Extend Express Request type to include admin
declare global {
    namespace Express {
        interface Request {
            admin?: {
                id: string;
                username: string;
                email: string;
                role: string;
            };
            sessionId?: string;
        }
    }
}

export const authenticateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Access token is required',
                },
            });
            return;
        }

        // Verify and decode token
        const decoded: JwtPayload = verifyToken(token);

        // Check if admin still exists in database
        const admin = await prisma.admin.findUnique({
            where: { id: decoded.adminId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            },
        });

        if (!admin) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Admin account not found',
                },
            });
            return;
        }

        // Create or update session
        const sessionId = `session_${decoded.adminId}_${Date.now()}`;
        SessionManager.createSession(
            sessionId,
            decoded,
            req.ip,
            req.get('User-Agent')
        );

        // Attach admin info and session to request
        req.admin = admin;
        req.sessionId = sessionId;

        next();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Authentication failed';
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message,
            },
        });
    }
};

export const requireSuperAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.admin) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        });
        return;
    }

    if (req.admin.role !== 'SUPER_ADMIN') {
        res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Super admin access required',
            },
        });
        return;
    }

    next();
};

export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.admin) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        });
        return;
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.admin.role)) {
        res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Admin access required',
            },
        });
        return;
    }

    next();
};

/**
 * Middleware to update session activity
 */
export const updateSessionActivity = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.sessionId) {
        SessionManager.updateActivity(req.sessionId);
    }
    next();
};

/**
 * Middleware to logout and destroy session
 */
export const logout = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.sessionId) {
        SessionManager.destroySession(req.sessionId);
    }

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
};
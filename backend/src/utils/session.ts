import { JwtPayload } from './jwt';

interface SessionData {
  adminId: string;
  username: string;
  email: string;
  role: string;
  loginTime: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

interface SessionStore {
  [sessionId: string]: SessionData;
}

// In-memory session store (in production, use Redis or database)
const sessions: SessionStore = {};

export class SessionManager {
  /**
   * Create a new session
   */
  static createSession(
    sessionId: string,
    payload: JwtPayload,
    ipAddress?: string,
    userAgent?: string
  ): void {
    const now = Date.now();
    
    sessions[sessionId] = {
      adminId: payload.adminId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      loginTime: now,
      lastActivity: now,
      ipAddress,
      userAgent,
    };
  }

  /**
   * Get session data
   */
  static getSession(sessionId: string): SessionData | null {
    const session = sessions[sessionId];
    
    if (!session) {
      return null;
    }

    // Check if session is expired (24 hours)
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - session.lastActivity > sessionTimeout) {
      delete sessions[sessionId];
      return null;
    }

    return session;
  }

  /**
   * Update session activity
   */
  static updateActivity(sessionId: string): boolean {
    const session = sessions[sessionId];
    
    if (!session) {
      return false;
    }

    session.lastActivity = Date.now();
    return true;
  }

  /**
   * Destroy a session
   */
  static destroySession(sessionId: string): boolean {
    if (sessions[sessionId]) {
      delete sessions[sessionId];
      return true;
    }
    return false;
  }

  /**
   * Destroy all sessions for a specific admin
   */
  static destroyAdminSessions(adminId: string): number {
    let destroyedCount = 0;
    
    Object.keys(sessions).forEach(sessionId => {
      if (sessions[sessionId].adminId === adminId) {
        delete sessions[sessionId];
        destroyedCount++;
      }
    });

    return destroyedCount;
  }

  /**
   * Get all active sessions for an admin
   */
  static getAdminSessions(adminId: string): Array<SessionData & { sessionId: string }> {
    const adminSessions: Array<SessionData & { sessionId: string }> = [];
    
    Object.keys(sessions).forEach(sessionId => {
      if (sessions[sessionId].adminId === adminId) {
        adminSessions.push({
          ...sessions[sessionId],
          sessionId,
        });
      }
    });

    return adminSessions;
  }

  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): number {
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    let cleanedCount = 0;

    Object.keys(sessions).forEach(sessionId => {
      if (now - sessions[sessionId].lastActivity > sessionTimeout) {
        delete sessions[sessionId];
        cleanedCount++;
      }
    });

    return cleanedCount;
  }

  /**
   * Get session statistics
   */
  static getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    sessionsByRole: { [role: string]: number };
  } {
    const now = Date.now();
    const sessionTimeout = 24 * 60 * 60 * 1000;
    
    let activeSessions = 0;
    const sessionsByRole: { [role: string]: number } = {};

    Object.values(sessions).forEach(session => {
      if (now - session.lastActivity <= sessionTimeout) {
        activeSessions++;
        sessionsByRole[session.role] = (sessionsByRole[session.role] || 0) + 1;
      }
    });

    return {
      totalSessions: Object.keys(sessions).length,
      activeSessions,
      sessionsByRole,
    };
  }
}

// Cleanup expired sessions every hour
setInterval(() => {
  const cleaned = SessionManager.cleanupExpiredSessions();
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
  }
}, 60 * 60 * 1000); // 1 hour
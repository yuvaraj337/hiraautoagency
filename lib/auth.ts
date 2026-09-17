import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'hira_yamaha_super_secure_jwt_secret_2026';
const COOKIE_NAME = 'hira_admin_token';

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function signToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
  } catch (error) {
    return null;
  }
}

export function getSession(): AdminSession | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireRole(allowedRoles: string[]): AdminSession {
  const session = getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  if (!allowedRoles.includes(session.role) && session.role !== 'Super Admin') {
    throw new Error('Forbidden: Insufficient permissions');
  }
  return session;
}

export function logActivity(userId: string, userName: string, action: string, entityType: string, entityId: string, details?: any) {
  try {
    const db = getDb();
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    db.prepare(`
      INSERT INTO activity_logs (id, user_id, user_name, action, entity_type, entity_id, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, userName, action, entityType, entityId, details ? JSON.stringify(details) : null);
  } catch (err) {
    console.error('Error recording activity log:', err);
  }
}

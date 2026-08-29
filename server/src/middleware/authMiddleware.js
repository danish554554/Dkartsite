import jwt from 'jsonwebtoken';
import { queryOne } from '../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dkart-production-secret-key-2026';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await queryOne('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Administrator privileges required.' });
    }
    next();
  });
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await queryOne('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id]);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Ignore invalid optional tokens
    }
  }
  next();
}

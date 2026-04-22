import { verifyAuthToken } from '../config/security.js';

const unauthorized = (res, message = 'Unauthorized') => res.status(401).json({ message });

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return unauthorized(res, 'Missing auth token');
  }

  try {
    const payload = verifyAuthToken(token);
    req.auth = payload;
    return next();
  } catch (error) {
    return unauthorized(res, error.message || 'Invalid auth token');
  }
};

export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.auth) {
      return unauthorized(res, 'Missing auth context');
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ message: 'Forbidden for current role' });
    }

    return next();
  };
};

export const protect = requireAuth;
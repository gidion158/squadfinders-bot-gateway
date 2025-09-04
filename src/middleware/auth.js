import basicAuth from 'express-basic-auth';
import { config } from '../config/index.js';
import { AdminUser } from '../models/index.js';

/**
 * Custom authorizer function for express-basic-auth.
 * It first checks for a static user from the config, then falls back
 * to checking for a user in the AdminUser collection in the database.
 */
const myAsyncAuthorizer = async (username, password, cb) => {
  try {
    // 1. Check for the static admin user from config
    const staticUserMatch = basicAuth.safeCompare(username, config.adminAuth.user) &&
                            basicAuth.safeCompare(password, config.adminAuth.pass);
    if (staticUserMatch) {
      return cb(null, true);
    }

    // 2. If no static match, check for a user in the database
    const user = await AdminUser.findOne({ email: username.toLowerCase() });
    if (!user) {
      // User not found in DB, authentication fails
      return cb(null, false);
    }

    // 3. Compare the provided password with the hashed password in the database
    const isMatch = await user.comparePassword(password);
    return cb(null, isMatch);

  } catch (error) {
    console.error('Authorization error:', error);
    return cb(error);
  }
};

// Authentication middleware that uses the custom authorizer
export const authMiddleware = basicAuth({
  authorizeAsync: true,
  authorizer: myAsyncAuthorizer,
  challenge: true,
  realm: 'SquadFinders API'
});

/**
 * Middleware for role-based authorization.
 * @param {string[]} allowedRoles - An array of roles that are allowed to access the route.
 * @returns {function} Express middleware function.
 */
export const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    const username = req.auth.user;

    try {
      let userRole;

      // Check if the authenticated user is the static admin user
      if (username === config.adminAuth.user) {
        userRole = 'admin';
      } else {
        // Find the user in the database to get their role
        const user = await AdminUser.findOne({ email: username.toLowerCase() });
        if (!user) {
          return res.status(403).json({ error: 'Forbidden: User not found' });
        }
        userRole = user.role;
      }

      // Check if the user's role is in the list of allowed roles
      if (allowedRoles.includes(userRole)) {
        next(); // User has the required role, proceed to the next middleware
      } else {
        res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};

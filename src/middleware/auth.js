import basicAuth from 'express-basic-auth';
import { config } from '../config/index.js';
import { AdminUser } from '../models/index.js';

// This authorizer checks both static and DB users for Basic Auth.
const authorizeUser = async (username, password, cb) => {
  // 1. Check the static user from config
  const staticUser = config.adminAuth.user;
  const staticPass = config.adminAuth.pass;
  if (basicAuth.safeCompare(username, staticUser) && basicAuth.safeCompare(password, staticPass)) {
    return cb(null, true);
  }

  // 2. Check against the AdminUser model in the database
  try {
    const user = await AdminUser.findOne({ email: username.toLowerCase() });
    if (user && (await user.comparePassword(password))) {
      return cb(null, true);
    }
  } catch (error) {
    console.error('Error during database authentication:', error);
    return cb(error);
  }

  // If no user is found or password doesn't match
  return cb(null, false);
};

// A helper to get user details (including role) after they've been authenticated.
const getUserDetails = async (username) => {
    if (username === config.adminAuth.user) {
        return { email: username, role: 'superadmin' };
    }
    // Use .lean() for a plain JS object, which is faster.
    const user = await AdminUser.findOne({ email: username.toLowerCase() }).lean();
    return user;
};

// Create the basicAuth middleware instance to be used as a fallback.
const basicAuthHandler = basicAuth({
  authorizer: authorizeUser,
  authorizeAsync: true,
  challenge: true,
  realm: 'SquadFinders API'
});


// This is the main middleware that combines session and basic auth.
export const authMiddleware = (req, res, next) => {
  // Priority 1: Check for an active AdminJS session.
  if (req.session && req.session.adminUser) {
    // Session exists, so the user is authenticated.
    // We create `req.auth` to be consistent for the authorizeRole middleware.
    req.auth = {
      user: req.session.adminUser.email,
      userObject: req.session.adminUser
    };
    return next();
  }

  // Priority 2: No session, so we fall back to Basic Auth for API clients.
  basicAuthHandler(req, res, async (err) => {
    if (err) {
      return next(err); // Basic auth failed (invalid credentials).
    }

    // Basic auth was successful if we reached here.
    // `req.auth.user` contains the username.
    // Now we fetch the user's details to get their role for the next middleware.
    if (req.auth && req.auth.user) {
      try {
        req.auth.userObject = await getUserDetails(req.auth.user);
        return next();
      } catch (dbError) {
        return next(dbError);
      }
    }

    // Fallback if req.auth is somehow not populated
    return next();
  });
};

/**
 * Middleware to authorize based on user role.
 * Must be used AFTER authMiddleware.
 * @param {string[]} roles - Array of roles that are allowed access (e.g., ['admin'])
 */
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (req.auth && req.auth.userObject && roles.includes(req.auth.userObject.role)) {
      return next(); // User has the required role, proceed.
    }

    // User is authenticated but does not have the required role.
    res.status(403).json({ error: 'Forbidden: You do not have the required role to perform this action.' });
  };
};


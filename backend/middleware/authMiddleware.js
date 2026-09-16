const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isDbConnected } = require('../config/db');
const mockStore = require('../config/mockStore');

// Verifies token, attaches user to req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // In-Memory Fallback if MongoDB is not connected
      if (!isDbConnected()) {
        let rawUser = mockStore.findUserById(decoded.id);

        if (!rawUser) {
          try {
            rawUser = await User.findById(decoded.id).select('-password');
          } catch {
            rawUser = null;
          }
        }

        if (!rawUser) {
          rawUser = {
            _id: decoded.id,
            role: decoded.role || 'student',
            name: decoded.name || 'Arena User',
            department: 'AI & Data Science',
            isActive: true,
          };
        }

        if (!rawUser.isActive) {
          return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        // eslint-disable-next-line no-unused-vars
        const { password, ...safeUser } = rawUser;
        req.user = safeUser;

        return next();
      }

      // Real MongoDB lookup
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Restricts route to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
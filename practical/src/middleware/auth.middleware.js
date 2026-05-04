const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { env } = require('../config/env');
const ApiError = require('../utils/apiError');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token required');
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.accessSecret);
    const user = await User.findById(decoded.id).select('-passwordHash -refreshTokens');

    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, 'Invalid or expired token'));
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden: insufficient permissions'));
  }

  next();
};

module.exports = {
  protect,
  requireRole
};

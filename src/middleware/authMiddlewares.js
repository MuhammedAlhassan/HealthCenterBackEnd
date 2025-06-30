// For ES Modules
import errorResponse from '../utils/errorResponse.js';
// import { verifyToken } from '../config/jwt.js';
// import User from '../models/user.js';
import { User } from '../models/user.js';
import { verifyToken } from '../config/jwt.js';

// OR for CommonJS
// const ErrorResponse = require('../utils/errorResponse');
// const { verifyToken } = require('../config/jwt');
// const User = require('../models/User');

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new errorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new errorResponse('No user found with this ID', 404));
    }

    next();
  } catch (err) {
    return next(new errorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return next(
        new errorResponse(
          `User role ${req.user.userType} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user is verified
export const checkVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(new errorResponse('Please verify your account first', 403));
  }
  next();
};

export const checkUser = (req, res, next)=>{
  res.send("check user")
}

export const errorHandler = (req, res, next)=>{}
export const notFound = (req, res, next)=>{}
export const requireAuth = (req, res, next)=>{}
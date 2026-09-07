import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = null;
      try {
        user = await User.findById(decoded.userId);
      } catch (e) {
        console.warn('DB user query failed in middleware:', e.message);
      }

      if (!user) {
        // If DB query yielded no user and token is demo token, allow demo user fallback
        if (decoded.userId === '507f1f77bcf86cd799439011' || String(decoded.userId).startsWith('mock_')) {
          user = {
            _id: '507f1f77bcf86cd799439011',
            id: '507f1f77bcf86cd799439011',
            name: 'Arjun Sharma',
            email: 'arjun@example.com',
            role: 'student',
            institution: 'National Institute of Technology',
            course: 'MCA',
            year: '2nd Year',
            toSafeObject() { return this; }
          };
        } else {
          return res.status(401).json({
            success: false,
            message: 'User account not found or session expired',
          });
        }
      }

      // Attach user to the request object
      req.user = user;
      next();
    } catch (error) {
      console.error(`Auth Middleware Error: ${error.message}`);
      
      let message = 'Not authorized, token failed';
      if (error.name === 'TokenExpiredError') {
        message = 'Session expired, please login again';
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token, authorization denied';
      }

      return res.status(401).json({
        success: false,
        message
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

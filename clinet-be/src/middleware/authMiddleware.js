// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

module.exports = (requireAdmin = false) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return res.status(401).json({ msg: 'User not found' });

      if (requireAdmin && user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admins only' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ msg: 'Invalid token' });
    }
  };
};

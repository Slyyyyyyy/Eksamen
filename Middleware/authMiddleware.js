const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const secret = process.env.JWT_SECRET || 'secretkey'; 

exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        console.error('Token verification error:', err.message);
        return res.status(403).json({ message: 'Invalid token', error: err.message });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const dbUser = await User.findOne({ username: req.user.username });
    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.isSelfOrAdmin = async (req, res, next) => {
  try {
    const dbUser = await User.findOne({ username: req.user.username });
    if (!dbUser) return res.status(404).json({ message: 'User not found' });

    if (dbUser.role === 'admin' || dbUser.username === req.params.username) {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
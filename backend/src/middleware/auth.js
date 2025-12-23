const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-privateKey'); // Exclude privateKey

      if (!req.user) {
        console.error(`Auth Error: User not found for ID ${decoded.id}`);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      // Detailed error for debugging
      res.status(401).json({ message: 'Not authorized', error: error.message });
    }
  }

  if (!token) {
    console.error("Auth Error: No token provided");
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
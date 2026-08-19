const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header first (explicit client intent)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Fall back to cookies
    if (!token) {
      token = req.cookies?.accessToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeycharactercoach2026');
    
    // Attach decoded user information (id) to the request
    req.user = decoded;
    next();
  } catch (err) {
    // TokenExpiredError is a normal lifecycle event handled silently by client-side refresh
    if (err.name !== 'TokenExpiredError') {
      console.error('Auth middleware error:', err.message);
    }
    return res.status(401).json({ message: 'Authentication failed. Invalid or expired token.' });
  }
};

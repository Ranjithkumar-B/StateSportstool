const jwt = require('jsonwebtoken');

// --------------- Verify JWT Token ---------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'StateSportsAcademy_SuperSecret_JWT_Key_2026';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;    // { id, role, athleteId }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

// --------------- Role Authorization ---------------
// Usage: authorize('admin', 'coach')  → only admin and coach can access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this resource.'
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorize };

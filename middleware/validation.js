// middleware/validation.js
exports.validateConsultation = (req, res, next) => {
  const { query, goal } = req.body;
  
  if (!query || query.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid business query (minimum 3 characters)'
    });
  }
  
  // Sanitize input
  req.body.query = req.body.query.trim();
  req.body.goal = req.body.goal || 'balanced';
  
  next();
};

// middleware/auth.js
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// middleware/cors.js
module.exports = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
};
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  console.log('🔍 Auth Middleware - Token received:', token ? 'Yes' : 'No');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
    // FIX: The token has { id: '...' } directly, not { user: { id: '...' } }
    req.user = { id: decoded.id }; // ✅ Changed this line
    
    console.log('👤 req.user set to:', req.user);
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
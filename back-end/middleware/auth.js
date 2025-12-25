import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

export default function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    logger.warn('Authentication failed: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    
    logger.debug(`User authenticated: ${decoded.id}`);
    next();
  } catch (err) {
    logger.error(`Token verification failed: ${err.message}`);
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
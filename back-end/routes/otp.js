import express from 'express';
import crypto from 'crypto';
import OTP from '../models/OTP.js';
import User from '../models/User.js';
import logger from '../config/logger.js';
import { sendOTPEmail } from '../utils/emailService.js';

const router = express.Router();

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

function generateOTP(length = OTP_LENGTH) {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

router.post('/send', async (req, res) => {
  try {
    const { email, name, purpose = 'verification' } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Please provide a valid email address.'
      });
    }

    const existingOTP = await OTP.findOne({ email });
    
    if (existingOTP) {
      const timeSinceCreation = Date.now() - existingOTP.createdAt.getTime();
      const cooldownMs = RESEND_COOLDOWN_SECONDS * 1000;

      if (timeSinceCreation < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceCreation) / 1000);
        logger.warn(`OTP resend cooldown active for ${email}, ${remainingSeconds}s remaining`);
        return res.status(429).json({
          success: false,
          error: 'RESEND_COOLDOWN',
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
          remainingSeconds
        });
      }
    }

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiryTime,
        attempts: 0,
        createdAt: new Date(),
        metadata: { name, purpose }
      },
      { upsert: true, new: true }
    );

    const emailSent = await sendOTPEmail(email, name, otp, OTP_EXPIRY_MINUTES);

    if (!emailSent) {
      logger.error(`Failed to send OTP email to ${email}`);
      return res.status(500).json({
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`OTP generated for ${email}: ${otp} (expires in ${OTP_EXPIRY_MINUTES} minutes)`);
    }

    logger.info(`OTP sent to ${email}`);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email.',
      expiresIn: OTP_EXPIRY_MINUTES * 60
    });

  } catch (error) {
    logger.error(`Error sending OTP: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while sending OTP.'
    });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Email and OTP are required.'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_OTP_FORMAT',
        message: 'OTP must be a 6-digit number.'
      });
    }

    const storedOTP = await OTP.findOne({ email });

    if (!storedOTP) {
      logger.warn(`OTP verification attempt for non-existent OTP: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'NO_OTP_FOUND',
        message: 'No OTP found for this email. Please request a new one.'
      });
    }

    if (Date.now() > storedOTP.expiryTime.getTime()) {
      await OTP.deleteOne({ email });
      logger.warn(`Expired OTP verification attempt: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'OTP_EXPIRED',
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (storedOTP.attempts >= MAX_ATTEMPTS) {
      await OTP.deleteOne({ email });
      logger.warn(`Max OTP attempts exceeded for: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum attempts exceeded. Please request a new OTP.'
      });
    }

    if (storedOTP.otp === otp) {
      const user = await User.findOne({ email });
      if (user && !user.emailVerified) {
        await User.findOneAndUpdate(
          { email },
          { emailVerified: true, verifiedAt: new Date() },
          { new: true }
        );
      }

      await OTP.deleteOne({ email });

      logger.info(`OTP verified successfully for ${email}`);

      return res.json({
        success: true,
        message: 'OTP verified successfully.',
        data: {
          emailVerified: true,
          metadata: storedOTP.metadata
        }
      });
    } else {
      storedOTP.attempts += 1;
      await storedOTP.save();

      const attemptsLeft = MAX_ATTEMPTS - storedOTP.attempts;

      logger.warn(`Invalid OTP attempt for ${email}, ${attemptsLeft} attempts remaining`);

      if (attemptsLeft <= 0) {
        await OTP.deleteOne({ email });
        return res.status(400).json({
          success: false,
          error: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Maximum attempts exceeded. Please request a new OTP.',
          attemptsLeft: 0
        });
      }

      return res.status(400).json({
        success: false,
        error: 'INVALID_OTP',
        message: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} remaining.`,
        attemptsLeft
      });
    }

  } catch (error) {
    logger.error(`Error verifying OTP: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while verifying OTP.'
    });
  }
});

router.post('/resend', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_EMAIL',
        message: 'Email is required.'
      });
    }

    const existingOTP = await OTP.findOne({ email });
    
    if (existingOTP) {
      const timeSinceCreation = Date.now() - existingOTP.createdAt.getTime();
      const cooldownMs = RESEND_COOLDOWN_SECONDS * 1000;

      if (timeSinceCreation < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceCreation) / 1000);
        logger.warn(`OTP resend cooldown active for ${email}`);
        return res.status(429).json({
          success: false,
          error: 'RESEND_COOLDOWN',
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
          remainingSeconds
        });
      }
    }

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const metadata = existingOTP?.metadata || { name };

    await OTP.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiryTime,
        attempts: 0,
        createdAt: new Date(),
        metadata
      },
      { upsert: true, new: true }
    );

    const emailSent = await sendOTPEmail(
      email, 
      name || metadata.name, 
      otp, 
      OTP_EXPIRY_MINUTES
    );

    if (!emailSent) {
      logger.error(`Failed to resend OTP email to ${email}`);
      return res.status(500).json({
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`OTP resent for ${email}: ${otp}`);
    }

    logger.info(`OTP resent to ${email}`);

    res.json({
      success: true,
      message: 'New OTP sent successfully to your email.',
      expiresIn: OTP_EXPIRY_MINUTES * 60
    });

  } catch (error) {
    logger.error(`Error resending OTP: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while resending OTP.'
    });
  }
});

router.get('/status/:email', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const { email } = req.params;
    const storedOTP = await OTP.findOne({ email });

    if (!storedOTP) {
      return res.json({
        exists: false,
        message: 'No OTP found for this email'
      });
    }

    res.json({
      exists: true,
      email: storedOTP.email,
      otp: storedOTP.otp,
      expiresAt: storedOTP.expiryTime.toISOString(),
      expiresIn: Math.max(0, Math.ceil((storedOTP.expiryTime.getTime() - Date.now()) / 1000)),
      attempts: storedOTP.attempts,
      maxAttempts: MAX_ATTEMPTS,
      attemptsRemaining: MAX_ATTEMPTS - storedOTP.attempts,
      metadata: storedOTP.metadata,
      createdAt: storedOTP.createdAt.toISOString()
    });

  } catch (error) {
    logger.error(`Error getting OTP status: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while getting OTP status.'
    });
  }
});

setInterval(async () => {
  try {
    const now = new Date();
    const result = await OTP.deleteMany({ expiryTime: { $lt: now } });
    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} expired OTP(s)`);
    }
  } catch (error) {
    logger.error(`Error cleaning up expired OTPs: ${error.message}`);
  }
}, 60000);

export default router;
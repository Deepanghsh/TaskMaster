import express from 'express';
import crypto from 'crypto';
import OTP from '../models/OTP.js';
import User from '../models/User.js';
import { sendOTPEmail } from '../utils/emailService.js';

const router = express.Router();

// Configuration from environment variables
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generate a random OTP
 */
function generateOTP(length = OTP_LENGTH) {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

/**
 * @route   POST /api/otp/send
 * @desc    Send OTP to user's email
 * @access  Public
 */
router.post('/send', async (req, res) => {
  try {
    const { email, name, purpose = 'verification' } = req.body;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Please provide a valid email address.'
      });
    }

    // Check if there's an existing OTP
    const existingOTP = await OTP.findOne({ email });
    
    if (existingOTP) {
      // Check resend cooldown
      const timeSinceCreation = Date.now() - existingOTP.createdAt.getTime();
      const cooldownMs = RESEND_COOLDOWN_SECONDS * 1000;

      if (timeSinceCreation < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceCreation) / 1000);
        return res.status(429).json({
          success: false,
          error: 'RESEND_COOLDOWN',
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
          remainingSeconds
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP in database
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

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, name, otp, OTP_EXPIRY_MINUTES);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    // In development, log OTP (REMOVE IN PRODUCTION)
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 OTP for ${email}: ${otp}`);
      console.log(`⏰ Expires in ${OTP_EXPIRY_MINUTES} minutes\n`);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email.',
      expiresIn: OTP_EXPIRY_MINUTES * 60 // seconds
    });

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while sending OTP.'
    });
  }
});

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP code
 * @access  Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
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

    // Find OTP in database
    const storedOTP = await OTP.findOne({ email });

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        error: 'NO_OTP_FOUND',
        message: 'No OTP found for this email. Please request a new one.'
      });
    }

    // Check if OTP has expired
    if (Date.now() > storedOTP.expiryTime.getTime()) {
      await OTP.deleteOne({ email });
      return res.status(400).json({
        success: false,
        error: 'OTP_EXPIRED',
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if max attempts exceeded
    if (storedOTP.attempts >= MAX_ATTEMPTS) {
      await OTP.deleteOne({ email });
      return res.status(400).json({
        success: false,
        error: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedOTP.otp === otp) {
      // OTP is correct - Mark email as verified if user exists
      const user = await User.findOne({ email });
      if (user && !user.emailVerified) {
        await User.findOneAndUpdate(
          { email },
          { emailVerified: true, verifiedAt: new Date() },
          { new: true }
        );
      }

      // Delete OTP after successful verification
      await OTP.deleteOne({ email });

      console.log(`✅ OTP verified successfully for ${email}`);

      return res.json({
        success: true,
        message: 'OTP verified successfully.',
        data: {
          emailVerified: true,
          metadata: storedOTP.metadata
        }
      });
    } else {
      // Incorrect OTP - Increment attempts
      storedOTP.attempts += 1;
      await storedOTP.save();

      const attemptsLeft = MAX_ATTEMPTS - storedOTP.attempts;

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
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while verifying OTP.'
    });
  }
});

/**
 * @route   POST /api/otp/resend
 * @desc    Resend OTP to user's email
 * @access  Public
 */
router.post('/resend', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_EMAIL',
        message: 'Email is required.'
      });
    }

    // Check if there's an existing OTP
    const existingOTP = await OTP.findOne({ email });
    
    if (existingOTP) {
      // Check resend cooldown
      const timeSinceCreation = Date.now() - existingOTP.createdAt.getTime();
      const cooldownMs = RESEND_COOLDOWN_SECONDS * 1000;

      if (timeSinceCreation < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceCreation) / 1000);
        return res.status(429).json({
          success: false,
          error: 'RESEND_COOLDOWN',
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
          remainingSeconds
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Get existing metadata or use provided name
    const metadata = existingOTP?.metadata || { name };

    // Store new OTP (resets attempts)
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

    // Send OTP via email
    const emailSent = await sendOTPEmail(
      email, 
      name || metadata.name, 
      otp, 
      OTP_EXPIRY_MINUTES
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    // In development, log OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 Resent OTP for ${email}: ${otp}`);
      console.log(`⏰ Expires in ${OTP_EXPIRY_MINUTES} minutes\n`);
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully to your email.',
      expiresIn: OTP_EXPIRY_MINUTES * 60
    });

  } catch (error) {
    console.error('❌ Error resending OTP:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while resending OTP.'
    });
  }
});

/**
 * @route   GET /api/otp/status/:email
 * @desc    Check OTP status for an email (for debugging/admin purposes)
 * @access  Public (should be protected in production)
 */
router.get('/status/:email', async (req, res) => {
  // IMPORTANT: Remove or protect this endpoint in production
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
      otp: storedOTP.otp, // Only in development
      expiresAt: storedOTP.expiryTime.toISOString(),
      expiresIn: Math.max(0, Math.ceil((storedOTP.expiryTime.getTime() - Date.now()) / 1000)),
      attempts: storedOTP.attempts,
      maxAttempts: MAX_ATTEMPTS,
      attemptsRemaining: MAX_ATTEMPTS - storedOTP.attempts,
      metadata: storedOTP.metadata,
      createdAt: storedOTP.createdAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting OTP status:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while getting OTP status.'
    });
  }
});

// Cleanup expired OTPs every minute
setInterval(async () => {
  try {
    const now = new Date();
    const result = await OTP.deleteMany({ expiryTime: { $lt: now } });
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired OTP(s)`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up expired OTPs:', error);
  }
}, 60000);

export default router;
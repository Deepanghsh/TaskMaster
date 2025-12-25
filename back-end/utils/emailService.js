import nodemailer from 'nodemailer';
import logger from '../config/logger.js';
import { generateOTPEmailTemplate, generateOTPEmailPlainText } from './emailTemplates.js';

let transporter = null;

function initializeTransporter() {
  if (transporter) return transporter;

  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
    logger.warn('Email notifications are disabled');
    return null;
  }

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    logger.error('Email credentials not found in environment variables');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    logger.info('Email transporter initialized successfully');
    return transporter;
  } catch (error) {
    logger.error(`Error initializing email transporter: ${error.message}`);
    return null;
  }
}

export async function sendOTPEmail(recipientEmail, recipientName, otp, expiryMinutes = 10) {
  try {
    const emailTransporter = transporter || initializeTransporter();

    if (!emailTransporter) {
      logger.error('Email transporter not initialized');
      return false;
    }

    const htmlContent = generateOTPEmailTemplate(recipientName, otp, expiryMinutes);
    const textContent = generateOTPEmailPlainText(recipientName, otp, expiryMinutes);

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"TaskMaster" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Your Verification Code: ${otp}`,
      html: htmlContent,
      text: textContent
    };

    const info = await emailTransporter.sendMail(mailOptions);
    
    logger.info(`OTP email sent successfully to ${recipientEmail}`, { messageId: info.messageId });
    
    return true;

  } catch (error) {
    logger.error(`Error sending OTP email: ${error.message}`, { 
      code: error.code,
      recipient: recipientEmail 
    });
    
    if (error.code === 'EAUTH') {
      logger.error('Authentication failed. Please check your email credentials.');
    } else if (error.code === 'ESOCKET') {
      logger.error('Network error. Please check your internet connection.');
    }
    
    return false;
  }
}

export async function sendWelcomeEmail(recipientEmail, recipientName) {
  try {
    const emailTransporter = transporter || initializeTransporter();

    if (!emailTransporter) {
      return false;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to TaskMaster!</h1>
        </div>
        <div class="content">
            <h2>Hello ${recipientName}!</h2>
            <p>Thank you for joining TaskMaster. We're excited to have you on board!</p>
            <p>You can now start organizing your tasks and boost your productivity.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The TaskMaster Team</p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"TaskMaster" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Welcome to TaskMaster!',
      html: htmlContent,
      text: `Hello ${recipientName}! Welcome to TaskMaster. We're excited to have you on board!`
    };

    await emailTransporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${recipientEmail}`);
    
    return true;

  } catch (error) {
    logger.error(`Error sending welcome email: ${error.message}`, { recipient: recipientEmail });
    return false;
  }
}

export async function verifyEmailConfig() {
  try {
    const emailTransporter = transporter || initializeTransporter();

    if (!emailTransporter) {
      return false;
    }

    await emailTransporter.verify();
    logger.info('Email configuration verified successfully');
    return true;

  } catch (error) {
    logger.error(`Email configuration verification failed: ${error.message}`);
    return false;
  }
}

initializeTransporter();

export default {
  sendOTPEmail,
  sendWelcomeEmail,
  verifyEmailConfig
};
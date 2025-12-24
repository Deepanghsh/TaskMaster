import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  expiryTime: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    name: String,
    purpose: String
  }
});

// Create TTL index to automatically delete expired OTPs
otpSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  // NEW FIELDS FOR SETTINGS PAGE
  mobile: {
    type: String,
    trim: true,
    default: ''
  },
  dob: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say', ''],
    default: ''
  },
  // END NEW FIELDS
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// CRITICAL FIX: Only hash password if it was actually modified
// This prevents re-hashing when updating other fields like lastLogin
userSchema.pre('save', async function() {
  // Skip if password hasn't been modified
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

export default User;
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user cannot have two categories with the same name
CategorySchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model('category', CategorySchema);
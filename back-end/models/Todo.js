import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // References the User model
    required: true
  },
  text: {
    type: String,
    required: true
  },
  // NEW: Description is now stored in the database
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  dueDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('todo', TodoSchema);
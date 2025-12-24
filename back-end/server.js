import 'dotenv/config'; // Loads variables before any other imports execute
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';
import categoryRoutes from './routes/categories.js';
import otpRoutes from './routes/otp.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/otp', otpRoutes);

// Health check route
app.get('/', (req, res) => res.send('API Running in Module Format with OTP Verification'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🔥 Server started on port ${PORT}`);
    
    // Optional: Log this here to verify variables are loaded
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS) {
        console.log("✅ Email system initialized for:", process.env.EMAIL_USER);
    }
});
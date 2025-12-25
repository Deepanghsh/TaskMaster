import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import logger from './config/logger.js';

import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';
import categoryRoutes from './routes/categories.js';
import otpRoutes from './routes/otp.js';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/otp', otpRoutes);

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
    
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
        logger.info(`Email system initialized for: ${process.env.EMAIL_USER}`);
    }
});
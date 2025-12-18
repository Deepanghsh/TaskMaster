import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.get('/', (req, res) => res.send('API Running in Module Format'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server started on port ${PORT}`));
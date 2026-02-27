import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import your routes
import authRoutes from './routes/authRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import networkRoutes from './routes/networkRoutes.js';
import { startCronJobs } from './cron/scheduler.js';

dotenv.config();

const app = express();

// Middleware - 🌟 ADDED 50MB LIMIT FOR PHOTOS!
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/network', networkRoutes); 

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      startCronJobs(); 
    });
  })
  .catch((err) => console.log(err));
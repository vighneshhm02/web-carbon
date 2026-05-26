import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import carbonRoutes from './routes/carbonRoutes.js';
import { getStorageMode } from './services/storageService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const storageMode = getStorageMode();

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.use('/api', carbonRoutes);

app.use((err, req, res, next) => {
  console.error(`[${req.method}] ${req.path}`, err);
  res.status(500).json({ error: err.message });
});

const startServer = async () => {
  try {
    if (storageMode === 'mongo') {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } else {
      console.log('Storage mode: memory (MongoDB connection skipped)');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import parkingRoutes from './routes/parking.js';
import bookingRoutes from './routes/bookings.js';

// Initialize dotenv
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Please ensure you have updated the MONGODB_URI in your .env file to a valid MongoDB Atlas connection string.');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    database: dbStatus
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong on the server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
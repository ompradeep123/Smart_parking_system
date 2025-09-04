import express from 'express';
import { 
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  completeBooking,
  cancelBooking
} from '../controllers/bookings.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/complete', protect, completeBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/', protect, authorize('admin'), getAllBookings);
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);

export default router;
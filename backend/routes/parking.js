import express from 'express';
import { 
  getParkingSlots,
  getParkingSlotById,
  createParkingSlot,
  updateParkingSlot,
  deleteParkingSlot,
  getParkingSlotsByFloor
} from '../controllers/parking.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getParkingSlots);
router.get('/floor/:floor', getParkingSlotsByFloor);
router.get('/:id', getParkingSlotById);

// Protected admin routes
router.post('/', protect, authorize('admin'), createParkingSlot);
router.put('/:id', protect, authorize('admin'), updateParkingSlot);
router.delete('/:id', protect, authorize('admin'), deleteParkingSlot);

export default router;
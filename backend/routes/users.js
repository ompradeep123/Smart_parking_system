import express from 'express';
import { 
  getUserProfile,
  updateUserProfile,
  addVehicle,
  removeVehicle,
  getAllUsers,
  deleteUser
} from '../controllers/users.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/vehicle', protect, addVehicle);
router.delete('/vehicle/:id', protect, removeVehicle);

// Admin routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
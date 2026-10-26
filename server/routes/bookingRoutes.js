import express from 'express';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getRestaurantBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Customer routes ---
router.post('/', protect, authorize('customer'), createBooking);

// Yahan 'owner' ko bhi add kar diya hai taake 403 error na aaye
router.get('/my', protect, authorize('customer', 'owner', 'admin'), getMyBookings);

router.patch('/:id/cancel', protect, authorize('customer', 'owner'), cancelBooking);

// --- Owner routes ---
router.get(
  '/restaurant/:restaurantId',
  protect,
  authorize('owner', 'admin'),
  getRestaurantBookings
);
router.put('/:id/status', protect, authorize('owner', 'admin'), updateBookingStatus);

export default router;
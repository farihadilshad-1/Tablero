import express from 'express';
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
  getRestaurantTables,
  addTable, // <--- Add Table import kiya hai
} from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// --- Public routes ---
router.get('/', getRestaurants);
router.get('/mine/list', protect, authorize('owner'), getMyRestaurants); // before '/:id' to avoid route clash
router.get('/:id', getRestaurantById);

// --- Tables Routes (GET & POST) ---
router.route('/:id/tables')
  .get(getRestaurantTables)
  .post(protect, authorize('owner'), addTable); // <--- Owner-protected POST route add kar diya hai

// --- Protected routes (owner only) ---
router.post('/', protect, authorize('owner'), upload.array('images', 5), createRestaurant);
router.put('/:id', protect, authorize('owner'), upload.array('images', 5), updateRestaurant);
router.delete('/:id', protect, authorize('owner'), deleteRestaurant);

export default router;
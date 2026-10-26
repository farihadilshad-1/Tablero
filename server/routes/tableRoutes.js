import express from 'express';
import { updateTable, deleteTable } from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:id')
  .put(protect, authorize('owner'), updateTable)
  .delete(protect, authorize('owner'), deleteTable);

export default router;
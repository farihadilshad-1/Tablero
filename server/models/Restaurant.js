import mongoose from 'mongoose';

const openingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    open: { type: String, required: true }, // e.g. "09:00"
    close: { type: String, required: true }, // e.g. "22:00"
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    cuisine: {
      type: [String],
      required: [true, 'At least one cuisine type is required'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, required: true },
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true }, // Cloudinary public_id, needed for deletion
        },
      ],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    openingHours: {
      type: [openingHoursSchema],
      default: [],
    },
    tableCapacity: {
      type: Number,
      required: [true, 'Table capacity is required'],
      min: [1, 'Table capacity must be at least 1'],
    },
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', cuisine: 'text', 'address.city': 'text' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;

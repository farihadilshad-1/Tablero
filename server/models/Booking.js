import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    // Stored as a normalized string, e.g. "19:00-20:00" or "19:00",
    // so exact-match queries in the double-booking check stay simple and index-friendly.
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: [1, 'Party size must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    specialRequests: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Speeds up the double-booking lookup (restaurant + date + timeSlot + status)
// which runs on every single booking attempt.
bookingSchema.index({ restaurant: 1, date: 1, timeSlot: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

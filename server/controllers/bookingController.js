import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (customer)
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { restaurant: restaurantId, date, timeSlot, partySize, specialRequests } = req.body;

  if (!restaurantId || !date || !timeSlot || !partySize) {
    throw new ApiError(400, 'restaurant, date, timeSlot and partySize are all required');
  }

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, 'Invalid restaurant ID');
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isActive) {
    throw new ApiError(404, 'Restaurant not found or is not currently accepting bookings');
  }

  if (partySize > restaurant.tableCapacity) {
    throw new ApiError(
      400,
      `Party size (${partySize}) exceeds this restaurant's total capacity (${restaurant.tableCapacity})`
    );
  }

  const bookingDate = new Date(date);
  bookingDate.setUTCHours(0, 0, 0, 0);

  const existingBookings = await Booking.aggregate([
    {
      $match: {
        restaurant: new mongoose.Types.ObjectId(restaurantId),
        date: bookingDate,
        timeSlot,
        status: 'confirmed',
      },
    },
    {
      $group: {
        _id: null,
        totalGuests: { $sum: '$partySize' },
      },
    },
  ]);

  const currentlyBooked = existingBookings[0]?.totalGuests || 0;

  if (currentlyBooked + Number(partySize) > restaurant.tableCapacity) {
    const remaining = Math.max(restaurant.tableCapacity - currentlyBooked, 0);
    throw new ApiError(
      400,
      `This time slot is fully booked. Only ${remaining} seat(s) remaining for ${timeSlot} on ${bookingDate.toDateString()}.`
    );
  }

const booking = await Booking.create({
    user: req.user._id,
    restaurant: restaurantId,
    date: bookingDate,
    timeSlot,
    partySize,
    specialRequests,
    status: 'pending', // <--- Isko 'pending' kar dein!
  });

  const populated = await booking.populate([
    { path: 'restaurant', select: 'name address tableCapacity' },
    { path: 'user', select: 'name email' },
  ]);

  // Return formatted single booking
  res.status(201).json(populated);
});

/**
 * @desc    Get all bookings for the logged-in customer
 * @route   GET /api/bookings/my
 * @access  Private (customer)
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('restaurant', 'name address images cuisine')
    .sort({ date: -1, createdAt: -1 });

  // Return raw array directly to match api.ts expecting Promise<Booking[]>
  res.status(200).json(bookings);
});

/**
 * @desc    Cancel a booking (must belong to the requesting customer)
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private (customer)
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to cancel this booking');
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(400, 'This booking is already cancelled');
  }

  booking.status = 'cancelled';
  await booking.save();

  res.status(200).json(booking);
});

/**
 * @desc    Get all bookings for a restaurant owned by the logged-in owner
 * @route   GET /api/bookings/restaurant/:restaurantId
 * @access  Private (owner)
 */
export const getRestaurantBookings = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to view bookings for this restaurant');
  }

  const { status, date } = req.query;
  const filter = { restaurant: restaurantId };
  if (status) filter.status = status;
  if (date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    filter.date = d;
  }

  const bookings = await Booking.find(filter)
    .populate('user', 'name email phone')
    .sort({ date: 1, timeSlot: 1 });

  res.status(200).json(bookings);
});

/**
 * @desc    Update a booking's status (confirm/cancel) — restaurant owner only
 * @route   PATCH /api/bookings/:id/status
 * @access  Private (owner)
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    throw new ApiError(400, "Status must be one of: 'pending', 'confirmed', 'cancelled'");
  }

  const booking = await Booking.findById(req.params.id).populate('restaurant');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to modify bookings for this restaurant');
  }

  if (status === 'confirmed' && booking.status !== 'confirmed') {
    const existingBookings = await Booking.aggregate([
      {
        $match: {
          restaurant: booking.restaurant._id,
          date: booking.date,
          timeSlot: booking.timeSlot,
          status: 'confirmed',
          _id: { $ne: booking._id },
        },
      },
      { $group: { _id: null, totalGuests: { $sum: '$partySize' } } },
    ]);

    const currentlyBooked = existingBookings[0]?.totalGuests || 0;

    if (currentlyBooked + booking.partySize > booking.restaurant.tableCapacity) {
      throw new ApiError(
        400,
        'Cannot confirm — this time slot no longer has enough remaining capacity'
      );
    }
  }

  booking.status = status;
  await booking.save();

  res.status(200).json(booking);
});
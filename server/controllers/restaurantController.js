import Restaurant from '../models/Restaurant.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { cloudinary } from '../config/cloudinary.js';
import Table from '../models/Table.js';

/**
 * @desc    Get all active restaurants (supports basic filtering & search)
 * @route   GET /api/restaurants
 * @access  Public
 */
export const getRestaurants = asyncHandler(async (req, res) => {
  const { city, cuisine, search, page = 1, limit = 10 } = req.query;

  const filter = { isActive: true };

  if (city) filter['address.city'] = new RegExp(city, 'i');
  if (cuisine) filter.cuisine = { $in: [new RegExp(cuisine, 'i')] };
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const restaurants = await Restaurant.find(filter)
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json(restaurants);
});

/**
 * @desc    Get a single restaurant by ID
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  res.status(200).json(restaurant);
});

/**
 * @desc    Create a new restaurant
 * @route   POST /api/restaurants
 * @access  Private (owner)
 */
export const createRestaurant = asyncHandler(async (req, res) => {
  const { name, description, cuisine, address, openingHours, tableCapacity, priceRange } =
    req.body;

  if (!name || !description || !cuisine || !address) {
    throw new ApiError(400, 'Missing required restaurant fields');
  }

  const images = (req.files || []).map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  // --- Yahan se safe parsing start hoti hai ---
  let parsedAddress = address;
  if (typeof address === 'string') {
    try {
      parsedAddress = JSON.parse(address);
    } catch {
      parsedAddress = { street: address, city: 'New York', country: 'USA' };
    }
  }

  let parsedHours = openingHours;
  if (typeof openingHours === 'string') {
    try {
      parsedHours = JSON.parse(openingHours);
    } catch {
      parsedHours = { open: '12:00 PM', close: '11:00 PM' };
    }
  }
  // ---------------------------------------------

  const restaurant = await Restaurant.create({
    name,
    description,
    cuisine: Array.isArray(cuisine) ? cuisine : String(cuisine).split(',').map((c) => c.trim()),
    address: parsedAddress,
    openingHours: parsedHours,
    tableCapacity: tableCapacity || 10,
    priceRange: priceRange || '$$',
    images,
    owner: req.user._id,
  });

  res.status(201).json(restaurant);
});

/**
 * @desc    Update a restaurant (owner of that restaurant only)
 * @route   PUT /api/restaurants/:id
 * @access  Private (owner)
 */
export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this restaurant');
  }

  const updatableFields = [
    'name',
    'description',
    'cuisine',
    'address',
    'openingHours',
    'tableCapacity',
    'priceRange',
    'isActive',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      let value = req.body[field];
      if ((field === 'address' || field === 'openingHours') && typeof value === 'string') {
        value = JSON.parse(value);
      }
      if (field === 'cuisine' && typeof value === 'string') {
        value = value.split(',').map((c) => c.trim());
      }
      restaurant[field] = value;
    }
  });

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
    restaurant.images.push(...newImages);
  }

  const updated = await restaurant.save();

  res.status(200).json(updated);
});

/**
 * @desc    Delete a restaurant (owner of that restaurant only)
 * @route   DELETE /api/restaurants/:id
 * @access  Private (owner)
 */
export const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this restaurant');
  }

  await Promise.all(
    restaurant.images.map((img) =>
      cloudinary.uploader.destroy(img.publicId).catch(() => null)
    )
  );

  await restaurant.deleteOne();

  res.status(200).json({ message: 'Restaurant deleted successfully' });
});

/**
 * @desc    Get all restaurants owned by the logged-in owner with tables count
 * @route   GET /api/restaurants/mine/list
 * @access  Private (owner)
 */
export const getMyRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({ owner: req.user._id }).lean().sort({ createdAt: -1 });

  const restaurantsWithTables = await Promise.all(
    restaurants.map(async (rest) => {
      const allTables = await Table.find({}).lean();
      
      const matchedTables = allTables.filter(t => {
        return Object.values(t).some(val => 
          val && (val.toString() === rest._id.toString())
        );
      });

      return { 
        ...rest, 
        tables: matchedTables,                
        tableCount: matchedTables.length 
      };
    })
  );

  res.status(200).json(restaurantsWithTables);
});

/**
 * @desc    Get tables for a specific restaurant
 * @route   GET /api/restaurants/:id/tables
 * @access  Public
 */
export const getRestaurantTables = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const allTables = await Table.find({}).lean();
  const tables = allTables.filter(t => {
    return Object.values(t).some(val => 
      val && (val.toString() === id.toString())
    );
  });

  return res.status(200).json(tables);
});

/**
 * @desc    Add a table to a specific restaurant
 * @route   POST /api/restaurants/:id/tables
 * @access  Private (owner)
 */
export const addTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { tableNumber, number, tableNo, name, capacity, seats, location } = req.body;

  const restaurant = await Restaurant.findById(id);

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to add tables to this restaurant');
  }

  const table = await Table.create({
    restaurant: id,
    tableNumber: tableNumber || number || tableNo || name || `Table-${Date.now()}`,
    capacity: capacity || seats || 4,
    location: location || 'Indoor',
  });

  res.status(201).json(table);
});

/**
 * @desc    Update a table
 * @route   PUT /api/tables/:id
 * @access  Private (owner)
 */
export const updateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const table = await Table.findById(id);

  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  const restaurant = await Restaurant.findById(table.restaurant);
  if (restaurant && restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this table');
  }

  const { capacity, active, location, tableNumber } = req.body;
  if (capacity !== undefined) table.capacity = capacity;
  if (active !== undefined) table.active = active;
  if (location !== undefined) table.location = location;
  if (tableNumber !== undefined) table.tableNumber = tableNumber;

  await table.save();
  res.status(200).json(table);
});

/**
 * @desc    Delete a table
 * @route   DELETE /api/tables/:id
 * @access  Private (owner)
 */
export const deleteTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const table = await Table.findById(id);

  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  const restaurant = await Restaurant.findById(table.restaurant);
  if (restaurant && restaurant.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this table');
  }

  await table.deleteOne();
  res.status(200).json({ message: 'Table deleted successfully' });
});
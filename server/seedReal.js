import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from './models/Restaurant.js';
import User from './models/User.js';
import Table from './models/Table.js'; // Added Table model import

dotenv.config();

const realRestaurants = [
  {
    name: 'Kolachi Restaurant',
    description: 'Famous seaside dining offering premium BBQ, Pakistani traditional food, and seafood with a stunning ocean view.',
    cuisine: ['Pakistani', 'BBQ', 'Seafood'],
    address: {
      street: 'Beach Avenue, Phase 8, DHA',
      city: 'Karachi',
      state: 'Sindh',
      zipCode: '75500',
      country: 'Pakistan',
    },
    tableCapacity: 120,
    priceRange: '$$$',
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', publicId: 'kolachi_1' },
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', publicId: 'kolachi_2' }
    ]
  },
  {
    name: 'Bombay Bakery',
    description: 'Historic and iconic bakery in Hyderabad famous for its traditional heritage cakes, coffee, and pastries.',
    cuisine: ['Bakery', 'Desserts', 'Cafe'],
    address: {
      street: 'Cantonment Area',
      city: 'Hyderabad',
      state: 'Sindh',
      zipCode: '71000',
      country: 'Pakistan',
    },
    tableCapacity: 25,
    priceRange: '$$',
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', publicId: 'bombay_1' },
      { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', publicId: 'bombay_2' }
    ]
  },
  {
    name: 'Royal Tagine Restaurant',
    description: 'Popular dining spot in Autobahn Hyderabad serving delicious Karahi, Handi, and Arabian Platter.',
    cuisine: ['Pakistani', 'Middle Eastern', 'BBQ'],
    address: {
      street: 'Autobahn Road, Latifabad',
      city: 'Hyderabad',
      state: 'Sindh',
      zipCode: '71800',
      country: 'Pakistan',
    },
    tableCapacity: 60,
    priceRange: '$$',
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800', publicId: 'royal_1' },
      { url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800', publicId: 'royal_2' }
    ]
  },
  {
    name: 'BBQ Tonight',
    description: 'Pioneer of authentic Pakistani BBQ and traditional cuisine with rich spices and rooftop seating.',
    cuisine: ['Pakistani', 'BBQ', 'Asian'],
    address: {
      street: 'Com. 5/6, Boating Basin, Clifton',
      city: 'Karachi',
      state: 'Sindh',
      zipCode: '75600',
      country: 'Pakistan',
    },
    tableCapacity: 100,
    priceRange: '$$$',
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', publicId: 'bbq_1' },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', publicId: 'bbq_2' }
    ]
  },
  {
    name: 'Cafe Flo',
    description: 'Upscale French restaurant known for exquisite fine dining, steaks, and artisanal pastries.',
    cuisine: ['French', 'Continental', 'Italian'],
    address: {
      street: 'Block 4, Clifton',
      city: 'Karachi',
      state: 'Sindh',
      zipCode: '75600',
      country: 'Pakistan',
    },
    tableCapacity: 50,
    priceRange: '$$$$',
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800', publicId: 'flo_1' }
    ]
  },
  {
    name: 'Monal Restaurant',
    description: 'Iconic rooftop restaurant perched on Margalla Hills offering fine continental buffet spreads.',
    cuisine: ['Pakistani', 'Continental', 'BBQ'],
    address: {
      street: 'Pir Sohawa, Margalla Hills',
      city: 'Islamabad',
      state: 'ICT',
      zipCode: '44000',
      country: 'Pakistan',
    },
    tableCapacity: 150,
    priceRange: '$$$',
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', publicId: 'monal_1' }
    ]
  },
  {
    name: 'Haveli Restaurant',
    description: 'Heritage dining overlooking the Badshahi Mosque, serving traditional Lahori delicacies.',
    cuisine: ['Pakistani', 'Lahori', 'BBQ'],
    address: {
      street: 'Fort Road Food Street',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan',
    },
    tableCapacity: 90,
    priceRange: '$$$',
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800', publicId: 'haveli_1' }
    ]
  }
];

const seedRealDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tablero_db');

    let owner = await User.findOne({ role: 'owner' });
    if (!owner) {
      owner = await User.create({
        name: 'Restaurant Owner',
        email: 'owner@test.com',
        password: 'password123',
        role: 'owner',
      });
    }

    // Clean old collections
    await Restaurant.deleteMany({});
    await Table.deleteMany({});

    // Insert Restaurants
    const seeded = realRestaurants.map((r) => ({ ...r, owner: owner._id }));
    const createdRestaurants = await Restaurant.insertMany(seeded);

    // Generate Tables for each created Restaurant
    const tablesToInsert = [];

    createdRestaurants.forEach((restaurant) => {
      // Har restaurant ke liye 6 tables create hongay
      const configurations = [
        { tableNumber: 'T-1', capacity: 2 },
        { tableNumber: 'T-2', capacity: 2 },
        { tableNumber: 'T-3', capacity: 4 },
        { tableNumber: 'T-4', capacity: 4 },
        { tableNumber: 'T-5', capacity: 6 },
        { tableNumber: 'T-6', capacity: 8 },
      ];

      configurations.forEach((config) => {
        tablesToInsert.push({
          restaurant: restaurant._id,
          tableNumber: config.tableNumber,
          capacity: config.capacity,
          active: true,
        });
      });
    });

    await Table.insertMany(tablesToInsert);

    console.log('✅ Real restaurants AND tables seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedRealDB();
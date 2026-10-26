export type Role = 'customer' | 'owner';

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type Cuisine =
  | 'Italian'
  | 'Japanese'
  | 'Steakhouse'
  | 'French'
  | 'Mexican'
  | 'Indian'
  | 'Seafood'
  | 'Thai'
  | 'Bistro'
  | 'Mediterranean';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface RestaurantTable {
  _id: string;
  id: string;
  restaurantId: string;
  number: number;
  capacity: number;
  active: boolean;
}

export interface Restaurant {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: any;
  _id: string;
  id: string;
  name: string;
  cuisine: Cuisine;
  description: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$';
  hours: { day: string; open: string; close: string }[];
  imageUrl: string;
  galleryImages: string[];
  ownerId: string;
  tags: string[];
}

export interface Booking {
  _id: string;
  id: string;
  restaurantId: string;
  tableId: string;
  customerName: string;
  date: string;
  time: string;
  timeSlot?: string; // FIX: Added optional property
  partySize: number;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  recommendations?: string[];
}
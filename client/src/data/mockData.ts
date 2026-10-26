import type { Restaurant, RestaurantTable, Booking } from '@/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function hours(open: string, close: string) {
  return DAYS.map((d) => ({ day: d, open, close }));
}

export const mockRestaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Osterlia Bellini',
    cuisine: 'Italian',
    description:
      'A candle-lit osteria serving hand-rolled pasta and natural wines from the Veneto hills. Chef Marco Bellini plates every dish with the precision of a Renaissance painter.',
    address: '42 Corso Garibaldi',
    city: 'Milan',
    phone: '+39 02 555 0142',
    rating: 4.8,
    reviewCount: 1240,
    priceRange: '$$$',
    hours: hours('17:30', '23:00'),
    imageUrl: 'https://images.pexels.com/photos/8917285/pexels-photo-8917285.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/27976900/pexels-photo-27976900.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/17636472/pexels-photo-17636472.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/4871266/pexels-photo-4871266.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner1',
    tags: ['Romantic', 'Wine list', 'Outdoor seating'],
  },
  {
    id: 'r2',
    name: 'Sakura Jin',
    cuisine: 'Japanese',
    description:
      'An intimate 12-seat omakase counter where Chef Yamamoto crafts Edomae-style sushi from fish flown daily from Toyosu. Each course is a meditation on seasonality.',
    address: '7-3 Ginza, Chuo-ku',
    city: 'Tokyo',
    phone: '+81 3 555 0731',
    rating: 4.9,
    reviewCount: 890,
    priceRange: '$$$',
    hours: hours('18:00', '22:30'),
    imageUrl: 'https://images.pexels.com/photos/858501/pexels-photo-858501.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/33269326/pexels-photo-33269326.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8951181/pexels-photo-8951181.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/11470545/pexels-photo-11470545.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner1',
    tags: ['Omakase', 'Counter seating', 'Quiet'],
  },
  {
    id: 'r3',
    name: 'The Brass Anchor',
    cuisine: 'Steakhouse',
    description:
      'A classic American steakhouse with dry-aged cuts carved tableside, an extensive bourbon program, and leather booths that have hosted three generations of regulars.',
    address: '150 W 46th Street',
    city: 'New York',
    phone: '+1 212 555 0199',
    rating: 4.7,
    reviewCount: 2103,
    priceRange: '$$$',
    hours: hours('16:00', '01:00'),
    imageUrl: 'https://images.pexels.com/photos/299351/pexels-photo-299351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/12411865/pexels-photo-12411865.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/17130442/pexels-photo-17130442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/30112336/pexels-photo-30112336.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner2',
    tags: ['Steak', 'Bourbon', 'Special occasion'],
  },
  {
    id: 'r4',
    name: 'Café Lumière',
    cuisine: 'French',
    description:
      'A Parisian-style bistro on a tree-lined boulevard serving coq au vin, steak frites, and an ever-rotating plat du jour. The terrace is perfect for a leisurely afternoon.',
    address: '18 Rue de Rivoli',
    city: 'Paris',
    phone: '+33 1 555 0488',
    rating: 4.6,
    reviewCount: 1567,
    priceRange: '$$',
    hours: hours('08:00', '23:00'),
    imageUrl: 'https://images.pexels.com/photos/13598490/pexels-photo-13598490.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/31035995/pexels-photo-31035995.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/31725641/pexels-photo-31725641.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/32811585/pexels-photo-32811585.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner2',
    tags: ['Terrace', 'Brunch', 'Classic'],
  },
  {
    id: 'r5',
    name: 'Casa Solera',
    cuisine: 'Mexican',
    description:
      'A vibrant cantina pouring mezcal flights alongside mole negro, fresh ceviche, and street-style tacos al pastor. Live mariachi on weekends.',
    address: '305 Olvera Street',
    city: 'Los Angeles',
    phone: '+1 213 555 0321',
    rating: 4.5,
    reviewCount: 982,
    priceRange: '$$',
    hours: hours('11:00', '00:00'),
    imageUrl: 'https://images.pexels.com/photos/5229768/pexels-photo-5229768.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/23947771/pexels-photo-23947771.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/27938734/pexels-photo-27938734.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/31823007/pexels-photo-31823007.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner1',
    tags: ['Mezcal', 'Live music', 'Vegan options'],
  },
  {
    id: 'r6',
    name: 'Saffron & Smoke',
    cuisine: 'Indian',
    description:
      'A modern Indian kitchen where tandoor-fired kebabs meet coastal curries. Chef Priya Anand reinterprets family recipes with seasonal produce from local farms.',
    address: '25 Brick Lane',
    city: 'London',
    phone: '+44 20 555 0777',
    rating: 4.7,
    reviewCount: 1340,
    priceRange: '$$',
    hours: hours('12:00', '23:00'),
    imageUrl: 'https://images.pexels.com/photos/9792458/pexels-photo-9792458.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/36388454/pexels-photo-36388454.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/33643313/pexels-photo-33643313.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/958547/pexels-photo-958547.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner2',
    tags: ['Tandoor', 'Vegetarian', 'Spicy'],
  },
  {
    id: 'r7',
    name: 'The Salted Pearl',
    cuisine: 'Seafood',
    description:
      'A waterfront seafood house with oysters shucked to order, a raw bar, and whole grilled branzino. The catch board changes with every tide.',
    address: '1 Pier 7 Boardwalk',
    city: 'Lisbon',
    phone: '+351 21 555 0303',
    rating: 4.6,
    reviewCount: 745,
    priceRange: '$$$',
    hours: hours('17:00', '23:30'),
    imageUrl: 'https://images.pexels.com/photos/27381531/pexels-photo-27381531.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/15671371/pexels-photo-15671371.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/32149256/pexels-photo-32149256.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/15059689/pexels-photo-15059689.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner1',
    tags: ['Oysters', 'Waterfront', 'Raw bar'],
  },
  {
    id: 'r8',
    name: 'Lemongrass Lane',
    cuisine: 'Thai',
    description:
      'A bustling Thai kitchen serving Isaan-style larb, fragrant green curry, and wok-fired pad see ew. The cocktail program leans into Thai herbs and rum.',
    address: '88 Sukhumvit Soi 11',
    city: 'Bangkok',
    phone: '+66 2 555 0888',
    rating: 4.5,
    reviewCount: 1120,
    priceRange: '$',
    hours: hours('11:00', '02:00'),
    imageUrl: 'https://images.pexels.com/photos/10756648/pexels-photo-10756648.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/5939141/pexels-photo-5939141.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/35283658/pexels-photo-35283658.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/36826038/pexels-photo-36826038.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner2',
    tags: ['Late night', 'Cocktails', 'Street food'],
  },
  {
    id: 'r9',
    name: 'The Green Fig',
    cuisine: 'Bistro',
    description:
      'A neighborhood bistro with a chalkboard menu, a tiny wine list, and a rotating roster of small plates. The kind of place where the bartender knows your order.',
    address: '5 Bedford Avenue',
    city: 'Brooklyn',
    phone: '+1 718 555 0456',
    rating: 4.4,
    reviewCount: 634,
    priceRange: '$$',
    hours: hours('17:00', '00:00'),
    imageUrl: 'https://images.pexels.com/photos/35285456/pexels-photo-35285456.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/8974874/pexels-photo-8974874.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/37295158/pexels-photo-37295158.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/39154579/pexels-photo-39154579.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner1',
    tags: ['Wine bar', 'Small plates', 'Cozy'],
  },
  {
    id: 'r10',
    name: 'Marisol',
    cuisine: 'Mediterranean',
    description:
      'Sun-washed Mediterranean plates — grilled octopus, charred lemon, za\'atar flatbread — served on a terrace overlooking the olive groves.',
    address: '23 Carrer del Mar',
    city: 'Barcelona',
    phone: '+34 93 555 0212',
    rating: 4.8,
    reviewCount: 890,
    priceRange: '$$$',
    hours: hours('13:00', '00:00'),
    imageUrl: 'https://images.pexels.com/photos/28575445/pexels-photo-28575445.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    galleryImages: [
      'https://images.pexels.com/photos/32568165/pexels-photo-32568165.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/12181763/pexels-photo-12181763.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/37968303/pexels-photo-37968303.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    ownerId: 'owner2',
    tags: ['Terrace', 'Garden', 'Sharing plates'],
  },
];

export const mockTables: RestaurantTable[] = [
  // Osterlia Bellini (r1)
  { id: 't1', restaurantId: 'r1', number: 1, capacity: 2, active: true },
  { id: 't2', restaurantId: 'r1', number: 2, capacity: 2, active: true },
  { id: 't3', restaurantId: 'r1', number: 3, capacity: 4, active: true },
  { id: 't4', restaurantId: 'r1', number: 4, capacity: 4, active: true },
  { id: 't5', restaurantId: 'r1', number: 5, capacity: 6, active: true },
  { id: 't6', restaurantId: 'r1', number: 6, capacity: 8, active: false },
  // Sakura Jin (r2)
  { id: 't7', restaurantId: 'r2', number: 1, capacity: 2, active: true },
  { id: 't8', restaurantId: 'r2', number: 2, capacity: 2, active: true },
  { id: 't9', restaurantId: 'r2', number: 3, capacity: 4, active: true },
  { id: 't10', restaurantId: 'r2', number: 4, capacity: 4, active: true },
  // The Brass Anchor (r3)
  { id: 't11', restaurantId: 'r3', number: 1, capacity: 2, active: true },
  { id: 't12', restaurantId: 'r3', number: 2, capacity: 4, active: true },
  { id: 't13', restaurantId: 'r3', number: 3, capacity: 4, active: true },
  { id: 't14', restaurantId: 'r3', number: 4, capacity: 6, active: true },
  { id: 't15', restaurantId: 'r3', number: 5, capacity: 8, active: true },
  // Café Lumière (r4)
  { id: 't16', restaurantId: 'r4', number: 1, capacity: 2, active: true },
  { id: 't17', restaurantId: 'r4', number: 2, capacity: 2, active: true },
  { id: 't18', restaurantId: 'r4', number: 3, capacity: 4, active: true },
  { id: 't19', restaurantId: 'r4', number: 4, capacity: 6, active: true },
  // Casa Solera (r5)
  { id: 't20', restaurantId: 'r5', number: 1, capacity: 2, active: true },
  { id: 't21', restaurantId: 'r5', number: 2, capacity: 4, active: true },
  { id: 't22', restaurantId: 'r5', number: 3, capacity: 4, active: true },
  { id: 't23', restaurantId: 'r5', number: 4, capacity: 6, active: true },
  { id: 't24', restaurantId: 'r5', number: 5, capacity: 8, active: true },
  // Saffron & Smoke (r6)
  { id: 't25', restaurantId: 'r6', number: 1, capacity: 2, active: true },
  { id: 't26', restaurantId: 'r6', number: 2, capacity: 4, active: true },
  { id: 't27', restaurantId: 'r6', number: 3, capacity: 4, active: true },
  { id: 't28', restaurantId: 'r6', number: 4, capacity: 6, active: true },
  // The Salted Pearl (r7)
  { id: 't29', restaurantId: 'r7', number: 1, capacity: 2, active: true },
  { id: 't30', restaurantId: 'r7', number: 2, capacity: 4, active: true },
  { id: 't31', restaurantId: 'r7', number: 3, capacity: 6, active: true },
  // Lemongrass Lane (r8)
  { id: 't32', restaurantId: 'r8', number: 1, capacity: 2, active: true },
  { id: 't33', restaurantId: 'r8', number: 2, capacity: 2, active: true },
  { id: 't34', restaurantId: 'r8', number: 3, capacity: 4, active: true },
  { id: 't35', restaurantId: 'r8', number: 4, capacity: 6, active: true },
  { id: 't36', restaurantId: 'r8', number: 5, capacity: 8, active: true },
  // The Green Fig (r9)
  { id: 't37', restaurantId: 'r9', number: 1, capacity: 2, active: true },
  { id: 't38', restaurantId: 'r9', number: 2, capacity: 4, active: true },
  { id: 't39', restaurantId: 'r9', number: 3, capacity: 4, active: true },
  // Marisol (r10)
  { id: 't40', restaurantId: 'r10', number: 1, capacity: 2, active: true },
  { id: 't41', restaurantId: 'r10', number: 2, capacity: 4, active: true },
  { id: 't42', restaurantId: 'r10', number: 3, capacity: 6, active: true },
  { id: 't43', restaurantId: 'r10', number: 4, capacity: 8, active: true },
];

const today = new Date();
const dateStr = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    restaurantId: 'r1',
    tableId: 't3',
    customerName: 'Alex Morgan',
    date: dateStr(0),
    time: '19:00',
    partySize: 4,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    notes: 'Anniversary dinner',
  },
  {
    id: 'b2',
    restaurantId: 'r3',
    tableId: 't12',
    customerName: 'Alex Morgan',
    date: dateStr(2),
    time: '20:00',
    partySize: 4,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b3',
    restaurantId: 'r2',
    tableId: 't7',
    customerName: 'Alex Morgan',
    date: dateStr(-3),
    time: '18:00',
    partySize: 2,
    status: 'completed',
    createdAt: new Date().toISOString(),
    notes: 'Birthday',
  },
  {
    id: 'b4',
    restaurantId: 'r5',
    tableId: 't22',
    customerName: 'Jordan Lee',
    date: dateStr(1),
    time: '19:30',
    partySize: 4,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b5',
    restaurantId: 'r1',
    tableId: 't1',
    customerName: 'Sam Rivera',
    date: dateStr(0),
    time: '19:00',
    partySize: 2,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b6',
    restaurantId: 'r3',
    tableId: 't15',
    customerName: 'Taylor Kim',
    date: dateStr(3),
    time: '21:00',
    partySize: 8,
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: 'Corporate dinner',
  },
];

export const timeSlots = [
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
];

export const cuisines: string[] = [
  'Italian', 'Japanese', 'Steakhouse', 'French', 'Mexican',
  'Indian', 'Seafood', 'Thai', 'Bistro', 'Mediterranean',
];

export const cities: string[] = [
  'Milan', 'Tokyo', 'New York', 'Paris', 'Los Angeles',
  'London', 'Lisbon', 'Bangkok', 'Brooklyn', 'Barcelona',
];

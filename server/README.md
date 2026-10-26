# Tablero Backend

Multi-restaurant table booking API. Node.js + Express + MongoDB (Mongoose), JWT auth, Cloudinary image storage, and Gemini-powered restaurant recommendations.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your real values
npm run dev             # nodemon, for local development
# or
npm start                # plain node, for production
```

## Environment variables (.env)

See `.env.example` — you need a MongoDB URI, a JWT secret, Cloudinary credentials, and a Gemini API key.

## Project structure

```
config/
  db.js            MongoDB connection
  cloudinary.js    Cloudinary config + multer storage engine
models/
  User.js
  Restaurant.js
  Booking.js
controllers/
  authController.js
  restaurantController.js
  bookingController.js
  aiController.js
routes/
  authRoutes.js
  restaurantRoutes.js
  bookingRoutes.js
  aiRoutes.js
middleware/
  authMiddleware.js  JWT verification + role-based access control
utils/
  asyncHandler.js  wraps controllers, forwards errors to Express
  ApiError.js      standardized error class (statusCode + message)
  generateToken.js JWT signing helper
server.js          app entry point, global error handler
```

## API Reference

### Auth — `/api/auth`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | body: `{ name, email, password, role, phone }`. `role` is `'customer'` or `'owner'`. |
| POST | `/login` | Public | body: `{ email, password }` → returns JWT |
| GET | `/me` | Private | Returns the logged-in user's profile |

### Restaurants — `/api/restaurants`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List restaurants. Query: `city`, `cuisine`, `search`, `page`, `limit` |
| GET | `/mine/list` | Owner | Restaurants owned by the logged-in owner |
| GET | `/:id` | Public | Single restaurant |
| POST | `/` | Owner | multipart/form-data, field `images` (up to 5 files) + JSON fields |
| PUT | `/:id` | Owner (own restaurant) | Update fields / append images |
| DELETE | `/:id` | Owner (own restaurant) | Deletes restaurant + its Cloudinary images |

### Bookings — `/api/bookings`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/` | Customer | body: `{ restaurant, date, timeSlot, partySize, specialRequests }` |
| GET | `/my-bookings` | Customer | All bookings for the logged-in customer |
| PUT | `/:id/cancel` | Customer (own booking) | Cancels a booking |
| GET | `/restaurant/:restaurantId` | Owner (own restaurant) | Incoming bookings. Query: `status`, `date` |
| PUT | `/:id/status` | Owner (own restaurant) | body: `{ status }` — `pending` / `confirmed` / `cancelled` |

**Double-booking prevention:** on every `POST /api/bookings` and every confirm via `PUT /:id/status`, the API sums `partySize` across all `confirmed` bookings for that exact restaurant + date + timeSlot. If `sum + new partySize > restaurant.tableCapacity`, the request is rejected with `400` and the number of remaining seats is included in the error message.

### AI — `/api/ai`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/recommend` | Public | body: `{ query: "romantic Italian dinner, mid-range budget" }` → 2-3 ranked recommendations pulled from active restaurants in MongoDB |

## Auth header format

```
Authorization: Bearer <jwt_token>
```

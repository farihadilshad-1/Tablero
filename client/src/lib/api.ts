import type { Restaurant, RestaurantTable, Booking, BookingStatus, Role } from '@/types';

const API_BASE = 'http://localhost:5000/api';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function clearToken(): void {
  localStorage.removeItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
      else if (body.error) message = body.error;
    } catch {
      // response body wasn't JSON
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ---- Auth ----

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ---- Restaurants ----

export function fetchRestaurants(): Promise<Restaurant[]> {
  return request<Restaurant[]>('/restaurants');
}

export function fetchRestaurant(id: string): Promise<Restaurant> {
  return request<Restaurant>(`/restaurants/${id}`);
}

export function createRestaurant(
  data: Omit<Restaurant, 'id' | 'ownerId'>,
): Promise<Restaurant> {
  return request<Restaurant>('/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateRestaurant(
  id: string,
  updates: Partial<Restaurant>,
): Promise<Restaurant> {
  return request<Restaurant>(`/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// ---- Tables ----

export function fetchTables(restaurantId: string): Promise<RestaurantTable[]> {
  return request<RestaurantTable[]>(`/restaurants/${restaurantId}/tables`);
}

export function createTable(
  restaurantId: string,
  data: { capacity: number },
): Promise<RestaurantTable> {
  return request<RestaurantTable>(`/restaurants/${restaurantId}/tables`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTable(
  tableId: string,
  updates: Partial<RestaurantTable>,
): Promise<RestaurantTable> {
  return request<RestaurantTable>(`/tables/${tableId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export function deleteTable(tableId: string): Promise<void> {
  return request<void>(`/tables/${tableId}`, { method: 'DELETE' });
}

// ---- Bookings ----

export function fetchBookings(): Promise<Booking[]> {
  return request<Booking[]>('/bookings');
}

export function fetchMyBookings(): Promise<Booking[]> {
  return request<Booking[]>('/bookings/my');
}

export function fetchRestaurantBookings(restaurantId: string): Promise<Booking[]> {
  return request<Booking[]>(`/bookings/restaurant/${restaurantId}`);
}

export function createBooking(
  data: Omit<Booking, 'id' | 'createdAt' | 'status'>,
): Promise<Booking> {
  return request<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<Booking> {
  // Updated to PUT and added /status to match backend route
  return request<Booking>(`/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function cancelBooking(bookingId: string): Promise<Booking> {
  return request<Booking>(`/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
  });
}
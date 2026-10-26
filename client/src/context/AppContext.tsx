import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Role, Restaurant, RestaurantTable, Booking, BookingStatus, User } from '@/types';
import * as api from '@/lib/api';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  restaurants: Restaurant[];
  tables: RestaurantTable[];
  bookings: Booking[];
  toasts: Toast[];
  loading: boolean;
  addRestaurant: (r: Omit<Restaurant, 'id' | 'ownerId'>) => Promise<void>;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => Promise<void>;
  addTable: (restaurantId: string, capacity: number) => Promise<void>;
  toggleTableActive: (tableId: string) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  isTableBooked: (tableId: string, date: string, time: string) => boolean;
}

const AppContext = createContext<AppState | null>(null);

let toastIdCounter = 0;
const nextToastId = () => `toast${++toastIdCounter}`;

// Helper to normalize restaurant image fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeRestaurant = (r: any): Restaurant => ({
  ...r,
  imageUrl: r.imageUrl || r.image || r.coverImage || ''
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('customer');
  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = nextToastId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
  }, []);

  const getEntityId = (item: unknown): string | null => {
    if (!item || typeof item !== 'object') return null;
    const obj = item as Record<string, unknown>;
    const rawId = obj._id || obj.id;
    if (!rawId || rawId === 'undefined') return null;
    return String(rawId);
  };

  // Helper to fetch correct bookings based on role supporting multiple restaurants and object IDs
  const fetchBookingsForUser = async (currentUser: User, currentRestaurants: Restaurant[]): Promise<Booking[]> => {
    try {
      if (currentUser.role === 'customer') {
        return await api.fetchMyBookings();
      } else if (currentUser.role === 'owner') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentUserId = String(currentUser.id || (currentUser as any)._id || '');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ownerRestaurants = currentRestaurants.filter((r: any) => {
          const ownerVal = r.ownerId || r.owner;
          if (!ownerVal) return false;
          const ownerIdStr = typeof ownerVal === 'object' 
            ? String(ownerVal._id || ownerVal.id || '') 
            : String(ownerVal);
          return ownerIdStr === currentUserId;
        });

        const allBookings: Booking[] = [];
        for (const rest of ownerRestaurants) {
          const restId = getEntityId(rest);
          if (restId) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (typeof (api as any).fetchRestaurantBookings === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const res = await (api as any).fetchRestaurantBookings(restId);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const list = Array.isArray(res) ? res : (res as any).data || [];
                allBookings.push(...list);
              }
            } catch {
              // Skip
            }
          }
        }
        return allBookings;
      }
      return [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const token = localStorage.getItem('token');
      let currentUser: User | null = null;

      if (token) {
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            currentUser = JSON.parse(stored) as User;
            setUser(currentUser);
            setRoleState(currentUser.role);
          }
        } catch {
          localStorage.removeItem('user');
        }
      }

      try {
        const restaurantData = await api.fetchRestaurants();
        if (cancelled) return;

        const safeRestaurants = Array.isArray(restaurantData) 
          ? restaurantData.map(normalizeRestaurant) 
          : [];
        setRestaurants(safeRestaurants);

        let bookingData: Booking[] = [];
        if (token && currentUser) {
          bookingData = await fetchBookingsForUser(currentUser, safeRestaurants);
        }

        const allTables: RestaurantTable[] = [];
        for (const r of safeRestaurants) {
          const restId = getEntityId(r);
          if (!restId) continue;

          try {
            const t = await api.fetchTables(restId);
            if (Array.isArray(t)) {
              // Ensure every table has a clear string restaurantId for proper matching
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const mappedTables = t.map((tableItem: any) => ({
                ...tableItem,
                restaurantId: getEntityId(tableItem.restaurantId) || restId
              }));
              allTables.push(...mappedTables);
            }
          } catch {
            // Ignore single table fetch failure
          }
        }
        if (!cancelled) setTables(allTables);
        if (!cancelled) setBookings(Array.isArray(bookingData) ? bookingData : []);
      } catch {
        if (!cancelled) {
          showToast('Could not connect to the server. Is your backend running?', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  // Auth Functions
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.login({ email, password });
      api.setToken(res.token);
      const currentUser: User = { ...res.user, _id: res.user.id };
      setUser(currentUser);
      setRoleState(res.user.role);
      localStorage.setItem('user', JSON.stringify(res.user));

      const restaurantData = await api.fetchRestaurants();
      const safeRestaurants = Array.isArray(restaurantData) 
        ? restaurantData.map(normalizeRestaurant) 
        : [];
      setRestaurants(safeRestaurants);

      const userBookings = await fetchBookingsForUser(currentUser, safeRestaurants);
      setBookings(Array.isArray(userBookings) ? userBookings : []);

      const allTables: RestaurantTable[] = [];
      for (const r of safeRestaurants) {
        const restId = getEntityId(r);
        if (!restId) continue;

        try {
          const t = await api.fetchTables(restId);
          if (Array.isArray(t)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedTables = t.map((tableItem: any) => ({
              ...tableItem,
              restaurantId: getEntityId(tableItem.restaurantId) || restId
            }));
            allTables.push(...mappedTables);
          }
        } catch { /* skip */ }
      }
      setTables(allTables);

      showToast(`Welcome back, ${res.user.name}!`, 'success');
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Login failed', 'error');
      return false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  const register = useCallback(async (name: string, email: string, password: string, selectedRole: Role): Promise<boolean> => {
    try {
      const res = await api.register({ name, email, password, role: selectedRole });
      api.setToken(res.token);
      setUser({ ...res.user, _id: res.user.id });
      setRoleState(res.user.role);
      localStorage.setItem('user', JSON.stringify(res.user));

      const restaurantData = await api.fetchRestaurants();
      setRestaurants(
        Array.isArray(restaurantData) 
          ? restaurantData.map(normalizeRestaurant) 
          : []
      );

      showToast(`Account created. Welcome, ${res.user.name}!`, 'success');
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Registration failed', 'error');
      return false;
    }
  }, [showToast]);

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem('user');
    setUser(null);
    setRoleState('customer');
    setBookings([]);
    showToast('Signed out', 'info');
  }, [showToast]);

  // Restaurant Actions
  const addRestaurant = useCallback(async (r: Omit<Restaurant, 'id' | 'ownerId'>) => {
    try {
      const created = await api.createRestaurant(r);
      const normalizedCreated = normalizeRestaurant(created);
      setRestaurants((prev) => [...prev, normalizedCreated]);
      showToast('Restaurant added successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add restaurant', 'error');
    }
  }, [showToast]);

  const updateRestaurant = useCallback(async (id: string, updates: Partial<Restaurant>) => {
    try {
      const updated = await api.updateRestaurant(id, updates);
      const normalizedUpdated = normalizeRestaurant(updated);
      setRestaurants((prev) => prev.map((r) => (getEntityId(r) === id ? normalizedUpdated : r)));
      showToast('Restaurant updated', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update restaurant', 'error');
    }
  }, [showToast]);

  // Table Actions
  const addTable = useCallback(async (restaurantId: string, capacity: number) => {
    if (!restaurantId || restaurantId === 'undefined') return;
    try {
      const created = await api.createTable(restaurantId, { capacity });
      const normalizedTable = {
        ...created,
        restaurantId: getEntityId(created.restaurantId) || restaurantId
      };
      setTables((prev) => [...prev, normalizedTable]);
      showToast(`Table ${created.number || ''} added`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add table', 'error');
    }
  }, [showToast]);

  const toggleTableActive = useCallback(async (tableId: string) => {
    const table = tables.find((t) => getEntityId(t) === tableId);
    if (!table) return;
    try {
      const updated = await api.updateTable(tableId, { active: !table.active });
      setTables((prev) => prev.map((t) => (getEntityId(t) === tableId ? updated : t)));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update table', 'error');
    }
  }, [tables, showToast]);

  const deleteTable = useCallback(async (tableId: string) => {
    try {
      await api.deleteTable(tableId);
      setTables((prev) => prev.filter((t) => getEntityId(t) !== tableId));
      showToast('Table removed', 'info');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove table', 'error');
    }
  }, [showToast]);

  // Booking Actions
  const isTableBooked = useCallback(
    (tableId: string, date: string, time: string) => {
      return bookings.some((b) => {
        const rawTable = (b as unknown as Record<string, unknown>).table || (b as unknown as Record<string, unknown>).tableId;
        const bTableId = typeof rawTable === 'object' && rawTable !== null 
          ? getEntityId(rawTable) 
          : String(rawTable || '');

        const bTime = b.time || (b as unknown as Record<string, unknown>).timeSlot;

        return (
          bTableId === String(tableId) &&
          b.date === date &&
          bTime === time &&
          b.status !== 'cancelled'
        );
      });
    },
    [bookings],
  );

  const createBooking = useCallback(
    async (bookingInput: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
      try {
        const rawCreated = await api.createBooking(bookingInput);
        
        const resObj = rawCreated as unknown as Record<string, unknown>;
        const createdBooking = (resObj.data || resObj.booking || rawCreated) as Booking;

        const safeBooking: Booking = {
          ...bookingInput,
          ...createdBooking,
          status: 'pending', 
          createdAt: createdBooking.createdAt ?? new Date().toISOString(),
        } as Booking;

        setBookings((prev) => [safeBooking, ...prev]);
        showToast('Booking request sent! The restaurant will confirm shortly.', 'success');
        return true;
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to create booking', 'error');
        return false;
      }
    },
    [showToast],
  );

  const updateBookingStatus = useCallback(
    async (bookingId: string, status: BookingStatus) => {
      try {
        const updated = await api.updateBookingStatus(bookingId, status);
        setBookings((prev) => prev.map((b) => (getEntityId(b) === bookingId ? updated : b)));
        const labels: Record<BookingStatus, string> = {
          pending: 'marked as pending',
          confirmed: 'confirmed',
          completed: 'marked as completed',
          cancelled: 'cancelled',
        };
        showToast(`Booking ${labels[status]}`, status === 'cancelled' ? 'info' : 'success');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to update booking', 'error');
      }
    },
    [showToast],
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      try {
        const updated = await api.cancelBooking(bookingId);
        setBookings((prev) => prev.map((b) => (getEntityId(b) === bookingId ? updated : b)));
        showToast('Booking cancelled', 'info');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to cancel booking', 'error');
      }
    },
    [showToast],
  );

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        restaurants,
        tables,
        bookings,
        toasts,
        loading,
        addRestaurant,
        updateRestaurant,
        addTable,
        toggleTableActive,
        deleteTable,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        showToast,
        dismissToast,
        isTableBooked,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
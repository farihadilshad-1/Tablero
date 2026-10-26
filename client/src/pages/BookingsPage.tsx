import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Users, MapPin, X, CheckCircle2, Hourglass, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { BookingStatus, Restaurant, RestaurantTable } from '@/types';

const statusConfig: Record<BookingStatus, { label: string; icon: typeof CheckCircle2; classes: string }> = {
  pending: { label: 'Pending', icon: Hourglass, classes: 'bg-warning-500/15 text-warning-300 border-warning-500/30' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, classes: 'bg-success-500/15 text-success-300 border-success-500/30' },
  completed: { label: 'Completed', icon: CheckCircle2, classes: 'bg-charcoal-700 text-charcoal-200 border-charcoal-600' },
  cancelled: { label: 'Cancelled', icon: XCircle, classes: 'bg-error-500/15 text-error-300 border-error-500/30' },
};

const restaurantImages: Record<string, string> = {
  'Kolachi Restaurant': 'https://images.unsplash.com/photo-1543007630-9710e4a00a20',
  'Bombay Bakery': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  'Royal Tagine Restaurant': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
  'BBQ Tonight': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  'Cafe Flo': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800',
  'Monal Restaurant': 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae',
  'Haveli Restaurant': 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d',
};

const getRestaurantImage = (restaurant?: Restaurant) => {
  if (restaurant?.name && restaurantImages[restaurant.name]) {
    return restaurantImages[restaurant.name];
  }
  if (restaurant?.imageUrl && restaurant.imageUrl.trim() !== '') {
    return restaurant.imageUrl;
  }
  return 'https://images.pexels.com/photos/10135116/pexels-photo-10135116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
};

const getId = (item: unknown): string | null => {
  if (!item) return null;
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    const rawId = obj._id || obj.id;
    return rawId ? String(rawId) : null;
  }
  return null;
};

export default function BookingsPage() {
  const { bookings, restaurants, tables, cancelBooking, user } = useApp();

  const myBookings = useMemo(() => {
    if (!user) return [];
    const userId = getId(user);

    return bookings
      .filter((booking) => {
        const b = booking as unknown as Record<string, unknown>;
        const bookingUserId = getId(b.userId || b.user);
        
        if (bookingUserId && userId) {
          return bookingUserId === userId;
        }
        return b.customerName === user.name || b.customerEmail === user.email;
      })
      .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
  }, [bookings, user]);

  const getRestaurant = (restaurantProp: unknown): Restaurant | undefined => {
    if (!restaurantProp) return undefined;
    if (typeof restaurantProp === 'object' && 'name' in restaurantProp) {
      return restaurantProp as Restaurant;
    }
    const targetId = getId(restaurantProp);
    return restaurants.find((r) => getId(r) === targetId);
  };

  const getTable = (tableProp: unknown): RestaurantTable | undefined => {
    if (!tableProp) return undefined;
    if (typeof tableProp === 'object' && 'number' in tableProp) {
      return tableProp as RestaurantTable;
    }
    const targetId = getId(tableProp);
    return tables.find((t) => getId(t) === targetId);
  };

  const upcoming = myBookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const past = myBookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-white">My Bookings</h1>
          <p className="text-sm text-charcoal-400 mt-1">Manage your upcoming and past reservations</p>
        </div>

        {myBookings.length === 0 ? (
          <div className="card p-12 text-center">
            <CalendarDays className="h-12 w-12 text-charcoal-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No bookings yet</h3>
            <p className="text-sm text-charcoal-400 mb-6">Browse restaurants and book your first table.</p>
            <Link to="/" className="btn-primary">Browse restaurants</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brass-400" />
                  Upcoming ({upcoming.length})
                </h2>
                <div className="space-y-3">
                  {upcoming.map((booking) => {
                    const bookingId = getId(booking);
                    const restaurant = getRestaurant((booking as unknown as Record<string, unknown>).restaurant || booking.restaurantId);
                    const table = getTable((booking as unknown as Record<string, unknown>).table || booking.tableId);
                    const status = statusConfig[booking.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const restaurantId = getId(restaurant) || String(booking.restaurantId || '');

                    return (
                      <div key={bookingId || Math.random()} className="card p-5 hover:border-charcoal-600 transition-all">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 flex gap-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-charcoal-800">
                              <img
                                src={getRestaurantImage(restaurant)}
                                alt={restaurant?.name || 'Restaurant'}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  to={`/restaurants/${restaurantId}`}
                                  className="font-serif text-lg font-semibold text-white hover:text-brass-300 transition-colors"
                                >
                                  {restaurant?.name || 'Restaurant'}
                                </Link>
                                <span className={`chip border ${status.classes}`}>
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {status.label}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-charcoal-400">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5 text-brass-400" />
                                  {booking.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-brass-400" />
                                  {booking.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5 text-brass-400" />
                                  {booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'}
                                </span>
                                {restaurant?.city && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-brass-400" />
                                    {restaurant.city}
                                  </span>
                                )}
                                {table && (
                                  <span className="text-charcoal-500">Table {table.number}</span>
                                )}
                              </div>
                              {booking.notes && (
                                <p className="mt-2 text-xs text-charcoal-500 italic">"{booking.notes}"</p>
                              )}
                            </div>
                          </div>
                          {bookingId && (
                            <div className="flex sm:flex-col gap-2 sm:items-end">
                              <button
                                onClick={() => cancelBooking(bookingId)}
                                className="btn-ghost !text-error-300 hover:!bg-error-500/10"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-charcoal-500" />
                  History ({past.length})
                </h2>
                <div className="space-y-3">
                  {past.map((booking) => {
                    const bookingId = getId(booking);
                    const restaurant = getRestaurant((booking as unknown as Record<string, unknown>).restaurant || booking.restaurantId);
                    const table = getTable((booking as unknown as Record<string, unknown>).table || booking.tableId);
                    const status = statusConfig[booking.status] || statusConfig.completed;
                    const StatusIcon = status.icon;

                    return (
                      <div key={bookingId || Math.random()} className="card p-5 opacity-75">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-charcoal-800">
                            <img
                              src={getRestaurantImage(restaurant)}
                              alt={restaurant?.name || 'Restaurant'}
                              className="h-full w-full object-cover grayscale"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-serif text-base font-semibold text-charcoal-200">
                                {restaurant?.name || 'Restaurant'}
                              </span>
                              <span className={`chip border ${status.classes}`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {status.label}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-charcoal-500">
                              <span>{booking.date} at {booking.time}</span>
                              <span>{booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'}</span>
                              {table && <span>Table {table.number}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
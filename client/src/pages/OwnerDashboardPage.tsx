import { useState, useMemo } from 'react';
import {
  Store, Plus, Users, CalendarDays, Clock, CheckCircle2, XCircle,
  Hourglass, UtensilsCrossed, Pencil, X, Trash2, Star, MapPin, TrendingUp, DollarSign, PieChart,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { BookingStatus, Cuisine } from '@/types';
import { cuisines, cities } from '@/data/constants';

const statusConfig: Record<BookingStatus, { label: string; icon: typeof CheckCircle2; classes: string }> = {
  pending: { label: 'Pending', icon: Hourglass, classes: 'bg-warning-500/15 text-warning-300 border-warning-500/30' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, classes: 'bg-success-500/15 text-success-300 border-success-500/30' },
  completed: { label: 'Completed', icon: CheckCircle2, classes: 'bg-charcoal-700 text-charcoal-200 border-charcoal-600' },
  cancelled: { label: 'Cancelled', icon: XCircle, classes: 'bg-error-500/15 text-error-300 border-error-500/30' },
};

type Tab = 'restaurants' | 'bookings';

export default function OwnerDashboardPage() {
  const context = useApp();
  
  const restaurants = context?.restaurants || [];
  const tables = context?.tables || [];
  const bookings = useMemo(() => context?.bookings || [], [context?.bookings]);
  const addRestaurant = context?.addRestaurant || (() => {});
  const updateRestaurant = context?.updateRestaurant || (() => {});
  const addTable = context?.addTable || (() => {});
  const toggleTableActive = context?.toggleTableActive || (() => {});
  const deleteTable = context?.deleteTable || (() => {});
  const updateBookingStatus = context?.updateBookingStatus || (() => {});

  const [tab, setTab] = useState<Tab>('restaurants');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<string | null>(null);

  // Form state - initialized with safe default empty strings/values
  const [formName, setFormName] = useState('');
  const [formCuisine, setFormCuisine] = useState<Cuisine>('Italian');
  const [formCity, setFormCity] = useState(cities[0] || 'Hyderabad');
  const [formDescription, setFormDescription] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('https://images.pexels.com/photos/10135116/pexels-photo-10135116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940');
  const [formPriceRange, setFormPriceRange] = useState<'$' | '$$' | '$$$'>('$$');
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);

  // Helper to extract clean string ID from an object or string
  const extractId = (idField: unknown): string => {
    if (!idField) return '';
    if (typeof idField === 'string') return idField;
    if (typeof idField === 'object') {
      const obj = idField as Record<string, unknown>;
      return String(obj.id || obj._id || '');
    }
    return String(idField);
  };

  const activeRestaurantId = selectedRestaurantId || extractId(restaurants[0]?.id) || extractId(restaurants[0]?._id) || '';
  const selectedRestaurant = restaurants.find((r) => extractId(r.id || r._id) === activeRestaurantId) || restaurants[0];
  
  // Helper to format address safely whether it's a string or an object
  const formatAddress = (address: unknown) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const addressDetails = address as Record<string, unknown>;
      return [addressDetails.street, addressDetails.city, addressDetails.state, addressDetails.country]
        .filter((part): part is string => typeof part === 'string' && Boolean(part))
        .join(', ') || 'Hyderabad';
    }
    return '';
  };

  // Safely filter tables matching the active restaurant
  const selectedRestaurantTables = tables.filter((t) => {
    const tableRestId = extractId(t.restaurantId);
    return tableRestId === activeRestaurantId;
  });

  const allIncomingBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  }, [bookings]);

  const pendingCount = allIncomingBookings.filter((b) => b.status === 'pending').length;

  // Estimated analytics calculations
  const totalEstimatedRevenue = useMemo(() => {
    return allIncomingBookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((acc, b) => acc + (b.partySize || 2) * 25, 0);
  }, [allIncomingBookings]);

  const occupancyRate = useMemo(() => {
    if (tables.length === 0 || allIncomingBookings.length === 0) return 0;
    const activeBookings = allIncomingBookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length;
    const rate = Math.round((activeBookings / (tables.length * 7)) * 100);
    return Math.min(rate, 100);
  }, [tables.length, allIncomingBookings]);

  const handleSaveRestaurant = () => {
    if (!formName.trim()) return;

    // Address ko wapas object ki form mein dein taake backend JSON parse error na de
    const restaurantData = {
      name: formName,
      cuisine: formCuisine,
      city: formCity,
      description: formDescription,
      address: {
        street: formAddress,
        city: formCity,
        country: 'Pakistan',
      },
      phone: formPhone,
      imageUrl: formImageUrl,
      priceRange: formPriceRange,
    };

    if (editingRestaurant) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateRestaurant(editingRestaurant, restaurantData as any);
    } else {
      addRestaurant({
        ...restaurantData,
        rating: 4.0,
        reviewCount: 0,
        hours: [
          { day: 'Mon', open: '17:00', close: '23:00' },
          { day: 'Tue', open: '17:00', close: '23:00' },
          { day: 'Wed', open: '17:00', close: '23:00' },
          { day: 'Thu', open: '17:00', close: '23:00' },
          { day: 'Fri', open: '17:00', close: '00:00' },
          { day: 'Sat', open: '17:00', close: '00:00' },
          { day: 'Sun', open: '17:00', close: '23:00' },
        ],
        galleryImages: [],
        tags: [],
        _id: ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormCuisine('Italian');
    setFormCity(cities[0] || 'Hyderabad');
    setFormDescription('');
    setFormAddress('');
    setFormPhone('');
    setFormImageUrl('https://images.pexels.com/photos/10135116/pexels-photo-10135116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940');
    setFormPriceRange('$$');
    setEditingRestaurant(null);
    setShowAddRestaurant(false);
  };

  const startEdit = (id: string) => {
    const r = restaurants.find((rr) => extractId(rr.id || rr._id) === id);
    if (!r) return;
    
    setFormName(String(r.name || ''));
    setFormCuisine(String(r.cuisine || 'Italian') as Cuisine);
    setFormCity(String(r.city || cities[0] || 'Hyderabad'));
    setFormDescription(String(r.description || ''));
    
    // Safe handling for address whether string or object
    const address = r.address;
    let addressStr = '';
    if (typeof address === 'string') {
      addressStr = address;
    } else if (typeof address === 'object' && address !== null) {
      const addrObj = address as Record<string, unknown>;
      addressStr = String(addrObj.street || addrObj.city || '');
    }
    setFormAddress(addressStr);

    setFormPhone(String(r.phone || ''));
    setFormImageUrl(String(r.imageUrl || ''));
    setFormPriceRange(String(r.priceRange || '$$') as '$' | '$$' | '$$$');
    setEditingRestaurant(id);
    setShowAddRestaurant(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-charcoal-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-white">Owner Dashboard</h1>
            <p className="text-sm text-charcoal-400 mt-1">Manage your restaurants, tables, and bookings</p>
          </div>
          <button onClick={() => { resetForm(); setShowAddRestaurant(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add restaurant
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 bg-charcoal-900 border border-charcoal-800 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-4 w-4 text-brass-400" />
              <span className="text-xs text-charcoal-400">Restaurants</span>
            </div>
            <p className="text-2xl font-serif font-semibold text-white">{restaurants.length}</p>
          </div>
          <div className="card p-4 bg-charcoal-900 border border-charcoal-800 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <UtensilsCrossed className="h-4 w-4 text-brass-400" />
              <span className="text-xs text-charcoal-400">Tables</span>
            </div>
            <p className="text-2xl font-serif font-semibold text-white">
              {tables.filter((t) => {
                const tableRestId = extractId(t.restaurantId);
                return restaurants.some((r) => extractId(r.id || r._id) === tableRestId);
              }).length}
            </p>
          </div>
          <div className="card p-4 bg-charcoal-900 border border-charcoal-800 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-4 w-4 text-brass-400" />
              <span className="text-xs text-charcoal-400">Total bookings</span>
            </div>
            <p className="text-2xl font-serif font-semibold text-white">{allIncomingBookings.length}</p>
          </div>
          <div className="card p-4 bg-charcoal-900 border border-charcoal-800 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Hourglass className="h-4 w-4 text-warning-400" />
              <span className="text-xs text-charcoal-400">Pending</span>
            </div>
            <p className="text-2xl font-serif font-semibold text-white">{pendingCount}</p>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 bg-gradient-to-br from-charcoal-900 to-charcoal-900/50 border border-charcoal-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Estimated Revenue</p>
              <h3 className="text-2xl font-serif font-bold text-white mt-1">${totalEstimatedRevenue.toLocaleString()}</h3>
              <span className="text-xs text-success-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> From confirmed & completed
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-brass-500/10 flex items-center justify-center text-brass-400 border border-brass-500/20">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-charcoal-900 to-charcoal-900/50 border border-charcoal-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Avg. Occupancy Rate</p>
              <h3 className="text-2xl font-serif font-bold text-white mt-1">{occupancyRate}%</h3>
              <span className="text-xs text-charcoal-400 mt-1 block">Based on table capacity</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-success-500/10 flex items-center justify-center text-success-400 border border-success-500/20">
              <PieChart className="h-6 w-6" />
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-charcoal-900 to-charcoal-900/50 border border-charcoal-800 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Active Locations</p>
              <h3 className="text-2xl font-serif font-bold text-white mt-1">{restaurants.length} Outlets</h3>
              <span className="text-xs text-brass-400 mt-1 block">Fully operational</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-400 border border-warning-500/20">
              <Store className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-charcoal-800">
          <button
            onClick={() => setTab('restaurants')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
              tab === 'restaurants' ? 'border-brass-400 text-brass-300' : 'border-transparent text-charcoal-400 hover:text-white'
            }`}
          >
            <Store className="h-4 w-4" />
            Restaurants & Tables
          </button>
          <button
            onClick={() => setTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
              tab === 'bookings' ? 'border-brass-400 text-brass-300' : 'border-transparent text-charcoal-400 hover:text-white'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Incoming Bookings
            {pendingCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning-500 text-xs font-bold text-charcoal-950">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Restaurants tab */}
        {tab === 'restaurants' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-3">
              {restaurants.map((r, index) => {
                const rId = extractId(r.id || r._id) || index.toString();
                const tableCount = tables.filter((t) => extractId(t.restaurantId) === rId).length;
                const isSelected = activeRestaurantId === rId;
                return (
                  <button
                    key={rId}
                    onClick={() => setSelectedRestaurantId(rId)}
                    className={`card w-full p-4 text-left transition-all bg-charcoal-900 border rounded-xl ${
                      isSelected ? 'border-brass-400 shadow-lg' : 'border-charcoal-800 hover:border-charcoal-700'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-charcoal-800">
<img 
  src={
    r.name === 'The Counter Dining' 
      ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' 
      : (r.imageUrl || (Array.isArray(r.images) && r.images[0]?.url) || 'https://images.pexels.com/photos/10135116/pexels-photo-10135116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
  } 
  alt={r.name} 
  className="h-full w-full object-cover" 
  loading="lazy" 
  onError={(e) => {
    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/10135116/pexels-photo-10135116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
  }}
/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{r.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-charcoal-400">
                          <Star className="h-3 w-3 fill-brass-400 text-brass-400" />
                          {r.rating} • {r.cuisine}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-charcoal-500">
                          <MapPin className="h-3 w-3" /> {r.city} • {tableCount} tables
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {restaurants.length === 0 && (
                <div className="card p-8 text-center bg-charcoal-900 rounded-xl border border-charcoal-800">
                  <Store className="h-10 w-10 text-charcoal-600 mx-auto mb-3" />
                  <p className="text-sm text-charcoal-400">No restaurants yet. Add your first one!</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {!selectedRestaurant ? (
                <div className="card p-12 text-center bg-charcoal-900 rounded-xl border border-charcoal-800">
                  <Store className="h-12 w-12 text-charcoal-600 mx-auto mb-4" />
                  <p className="text-charcoal-400">Select a restaurant to manage its tables</p>
                </div>
              ) : (
                <div className="card p-6 bg-charcoal-900 rounded-xl border border-charcoal-800">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-serif text-xl font-semibold text-white">{selectedRestaurant.name}</h2>
                      <p className="text-sm text-charcoal-400 mt-1">
                        {formatAddress(selectedRestaurant.address)}
                        {selectedRestaurant.city ? `, ${selectedRestaurant.city}` : ''}
                      </p>
                    </div>
                    <button onClick={() => startEdit(extractId(selectedRestaurant.id || selectedRestaurant._id))} className="btn-ghost flex items-center gap-1 text-brass-300">
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">Tables</h3>
                      <button
                        onClick={() => setShowAddTable(!showAddTable)}
                        className="btn-ghost text-brass-300 flex items-center gap-1 text-sm"
                      >
                        <Plus className="h-4 w-4" /> Add table
                      </button>
                    </div>

                    {showAddTable && (
                      <div className="flex items-center gap-2 mb-3 rounded-xl border border-charcoal-700 bg-charcoal-800 p-3">
                        <Users className="h-4 w-4 text-charcoal-400" />
                        <select
                          value={newTableCapacity}
                          onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                          className="input-field bg-charcoal-900 text-white rounded-lg p-2 border border-charcoal-700"
                        >
                          {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <option key={n} value={n}>Seats {n}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            addTable(activeRestaurantId, newTableCapacity);
                            setShowAddTable(false);
                          }}
                          className="btn-primary bg-brass-500 text-charcoal-950 font-semibold px-4 py-2 rounded-lg"
                        >
                          Add
                        </button>
                        <button onClick={() => setShowAddTable(false)} className="btn-ghost text-charcoal-400">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedRestaurantTables.map((table, tIndex) => {
                        const tableId = extractId(table.id || table._id) || tIndex.toString();
                        return (
                          <div
                            key={tableId}
                            className={`rounded-xl border p-4 transition-all ${
                              table.active
                                ? 'border-charcoal-700 bg-charcoal-800'
                                : 'border-charcoal-800 bg-charcoal-950 opacity-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">Table {table.number}</p>
                                <p className="text-xs text-charcoal-400">Seats {table.capacity}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleTableActive(tableId)}
                                  className={`rounded-lg p-1.5 transition-all ${
                                    table.active
                                      ? 'text-success-400 hover:bg-success-500/10'
                                      : 'text-charcoal-500 hover:bg-charcoal-700'
                                  }`}
                                  title={table.active ? 'Deactivate' : 'Activate'}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteTable(tableId)}
                                  className="rounded-lg p-1.5 text-error-400 hover:bg-error-500/10 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${table.active ? 'bg-success-500/10 text-success-300' : 'bg-charcoal-700 text-charcoal-400'}`}>
                                {table.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {selectedRestaurantTables.length === 0 && (
                      <p className="text-sm text-charcoal-400 text-center py-8">No tables yet. Add one to start accepting bookings.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings tab */}
        {tab === 'bookings' && (
          <div className="space-y-3">
            {allIncomingBookings.length === 0 ? (
              <div className="card p-12 text-center bg-charcoal-900 rounded-xl border border-charcoal-800">
                <CalendarDays className="h-12 w-12 text-charcoal-600 mx-auto mb-4" />
                <p className="text-charcoal-400">No incoming bookings yet.</p>
              </div>
            ) : (
              allIncomingBookings.map((booking, bIndex) => {
                const bId = extractId(booking.id || booking._id) || bIndex.toString();
                const bookingRestId = extractId(booking.restaurantId);
                const restaurant = restaurants.find((r) => extractId(r.id || r._id) === bookingRestId);
                const table = tables.find((t) => extractId(t.id || t._id) === extractId(booking.tableId));
                const status = statusConfig[booking.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <div key={bId} className="card p-5 bg-charcoal-900 rounded-xl border border-charcoal-800">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-serif text-lg font-semibold text-white">
                              {restaurant?.name || 'Restaurant'}
                            </h3>
                            <p className="text-sm text-charcoal-400 mt-0.5">
                              Booking for <span className="text-charcoal-200 font-medium">{booking.customerName}</span>
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1.5 ${status.classes}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-charcoal-400">
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
                          {table && <span className="text-charcoal-500">Table {table.number}</span>}
                        </div>
                        {booking.notes && (
                          <p className="mt-2 text-xs text-charcoal-500 italic">"{booking.notes}"</p>
                        )}
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(bId, 'confirmed')}
                            className="inline-flex items-center gap-1.5 rounded-full bg-success-500/15 px-4 py-2 text-sm font-semibold text-success-300 border border-success-500/30 transition-all hover:bg-success-500/25"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateBookingStatus(bId, 'cancelled')}
                            className="inline-flex items-center gap-1.5 rounded-full bg-error-500/15 px-4 py-2 text-sm font-semibold text-error-300 border border-error-500/30 transition-all hover:bg-error-500/25"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add/Edit restaurant modal */}
      {showAddRestaurant && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 bg-charcoal-900 rounded-2xl border border-charcoal-800">
            <div className="flex items-start justify-between mb-6">
              <h3 className="font-serif text-xl font-semibold text-white">
                {editingRestaurant ? 'Edit restaurant' : 'Add restaurant'}
              </h3>
              <button onClick={resetForm} className="text-charcoal-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Restaurant name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. The Rustic Spoon"
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Cuisine</label>
                  <select value={formCuisine} onChange={(e) => setFormCuisine(e.target.value as Cuisine)} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-2.5 text-white">
                    {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">City</label>
                  <select value={formCity} onChange={(e) => setFormCity(e.target.value)} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-2.5 text-white">
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Price range</label>
                  <select value={formPriceRange} onChange={(e) => setFormPriceRange(e.target.value as '$' | '$$' | '$$$')} className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-2.5 text-white">
                    <option value="$">$ — Casual</option>
                    <option value="$$">$$ — Mid-range</option>
                    <option value="$$$">$$$ — Fine dining</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Phone</label>
                  <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+1 555 0100" className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-2.5 text-white" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Address</label>
                <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Street address" className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Tell diners what makes your restaurant special..."
                  rows={3}
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-2.5 text-white resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Cover image URL</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-800">
                <button type="button" onClick={resetForm} className="btn-ghost px-4 py-2 rounded-xl text-charcoal-300 hover:text-white">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveRestaurant} className="btn-primary bg-brass-500 text-charcoal-950 font-semibold px-5 py-2 rounded-xl">
                  {editingRestaurant ? 'Save changes' : 'Add restaurant'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, MapPin, Phone, Clock, Calendar, Users, ArrowLeft,
  CheckCircle2, X, UtensilsCrossed, ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { timeSlots } from '@/data/constants';

interface ImageObject {
  url?: string;
}

interface AddressObject {
  city?: string;
}

interface HoursObject {
  open?: string;
  close?: string;
}

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { 
    restaurants = [], 
    tables = [], 
    isTableBooked, 
    createBooking, 
    user 
  } = useApp();

  const restaurant = useMemo(() => {
    return (restaurants as unknown as Array<Record<string, unknown>>)?.find(
      (r) => String((r as Record<string, unknown>)._id || (r as Record<string, unknown>).id) === String(id)
    );
  }, [restaurants, id]);

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(timeSlots[0] || '12:00');
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<'success' | null>(null);

  const restaurantTables = useMemo(() => {
    if (!id || !Array.isArray(tables)) return [];

    const matched = (tables as unknown as Array<Record<string, unknown>>).filter((t) => {
      const rawRest = (t as Record<string, unknown>).restaurant || 
                    (t as Record<string, unknown>).restaurantId || 
                    (t as Record<string, unknown>).restaurant_id;
      
      const tableRestId = typeof rawRest === 'object' && rawRest !== null
        ? String((rawRest as Record<string, unknown>)._id || (rawRest as Record<string, unknown>).id || '')
        : String(rawRest || '');

      const matchesRestaurant = tableRestId.trim() === String(id).trim();
      const isActive = (t as Record<string, unknown>).active !== undefined 
        ? Boolean((t as Record<string, unknown>).active) 
        : true;

      return matchesRestaurant && isActive;
    });

    if (matched.length === 0 && (tables as unknown as Array<Record<string, unknown>>).length > 0) {
      return (tables as unknown as Array<Record<string, unknown>>).slice(0, 6);
    }

    return matched;
  }, [tables, id]);

  const suitableTables = useMemo(() => {
    const filtered = restaurantTables.filter((t) => {
      const cap = Number(
        (t as Record<string, unknown>).capacity || 
        (t as Record<string, unknown>).seats || 
        (t as Record<string, unknown>).maxGuests || 
        4
      );
      return cap >= partySize;
    });

    return filtered.length > 0 ? filtered : restaurantTables;
  }, [restaurantTables, partySize]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-charcoal-400 mb-4">Restaurant not found.</p>
          <Link to="/" className="btn-primary">Back to browse</Link>
        </div>
      </div>
    );
  }

  const restId = String((restaurant as Record<string, unknown>)._id || (restaurant as Record<string, unknown>).id || '');
  const restName = String((restaurant as Record<string, unknown>).name || 'Restaurant');
  const restCuisine = Array.isArray((restaurant as Record<string, unknown>).cuisine) 
    ? ((restaurant as Record<string, unknown>).cuisine as string[]).join(', ') 
    : String((restaurant as Record<string, unknown>).cuisine || 'Pakistani');
  const restAddress = String((restaurant as Record<string, unknown>).address || (restaurant as Record<string, unknown>).location || '');
  const restCity = String((restaurant as Record<string, unknown>).city || ((restaurant as Record<string, unknown>).address as AddressObject)?.city || 'Hyderabad');
  const restRating = String((restaurant as Record<string, unknown>).rating || '4.5');
  const restReviewCount = Number((restaurant as Record<string, unknown>).reviewCount || (restaurant as Record<string, unknown>).reviewsCount || 12);
  const restPriceRange = String((restaurant as Record<string, unknown>).priceRange || '$$');
  const restPhone = String((restaurant as Record<string, unknown>).phone || '+92 300 1234567');
  const restDescription = String((restaurant as Record<string, unknown>).description || 'Welcome to ' + restName);
  
  const tagsList: string[] = Array.isArray((restaurant as Record<string, unknown>).tags) 
    ? ((restaurant as Record<string, unknown>).tags as string[]) 
    : ['Popular', 'Dine-In'];
  
  const coverImage: string = (typeof (restaurant as Record<string, unknown>).imageUrl === 'string' && (restaurant as Record<string, unknown>).imageUrl)
    ? String((restaurant as Record<string, unknown>).imageUrl)
    : (Array.isArray((restaurant as Record<string, unknown>).images) && ((restaurant as Record<string, unknown>).images as unknown[]).length > 0
      ? (typeof ((restaurant as Record<string, unknown>).images as unknown[])[0] === 'string' 
        ? String(((restaurant as Record<string, unknown>).images as unknown[])[0]) 
        : ((((restaurant as Record<string, unknown>).images as unknown[])[0] as ImageObject)?.url || ''))
      : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800');

  const galleryList: string[] = Array.isArray((restaurant as Record<string, unknown>).galleryImages) && ((restaurant as Record<string, unknown>).galleryImages as string[]).length > 0
    ? ((restaurant as Record<string, unknown>).galleryImages as string[])
    : (Array.isArray((restaurant as Record<string, unknown>).images) 
      ? ((restaurant as Record<string, unknown>).images as unknown[]).map((img) => typeof img === 'string' ? img : ((img as ImageObject)?.url || '')) 
      : []);

  const todayIdx = (new Date().getDay() + 6) % 7;
  const hoursArray = Array.isArray((restaurant as Record<string, unknown>).hours) ? ((restaurant as Record<string, unknown>).hours as HoursObject[]) : [];
  const todayHours = hoursArray[todayIdx] || { open: '12:00', close: '23:00' };

  const handleBook = async () => {
    if (!selectedTable || !time) return;

    const token = localStorage.getItem('token');
    if (!token || !user) {
      alert('Please sign in first to confirm your booking!');
      setShowConfirm(false);
      navigate('/auth');
      return;
    }

    const currentUser = user as unknown as Record<string, string> | null;
    const currentUserId = currentUser?._id || currentUser?.id || '';

    const bookingPayload = {
      restaurant: restId,
      restaurantId: restId,
      table: selectedTable,
      tableId: selectedTable,
      user: currentUserId,
      userId: currentUserId,
      customerName: user?.name ?? 'Guest',
      date,
      time,
      timeSlot: time,
      partySize,
      status: 'pending',
    };

    const success = await createBooking(
      bookingPayload as unknown as Parameters<typeof createBooking>[0]
    );

    if (success) {
      setBookingResult('success');
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="relative h-80 sm:h-96 overflow-hidden">
        <img src={coverImage} alt={restName} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-charcoal-950/20" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-charcoal-950/65 backdrop-blur-sm px-4 py-2 text-sm text-white border border-charcoal-700 hover:bg-charcoal-950/80 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="card p-6 sm:p-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="chip bg-brass-400/15 text-brass-300 border border-brass-500/20">
                  {restCuisine}
                </span>
                <span className="chip bg-charcoal-800 text-charcoal-300">
                  {restPriceRange}
                </span>
                {tagsList.map((tag: string) => (
                  <span key={tag} className="chip bg-charcoal-800 text-charcoal-400 hidden sm:inline-flex">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
                {restName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-brass-400 text-brass-400" />
                  <span className="font-semibold text-white">{restRating}</span>
                  <span className="text-charcoal-400">({restReviewCount} reviews)</span>
                </div>
                {restAddress && (
                  <div className="flex items-center gap-1.5 text-charcoal-300">
                    <MapPin className="h-4 w-4 text-brass-400" />
                    {restAddress}, {restCity}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-charcoal-300">
                  <Phone className="h-4 w-4 text-brass-400" />
                  {restPhone}
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-300">
                  <Clock className="h-4 w-4 text-brass-400" />
                  {todayHours?.open || '12:00'}–{todayHours?.close || '23:00'}
                </div>
              </div>
              <p className="mt-4 text-charcoal-300 leading-relaxed max-w-2xl">
                {restDescription}
              </p>
            </div>
          </div>
        </div>

        {galleryList.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {galleryList.slice(0, 3).map((img: string, i: number) => (
              <div key={i} className="relative h-32 sm:h-48 overflow-hidden rounded-xl group">
                <img
                  src={img}
                  alt={`${restName} gallery ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-1">
            <h2 className="font-serif text-xl font-semibold text-white mb-4">Book a table</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal-300 mb-1.5">
                  <Calendar className="h-4 w-4 text-brass-400" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => { setDate(e.target.value); setSelectedTable(null); }}
                  className="input-field"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal-300 mb-1.5">
                  <Clock className="h-4 w-4 text-brass-400" /> Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot: string) => (
                    <button
                      key={slot}
                      onClick={() => { setTime(slot); setSelectedTable(null); }}
                      className={`rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                        time === slot
                          ? 'bg-brass-400 text-charcoal-950 font-bold shadow-sm'
                          : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-charcoal-300 mb-1.5">
                  <Users className="h-4 w-4 text-brass-400" /> Party size
                </label>
                <select
                  value={partySize}
                  onChange={(e) => { setPartySize(Number(e.target.value)); setSelectedTable(null); }}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n: number) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-white">Available tables</h2>
              {time && (
                <span className="text-sm text-charcoal-400">
                  {date} at {time}
                </span>
              )}
            </div>

            {suitableTables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-10 w-10 text-charcoal-600 mb-3" />
                <p className="text-charcoal-400">No tables configured for this restaurant in database.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {suitableTables.map((table, index) => {
                    const tableObj = table as Record<string, unknown>;
                    const tableId = String(tableObj._id || tableObj.id || `table-${index}`);
                    const booked = isTableBooked ? isTableBooked(tableId, date, time) : false;
                    const selected = selectedTable === tableId;
                    const cap = Number(tableObj.capacity || tableObj.seats || tableObj.maxGuests || 4);
                    
                    // --- Cleaned table number logic ---
                    let rawTableNum = String(tableObj.number || tableObj.tableNumber || tableObj.name || (index + 1));
                    if (rawTableNum.toLowerCase().startsWith('table-')) {
                      rawTableNum = rawTableNum.replace(/table-/i, '');
                    }
                    if (rawTableNum.length > 8) {
                      rawTableNum = `T-${index + 1}`;
                    }
                    const tableNum = rawTableNum;

                    return (
                      <button
                        key={tableId}
                        disabled={booked}
                        onClick={() => setSelectedTable(tableId)}
                        className={`relative flex flex-col items-center justify-center rounded-xl border p-4 transition-all ${
                          booked
                            ? 'border-charcoal-800 bg-charcoal-900 opacity-40 cursor-not-allowed'
                            : selected
                              ? 'border-brass-400 bg-brass-400/10 shadow-warm'
                              : 'border-charcoal-700 bg-charcoal-800 hover:border-charcoal-500'
                        }`}
                      >
                        {booked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <X className="h-6 w-6 text-error-400" />
                          </div>
                        )}
                        <UtensilsCrossed className={`h-5 w-5 mb-1 ${selected ? 'text-brass-400' : 'text-charcoal-500'}`} />
                        <span className={`text-sm font-semibold truncate max-w-full px-1 ${selected ? 'text-brass-300' : 'text-white'}`}>
                          Table {tableNum}
                        </span>
                        <span className="text-xs text-charcoal-400">Seats {cap}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedTable && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-brass-500/20 bg-brass-400/5 p-4 animate-slide-up">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success-400" />
                      <span className="text-sm text-charcoal-200">
                        Table selected for {partySize} {partySize === 1 ? 'guest' : 'guests'} on {date} at {time}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="btn-primary w-full sm:w-auto"
                    >
                      Book table
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showConfirm && selectedTable && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-serif text-xl font-semibold text-white">Confirm booking</h3>
              <button onClick={() => setShowConfirm(false)} className="text-charcoal-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-charcoal-400">Restaurant</span><span className="text-white font-medium">{restName}</span></div>
              <div className="flex justify-between"><span className="text-charcoal-400">Date</span><span className="text-white font-medium">{date}</span></div>
              <div className="flex justify-between"><span className="text-charcoal-400">Time</span><span className="text-white font-medium">{time}</span></div>
              <div className="flex justify-between"><span className="text-charcoal-400">Party size</span><span className="text-white font-medium">{partySize} {partySize === 1 ? 'guest' : 'guests'}</span></div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleBook} className="btn-primary flex-1">Confirm booking</button>
            </div>
          </div>
        </div>
      )}

      {bookingResult === 'success' && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md w-full p-8 text-center animate-scale-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-500/15 mb-4">
              <CheckCircle2 className="h-8 w-8 text-success-400" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-white mb-2">Booking confirmed!</h3>
            <p className="text-sm text-charcoal-400 mb-6">
              Your booking request at {restName} has been sent. The restaurant will confirm shortly.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/bookings" className="btn-primary">View my bookings</Link>
              <button onClick={() => setBookingResult(null)} className="btn-secondary">Continue browsing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
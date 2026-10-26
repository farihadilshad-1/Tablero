import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Users, SlidersHorizontal, Sparkles, Star, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cuisines, cities } from '@/data/constants';
import RestaurantCard from '@/components/RestaurantCard';

export default function HomePage() {
  const { restaurants } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [city, setCity] = useState('');
  const [partySize, setPartySize] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Safe Record Type Helpers
  const restaurantList = useMemo(() => {
    const list = Array.isArray(restaurants) ? restaurants : [];
    return list as unknown as Array<Record<string, unknown>>;
  }, [restaurants]);

  const filtered = useMemo(() => {
    return restaurantList.filter((r) => {
      const name = String(r.name || '').toLowerCase();
      
      const cuisineValue = Array.isArray(r.cuisine) 
        ? r.cuisine.join(' ').toLowerCase() 
        : String(r.cuisine || '').toLowerCase();

      const cityValue = String(r.city || (r.address as Record<string, unknown>)?.city || '');

      if (search) {
        const query = search.toLowerCase();
        if (!name.includes(query) && !cuisineValue.includes(query)) return false;
      }

      if (cuisine && !cuisineValue.includes(cuisine.toLowerCase())) return false;
      if (city && cityValue.toLowerCase() !== city.toLowerCase()) return false;

      // Party size logic handle
      if (partySize > 0) {
        const capacity = Number(r.capacity || r.maxPartySize || 10);
        if (capacity < partySize) return false;
      }

      return true;
    });
  }, [restaurantList, search, cuisine, city, partySize]);

  const topRated = useMemo(() => {
    return [...restaurantList]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3);
  }, [restaurantList]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/27138849/pexels-photo-27138849.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Restaurant interior"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/70 via-charcoal-950/50 to-charcoal-950" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-4 pt-16">
          <div className="text-center max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-brass-500/30 bg-charcoal-950/40 px-4 py-1.5 backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4 text-brass-400" />
              <span className="text-sm text-brass-200">AI-powered restaurant discovery</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight tracking-tight">
              Find your perfect table,
              <br />
              <span className="text-brass-300">anywhere in the world</span>
            </h1>
            <p className="mt-5 text-lg text-charcoal-200 max-w-xl mx-auto leading-relaxed">
              Browse curated restaurants, get personalized recommendations from our AI
              assistant, and book in seconds.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-8 w-full max-w-3xl animate-slide-up">
            <div className="rounded-2xl border border-charcoal-700 bg-charcoal-900/90 backdrop-blur-md p-4 shadow-card-hover">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal-400" />
                  <input
                    type="text"
                    placeholder="Restaurant name or cuisine..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field !pl-10"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field !w-auto flex-1"
                  >
                    <option value="">All cities</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn-secondary !px-4 ${showFilters ? 'border-brass-400 text-brass-300' : ''}`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-3 flex flex-wrap items-center gap-3 animate-slide-down">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-charcoal-400" />
                    <select
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      className="input-field !w-auto !py-2"
                    >
                      <option value={0}>Any party size</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="input-field !w-auto !py-2"
                  >
                    <option value="">All cuisines</option>
                    {cuisines.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Top rated strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-brass-400" />
            <h2 className="text-lg font-semibold text-white">Top rated this week</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {topRated.map((r, idx) => {
              const resId = String(r._id || r.id || '');
              const resName = String(r.name || 'Restaurant');
              const resRating = String(r.rating || '4.5');
              const resCity = String(r.city || (r.address as Record<string, unknown>)?.city || 'Pakistan');
              const resCuisine = Array.isArray(r.cuisine) ? r.cuisine[0] : String(r.cuisine || 'Pakistani');
              const resImage = (r.imageUrl as string) ||
                (Array.isArray(r.images) && r.images.length > 0
                  ? typeof r.images[0] === 'string'
                    ? r.images[0]
                    : String((r.images[0] as Record<string, unknown>)?.url || '')
                  : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800');

              return (
                <button
                  key={resId || idx}
                  onClick={() => navigate(`/restaurants/${resId}`)}
                  className="group flex items-center gap-4 rounded-xl p-3 text-left transition-all hover:bg-charcoal-800"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                    <img src={resImage} alt={resName} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-brass-400 text-xs font-bold text-charcoal-950">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-brass-300 transition-colors">
                      {resName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-brass-400 text-brass-400" />
                      <span className="text-xs text-charcoal-300">{resRating}</span>
                      <span className="text-xs text-charcoal-500">• {resCuisine}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-charcoal-500">
                      <MapPin className="h-3 w-3" /> {resCity}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Restaurant grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-white">
              {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''}
            </h2>
            <p className="text-sm text-charcoal-400 mt-1">
              {cuisine || city || search ? 'Filtered results' : 'All available restaurants'}
            </p>
          </div>
          {(cuisine || city || search) && (
            <button
              onClick={() => { setSearch(''); setCuisine(''); setCity(''); setPartySize(0); }}
              className="btn-ghost"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-charcoal-400">No restaurants match your filters. Try clearing them.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r, idx) => {
              const resId = String(r._id || r.id || idx);
              return <RestaurantCard key={resId} restaurant={r} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
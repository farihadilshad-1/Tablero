import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';

interface Props {
  restaurant: Record<string, unknown>;
}

export default function RestaurantCard({ restaurant }: Props) {
  // Cast internally for runtime safety
const r = restaurant as Record<string, unknown>;
  // Safe ID resolution
  const restaurantId = (r._id || r.id) as string;

  // Safe Image URL
  const imageUrl =
    (r.imageUrl as string) ||
    (Array.isArray(r.images) && r.images.length > 0
      ? typeof r.images[0] === 'string'
        ? r.images[0]
        : r.images[0]?.url
      : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800');

  // Safe City
  const cityName = (r.city || (r.address as Record<string, string>)?.city || 'Pakistan') as string;

  // Safe Cuisine
  const cuisineText = Array.isArray(r.cuisine)
    ? r.cuisine.join(', ')
    : (r.cuisine as string) || 'Pakistani';

  // Safe IsOpen state
  const isOpen = (() => {
    if (!r.hours || !Array.isArray(r.hours)) return true;
    const now = new Date();
    const dayIdx = (now.getDay() + 6) % 7;
    const todayHours = r.hours[dayIdx];
    if (!todayHours || !todayHours.open || !todayHours.close) return true;

    const current = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = todayHours.open.split(':').map(Number);
    const [ch, cm] = todayHours.close.split(':').map(Number);
    return current >= oh * 60 + om && current < ch * 60 + cm;
  })();

  const openTime = (r.hours as Array<{ open: string }>)?.[0]?.open || '12:00';
  const closeTime = (r.hours as Array<{ close: string }>)?.[0]?.close || '23:00';

  return (
    <Link
      to={`/restaurants/${restaurantId}`}
      className="card group overflow-hidden hover:shadow-card-hover hover:border-charcoal-600 hover:-translate-y-1 block bg-neutral-900 rounded-xl border border-neutral-800"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageUrl}
          alt={(r.name as string) || 'Restaurant'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="chip bg-charcoal-950/80 text-brass-300 backdrop-blur-sm border border-brass-500/20 px-2 py-1 text-xs rounded">
            {cuisineText}
          </span>
         {Boolean(r.priceRange) && (
  <span className="chip bg-charcoal-950/80 text-charcoal-200 backdrop-blur-sm border border-charcoal-600/40 px-2 py-1 text-xs rounded">
    {String(r.priceRange)}
  </span>
)}
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`chip backdrop-blur-sm border px-2 py-1 text-xs rounded flex items-center gap-1 ${
              isOpen
                ? 'bg-success-500/20 text-success-300 border-success-500/30'
                : 'bg-error-500/20 text-error-300 border-error-500/30'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-serif text-lg font-semibold text-white leading-tight">
            {r.name as string}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-charcoal-300">
            <MapPin className="h-3 w-3" />
            {cityName}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-brass-400 text-yellow-500" />
            <span className="text-sm font-semibold text-white">{(r.rating as string) || '4.5'}</span>
            <span className="text-xs text-charcoal-400">({(r.reviewCount as number) || 12} reviews)</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-charcoal-400">
            <Clock className="h-3.5 w-3.5" />
            {openTime}–{closeTime}
          </div>
        </div>
        <p className="text-sm text-charcoal-400 line-clamp-2 leading-relaxed">
          {r.description as string}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.isArray(r.tags) &&
            r.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="chip bg-charcoal-800 text-charcoal-300 px-2 py-0.5 text-xs rounded"
              >
                {tag}
              </span>
            ))}
        </div>
      </div>
    </Link>
  );
}
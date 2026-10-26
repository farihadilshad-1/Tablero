import { UtensilsCrossed, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-charcoal-800 bg-charcoal-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brass-400 text-charcoal-950">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <span className="font-serif text-xl font-semibold text-white">Tablewise</span>
            </div>
            <p className="text-sm text-charcoal-400 max-w-sm leading-relaxed">
              The AI-powered way to find and book the perfect table. Browse curated
              restaurants, get personalized recommendations, and reserve in seconds.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-charcoal-400">
              <li><a href="/" className="hover:text-brass-300 transition-colors">Browse Restaurants</a></li>
              <li><a href="/assistant" className="hover:text-brass-300 transition-colors">AI Assistant</a></li>
              <li><a href="/owner" className="hover:text-brass-300 transition-colors">For Owners</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-charcoal-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brass-400" /> 1 Table Lane, Food District
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brass-400" /> hello@tablewise.app
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-charcoal-800 pt-6 text-center text-xs text-charcoal-500">
          © 2026 Tablewise. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

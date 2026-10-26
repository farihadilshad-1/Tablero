import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, UtensilsCrossed, MapPin, Users, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ChatMessage } from '@/types';

let msgIdCounter = 0;
const nextMsgId = () => `msg${++msgIdCounter}`;

export default function AssistantPage() {
  const { restaurants } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextMsgId(),
      role: 'assistant',
      content: "Hi! I'm your AI dining assistant. Tell me what you're in the mood for — a cuisine, city, or party size — and I'll recommend the perfect spot.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const getRecommendations = (query: string): { content: string; recs: string[] } => {
    const lower = query.toLowerCase();
    const matched: typeof restaurants = [];

    // Safe helper function to check cuisine (handles both strings and arrays)
    const matchesCuisine = (cuisine: unknown, searchLower: string) => {
      if (typeof cuisine === 'string') {
        return cuisine.toLowerCase().includes(searchLower) || searchLower.includes(cuisine.toLowerCase());
      }
      if (Array.isArray(cuisine)) {
        return cuisine.some((c) => typeof c === 'string' && (c.toLowerCase().includes(searchLower) || searchLower.includes(c.toLowerCase())));
      }
      return false;
    };

    const cuisineMatch = restaurants.find((r) => matchesCuisine(r.cuisine, lower));
    if (cuisineMatch) {
      matched.push(...restaurants.filter((r) => r.cuisine === cuisineMatch.cuisine));
    }

    const cityMatch = restaurants.find((r) => {
      const city = r.city || '';
      return city.toLowerCase().includes(lower) || lower.includes(city.toLowerCase());
    });
    if (cityMatch) {
      const cityRestaurants = restaurants.filter((r) => r.city === cityMatch.city);
      matched.push(...cityRestaurants.filter((r) => !matched.includes(r)));
    }

    const partyMatch = lower.match(/(\d+)\s*(people|guests?|persons?|pax)/);
    if (partyMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const suitable = restaurants.filter((_r) => {
        return true;
      });
      void suitable;
    }

    const keywordMatch = restaurants.filter((r) =>
      (r.tags && r.tags.some((t) => lower.includes(t.toLowerCase()))) ||
      r.description.toLowerCase().includes(lower),
    );
    matched.push(...keywordMatch.filter((r) => !matched.includes(r)));

    if (matched.length === 0) {
      const top = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 3);
      return {
        content: `I couldn't find an exact match for "${query}", but here are some of our top-rated restaurants that might interest you:`,
        recs: top.map((r) => r.id || r._id),
      };
    }

    const sorted = matched.sort((a, b) => b.rating - a.rating).slice(0, 4);
    
    // Format cuisines safely for output message
    const getCuisineString = (c: unknown): string => {
      if (typeof c === 'string') return c;
      if (Array.isArray(c)) return c.join(', ');
      return '';
    };

    const cuisineList = [...new Set(sorted.map((r) => getCuisineString(r.cuisine)))];
    const cityList = [...new Set(sorted.map((r) => r.city))];

    let content = `Based on what you're looking for, I found ${sorted.length} great ${cuisineList.length > 1 ? '' : cuisineList[0] + ' '}restaurant${sorted.length !== 1 ? 's' : ''}`;
    if (cityList.length === 1) content += ` in ${cityList[0]}`;
    content += `. Here are my top picks:`;

    return { content, recs: sorted.map((r) => r.id || r._id) };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: nextMsgId(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { content, recs } = getRecommendations(input);
      const assistantMsg: ChatMessage = {
        id: nextMsgId(),
        role: 'assistant',
        content,
        timestamp: Date.now(),
        recommendations: recs,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'Italian in Milan',
    'Seafood with a view',
    'Romantic dinner for 2',
    'Best sushi in Tokyo',
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-400/15 border border-brass-500/20">
              <Sparkles className="h-5 w-5 text-brass-400" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-white">AI Assistant</h1>
              <p className="text-xs text-charcoal-400">Get personalized restaurant recommendations</p>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end animate-slide-up">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brass-400 px-4 py-3 text-sm text-charcoal-950">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 animate-slide-up">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brass-400/15 border border-brass-500/20">
                      <Sparkles className="h-4 w-4 text-brass-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-charcoal-100 leading-relaxed">{msg.content}</p>
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.recommendations.map((rid) => {
                            const r = restaurants.find((rr) => (rr.id || rr._id) === rid);
                            if (!r) return null;
                            const displayCuisine = Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine;
                            const displayImage = r.imageUrl || (Array.isArray(r.images) && r.images[0]?.url) || 'https://images.pexels.com/photos/10135116/pexels-photo-10135116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
                            
                            return (
                              <Link
                                key={rid}
                                to={`/restaurants/${r.id || r._id}`}
                                className="group flex items-center gap-3 rounded-xl border border-charcoal-700 bg-charcoal-800 p-3 transition-all hover:border-brass-400 hover:bg-charcoal-700"
                              >
                                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                                  <img src={displayImage} alt={r.name} className="h-full w-full object-cover" loading="lazy" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-white group-hover:text-brass-300 transition-colors">
                                    {r.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-charcoal-400">
                                    <span className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-brass-400 text-brass-400" />
                                      {r.rating}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <UtensilsCrossed className="h-3 w-3" /> {displayCuisine}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" /> {r.city}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" /> {r.priceRange}
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brass-400/15 border border-brass-500/20">
                  <Sparkles className="h-4 w-4 text-brass-400" />
                </div>
                <div className="flex items-center gap-1.5 py-3">
                  <span className="h-2 w-2 rounded-full bg-brass-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-brass-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-brass-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="chip bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 hover:text-brass-300 border border-charcoal-700 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-charcoal-800 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for a recommendation..."
                className="input-field flex-1"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="btn-primary !px-4"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
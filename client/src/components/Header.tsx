import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UtensilsCrossed, Menu, X, CalendarDays, Sparkles, Store, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const { role, user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const customerLinks = [
    { to: '/', label: 'Browse', icon: UtensilsCrossed },
    { to: '/bookings', label: 'My Bookings', icon: CalendarDays },
    { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
  ];

  const ownerLinks = [
    { to: '/owner', label: 'Dashboard', icon: Store },
    { to: '/', label: 'Browse', icon: UtensilsCrossed },
  ];

  // Role ab strictly authenticated user ke role par depend karega
  const currentRole = user?.role || role;
  const links = currentRole === 'owner' ? ownerLinks : customerLinks;

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-charcoal-950/95 backdrop-blur-md border-b border-charcoal-800 shadow-soft'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brass-400 text-charcoal-950 transition-transform group-hover:scale-105">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-semibold text-white tracking-tight">
              Tablewise
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-charcoal-800 text-brass-300'
                      : 'text-charcoal-200 hover:bg-charcoal-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-brass-300">
                  {user.name || user.email || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full bg-charcoal-800 hover:bg-charcoal-700 px-4 py-2 text-xs font-medium text-white transition-all border border-charcoal-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="btn-primary !py-2 !px-5"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center rounded-lg p-2 text-charcoal-200 hover:bg-charcoal-800"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-charcoal-800 py-4 animate-slide-down">
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? 'bg-charcoal-800 text-brass-300'
                        : 'text-charcoal-200 hover:bg-charcoal-800/60'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}

              {user ? (
                <div className="mt-2 px-4 flex flex-col gap-2">
                  <div className="text-xs text-brass-300 font-medium px-1">
                    Logged in as: {user.name || user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-xl bg-charcoal-800 py-2.5 text-sm font-medium text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="btn-primary mt-2 w-full"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
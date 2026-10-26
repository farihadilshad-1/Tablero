import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Store, Mail, Lock, ArrowRight, UtensilsCrossed, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AuthPage() {
  const { login, register, setRole } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'owner'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let success = false;

    if (mode === 'signin') {
      success = await login(email, password);
    } else {
      success = await register(name, email, password, selectedRole);
    }

    setSubmitting(false);

    if (success) {
      // Yahan hardcoded 'customer' ki jagah selectedRole use kiya hai
      const targetRole = selectedRole;
      
      setRole(targetRole);
      navigate(targetRole === 'owner' ? '/owner' : '/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/24433378/pexels-photo-24433378.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt=""
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-charcoal-950/80" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brass-400 text-charcoal-950 mb-4">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-white">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-charcoal-400 mt-1">
              {mode === 'signin' ? 'Sign in to manage your bookings' : 'Join Tablewise to start booking tables'}
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-charcoal-300 mb-2 block">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  selectedRole === 'customer'
                    ? 'border-brass-400 bg-brass-400/10 shadow-warm'
                    : 'border-charcoal-700 bg-charcoal-800 hover:border-charcoal-500'
                }`}
              >
                <User className={`h-6 w-6 ${selectedRole === 'customer' ? 'text-brass-400' : 'text-charcoal-400'}`} />
                <span className={`text-sm font-medium ${selectedRole === 'customer' ? 'text-brass-300' : 'text-charcoal-300'}`}>
                  Customer
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('owner')}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  selectedRole === 'owner'
                    ? 'border-brass-400 bg-brass-400/10 shadow-warm'
                    : 'border-charcoal-700 bg-charcoal-800 hover:border-charcoal-500'
                }`}
              >
                <Store className={`h-6 w-6 ${selectedRole === 'owner' ? 'text-brass-400' : 'text-charcoal-400'}`} />
                <span className={`text-sm font-medium ${selectedRole === 'owner' ? 'text-brass-300' : 'text-charcoal-300'}`}>
                  Restaurant Owner
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                  className="input-field"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field !pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-field !pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal-400">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}
              className="text-brass-300 font-medium hover:text-brass-200 transition-colors"
            >
              {mode === 'signin' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import FloatingDecorations from '@/components/FloatingDecorations';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { isAuthenticated, isOnboarded, login, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [isAuthenticated, isOnboarded, navigate]);

  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
    return undefined;
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({ email: emailErr, password: passErr });
    setTouched({ email: true, password: true });
    if (emailErr || passErr) return;

    if (mode === 'login') {
      login(email);
      navigate('/onboarding');
    } else {
      signup(email);
      navigate('/onboarding');
    }
  };

  const inputBase =
    'w-full rounded-xl border bg-cream-50 pl-11 pr-4 py-3 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-400';
  const inputState = (err, isTouched) => {
    if (err && isTouched) return 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100';
    if (!err && isTouched) return 'border-whatsapp-300 focus:border-whatsapp-500 focus:ring-2 focus:ring-whatsapp-100';
    return 'border-cream-300 focus:border-whatsapp-400 focus:ring-2 focus:ring-whatsapp-100';
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-50 px-5 py-12">
      <FloatingDecorations />

      {/* Back to home */}
      <Link to="/" className="absolute left-5 top-5 z-20 flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-whatsapp-600">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-cream-300/70 bg-cream-50 p-8 shadow-xl shadow-whatsapp-500/5">
          {/* Toggle */}
          <div className="mb-6 flex rounded-full bg-cream-200 p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition-all ${mode === 'login' ? 'bg-whatsapp-500 text-white shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition-all ${mode === 'signup' ? 'bg-whatsapp-500 text-white shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="font-serif text-2xl font-bold text-ink-900">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {mode === 'login' ? 'Log in to your WhatsApp Buddy dashboard.' : 'Start automating your WhatsApp in minutes.'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-600">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) setErrors({ ...errors, email: validateEmail(e.target.value) });
                  }}
                  onBlur={() => {
                    setTouched({ ...touched, email: true });
                    setErrors({ ...errors, email: validateEmail(email) });
                  }}
                  placeholder="you@business.com"
                  className={`${inputBase} ${inputState(errors.email, touched.email)}`}
                />
              </div>
              <AnimatePresence>
                {errors.email && touched.email && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) setErrors({ ...errors, password: validatePassword(e.target.value) });
                  }}
                  onBlur={() => {
                    setTouched({ ...touched, password: true });
                    setErrors({ ...errors, password: validatePassword(password) });
                  }}
                  placeholder="••••••••"
                  className={`${inputBase} pr-11 ${inputState(errors.password, touched.password)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && touched.password && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
              {mode === 'login' && (
                <div className="mt-2 text-right">
                  <button type="button" className="text-xs font-medium text-whatsapp-600 hover:text-whatsapp-700">
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <Button type="submit" fullWidth size="lg" className="mt-2">
              Continue
            </Button>
          </form>
        </div>

        {/* Toggle link */}
        <p className="mt-6 text-center text-sm text-ink-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setErrors({});
              setTouched({});
            }}
            className="font-bold text-whatsapp-600 hover:text-whatsapp-700"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

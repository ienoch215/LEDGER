import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const successMessage = (location.state as { message?: string })?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase is not configured yet. Please add your credentials in the .env file.');
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch {
      setErrorMsg('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto w-full">
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
          Sign in to your ledger
        </h2>
        <p className="text-sm text-[#667085] dark:text-[#8c92a0] mb-8">
          Enter your email and password to access your monthly records.
        </p>

        {successMessage && (
          <div className="mb-6 p-3.5 bg-[#edf7ed] dark:bg-[#14231b] border border-[#c8e6c9] dark:border-[#23452f] rounded-lg text-sm text-[#2e7d32] dark:text-[#70d497] flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] dark:bg-[#48bb78]"></span>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-[#fef2f2] dark:bg-[#251517] border border-[#fecaca] dark:border-[#482025] rounded-lg text-sm text-[#b91c1c] dark:text-[#f59e9e] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ef4444] dark:text-[#f87171]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-[#fefce8] dark:bg-[#1e1b12] border border-[#fef08a] dark:border-[#483d1c] rounded-lg text-xs text-[#854d0e] dark:text-[#e5c07b] space-y-2">
            <div className="font-semibold text-black dark:text-white">Setup Required: Supabase Keys</div>
            <p className="leading-relaxed">
              Open the <code className="bg-black/5 dark:bg-[#14161b] px-1.5 py-0.5 rounded text-black dark:text-white">.env</code> file in your project root and paste your <code className="text-black dark:text-white">VITE_SUPABASE_URL</code> and <code className="text-black dark:text-white">VITE_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] mb-2 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alok@domain.com"
              autoComplete="email"
              required
              className="w-full bg-[#f2f4f7] dark:bg-[#15171d] border border-[#e4e7ec] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-black dark:text-white placeholder-[#98a2b3] dark:placeholder-[#505664] font-mono transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] font-semibold">
                Password
              </label>
              <span className="text-[11px] font-mono text-[#667085] dark:text-[#5f6575]">
                Min 8 characters
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-[#f2f4f7] dark:bg-[#15171d] border border-[#e4e7ec] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-black dark:text-white placeholder-[#98a2b3] dark:placeholder-[#505664] font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] dark:text-[#737987] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-mono text-[#475467] dark:text-[#8c92a0] hover:text-black dark:hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-[#1a1d24] text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {loading ? (
              <span className="font-mono text-xs">Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <span className="font-mono">→</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#475467] dark:text-[#8c92a0]">
          New to Ledger?{' '}
          <Link
            to="/signup"
            className="text-black dark:text-white hover:underline underline-offset-4 font-semibold"
          >
            Create an account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

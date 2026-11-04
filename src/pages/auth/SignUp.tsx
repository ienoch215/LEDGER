import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, MailCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase is not configured yet. Please add your credentials in the .env file.');
      return;
    }

    if (!email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.user && !data.session) {
        setEmailVerificationNeeded(true);
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setErrorMsg('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailVerificationNeeded) {
    return (
      <AuthLayout>
        <div className="max-w-md mx-auto w-full text-center py-4">
          <div className="w-12 h-12 rounded-full bg-[#17202b] border border-[#233549] text-white flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
            Check your email
          </h2>
          <p className="text-sm text-[#525866] dark:text-[#8c92a0] mb-6 leading-relaxed">
            We sent a verification link to <span className="text-black dark:text-white font-mono font-semibold">{email}</span>. Click the link in that email to confirm your account and sign in.
          </p>
          <div className="p-3 bg-[#f2f4f7] dark:bg-[#161820] border border-[#e4e7ec] dark:border-[#272b36] rounded-lg text-xs text-[#525866] dark:text-[#8c92a0] mb-8 text-left font-mono">
            Tip: To skip email verification during local development, disable "Confirm email" in Supabase Dashboard → Authentication → Providers → Email.
          </div>
          <Link
            to="/signin"
            className="inline-flex items-center justify-center w-full bg-black hover:bg-[#1a1d24] text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto w-full">
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
          Create your ledger account
        </h2>
        <p className="text-sm text-[#525866] dark:text-[#8c92a0] mb-8">
          Start recording with exact manual discipline and live spendable tracking.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-[#fef2f2] dark:bg-[#251517] border border-[#fecaca] dark:border-[#482025] rounded-lg text-sm text-[#b91c1c] dark:text-[#f59e9e] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ef4444] dark:text-[#f87171]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#475467] dark:text-[#8c92a0] mb-2 font-semibold">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                required
                className="w-full bg-[#f2f4f7] dark:bg-[#15171d] border border-[#e4e7ec] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-black dark:text-white placeholder-[#98a2b3] dark:placeholder-[#505664] font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] dark:text-[#737987] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-[#1a1d24] text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {loading ? (
                <span className="font-mono text-xs">Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="font-mono">→</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-[#525866] dark:text-[#8c92a0]">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="text-black dark:text-white hover:underline underline-offset-4 font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

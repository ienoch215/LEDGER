import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
      // Update password
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Requirement: "After a reset, sign out all sessions and return to sign-in."
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {
        // Fallback to local signout if global scope fails
        return supabase.auth.signOut();
      });

      navigate('/signin', {
        replace: true,
        state: { message: 'Password reset successful. Please sign in with your new password.' },
      });
    } catch {
      setErrorMsg('Failed to update password. Your reset link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto w-full">
        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
          Set new password
        </h2>
        <p className="text-sm text-[#667085] dark:text-[#8c92a0] mb-8 leading-relaxed">
          Create a strong password (at least 8 characters) to secure your account.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-[#fde8e8] dark:bg-[#251517] border border-[#f8b4b4] dark:border-[#482025] rounded-lg text-sm text-[#9b1c1c] dark:text-[#f59e9e] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#e02424] dark:text-[#f87171]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#525866] dark:text-[#8c92a0] font-semibold">
                New Password
              </label>
              <span className="text-[11px] font-mono text-[#717784] dark:text-[#5f6575]">
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
                className="w-full bg-[#f0f2f5] dark:bg-[#15171d] border border-[#e2e4e8] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-black dark:text-white placeholder-[#8c92a0] dark:placeholder-[#505664] font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717784] dark:text-[#737987] hover:text-black dark:hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#525866] dark:text-[#8c92a0] mb-2 font-semibold">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                required
                className="w-full bg-[#f0f2f5] dark:bg-[#15171d] border border-[#e2e4e8] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-black dark:text-white placeholder-[#8c92a0] dark:placeholder-[#505664] font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717784] dark:text-[#737987] hover:text-black dark:hover:text-white transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-[#1a1d24] text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {loading ? (
                <span className="font-mono text-xs">Updating password...</span>
              ) : (
                <>
                  <span>Update Password</span>
                  <span className="font-mono">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

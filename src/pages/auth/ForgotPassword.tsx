import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase is not configured yet. Please add your credentials in the .env file.');
      return;
    }

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      // Send password reset request
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      // Requirement: "identical confirmation whether or not the account exists."
      setSubmitted(true);
    } catch {
      // Even on error, maintain privacy with generic confirmation unless technical configuration fails
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto w-full">
        <Link
          to="/signin"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#667085] hover:text-black dark:text-[#8c92a0] dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
          Reset password
        </h2>
        <p className="text-sm text-[#667085] dark:text-[#8c92a0] mb-8 leading-relaxed">
          Enter your registered email address. We'll send you a secure link to reset your password.
        </p>

        {submitted ? (
          <div className="space-y-6">
            <div className="p-4 bg-[#14231b] border border-[#23452f] rounded-lg text-sm text-[#a8e8c1] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#48bb78] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-white">Reset instructions sent</div>
                <div className="text-xs leading-relaxed text-[#a8e8c1]">
                  If an account exists for <span className="text-white font-mono">{email}</span>, a password reset link has been dispatched to your inbox.
                </div>
              </div>
            </div>

            <p className="text-xs text-[#737987] leading-relaxed">
              Didn't receive an email? Check your spam folder or verify you entered the correct address.
            </p>

            <Link
              to="/signin"
              className="inline-flex items-center justify-center w-full bg-black hover:bg-[#1a1d24] text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 bg-[#fde8e8] dark:bg-[#251517] border border-[#f8b4b4] dark:border-[#482025] rounded-lg text-sm text-[#9b1c1c] dark:text-[#f59e9e] flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#e02424] dark:text-[#f87171]" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#525866] dark:text-[#8c92a0] mb-2 font-semibold">
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alok@domain.com"
                autoComplete="email"
                required
                className="w-full bg-[#f0f2f5] dark:bg-[#15171d] border border-[#e2e4e8] dark:border-[#272a33] focus:border-black dark:focus:border-white focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-black dark:text-white placeholder-[#8c92a0] dark:placeholder-[#505664] font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-[#1a1d24] text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {loading ? (
                <span className="font-mono text-xs">Sending reset link...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <span className="font-mono">→</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

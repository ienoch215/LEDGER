import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] dark:bg-[#090a0c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-black/20 border-t-black dark:border-white/20 dark:border-t-white rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-[#525866] dark:text-[#8c92a0] tracking-wider uppercase font-semibold">Loading Ledger...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ children, requireAdmin = false }) => {
  const { user, token, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();

  // Instant fallback check against localStorage to avoid React state batching race conditions
  let localUser = user;
  let localToken = token;
  if (!localUser || !localToken) {
    try {
      const savedUser = localStorage.getItem('beta_user');
      const savedToken = localStorage.getItem('beta_token');
      if (savedUser && savedToken) {
        localUser = JSON.parse(savedUser);
        localToken = savedToken;
      }
    } catch {
      // Ignore parse errors
    }
  }

  const effectiveIsAuthenticated = Boolean(localUser && localToken);
  const effectiveIsAdmin = Boolean(
    localUser?.roles?.some((r: string) => ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF'].includes(r))
  );

  if (isLoading && !effectiveIsAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-950"></div>
      </div>
    );
  }

  if (!effectiveIsAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireAdmin && !effectiveIsAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-navy-950">Admin Privileges Required</h1>
            <p className="text-xs text-slate-500 mt-1">
              You are currently signed in as <span className="font-semibold text-slate-800">{localUser?.email}</span> which does not have partner administrative rights.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                logout();
                window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
              }}
              className="w-full py-2.5 rounded-lg bg-navy-950 hover:bg-navy-850 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign In with Admin Account</span>
            </button>

            <Link
              to="/"
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

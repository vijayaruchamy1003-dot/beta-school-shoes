import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const doLogin = async (loginEmail: string, loginPass: string) => {
    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await authApi.login({ email: loginEmail.trim(), password: loginPass.trim() });
      login(res.data.token, {
        id: res.data.userId,
        email: res.data.email,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        roles: res.data.roles
      });

      const hasAdminAccess = res.data.roles?.some((r: string) =>
        ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF'].includes(r)
      );
      const targetUrl = hasAdminAccess && (redirect === '/' || redirect.startsWith('/admin'))
        ? '/admin'
        : redirect;
      window.location.href = targetUrl;
    } catch (err: any) {
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else if (err.response?.status === 401 || err.response?.status === 400) {
        setErrorMsg('Invalid email or password');
      } else if (!err.response) {
        setErrorMsg(`Network error (${err.message || 'connection failed'}). Please check your connection or refresh the page.`);
      } else {
        setErrorMsg(`Server error (${err.response.status}): ${err.message || 'Please try again'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doLogin(email, password);
  };

  return (
    <main className="flex-1 bg-background text-foreground py-16 px-6 flex items-center justify-center">
      <div className="w-full max-w-md paper-shadow border border-foreground/15 bg-card p-8 md:p-10 space-y-6">
        
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {redirect.includes('/admin') ? 'Staff Access' : 'Account Access'}
          </p>
          <h1 className="font-display text-3xl font-black uppercase leading-none tracking-tight">
            {redirect.includes('/admin') ? 'Admin Login' : 'Sign In'}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {redirect.includes('/admin')
              ? 'Authorized institutional administrator authentication portal.'
              : 'Sign in to access saved shoe sizes, past purchases, and track school orders.'}
          </p>
        </div>

        {/* Quick Credentials Helper */}
        <div className="border border-blue-200 bg-blue-50/70 p-4 rounded-lg text-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold uppercase tracking-wider text-primary">Institutional Admin:</span>
            <button
              type="button"
              disabled={submitting}
              onClick={() => doLogin('admin@betashoes.example.com', 'Admin@Beta2026')}
              className="text-[11px] font-bold uppercase tracking-wider text-white bg-primary px-3 py-1.5 rounded hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Signing In...' : '⚡ 1-Click Admin Sign-In'}
            </button>
          </div>
          <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px] pt-1 border-t border-blue-200/60">
            <span>admin@betashoes.example.com / Admin@Beta2026</span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@betashoes.example.com');
                setPassword('Admin@Beta2026');
              }}
              className="text-primary hover:underline font-sans font-semibold"
            >
              Fill Inputs
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="border border-destructive/40 bg-destructive/10 p-4 text-xs font-bold text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-[0.18em]">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 bg-primary py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:paper-shadow-sm active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-foreground/15 pt-5 text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-bold text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Create Customer Account
          </Link>
        </div>

      </div>
    </main>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      login(res.data.token, {
        id: res.data.userId,
        email: res.data.email,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        roles: res.data.roles
      });

      navigate(redirect);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-background text-foreground py-16 px-6 flex items-center justify-center">
      <div className="w-full max-w-md paper-shadow border border-foreground/15 bg-card p-8 md:p-10 space-y-6">
        
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Customer Registration
          </p>
          <h1 className="font-display text-3xl font-black uppercase leading-none tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Register to save your student footwear sizes, view order history, and track doorstep deliveries.
          </p>
        </div>

        {errorMsg && (
          <div className="border border-destructive/40 bg-destructive/10 p-4 text-xs font-bold text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                First Name *
              </label>
              <input
                type="text"
                required
                placeholder="Ramesh"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                Last Name *
              </label>
              <input
                type="text"
                required
                placeholder="Kumar"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="ramesh@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
              Mobile Phone *
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98450 12345"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
              Password *
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 flex items-center justify-center gap-3 bg-primary py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:paper-shadow-sm active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? 'Registering Account...' : 'Create Account'}
          </button>
        </form>

        <div className="border-t border-foreground/15 pt-5 text-center text-xs text-muted-foreground">
          Already registered?{' '}
          <Link
            to={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-bold text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Sign In Here
          </Link>
        </div>

      </div>
    </main>
  );
};

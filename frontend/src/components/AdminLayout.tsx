import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  HelpCircle, 
  LogOut, 
  Store,
  ShieldCheck,
  Building2,
  ClipboardList,
  Users
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Schools', path: '/admin/schools', icon: Building2 },
    { label: 'School Visit Orders', path: '/admin/school-visit-orders', icon: ClipboardList },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Inventory & Stock', path: '/admin/inventory', icon: Layers },
    { label: 'Online Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Bulk Enquiries', path: '/admin/enquiries', icon: HelpCircle },
    { label: 'User Management', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-primary text-primary-foreground flex-shrink-0 flex flex-col justify-between border-r border-primary-foreground/15">
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-primary-foreground/15">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ED2C23] via-[#D91E18] to-[#991B1B] text-white shadow-sm">
                <svg viewBox="0 0 32 32" className="w-6 h-6 fill-current" aria-hidden="true">
                  <path d="M4 21.5c0-1.4 1.1-2.5 2.5-2.5h2.2c1.8 0 3.5-.8 4.6-2.2l2.9-3.6c.6-.7 1.6-.9 2.4-.5l1.9 1c1.2.6 2.5 1 3.8 1.2l2.3.3c1.9.3 3.4 1.9 3.4 3.8v2.5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2zm2.5 3.5h21c.8 0 1.5.7 1.5 1.5S28.3 28 27.5 28h-21C5.7 28 5 27.3 5 26.5S5.7 25 6.5 25z" />
                </svg>
              </div>
              <div className="whitespace-nowrap">
                <h2 className="font-display font-black text-lg uppercase tracking-tight text-primary-foreground leading-none">
                  SHOES<span className="text-amber-400">.NET</span>
                </h2>
                <span className="text-[10px] text-amber-300 flex items-center gap-1 font-bold uppercase tracking-wider mt-1">
                  <ShieldCheck className="w-3 h-3 shrink-0" /> Management Portal
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                    isActive
                      ? 'bg-primary-foreground text-primary'
                      : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-primary-foreground/15 space-y-3">
          <div className="text-xs text-primary-foreground/70 truncate">
            <span className="block font-bold uppercase text-primary-foreground">{user?.firstName} {user?.lastName}</span>
            <span className="text-[11px] font-mono text-primary-foreground/50">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-primary-foreground/10 text-xs">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground uppercase tracking-wider font-semibold"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1 text-destructive-foreground hover:opacity-80 uppercase tracking-wider font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-6 md:p-10 overflow-x-auto">
        {children}
      </main>
    </div>
  );
};

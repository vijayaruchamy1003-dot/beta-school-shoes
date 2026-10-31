import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Package, 
  LayoutDashboard,
  Search
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) => `text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-primary ${
    isActive(path) 
      ? 'text-primary underline decoration-2 underline-offset-8' 
      : 'text-muted-foreground'
  }`;

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-background/95 backdrop-blur-sm">
      {/* Top Banner Notice */}
      <div className="bg-primary text-primary-foreground py-1.5 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] flex justify-between items-center">
        <span className="hidden sm:inline">Official Partner · Apex Footwear · Genuine BETA School Shoes</span>
        <span className="sm:hidden">Official BETA Footwear Partner</span>
        <div className="flex items-center gap-4 text-primary-foreground/80">
          <Link to="/track" className="hover:text-primary-foreground transition-colors">Track Order</Link>
          <span className="opacity-40">|</span>
          <Link to="/bulk-enquiry" className="hover:text-primary-foreground transition-colors">Bulk School Orders</Link>
          {isAdmin && (
            <>
              <span className="opacity-40">|</span>
              <Link to="/admin" className="text-primary-foreground underline underline-offset-2 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 md:h-20">
        
        {/* Logo / Brand Mark */}
        <Link to="/" className="flex items-center gap-2.5" aria-label="BETA home">
          {/* Octagon Geometric Mark */}
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-foreground shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M8.7 1.5h6.6l7.2 7.2v6.6l-7.2 7.2H8.7l-7.2-7.2V8.7l7.2-7.2z"></path>
          </svg>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-black uppercase leading-none tracking-tight text-foreground">
              BETA
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
              Partner
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/catalogue" className={navLinkClass('/catalogue')}>
            Shop All
          </Link>
          <Link to="/catalogue?category=BOYS_FORMAL" className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground">
            Boys Formal
          </Link>
          <Link to="/catalogue?category=GIRLS_FORMAL" className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground">
            Girls Formal
          </Link>
          <Link to="/bulk-enquiry" className={navLinkClass('/bulk-enquiry')}>
            Bulk Enquiries
          </Link>
          <Link to="/contact" className={navLinkClass('/contact')}>
            Contact Us
          </Link>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-4">
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden items-center gap-2 md:flex" role="search">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <label htmlFor="header-search" className="sr-only">Search shoes</label>
            <input
              id="header-search"
              type="search"
              placeholder="Search shoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 border-b border-transparent bg-transparent py-1 text-xs outline-none transition-all placeholder:text-muted-foreground focus:w-44 focus:border-foreground/40 font-sans"
            />
          </form>

          {/* Cart Bag Icon with Counter */}
          <Link
            to="/cart"
            className="relative flex h-11 w-11 items-center justify-center transition-transform active:scale-95 text-foreground hover:opacity-80"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-primary text-[10px] font-black text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account Button & Dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 border border-foreground/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{user?.firstName}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 border border-foreground/20 bg-card py-2 text-xs shadow-lg z-50">
                  <div className="px-4 py-2 border-b border-foreground/15">
                    <p className="font-bold uppercase tracking-wider text-foreground">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-secondary font-bold uppercase tracking-wider transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Admin Portal</span>
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-secondary font-medium uppercase tracking-wider transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>My Orders</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-destructive hover:bg-secondary font-medium uppercase tracking-wider transition-colors border-t border-foreground/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="border border-foreground/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-foreground hover:bg-secondary/40"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center lg:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-foreground/15 bg-background px-6 py-6 lg:hidden space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 border-b border-foreground/25 pb-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search school shoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>

          <nav className="flex flex-col space-y-3 pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-[0.16em] text-foreground"
            >
              Home
            </Link>
            <Link
              to="/catalogue"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-[0.16em] text-foreground"
            >
              Shop All Shoes
            </Link>
            <Link
              to="/catalogue?category=BOYS_FORMAL"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Boys Formal
            </Link>
            <Link
              to="/catalogue?category=GIRLS_FORMAL"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Girls Formal
            </Link>
            <Link
              to="/catalogue?category=SPORTS_PT"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Sports & PT Canvas
            </Link>
            <Link
              to="/bulk-enquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-[0.16em] text-foreground"
            >
              Bulk Enquiries
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-[0.16em] text-foreground"
            >
              Contact Us
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Track Order
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold uppercase tracking-[0.16em] text-foreground underline"
              >
                Admin Portal
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

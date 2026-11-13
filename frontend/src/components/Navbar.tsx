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
  Search,
  Truck,
  RotateCcw,
  Sparkles
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

  const navLinkClass = (path: string) => `text-xs md:text-[13px] font-bold uppercase tracking-wider transition-colors hover:text-blue-700 ${
    isActive(path) 
      ? 'text-blue-700 border-b-2 border-blue-700 pb-1' 
      : 'text-slate-600'
  }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      
      {/* Walkaroo Signature Energetic Bright Red Announcement Ticker */}
      <div className="bg-gradient-to-r from-[#ED2C23] via-[#E52D27] to-[#C91A12] text-white py-2 px-4 sm:px-6 text-[11px] font-medium flex flex-wrap justify-between items-center gap-2 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-white font-black tracking-wider text-[10px]">
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>SHOES NET</span>
          </span>
          <span className="hidden sm:inline text-white/60">•</span>
          <span className="hidden sm:inline text-white font-semibold">Official Partner of <strong>Walkaroo</strong> Company</span>
          <span className="hidden md:inline text-white/60">•</span>
          <span className="hidden md:inline text-amber-200 font-bold">🚚 Free Express Delivery & COD across India</span>
        </div>

        <div className="flex items-center gap-4 text-white/90 text-[11px] font-semibold">
          <Link to="/track" className="hover:text-white transition-colors underline-offset-2 hover:underline">Track Order</Link>
          <span className="text-white/40">|</span>
          <Link to="/bulk-enquiry" className="hover:text-white transition-colors underline-offset-2 hover:underline">Bulk School Orders</Link>
          {isAdmin && (
            <>
              <span className="text-white/40">|</span>
              <Link to="/admin" className="text-amber-300 hover:text-white flex items-center gap-1 font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Navbar Header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20 bg-white">
        
        {/* Brand Logo: Shoes Net + Walkaroo Partner */}
        <Link to="/" className="flex items-center gap-3" aria-label="Shoes Net Home">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#ED2C23] via-rose-600 to-amber-500 text-white font-black text-lg shadow-md">
            SN
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-900 leading-none">
              Shoes Net
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#ED2C23] flex items-center gap-1 mt-0.5">
              <span>Official</span>
              <span className="rounded bg-red-100 border border-red-200 px-1 py-0.2 text-[9px] font-black text-[#ED2C23]">
                WALKAROO
              </span>
              <span>Partner</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex" aria-label="Main navigation">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/catalogue" className={navLinkClass('/catalogue')}>
            All Products
          </Link>
          <Link to="/catalogue?category=BOYS" className="text-xs md:text-[13px] font-semibold uppercase tracking-wider text-slate-600 hover:text-blue-700 transition-colors">
            Boys
          </Link>
          <Link to="/catalogue?category=GIRLS" className="text-xs md:text-[13px] font-semibold uppercase tracking-wider text-slate-600 hover:text-blue-700 transition-colors">
            Girls
          </Link>
          <Link to="/catalogue?category=MEN" className="text-xs md:text-[13px] font-semibold uppercase tracking-wider text-slate-600 hover:text-blue-700 transition-colors">
            Men
          </Link>
          <Link to="/catalogue?category=WOMEN" className="text-xs md:text-[13px] font-semibold uppercase tracking-wider text-slate-600 hover:text-blue-700 transition-colors">
            Women
          </Link>
          <Link to="/catalogue?category=SCHOOL_SHOES" className="relative text-xs md:text-[13px] font-semibold uppercase tracking-wider text-slate-600 hover:text-blue-700 transition-colors">
            <span>School Shoes</span>
            <span className="absolute -top-2.5 -right-3.5 rounded-full bg-rose-600 px-1.5 py-0.2 text-[8px] font-extrabold text-white">
              NEW
            </span>
          </Link>
          <Link to="/bulk-enquiry" className={navLinkClass('/bulk-enquiry')}>
            Bulk Enquiries
          </Link>
          <Link to="/contact" className={navLinkClass('/contact')}>
            Contact
          </Link>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Asian Footwears Style Pill Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center" role="search">
            <input
              id="header-search"
              type="search"
              placeholder="Search shoes, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 lg:w-56 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:w-64 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </form>

          {/* Cart Bag with Counter */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
            aria-label={`Open cart, ${itemCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-[10px] font-black text-white shadow-xs">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account / Sign In */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 transition-all hover:bg-slate-100"
              >
                <UserIcon className="h-3.5 w-3.5 text-blue-700" />
                <span className="hidden sm:inline">{user?.firstName}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-2 text-xs shadow-xl z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-blue-700" />
                      <span>Admin Portal</span>
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>My Orders</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
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
              className="rounded-xl bg-[#ED2C23] hover:bg-[#D41C14] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all active:scale-95"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden space-y-4 shadow-lg animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="search"
              placeholder="Search school shoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-600 focus:bg-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </form>

          <nav className="flex flex-col space-y-2 pt-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/catalogue"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50"
            >
              All Products
            </Link>
            <Link
              to="/catalogue?category=BOYS"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Boys
            </Link>
            <Link
              to="/catalogue?category=GIRLS"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Girls
            </Link>
            <Link
              to="/catalogue?category=MEN"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Men
            </Link>
            <Link
              to="/catalogue?category=WOMEN"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Women
            </Link>
            <Link
              to="/catalogue?category=SCHOOL_SHOES"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              School Shoes
            </Link>
            <Link
              to="/bulk-enquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Bulk School Enquiries
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      )}

    </header>
  );
};

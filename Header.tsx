import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, SlidersHorizontal, MapPin, LogIn, UserPlus, LogOut, User, PackageCheck, ShieldAlert, Store, Sparkles } from 'lucide-react';
import { UserAccount } from './AuthModal';
import { UserRole, ThemeConfig, Product } from '../types';
import brandLogo from '../assets/images/atidy_fashion_logo_1785823125232.jpg';

interface HeaderProps {
  currentUser: UserAccount | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenSellerAuth?: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  cartCount: number;
  onOpenCart: () => void;
  selectedDivision: string;
  selectedDistrict: string;
  selectedThana: string;
  onOpenLocationModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenOrderHistory: () => void;
  themeConfig?: ThemeConfig;
  allProducts?: Product[];
  onOpenProductDetail?: (p: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onOpenSellerAuth,
  onLogout,
  currentRole,
  onRoleChange,
  cartCount,
  onOpenCart,
  selectedDistrict,
  selectedThana,
  onOpenLocationModal,
  searchQuery,
  onSearchChange,
  onOpenOrderHistory,
  themeConfig,
  allProducts = [],
  onOpenProductDetail
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const showTopAnnouncement = themeConfig?.showTopAnnouncement !== false;
  const announcementText = themeConfig?.announcementText || localStorage.getItem('luxeshop_announcement') || '🚀 Direct Manufacturer Pricing | ৳60 Inside Dhaka • ৳120 Outside • ৳150 Thana';
  const announcementBgColor = themeConfig?.announcementBgColor || '#0f172a';
  const primaryColor = themeConfig?.primaryColor || '#f97316';
  const buttonRadius = themeConfig?.buttonRadius || '12px';
  const lightLogo = themeConfig?.lightLogoUrl || localStorage.getItem('luxeshop_site_logo') || brandLogo;
  const siteTitle = themeConfig?.siteTitle || localStorage.getItem('luxeshop_site_title') || 'LuxeShop';
  const siteTitleSuffix = themeConfig?.siteTitleSuffix || localStorage.getItem('luxeshop_site_suffix') || 'BD';
  const siteTagline = themeConfig?.siteTagline || localStorage.getItem('luxeshop_site_tagline') || 'Wholesale & Retail Market';
  const searchPlaceholder = themeConfig?.searchPlaceholder || 'Search gadgets, smartphones, wholesale...';

  const searchSuggestions = (themeConfig?.enableLiveSearchSuggestions !== false && searchQuery.trim().length > 0)
    ? allProducts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-colors">
      {/* Top Banner Announcement Bar */}
      {showTopAnnouncement && (
        <div
          style={{ backgroundColor: announcementBgColor }}
          className="text-slate-200 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium transition-all"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            {/* Announcement text */}
            <div className="flex items-center space-x-2 min-w-0 overflow-hidden">
              <span
                style={{ backgroundColor: primaryColor }}
                className="text-white text-[9px] sm:text-[10px] uppercase font-black px-2 py-0.5 rounded-full shrink-0 shadow-xs"
              >
                Wholesale BD
              </span>
              <span className="truncate text-[10px] sm:text-xs text-slate-200 font-bold">
                {announcementText}
              </span>
            </div>

            {/* Role Nav & Auth */}
            <div className="shrink-0 flex items-center space-x-2">
              {/* Admin or Vendor Panel switch button for logged in Admin/Vendor */}
              {(currentUser?.role === 'admin' || currentUser?.role === 'vendor' || currentRole === 'vendor') && (
                <div className="bg-slate-800/80 p-0.5 rounded-lg flex text-[10px] sm:text-[11px]">
                  <button
                    onClick={() => onRoleChange('customer')}
                    style={{
                      backgroundColor: currentRole === 'customer' ? primaryColor : 'transparent',
                      color: currentRole === 'customer' ? '#ffffff' : '#cbd5e1'
                    }}
                    className="px-2 py-0.5 rounded-md font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Store className="w-3 h-3" />
                    <span className="hidden xs:inline">Shop</span>
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => onRoleChange('admin')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                        currentRole === 'admin'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3 text-amber-300" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  {(currentUser?.role === 'vendor' || currentRole === 'vendor') && (
                    <button
                      onClick={() => onRoleChange('vendor')}
                      style={{
                        backgroundColor: currentRole === 'vendor' ? primaryColor : 'transparent',
                        color: currentRole === 'vendor' ? '#ffffff' : '#cbd5e1'
                      }}
                      className="px-2 py-0.5 rounded-md font-bold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Store className="w-3 h-3" />
                      <span>Seller Dashboard</span>
                    </button>
                  )}
                </div>
              )}

              {currentUser ? (
                <div className="flex items-center space-x-2 bg-slate-800/90 px-2.5 py-0.5 rounded-xl text-[11px]">
                  <div className="flex items-center space-x-1 text-amber-400 font-bold max-w-[100px] sm:max-w-[150px] truncate">
                    <User className="w-3 h-3 shrink-0" />
                    <span className="truncate">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="text-slate-300 hover:text-rose-400 font-bold text-[10px] sm:text-[11px] flex items-center space-x-1 transition-colors cursor-pointer border-l border-slate-700 pl-2 shrink-0"
                    title="Log Out"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg sm:rounded-xl transition-all flex items-center space-x-1 cursor-pointer border border-slate-700"
                  >
                    <LogIn className="w-3 h-3 text-amber-400" />
                    <span>Log In</span>
                  </button>
                  <button
                    onClick={() => onOpenAuth('register')}
                    style={{ backgroundColor: primaryColor, borderRadius: buttonRadius }}
                    className="text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 transition-all flex items-center space-x-1 cursor-pointer shadow-xs hover:brightness-110"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Registration</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2 sm:space-y-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div
            onClick={() => onRoleChange('customer')}
            className="flex items-center space-x-2 sm:space-x-3 shrink-0 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 flex items-center justify-center shadow-md shrink-0">
              <img
                src={lightLogo}
                alt="Brand Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 font-display flex items-center gap-1.5">
                {siteTitle} {siteTitleSuffix && <span style={{ color: primaryColor }} className="font-extrabold text-sm sm:text-base">{siteTitleSuffix}</span>}
              </span>
              {siteTagline && (
                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest hidden sm:block" style={{ color: primaryColor }}>
                  {siteTagline}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Delivery Location Selector */}
          <button
            onClick={onOpenLocationModal}
            className="hidden md:flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-2xl transition-all group text-left cursor-pointer shrink-0"
          >
            <div
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              className="w-7 h-7 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs">
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                Deliver to
              </p>
              <p className="font-bold text-slate-800 line-clamp-1 text-[11px]">
                {selectedThana ? `${selectedThana}, ${selectedDistrict}` : 'Select Location'}
              </p>
            </div>
          </button>

          {/* Desktop Search Bar with Live Suggestions */}
          <div className="hidden sm:block flex-1 max-w-md relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-medium"
                style={{ ['--tw-ring-color' as any]: primaryColor }}
              />
              <button className="absolute right-3 text-slate-400 hover:text-slate-600">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Live Search Suggestions Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Matching Product Suggestions</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {searchSuggestions.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        if (onOpenProductDetail) onOpenProductDetail(prod);
                      }}
                      className="p-2.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <img src={prod.images[0]} alt="" className="w-9 h-9 rounded-xl object-cover bg-slate-100" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{prod.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {prod.category} • <strong style={{ color: primaryColor }}>৳{prod.basePrice.toLocaleString()}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile Location Badge Trigger */}
            <button
              onClick={onOpenLocationModal}
              className="md:hidden p-2 rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center space-x-1 text-xs"
              title="Location"
            >
              <MapPin className="w-4 h-4 text-orange-600" />
            </button>

            {/* Track Orders */}
            <button
              onClick={onOpenOrderHistory}
              className="p-2 sm:p-2.5 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center space-x-1 text-xs font-bold cursor-pointer"
              title="My Orders"
            >
              <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              <span className="hidden lg:inline">Orders</span>
            </button>

            {/* Wishlist */}
            <button className="hidden sm:block p-2.5 rounded-2xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all">
              <Heart className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              style={{ backgroundColor: primaryColor, borderRadius: buttonRadius }}
              className="flex items-center space-x-1.5 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span
                    style={{ color: primaryColor }}
                    className="absolute -top-2 -right-2 bg-white font-black text-[9px] sm:text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="sm:hidden pt-1">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, smartphones, wholesale..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};



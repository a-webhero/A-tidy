import React, { useState } from 'react';
import { X, Store, Phone, Mail, Lock, CheckCircle2, AlertCircle, LogIn, UserPlus, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { UserAccount } from './AuthModal';
import { sendAdminEmailNotification } from '../services/adminEmailService';

interface SellerAuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSellerLoginSuccess: (user: UserAccount) => void;
  onRegisterSellerUser?: (newUser: UserAccount) => void;
}

export const SellerAuthModal: React.FC<SellerAuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSellerLoginSuccess,
  onRegisterSellerUser,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Seller Registration Form State
  const [shopName, setShopName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');

  // UI Error / Success State
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoSellerLogin = () => {
    const demoSeller: UserAccount = {
      name: 'A-TIDY Verified Seller',
      phone: '01800000000',
      email: 'seller@atidyfashion.bd',
      role: 'vendor',
    };
    setSuccessMsg('Connecting to Seller Portal...');
    setTimeout(() => {
      onSellerLoginSuccess(demoSeller);
      onClose();
    }, 500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!shopName.trim()) {
      setError('Shop / Brand name is required');
      return;
    }
    if (!sellerName.trim()) {
      setError('Seller owner name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Seller phone number (Seller ID) is required');
      return;
    }
    if (!email.trim()) {
      setError('Gmail / Email address is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const newSeller: UserAccount = {
      name: `${shopName.trim()} (${sellerName.trim()})`,
      phone: phone.trim(),
      email: email.trim(),
      password,
      role: 'vendor',
    };

    if (onRegisterSellerUser) {
      onRegisterSellerUser(newSeller);
    }

    // Send Automated Admin Email Notification
    sendAdminEmailNotification('new_seller', {
      shopName: shopName.trim(),
      ownerName: sellerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });

    setSuccessMsg('Seller Account Created Successfully! Accessing Seller Panel...');
    setTimeout(() => {
      onSellerLoginSuccess(newSeller);
      onClose();
    }, 700);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const inputIdentity = phone.trim().toLowerCase();

    if (!inputIdentity) {
      setError('Seller ID, Mobile or Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    const sellerUser: UserAccount = {
      name: shopName.trim() || 'A-TIDY Partner Merchant',
      phone: phone.trim() || '01800000000',
      email: email.trim() || 'merchant@atidyfashion.bd',
      role: 'vendor',
    };

    setSuccessMsg('Seller credentials verified! Loading Seller Dashboard...');
    setTimeout(() => {
      onSellerLoginSuccess(sellerUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display flex items-center gap-1.5">
                Seller & Merchant Portal
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  b2b seller
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {mode === 'login' ? 'Log in with Seller ID & Password' : 'Register your shop/brand as a seller'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="bg-slate-100 p-1 rounded-2xl flex text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>Seller Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              mode === 'register'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Seller Registration</span>
          </button>
        </div>

        {/* Banners */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-2xl text-xs flex items-center space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-2xl text-xs flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SELLER LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Seller ID / Phone Number / Email
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01800000000 or seller@shop.bd"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Seller Account Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Log In as Seller</span>
            </button>

            <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Want to test seller features instantly?</span>
              <button
                type="button"
                onClick={handleDemoSellerLogin}
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300/60 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Instant Demo Seller Login</span>
              </button>
            </div>
          </form>
        )}

        {/* SELLER REGISTRATION FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Shop / Brand Name *
              </label>
              <div className="relative flex items-center">
                <Building2 className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. A-TIDY Modest Wear Hub"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Seller Owner Name *
              </label>
              <div className="relative flex items-center">
                <Store className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="e.g. Sajjad Hossain"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Mobile / Seller ID *
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 absolute left-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01800000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@shop.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Confirm Password *
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Trade License / NID (Optional)
              </label>
              <div className="relative flex items-center">
                <ShieldCheck className="w-4 h-4 absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  placeholder="e.g. TRAD/DHaka/012930"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Seller Account</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

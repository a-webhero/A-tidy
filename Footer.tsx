import React from 'react';
import { ThemeConfig } from '../types';
import { Facebook, Instagram, Youtube, Phone, ShieldCheck, Truck, RotateCcw, HeadphoneOff, MessageSquare, Award, CreditCard, Store, PhoneCall, UserPlus, LogIn, MapPin } from 'lucide-react';

interface FooterProps {
  themeConfig?: ThemeConfig;
  onSelectCategory?: (cat: string) => void;
  onOpenOrderHistory?: () => void;
  onOpenSellerAuth?: (mode?: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({
  themeConfig,
  onSelectCategory,
  onOpenOrderHistory,
  onOpenSellerAuth
}) => {
  const primaryColor = themeConfig?.primaryColor || '#f97316';
  const secondaryColor = themeConfig?.secondaryColor || '#0f172a';
  const copyrightNotice = themeConfig?.copyrightNotice || localStorage.getItem('luxeshop_site_copyright') || '© 2026 LuxeShop BD. All rights reserved. Powered by Wholesale BD Engine.';
  const facebookUrl = themeConfig?.facebookUrl || localStorage.getItem('luxeshop_site_facebook') || 'https://facebook.com';
  const whatsappNumber = themeConfig?.whatsappNumber || localStorage.getItem('luxeshop_site_whatsapp') || '01711223344';
  const instagramUrl = themeConfig?.instagramUrl || localStorage.getItem('luxeshop_site_instagram') || 'https://instagram.com';
  const youtubeUrl = themeConfig?.youtubeUrl || localStorage.getItem('luxeshop_site_youtube') || 'https://youtube.com';
  const showPaymentGateways = themeConfig?.showPaymentGateways !== false;

  const aboutTitle = themeConfig?.footerAboutTitle || localStorage.getItem('luxeshop_site_name') || 'LuxeShop BD';
  const aboutText = themeConfig?.footerAboutText || "Bangladesh's leading multi-vendor wholesale & retail e-commerce portal. Discover genuine smartphones, gadgets, apparel, and lifestyle items at factory rates.";
  const fastShippingText = themeConfig?.footerFastShippingText || 'Dhaka ৳60 • Outside ৳120';
  const genuineWarrantyText = themeConfig?.footerGenuineWarrantyText || 'Official Brand Warranty';
  const wholesaleBadgeText = themeConfig?.footerWholesaleBadgeText || 'Direct Manufacturer Price';
  const returnPolicyText = themeConfig?.footerReturnPolicyText || 'Hassle-Free Replacement';
  const supportPhone = themeConfig?.supportPhone || localStorage.getItem('luxeshop_site_phone') || themeConfig?.whatsappNumber || '01711223344';
  const supportEmail = themeConfig?.supportEmail || localStorage.getItem('luxeshop_site_email') || 'support@luxeshopbd.com';
  const workingHours = themeConfig?.workingHours || localStorage.getItem('luxeshop_working_hours') || 'Daily: 9:00 AM - 11:00 PM';
  const storeAddress = themeConfig?.storeAddress || localStorage.getItem('luxeshop_site_address') || 'Dhaka, Bangladesh';

  return (
    <footer
      style={{ backgroundColor: secondaryColor }}
      className="text-white pt-12 pb-8 border-t border-slate-800 font-sans transition-colors duration-300 mt-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-3 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white">Fast Express Shipping</h5>
              <p className="text-[10px] text-slate-400">{fastShippingText}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white">100% Genuine Quality</h5>
              <p className="text-[10px] text-slate-400">{genuineWarrantyText}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white">Wholesale B2B Rate</h5>
              <p className="text-[10px] text-slate-400">{wholesaleBadgeText}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white">7 Days Easy Return</h5>
              <p className="text-[10px] text-slate-400">{returnPolicyText}</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Brand & About */}
          <div className="space-y-4">
            <h4 className="font-black text-base font-display text-white tracking-wide">
              {aboutTitle}
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              {aboutText}
            </p>
            {/* Social Media Links */}
            <div className="flex items-center space-x-2 pt-2">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-colors"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-pink-400 hover:text-pink-300 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-rose-500 hover:text-rose-400 transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h5 className="font-bold text-sm text-white border-b border-slate-800 pb-2">Top Categories</h5>
            <ul className="space-y-2 text-slate-400">
              {['Electronic', 'Accessories', 'Headphone', 'Laptop', 'Fashion', 'Beauty'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory && onSelectCategory(cat)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service & Links */}
          <div className="space-y-3">
            <h5 className="font-bold text-sm text-white border-b border-slate-800 pb-2">Customer Care</h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={onOpenOrderHistory} className="hover:text-white transition-colors cursor-pointer">
                  Track My Order
                </button>
              </li>
              <li>
                <button onClick={onOpenSellerAuth} className="hover:text-white transition-colors cursor-pointer">
                  Become a Merchant Vendor
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Return & Refund Policy</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Wholesale B2B Pricing Guide</span>
              </li>
            </ul>
          </div>

          {/* Contact Helpline */}
          <div className="space-y-3">
            <h5 className="font-bold text-sm text-white border-b border-slate-800 pb-2">Helpline Support</h5>
            <p className="text-slate-400 text-xs">Have questions or custom bulk inquiries?</p>
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex items-center space-x-2 text-white font-extrabold text-sm">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+88 {supportPhone}</span>
              </div>
              {supportEmail && (
                <p className="text-[10px] text-amber-300 font-medium truncate">✉️ {supportEmail}</p>
              )}
              {storeAddress && (
                <p className="text-[10px] text-slate-300">📍 {storeAddress}</p>
              )}
              <p className="text-[10px] text-slate-400">🕒 {workingHours}</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Payment Gateways */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{copyrightNotice}</p>

          {showPaymentGateways && (
            <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
              <span className="bg-pink-950/80 text-pink-300 border border-pink-800/50 px-2.5 py-1 rounded-lg">
                bKash
              </span>
              <span className="bg-orange-950/80 text-orange-300 border border-orange-800/50 px-2.5 py-1 rounded-lg">
                Nagad
              </span>
              <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg">
                SSLCommerz
              </span>
              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
                Cash on Delivery
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

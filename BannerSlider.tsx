import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, ShieldCheck, Truck } from 'lucide-react';
import { BannerItem } from '../types';

interface BannerSliderProps {
  banners?: BannerItem[];
}

export const INITIAL_BANNERS: BannerItem[] = [
  {
    id: 'b1',
    title: 'iPhone 16 Pro Max',
    subtitle: 'Extraordinary Visual & Exceptional Power',
    badge: 'Official Apple Warranty',
    cta: 'Shop Now',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    priceTag: 'Starting at ৳148,000 (Wholesale)',
    isActive: true
  },
  {
    id: 'b2',
    title: '6.6 Flash Sale Live',
    subtitle: 'Cashback Up to 100% on Select Gadgets',
    badge: 'Limited Stock Deal',
    cta: 'Explore Flash Deals',
    bgGradient: 'from-orange-600 via-amber-600 to-orange-700',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    priceTag: 'Up to 25% Off Retail Price',
    isActive: true
  },
  {
    id: 'b3',
    title: 'BD Wholesale B2B Direct',
    subtitle: 'Tiered Bulk Pricing for Resellers & Shop Owners',
    badge: 'Tiered Price Engine',
    cta: 'Join Wholesale Hub',
    bgGradient: 'from-blue-900 via-slate-900 to-indigo-950',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    priceTag: 'Up to 30% Bulk Discount',
    isActive: true
  }
];

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners: propsBanners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeBanners = (propsBanners && propsBanners.length > 0)
    ? propsBanners.filter(b => b.isActive !== false)
    : INITIAL_BANNERS;

  useEffect(() => {
    if (activeBanners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl shadow-slate-200">
      <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[290px] flex items-center">
        {activeBanners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out bg-gradient-to-r ${banner.bgGradient || 'from-slate-900 to-slate-800'} p-6 sm:p-8 flex items-center justify-between ${
              idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="max-w-md space-y-2 sm:space-y-3">
              <span className="inline-flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-amber-300 border border-white/10">
                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-300" />
                <span>{banner.badge}</span>
              </span>

              <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-white leading-tight">
                {banner.title}
              </h2>

              <p className="text-[11px] sm:text-sm text-slate-200/90 font-medium line-clamp-2">
                {banner.subtitle}
              </p>

              <div className="pt-1 sm:pt-2 flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-4">
                <button className="bg-white text-slate-900 font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs hover:bg-amber-400 hover:text-slate-950 transition-all flex items-center space-x-2 shadow-lg shadow-black/20 cursor-pointer">
                  <span>{banner.cta || 'Shop Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {banner.priceTag && (
                  <span className="text-[10px] sm:text-xs font-semibold text-amber-300/90">
                    {banner.priceTag}
                  </span>
                )}
              </div>
            </div>

            {banner.image && (
              <div className="hidden sm:block relative w-1/3 max-w-[280px] aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Trust Badges Bar */}
      <div className="bg-slate-950/80 backdrop-blur-md px-6 py-2.5 border-t border-white/10 hidden sm:flex items-center justify-around text-[11px] font-medium text-slate-300">
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-amber-400" />
          <span>Express Delivery Across BD (60৳ / 120৳ / 150৳)</span>
        </div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Genuine & Invoice Guaranteed</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-sky-400" />
          <span>Instant bKash / Nagad Refund Policy</span>
        </div>
      </div>
    </div>
  );
};

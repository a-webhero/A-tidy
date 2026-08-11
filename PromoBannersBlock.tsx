import React from 'react';
import { PromoBannerItemConfig, ThemeConfig } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PromoBannersBlockProps {
  promoBanners?: PromoBannerItemConfig[];
  themeConfig?: ThemeConfig;
  onSelectBanner?: (banner: PromoBannerItemConfig) => void;
}

export const PromoBannersBlock: React.FC<PromoBannersBlockProps> = ({
  promoBanners,
  themeConfig,
  onSelectBanner
}) => {
  const banners = promoBanners && promoBanners.length > 0 ? promoBanners : [
    {
      id: 'promo-1',
      title: '50% Flat Wholesale Offer',
      subtitle: 'On Selected Electronic Smart Gadgets',
      badge: 'LIMITED TIME',
      imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
      targetUrl: '#'
    },
    {
      id: 'promo-2',
      title: 'Premium Modesty Fashion',
      subtitle: 'Exclusive Three-Pieces & Sarees Collection',
      badge: 'NEW ARRIVAL',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
      targetUrl: '#'
    }
  ];

  const primaryColor = themeConfig?.primaryColor || '#f97316';
  const cardRadius = themeConfig?.cardRadius || '16px';
  const buttonRadius = themeConfig?.buttonRadius || '12px';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-4">
      {banners.map((item) => (
        <div
          key={item.id}
          style={{ borderRadius: cardRadius }}
          className="relative overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/80 bg-slate-900 text-white min-h-[160px] sm:min-h-[180px] flex items-center p-5 sm:p-6"
        >
          {/* Background Image with Dark Gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-sm space-y-2">
            {item.badge && (
              <span
                style={{ backgroundColor: primaryColor }}
                className="inline-flex items-center gap-1 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs"
              >
                <Sparkles className="w-3 h-3" />
                {item.badge}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-black font-display text-white leading-tight">
              {item.title}
            </h3>
            <p className="text-xs text-slate-300 font-medium line-clamp-2">
              {item.subtitle}
            </p>

            <button
              onClick={() => onSelectBanner && onSelectBanner(item)}
              style={{ backgroundColor: primaryColor, borderRadius: buttonRadius }}
              className="mt-3 text-slate-950 font-extrabold text-xs px-4 py-2 flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

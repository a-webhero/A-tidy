import React from 'react';
import { Store, ShieldCheck, Star, MapPin, ArrowRight, Package, Sparkles, Zap, Tag } from 'lucide-react';
import { VendorShopInfo } from './SellerShopModal';

interface ShopFlashCardProps {
  shop: VendorShopInfo;
  productCount?: number;
  onVisitShop: (shop: VendorShopInfo) => void;
  isInterleaved?: boolean;
}

export const ShopFlashCard: React.FC<ShopFlashCardProps> = ({
  shop,
  productCount = 4,
  onVisitShop,
  isInterleaved = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/50 border-2 border-amber-500/40 shadow-2xl hover:border-amber-400 transition-all duration-300 group flex flex-col justify-between ${
        isInterleaved ? 'col-span-2 sm:col-span-3 lg:col-span-4 my-4 p-1 ring-1 ring-amber-500/30' : 'p-1'
      }`}
    >
      {/* Top Banner Image with Flash Badges */}
      <div className="relative h-28 sm:h-36 w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-800">
        <img
          src={shop.banner || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80'}
          alt={shop.shopName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

        {/* Flash Sale Style Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg animate-pulse">
            <Zap className="w-3 h-3 fill-slate-950 text-slate-950" />
            <span>FLASH STORE</span>
          </span>
          {shop.isVerified && (
            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3 h-3" />
              <span>VERIFIED</span>
            </span>
          )}
        </div>

        {/* Rating Badge Top Right */}
        <div className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-md text-amber-400 font-extrabold text-[11px] px-2.5 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1 shadow-lg">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{shop.rating || 4.9}</span>
          <span className="text-slate-400 font-medium">({shop.reviewCount || 120})</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 space-y-3 relative -mt-8">
        <div className="flex items-end justify-between gap-2">
          {/* Logo overlapping banner */}
          <div className="relative shrink-0">
            <img
              src={shop.logo}
              alt={shop.shopName}
              className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-amber-400 bg-white shadow-xl group-hover:scale-105 transition-transform"
            />
            {shop.isVerified && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-xl shadow-xs">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>{productCount} Items Online</span>
            </span>
          </div>
        </div>

        {/* Shop Info */}
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
            <span>{shop.shopName}</span>
          </h4>
          <p className="text-xs text-amber-200/90 font-bold flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-400" />
            <span>Owner: {shop.ownerName}</span>
          </p>
          {shop.description && (
            <p className="text-xs text-slate-300 line-clamp-2 font-medium leading-relaxed">
              {shop.description}
            </p>
          )}
        </div>

        {/* Notice Bar / Flash Deal Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{shop.notice || 'Special B2B Wholesale Discount Available Today!'}</span>
        </div>

        {/* Location & Action */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
          {shop.address ? (
            <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-medium truncate max-w-[50%]">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </div>
          ) : (
            <span className="text-[11px] text-amber-400/90 font-bold">Verified BD Merchant</span>
          )}

          <button
            type="button"
            onClick={() => onVisitShop(shop)}
            className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all duration-200 shadow-lg flex items-center space-x-1.5 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
          >
            <Store className="w-4 h-4" />
            <span>Visit Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Product, BuyerType } from '../types';
import { Zap, Clock, ShoppingBag, Flame, Sparkles, ArrowRight } from 'lucide-react';

interface FlashDealsSectionProps {
  products: Product[];
  buyerType: BuyerType;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  products,
  buyerType,
  onOpenDetail,
  onAddToCart,
}) => {
  const flashProducts = products.filter((p) => p.isFlashSale);

  // Countdown timer simulation (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (flashProducts.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-3xl p-4 sm:p-6 text-white shadow-xl space-y-4">
      {/* Flash Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-orange-600 flex items-center justify-center font-black shadow-lg animate-bounce">
            <Zap className="w-6 h-6 fill-orange-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                ⚡ Flash Cards & Deals
              </h2>
              <span className="bg-amber-300 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                HOT SALE
              </span>
            </div>
            <p className="text-xs text-amber-100 font-medium">
              Extra discounts on limited quantity items • Grab before stock ends!
            </p>
          </div>
        </div>

        {/* Live Countdown Timer */}
        <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shrink-0">
          <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="text-[11px] font-bold text-amber-200">Ends In:</span>
          <div className="flex items-center space-x-1 font-mono font-black text-xs">
            <span className="bg-white text-slate-900 px-2 py-0.5 rounded-md shadow-xs">
              {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span>:</span>
            <span className="bg-white text-slate-900 px-2 py-0.5 rounded-md shadow-xs">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span>:</span>
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-xs">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </div>

      {/* Flash Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {flashProducts.map((product) => {
          const discountVal =
            product.discountPercent ||
            (product.discountAmount && product.discountType === 'percent' ? product.discountAmount : 15);

          const displayPrice = product.discountPrice || product.basePrice;
          const stockPercent = product.flashStockPercent || 82;

          return (
            <div
              key={product.id}
              onClick={() => onOpenDetail(product)}
              className="bg-white text-slate-900 rounded-2xl p-2.5 sm:p-3 space-y-2.5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer relative flex flex-col justify-between group border border-amber-200/50"
            >
              {/* Image & Badges */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-300" />
                  <span>{product.flashBadge || `${discountVal}% OFF`}</span>
                </span>
              </div>

              {/* Product Info */}
              <div className="space-y-1 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {product.category}
                </p>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                  {product.title}
                </h4>

                <div className="flex items-baseline space-x-1.5 pt-1">
                  <span className="text-sm sm:text-base font-black text-orange-600 font-display">
                    ৳{displayPrice.toLocaleString()}
                  </span>
                  {product.basePrice > displayPrice && (
                    <span className="text-[11px] font-semibold text-slate-400 line-through">
                      ৳{product.basePrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Stock Claimed Progress Bar */}
                <div className="pt-1.5 space-y-1">
                  <div className="flex justify-between text-[9px] font-extrabold text-slate-500">
                    <span>Sold: {stockPercent}%</span>
                    <span className="text-orange-600">Limited Stock!</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full"
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => onAddToCart(product, e)}
                className="w-full bg-slate-900 hover:bg-orange-500 text-white font-extrabold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add To Cart</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

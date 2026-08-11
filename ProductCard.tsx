import React from 'react';
import { Star, Heart, Tag, Plus, Check } from 'lucide-react';
import { Product, BuyerType, ThemeConfig } from '../types';
import { calculateProductPrice } from './priceUtils';

interface ProductCardProps {
  product: Product;
  buyerType: BuyerType;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInCart?: boolean;
  themeConfig?: ThemeConfig;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  buyerType,
  onOpenDetail,
  onAddToCart,
  isInCart,
  themeConfig
}) => {
  const priceInfo = calculateProductPrice(product, buyerType);
  const cardRadius = themeConfig?.cardRadius || '16px';
  const buttonRadius = themeConfig?.buttonRadius || '12px';
  const primaryColor = themeConfig?.primaryColor || '#f97316';
  const surfaceColor = themeConfig?.surfaceColor || '#ffffff';

  return (
    <div
      style={{ borderRadius: cardRadius, backgroundColor: surfaceColor }}
      className="group p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between"
    >
      {/* Top Media Container */}
      <div>
        <div
          style={{ borderRadius: buttonRadius }}
          className="relative aspect-square w-full bg-slate-50 overflow-hidden mb-3"
        >
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Discount Badge (Supports % OFF and Flat ৳ OFF) */}
          {priceInfo.discountBadgeText && (
            <span
              style={{ backgroundColor: primaryColor }}
              className="absolute top-2.5 left-2.5 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs tracking-wide"
            >
              {priceInfo.discountBadgeText}
            </span>
          )}

          {/* Wholesale Tag - Only shown if product has genuine wholesale option */}
          {priceInfo.isWholesaleProduct && (
            <span className="absolute bottom-2.5 left-2.5 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center space-x-1 shadow-xs">
              <Tag className="w-2.5 h-2.5" />
              <span>Wholesale</span>
            </span>
          )}

          {/* Wishlist Heart */}
          <button className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md text-slate-600 hover:text-rose-500 hover:bg-white flex items-center justify-center transition-all shadow-xs cursor-pointer">
            <Heart className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vendor & Rating Header */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
          <span className="font-semibold text-slate-400 truncate max-w-[120px]">
            {product.vendorName}
          </span>
          <div className="flex items-center space-x-1 font-bold text-slate-700">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            <span className="text-slate-400 text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h4
          onClick={() => onOpenDetail(product)}
          className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:opacity-80 transition-colors cursor-pointer mb-2 font-display"
        >
          {product.title}
        </h4>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-1">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-sm sm:text-base font-black text-slate-900">
              ৳{priceInfo.finalPrice.toLocaleString()}
            </span>
            {priceInfo.originalPrice && (
              <span className="text-[10px] text-slate-400 line-through">
                ৳{priceInfo.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-[10px] font-semibold" style={{ color: primaryColor }}>
            {priceInfo.isWholesaleApplied ? 'Wholesale Tier Rate' : 'Retail Price'}
          </p>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          style={{ borderRadius: buttonRadius }}
          className={`w-9 h-9 flex items-center justify-center transition-all cursor-pointer ${
            isInCart
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-white hover:brightness-125 shadow-md shadow-slate-900/10'
          }`}
          title="Add to Cart"
        >
          {isInCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};


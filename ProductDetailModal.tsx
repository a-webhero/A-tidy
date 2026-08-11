import React, { useState } from 'react';
import { X, Star, Heart, Share2, Tag, ShieldCheck, Check, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product, ProductVariant, WholesaleTierRule } from './types';
import { calculateProductPrice } from './priceUtils';
interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCartWithVariant: (
    product: Product,
    variant: ProductVariant | undefined,
    quantity: number,
    unitPrice: number,
    isWholesaleApplied: boolean
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCartWithVariant
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);

  // Calculate unit price dynamically based on wholesale rules & variant extra & retail discounts
  const priceInfo = calculateProductPrice(product, 'retail');
  
  const calculateUnitPrice = (qty: number) => {
    let unitBase = priceInfo.finalPrice;
    let isWholesale = false;

    // Check wholesale rules
    if (product.wholesalePriceRules && product.wholesalePriceRules.length > 0) {
      const applicableRule = product.wholesalePriceRules.find(
        (rule) => qty >= rule.minQty && (rule.maxQty === undefined || qty <= rule.maxQty)
      );
      if (applicableRule) {
        if (applicableRule.minQty > 1 || applicableRule.pricePerUnit < product.basePrice) {
          unitBase = applicableRule.pricePerUnit;
          if (qty >= (product.wholesalePriceRules[1]?.minQty || 2)) {
            isWholesale = true;
          }
        }
      }
    }

    const extra = selectedVariant ? selectedVariant.priceExtra : 0;
    return { unitPrice: unitBase + extra, isWholesale };
  };

  const { unitPrice, isWholesale } = calculateUnitPrice(quantity);
  const totalPrice = unitPrice * quantity;

  // Group variants by Color and Storage/Size
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => v.colorName).filter(Boolean) as string[])
  );

  const availableStorages = Array.from(
    new Set(product.variants.map((v) => v.storage).filter(Boolean) as string[])
  );

  const availableSizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter(Boolean) as string[])
  );

  const handleSelectColor = (colorName: string) => {
    const match = product.variants.find(
      (v) => v.colorName === colorName && (selectedVariant?.storage ? v.storage === selectedVariant.storage : true)
    );
    if (match) setSelectedVariant(match);
    else {
      const firstColorMatch = product.variants.find((v) => v.colorName === colorName);
      if (firstColorMatch) setSelectedVariant(firstColorMatch);
    }
  };

  const handleSelectStorage = (storage: string) => {
    const match = product.variants.find(
      (v) => v.storage === storage && (selectedVariant?.colorName ? v.colorName === selectedVariant.colorName : true)
    );
    if (match) setSelectedVariant(match);
    else {
      const firstStorageMatch = product.variants.find((v) => v.storage === storage);
      if (firstStorageMatch) setSelectedVariant(firstStorageMatch);
    }
  };

  const handleSelectSize = (size: string) => {
    const match = product.variants.find(
      (v) => v.size === size && (selectedVariant?.colorName ? v.colorName === selectedVariant.colorName : true)
    );
    if (match) setSelectedVariant(match);
    else {
      const firstSizeMatch = product.variants.find((v) => v.size === size);
      if (firstSizeMatch) setSelectedVariant(firstSizeMatch);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5 text-orange-500" />
            <span>Product Details & Wholesale Tier</span>
          </span>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-200/80 overflow-hidden relative group">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.isFlashSale && (
                <span className="absolute top-4 left-4 bg-orange-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                  6.6 Flash Sale
                </span>
              )}
            </div>

            {/* Thumbnail switcher */}
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIdx === idx ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Wholesale Tier Pricing Breakdown Card */}
            {product.wholesalePriceRules.length > 0 && (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Wholesale Bulk Discount Rules</span>
                  </span>
                  <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                    B2B Tier
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  {product.wholesalePriceRules.map((tier, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border transition-all ${
                        quantity >= tier.minQty && (tier.maxQty === undefined || quantity <= tier.maxQty)
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-blue-100'
                      }`}
                    >
                      <p className="text-[10px] opacity-80">
                        {tier.maxQty ? `${tier.minQty}–${tier.maxQty} pcs` : `${tier.minQty}+ pcs`}
                      </p>
                      <p className="font-extrabold text-xs">
                        ৳{tier.pricePerUnit.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Title, Variants, Qty, CTAs */}
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                {product.vendorName}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5 leading-snug">
                {product.title}
              </h2>

              <div className="flex items-center space-x-3 mt-2 text-xs">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="ml-1 text-slate-800">{product.rating}</span>
                  <span className="text-slate-400 font-medium ml-1">({product.reviewCount} reviews)</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>In Stock ({selectedVariant?.stock || 50} units)</span>
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Unit Price</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">
                    ৳{unitPrice.toLocaleString()}
                  </span>
                  {!isWholesale && priceInfo.originalPrice && (
                    <span className="text-sm font-bold text-slate-400 line-through">
                      ৳{priceInfo.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {!isWholesale && priceInfo.discountBadgeText && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                      {priceInfo.discountBadgeText}
                    </span>
                  )}
                  {isWholesale && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Wholesale Tier Applied!
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-black text-sm text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Color Variant Selector */}
            {uniqueColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Color: <span className="text-orange-600">{selectedVariant?.colorName}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((colorName) => {
                    const variantMatch = product.variants.find((v) => v.colorName === colorName);
                    const isSelected = selectedVariant?.colorName === colorName;

                    return (
                      <button
                        key={colorName}
                        onClick={() => handleSelectColor(colorName!)}
                        className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/80 text-orange-900 ring-2 ring-orange-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {variantMatch?.colorHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: variantMatch.colorHex }}
                          />
                        )}
                        <span>{colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Storage / Size Variant Selector */}
            {availableStorages.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Storage Capacity
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableStorages.map((storage) => {
                    const isSelected = selectedVariant?.storage === storage;
                    return (
                      <button
                        key={storage}
                        onClick={() => handleSelectStorage(storage!)}
                        className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {storage}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Variant Selector if Fashion */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const isSelected = selectedVariant?.size === size;
                    return (
                      <button
                        key={size}
                        onClick={() => handleSelectSize(size!)}
                        className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              <p className="font-bold text-slate-900 mb-1">Description Product</p>
              <p>{product.description}</p>
            </div>

            {/* Actions: Add to Cart & Buy Now */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                <span>Total Amount:</span>
                <span className="text-lg font-black text-orange-600">
                  ৳{totalPrice.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onAddToCartWithVariant(product, selectedVariant, quantity, unitPrice, isWholesale);
                    onClose();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => {
                    onAddToCartWithVariant(product, selectedVariant, quantity, unitPrice, isWholesale);
                    onClose();
                  }}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-orange-500/20 hover:opacity-95"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

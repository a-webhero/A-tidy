import React, { useState } from 'react';
import { X, Store, Phone, MessageSquare, MapPin, Star, ShieldCheck, CheckCircle2, ShoppingBag, Search, ExternalLink, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { Product, ProductVariant } from '../types';

export interface VendorShopInfo {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  logo: string;
  banner?: string;
  description: string;
  address?: string;
  notice?: string;
  rating?: number;
  reviewCount?: number;
  totalSales?: number;
  isVerified?: boolean;
}

interface SellerShopModalProps {
  isOpen: boolean;
  shop: VendorShopInfo | null;
  shopProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const SellerShopModal: React.FC<SellerShopModalProps> = ({
  isOpen,
  shop,
  shopProducts,
  onClose,
  onAddToCart,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen || !shop) return null;

  const categories = ['All', ...Array.from(new Set(shopProducts.map((p) => p.category)))];

  const filteredProducts = shopProducts.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-800 my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95">
        
        {/* Shop Cover Banner Header */}
        <div className="relative h-44 sm:h-56 w-full bg-slate-800 shrink-0">
          <img
            src={shop.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'}
            alt={shop.shopName}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Shop Profile Details Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 z-10">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <img
                  src={shop.logo || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80'}
                  alt={shop.shopName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/80 shadow-2xl bg-white"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="text-white space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-2xl font-black font-display drop-shadow-md">{shop.shopName}</h2>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Seller
                  </span>
                </div>
                <p className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  Owner: <span className="text-white">{shop.ownerName}</span> • <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" /> {shop.rating || 4.9} rating
                </p>
                {shop.address && (
                  <p className="text-[11px] text-slate-300 flex items-center gap-1 truncate max-w-md">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" /> {shop.address}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {shop.whatsapp && (
                <a
                  href={`https://wa.me/88${shop.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl border border-emerald-400/40 shadow-lg flex items-center justify-center space-x-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 shadow-lg flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Seller</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Shop Announcement Notice Banner if present */}
        {shop.notice && (
          <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-300 flex items-center justify-center space-x-2 text-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>{shop.notice}</span>
          </div>
        )}

        {/* Shop Description Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300 shrink-0">
          <p className="line-clamp-2 max-w-2xl">{shop.description}</p>
          <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-400 shrink-0">
            <span>Total Products: <strong className="text-white">{shopProducts.length}</strong></span>
            <span>•</span>
            <span>Est. Delivery: <strong className="text-amber-400">24-48 Hours</strong></span>
          </div>
        </div>

        {/* Shop Products Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-950">
          
          {/* Controls Bar: Search & Category Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search products in ${shop.shopName}...`}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-900/50 rounded-3xl border border-slate-800">
              <Store className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No products found for this search or category.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-amber-400 font-bold underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => {
                const finalPrice = product.discountPrice || product.basePrice;

                return (
                  <div
                    key={product.id}
                    className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-800 cursor-pointer" onClick={() => onSelectProduct(product)}>
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discountAmount && product.discountAmount > 0 && (
                        <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md">
                          {product.discountType === 'percent' ? `${product.discountAmount}% OFF` : `৳${product.discountAmount} OFF`}
                        </span>
                      )}
                      {product.isWholesaleAvailable && (
                        <span className="absolute bottom-2 left-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" /> Wholesale
                        </span>
                      )}
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                        <h4
                          onClick={() => onSelectProduct(product)}
                          className="text-xs font-bold text-white line-clamp-2 hover:text-amber-400 cursor-pointer"
                        >
                          {product.title}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-sm font-black text-amber-400 font-display">৳{finalPrice.toLocaleString()}</span>
                          {product.discountPrice && (
                            <span className="text-[10px] text-slate-500 line-through font-semibold">৳{product.basePrice.toLocaleString()}</span>
                          )}
                        </div>

                        <button
                          onClick={() => onAddToCart(product)}
                          className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-[11px] py-2 rounded-xl transition-all border border-slate-700 hover:border-amber-400 flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Order Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

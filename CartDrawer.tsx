import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
  appliedCoupon: { code: string; discountAmount: number } | null;
  onApplyCoupon: (code: string) => Promise<boolean>;
  couponError: string | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
  appliedCoupon,
  onApplyCoupon,
  couponError
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const wholesaleSavings = cartItems.reduce((sum, item) => {
    if (item.isWholesaleTierApplied) {
      const retailDiff = (item.product.basePrice - item.unitPrice) * item.quantity;
      return sum + (retailDiff > 0 ? retailDiff : 0);
    }
    return sum;
  }, 0);

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const estimatedTotal = Math.max(0, subtotal - discount);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsApplying(true);
    await onApplyCoupon(promoInput.trim());
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900 font-display">
              Cart ({cartItems.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                title="Clear Cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wholesale Tier Alert Badge */}
        {wholesaleSavings > 0 && (
          <div className="bg-emerald-50 border-y border-emerald-200/80 px-6 py-2.5 flex items-center space-x-2 text-xs text-emerald-900 font-medium">
            <Tag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Wholesale Tier Unlocked!</strong> You save ৳
              {wholesaleSavings.toLocaleString()} with bulk pricing.
            </span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Your cart is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explore our catalog for gadgets, devices, and wholesale products.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 flex gap-3 relative group"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1 pr-4">
                        {item.product.title}
                      </h5>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium">
                      {item.selectedVariant?.colorName && `Color: ${item.selectedVariant.colorName}`}
                      {item.selectedVariant?.storage && ` • ${item.selectedVariant.storage}`}
                      {item.selectedVariant?.size && ` • Size: ${item.selectedVariant.size}`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs font-black text-slate-900">
                        ৳{(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                      {item.isWholesaleTierApplied && (
                        <span className="block text-[9px] font-bold text-blue-600">
                          Bulk Tier Rate (৳{item.unitPrice.toLocaleString()}/pc)
                        </span>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-1.5 bg-white px-1.5 py-0.5 rounded-xl border border-slate-200 shadow-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-extrabold text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Promo Code */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-white space-y-4">
            {/* Promo Code Form */}
            <form onSubmit={handleCouponSubmit} className="space-y-1">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
                <Tag className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Enter Promo Code (e.g. LUXE10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  disabled={isApplying}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 px-2 py-1 transition-colors cursor-pointer"
                >
                  {isApplying ? 'Applying...' : 'Apply'}
                </button>
              </div>

              {couponError && (
                <p className="text-[10px] text-rose-500 font-semibold px-2">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="text-[10px] text-emerald-600 font-semibold px-2">
                  Coupon {appliedCoupon.code} applied (-৳{appliedCoupon.discountAmount.toLocaleString()})
                </p>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-2 text-xs font-medium text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount</span>
                  <span className="font-bold">-৳{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Shipping Fee</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-100 pt-2">
                <span>Total</span>
                <span className="text-orange-600">৳{estimatedTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/10 active:scale-98 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import { Product, BuyerType } from '../types';

export interface ProductPriceInfo {
  finalPrice: number;
  originalPrice: number | null;
  hasDiscount: boolean;
  discountType: 'percent' | 'flat' | null;
  discountBadgeText: string | null;
  isWholesaleApplied: boolean;
  isWholesaleProduct: boolean;
}

export function calculateProductPrice(
  product: Product,
  buyerType: BuyerType = 'retail',
  quantity: number = 1
): ProductPriceInfo {
  const basePrice = Number(product.basePrice) || 0;

  let sellingPrice = basePrice;
  let hasDiscount = false;
  let discountType: 'percent' | 'flat' | null = null;
  let discountBadgeText: string | null = null;

  if (product.discountType === 'flat' && product.discountAmount && product.discountAmount > 0) {
    sellingPrice = Math.max(0, basePrice - product.discountAmount);
    hasDiscount = sellingPrice < basePrice;
    discountType = 'flat';
    discountBadgeText = `৳${product.discountAmount.toLocaleString()} OFF`;
  } else if (product.discountType === 'percent' && product.discountAmount && product.discountAmount > 0) {
    sellingPrice = Math.round(basePrice * (1 - product.discountAmount / 100));
    hasDiscount = sellingPrice < basePrice;
    discountType = 'percent';
    discountBadgeText = `${product.discountAmount}% OFF`;
  } else if (product.discountPercent && product.discountPercent > 0) {
    sellingPrice = Math.round(basePrice * (1 - product.discountPercent / 100));
    hasDiscount = sellingPrice < basePrice;
    discountType = 'percent';
    discountBadgeText = `${product.discountPercent}% OFF`;
  } else if (product.discountPrice && product.discountPrice < basePrice) {
    sellingPrice = product.discountPrice;
    hasDiscount = true;
    const diff = basePrice - product.discountPrice;
    const percent = Math.round((diff / basePrice) * 100);
    discountType = 'flat';
    discountBadgeText = percent >= 5 ? `${percent}% OFF` : `৳${diff.toLocaleString()} OFF`;
  }

  const hasWholesaleRules = Array.isArray(product.wholesalePriceRules) && product.wholesalePriceRules.length > 0;
  
  // Is wholesale product if flagged OR if it has genuine bulk tier discounts (e.g. minQty > 1 with price < basePrice)
  const hasGenuineBulkRules = hasWholesaleRules && product.wholesalePriceRules.some((r) => r.minQty > 1 && r.pricePerUnit < basePrice);
  const isWholesaleProduct = Boolean(product.isWholesaleOnly || product.isWholesaleAvailable || hasGenuineBulkRules);

  let finalPrice = sellingPrice;
  let originalPrice: number | null = hasDiscount ? basePrice : null;
  let isWholesaleApplied = false;

  if (buyerType === 'wholesale' && hasWholesaleRules) {
    const applicableRule = product.wholesalePriceRules.find(
      (rule) => quantity >= rule.minQty && (rule.maxQty === undefined || quantity <= rule.maxQty)
    );
    if (applicableRule) {
      finalPrice = applicableRule.pricePerUnit;
      originalPrice = basePrice;
      isWholesaleApplied = true;
    } else {
      const lowestTier = product.wholesalePriceRules[product.wholesalePriceRules.length - 1];
      if (lowestTier && lowestTier.pricePerUnit < sellingPrice) {
        finalPrice = lowestTier.pricePerUnit;
        originalPrice = basePrice;
        isWholesaleApplied = true;
      }
    }
  }

  return {
    finalPrice,
    originalPrice,
    hasDiscount,
    discountType,
    discountBadgeText,
    isWholesaleApplied,
    isWholesaleProduct,
  };
}

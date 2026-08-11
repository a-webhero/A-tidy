import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-iphone-16-pro',
    vendorId: 'vendor-apple-store',
    vendorName: 'Apple Official BD Hub',
    title: 'iPhone 16 Pro Max',
    slug: 'iphone-16-pro-max',
    category: 'Electronic',
    description: 'Extraordinary Visual & Exceptional Power with A18 Pro Chip, Titanium Design, and Camera Control.',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 2240,
    isFlashSale: true,
    discountType: 'percent',
    discountAmount: 12,
    discountPercent: 12,
    basePrice: 165000, // ৳165,000 Base Regular Price
    isWholesaleAvailable: true,
    wholesalePriceRules: [
      { minQty: 1, maxQty: 4, pricePerUnit: 145200 },
      { minQty: 5, maxQty: 10, pricePerUnit: 140000 },
      { minQty: 11, pricePerUnit: 135000 }
    ],
    variants: [
      { id: 'v-iphone-desert-256', colorName: 'Desert Titanium', colorHex: '#C5A992', storage: '256 GB', sku: 'IP16PM-DES-256', stock: 45, priceExtra: 0 },
      { id: 'v-iphone-desert-512', colorName: 'Desert Titanium', colorHex: '#C5A992', storage: '512 GB', sku: 'IP16PM-DES-512', stock: 20, priceExtra: 22000 }
    ],
    createdAt: '2026-07-28T10:00:00Z'
  },
  {
    id: 'prod-ipad-pro-11',
    vendorId: 'vendor-apple-store',
    vendorName: 'Apple Official BD Hub',
    title: 'iPad Pro 6th Generation 11 Inch',
    slug: 'ipad-pro-6th-gen-11-inch',
    category: 'Electronic',
    description: 'Apple M2 chip, Ultra Retina XDR Display, Wi-Fi 6E, Thunderbolt port, and supports Apple Pencil Hover.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    reviewCount: 1180,
    isFlashSale: true,
    discountType: 'flat',
    discountAmount: 15000, // ৳15,000 Flat Discount!
    basePrice: 115000,
    isWholesaleAvailable: true,
    wholesalePriceRules: [
      { minQty: 1, maxQty: 3, pricePerUnit: 100000 },
      { minQty: 4, maxQty: 8, pricePerUnit: 95000 },
      { minQty: 9, pricePerUnit: 90000 }
    ],
    variants: [
      { id: 'v-ipad-spacegray-256', colorName: 'Space Gray', colorHex: '#4A4B4D', storage: '256 GB', sku: 'IPAD6G-SG-256', stock: 15, priceExtra: 0 }
    ],
    createdAt: '2026-07-29T12:00:00Z'
  },
  {
    id: 'prod-nike-air-zoom',
    vendorId: 'vendor-lux-fashion',
    vendorName: 'Luxe Wear Bangladesh',
    title: 'Nike Air Zoom Tempo NEXT% Flyknit',
    slug: 'nike-air-zoom-tempo-next',
    category: 'Fashion',
    description: 'Ultra-responsive running shoe engineered for high durability, ZoomX foam footbed, breathable upper.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    reviewCount: 420,
    isFlashSale: false,
    discountType: 'flat',
    discountAmount: 2000, // ৳2,000 Flat Discount!
    basePrice: 14500,
    wholesalePriceRules: [], // Normal product, no wholesale
    variants: [
      { id: 'v-nike-red-42', colorName: 'Infrared Crimson', colorHex: '#E63946', size: '42 EU', sku: 'NK-AZ-RED-42', stock: 25, priceExtra: 0 }
    ],
    createdAt: '2026-08-02T14:20:00Z'
  },
  {
    id: 'prod-macbook-air-m3',
    vendorId: 'vendor-apple-store',
    vendorName: 'Apple Official BD Hub',
    title: 'MacBook Air M3 15-Inch Liquid Retina',
    slug: 'macbook-air-m3-15-inch',
    category: 'Laptop',
    description: 'Incredibly thin, fast M3 8-core CPU, 10-core GPU, 18 hours battery life, MagSafe charging.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 650,
    isFlashSale: true,
    discountType: 'percent',
    discountAmount: 15, // 15% OFF
    basePrice: 178000,
    isWholesaleAvailable: true,
    wholesalePriceRules: [
      { minQty: 1, maxQty: 3, pricePerUnit: 151300 },
      { minQty: 4, pricePerUnit: 142000 }
    ],
    variants: [
      { id: 'v-mac-midnight-512', colorName: 'Midnight', colorHex: '#1E232A', storage: '512 GB', sku: 'MBA-M3-MID-512', stock: 8, priceExtra: 0 }
    ],
    createdAt: '2026-08-01T11:15:00Z'
  },
  {
    id: 'prod-tshirt-cotton',
    vendorId: 'vendor-lux-fashion',
    vendorName: 'BD Wholesale Hub',
    title: 'Premium Organic Cotton Casual T-Shirt',
    slug: 'organic-cotton-tshirt',
    category: 'Fashion',
    description: '100% Combed organic cotton breathable daily wear tee with reinforced stitching.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 24,
    basePrice: 850,
    wholesalePriceRules: [], // Normal retail item
    variants: [
      { id: 'v-ts-black-m', colorName: 'Black', colorHex: '#000000', size: 'M', sku: 'TS-BLK-M', stock: 100, priceExtra: 0 }
    ],
    createdAt: '2026-08-03T10:00:00Z'
  },
  {
    id: 'prod-wireless-headphones',
    vendorId: 'vendor-sound-hub',
    vendorName: 'Acoustics BD',
    title: 'Sony WH-1000XM5 Noise Canceling Headphones',
    slug: 'sony-wh1000xm5-headphones',
    category: 'Headphone',
    description: 'Industry-leading Active Noise Cancellation with two processors and 8 microphones.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    reviewCount: 1540,
    isFlashSale: true,
    discountType: 'flat',
    discountAmount: 5000, // ৳5,000 Flat OFF
    basePrice: 38500,
    wholesalePriceRules: [],
    variants: [
      { id: 'v-sony-black', colorName: 'Matte Black', colorHex: '#1A1A1A', sku: 'SNY-XM5-BLK', stock: 40, priceExtra: 0 }
    ],
    createdAt: '2026-08-02T16:00:00Z'
  }
];

export const INITIAL_COUPONS = [
  { code: 'LUXE10', discountType: 'percent', discountValue: 10, minSpend: 1000 },
  { code: 'BD500', discountType: 'flat', discountValue: 500, minSpend: 5000 },
  { code: 'WHOLESALEVIP', discountType: 'percent', discountValue: 15, minSpend: 50000 }
];

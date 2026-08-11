export type UserRole = 'customer' | 'vendor' | 'admin';

export type BuyerType = 'retail' | 'wholesale';

export interface LayoutSectionConfig {
  id: string;
  title: string;
  subtitle?: string;
  isVisible: boolean;
  order: number;
}

export interface CustomProductBlockConfig {
  id: string;
  title: string;
  subtitle: string;
  dataSource: 'automated' | 'manual';
  automatedType?: 'most_viewed' | 'top_sales' | 'latest' | 'highest_discount';
  manualProductIds?: string[];
  layoutType: 'grid' | 'slider';
  columns: 2 | 4;
  isVisible: boolean;
}

export interface PromoBannerItemConfig {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  targetUrl: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  accentTextColor: string;
  fontFamily: string;
  buttonRadius: '0px' | '8px' | '12px' | '24px';
  cardRadius: '8px' | '16px' | '24px';
  categoryDisplayStyle: 'circle_icon' | 'grid_box';
  highlightedCategories: string[];
  lightLogoUrl: string;
  darkLogoUrl: string;
  siteTitle?: string;
  siteTitleSuffix?: string;
  siteTagline?: string;
  showTopAnnouncement: boolean;
  announcementText: string;
  announcementBgColor: string;
  enableLiveSearchSuggestions: boolean;
  searchBarPlacement: 'center' | 'top_right' | 'compact';
  searchPlaceholder?: string;
  headerSupportPhone?: string;
  promoBanners: PromoBannerItemConfig[];
  customBlocks: CustomProductBlockConfig[];
  facebookUrl: string;
  whatsappNumber: string;
  instagramUrl: string;
  youtubeUrl: string;
  showPaymentGateways: boolean;
  copyrightNotice: string;
  footerAboutTitle?: string;
  footerAboutText?: string;
  supportEmail?: string;
  supportPhone?: string;
  storeAddress?: string;
  workingHours?: string;
  footerFastShippingText?: string;
  footerGenuineWarrantyText?: string;
  footerWholesaleBadgeText?: string;
  footerReturnPolicyText?: string;
  sections: LayoutSectionConfig[];
}

export interface LocationDivision {
  id: string;
  name: string;
  districts: LocationDistrict[];
}

export interface LocationDistrict {
  id: string;
  name: string;
  isDhakaCity?: boolean;
  thanas: LocationThana[];
}

export interface LocationThana {
  id: string;
  name: string;
  isRemote?: boolean;
}

export interface WholesaleTierRule {
  minQty: number;
  maxQty?: number; // undefined means infinity+
  pricePerUnit: number;
}

export interface ProductVariant {
  id: string;
  colorName?: string;
  colorHex?: string;
  size?: string;
  storage?: string;
  sku: string;
  stock: number;
  priceExtra: number;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  cta: string;
  bgGradient: string;
  image: string;
  priceTag: string;
  linkUrl?: string;
  isActive?: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  slug: string;
  category: string;
  subCategory?: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isFlashSale?: boolean;
  flashEndsAt?: string;
  flashStockPercent?: number;
  flashBadge?: string;
  discountPercent?: number;
  discountType?: 'percent' | 'flat';
  discountAmount?: number; // percent value (e.g. 15 for 15%) or flat amount (e.g. 200 for ৳200)
  basePrice: number; // Regular Base / MRP Price
  discountPrice?: number; // Final calculated selling price after discount
  isWholesaleOnly?: boolean;
  isWholesaleAvailable?: boolean;
  seoDescription?: string;
  seoPhoto?: string;
  deliveryTime?: string;
  returnPolicy?: string;
  returnTime?: string;
  wholesalePriceRules: WholesaleTierRule[];
  variants: ProductVariant[];
  createdAt: string;
}

export interface CartItem {
  id: string; // unique item id in cart (product.id + variant.id)
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  unitPrice: number; // calculated based on retail vs wholesale tier
  isWholesaleTierApplied: boolean;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  division: string;
  district: string;
  thana: string;
  fullAddress: string;
  zipCode?: string;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'sslcommerz' | 'cod';

export interface PaymentDetails {
  method: PaymentMethod;
  status: 'paid' | 'pending' | 'failed';
  transactionId?: string;
  advanceFeePaid?: number; // for COD advance delivery charge option
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Dispatched' | 'In Delivery' | 'Delivered' | 'Cancelled';

export interface TrackingStep {
  title: string;
  description: string;
  time: string;
  completed: boolean;
  active?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  buyerType: BuyerType;
  shippingAddress: ShippingAddress;
  deliveryZone: 'Dhaka City' | 'Outside Dhaka' | 'Remote Area';
  shippingFee: number;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  totalAmount: number;
  paymentDetails: PaymentDetails;
  orderStatus: OrderStatus;
  vendorId: string;
  vendorName: string;
  commissionFee: number;
  trackingSteps: TrackingStep[];
  courierDetails?: {
    riderName: string;
    riderPhone: string;
    courierName: string;
    trackingId: string;
  };
}

export interface VendorStats {
  vendorId: string;
  shopName: string;
  totalSales: number;
  totalOrders: number;
  walletBalance: number;
  pendingCommission: number;
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minSpend: number;
}

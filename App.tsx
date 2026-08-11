import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import BannerSlider, { INITIAL_BANNERS } from './BannerSlider';
import { CategoryGrid } from './CategoryGrid';
import { ProductCard } from './ProductCard';
import { FlashDealsSection } from './FlashDealsSection';
import { CustomerStorefront } from './CustomerStorefront';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { InvoiceModal } from './InvoiceModal';
import { OrderTrackerModal } from './OrderTrackerModal';
import { VendorPanel } from './VendorPanel';
import { AdminPanel } from './AdminPanel';
import { LocationSelectorModal } from './LocationSelectorModal';
import { AuthModal, UserAccount } from './AuthModal';
import { SellerAuthModal } from './SellerAuthModal';
import { SellerShopModal, VendorShopInfo } from './SellerShopModal';
export default function App() {
  // App Role & Mode
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [buyerType, setBuyerType] = useState<BuyerType>('retail');

  // Banners State
  const [banners, setBanners] = useState<BannerItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxeshop_banners');
      return saved ? JSON.parse(saved) : INITIAL_BANNERS;
    } catch {
      return INITIAL_BANNERS;
    }
  });

  const handleSaveBanners = (updated: BannerItem[]) => {
    setBanners(updated);
    localStorage.setItem('luxeshop_banners', JSON.stringify(updated));
  };

  // Dynamic Theme & Layout Config State
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('luxeshop_theme_config');
      return saved ? JSON.parse(saved) : DEFAULT_THEME_CONFIG;
    } catch {
      return DEFAULT_THEME_CONFIG;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveThemeConfig = (updated: ThemeConfig) => {
    setThemeConfig(updated);
    localStorage.setItem('luxeshop_theme_config', JSON.stringify(updated));
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('luxeshop_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('luxeshop_registered_users');
      return saved
        ? JSON.parse(saved)
        : [
            {
              name: 'Tanvir Ahmed',
              phone: '01712345678',
              email: 'tanvir@gmail.com',
              password: '123456'
            }
          ];
    } catch {
      return [
        {
          name: 'Tanvir Ahmed',
          phone: '01712345678',
          email: 'tanvir@gmail.com',
          password: '123456'
        }
      ];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Seller Auth Modal State
  const [isSellerAuthOpen, setIsSellerAuthOpen] = useState(false);
  const [sellerAuthInitialMode, setSellerAuthInitialMode] = useState<'login' | 'register'>('login');

  // Save registered users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('luxeshop_registered_users', JSON.stringify(registeredUsers));
    } catch (e) {
      console.error(e);
    }
  }, [registeredUsers]);

  // Save logged in user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('luxeshop_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('luxeshop_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const handleRegisterUser = (newUser: UserAccount) => {
    setRegisteredUsers((prev) => [...prev, newUser]);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (
      user.role === 'admin' ||
      user.email === 'awebheroofficial@gmail.com' ||
      user.phone === '01700000000' ||
      user.phone === 'admin'
    ) {
      setCurrentRole('admin');
    } else if (user.role === 'vendor') {
      setCurrentRole('vendor');
    } else {
      setCurrentRole('customer');
    }
  };

  const handleSellerLoginSuccess = (sellerUser: UserAccount) => {
    setCurrentUser(sellerUser);
    setCurrentRole('vendor');
    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.phone === sellerUser.phone || u.email === sellerUser.email);
      return exists ? prev : [...prev, sellerUser];
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('customer');
  };

  // Location State
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka City');
  const [thana, setThana] = useState('Gulshan');

  // Catalog & Order State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Modals Control
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [selectedShopForModal, setSelectedShopForModal] = useState<VendorShopInfo | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [activeTrackerOrder, setActiveTrackerOrder] = useState<Order | null>(null);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  // Vendor Shops State
  const [vendorShops, setVendorShops] = useState<VendorShopInfo[]>(() => {
    try {
      const saved = localStorage.getItem('luxeshop_vendor_shops');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'vendor-apple-store',
              shopName: 'Apple Official BD Hub',
              ownerName: 'Tanvir Rahman',
              phone: '01711223344',
              whatsapp: '01711223344',
              logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80',
              banner: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
              description: 'Official store for iPhones, iPads, MacBooks & Apple Accessories in Bangladesh with brand warranty.',
              address: 'Shop #302, Jamuna Future Park, Dhaka',
              notice: '🎉 100% Original Apple Products with Official BD Warranty!',
              rating: 4.9,
              reviewCount: 2240,
              isVerified: true
            },
            {
              id: 'vendor-lux-fashion',
              shopName: 'Luxe Wear Bangladesh',
              ownerName: 'Sajjad Hossain',
              phone: '01899887766',
              whatsapp: '01899887766',
              logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
              description: 'Designer modesty wear, Three-Pieces, Sarees, and footwear.',
              address: 'Level 4, Police Plaza Concord, Gulshan 1, Dhaka',
              notice: '🎉 20% Flat Discount on all Three-Piece sets!',
              rating: 4.8,
              reviewCount: 890,
              isVerified: true
            },
            {
              id: 'v101',
              shopName: 'Gadget World BD',
              ownerName: 'Rafiqul Islam',
              phone: '01711223344',
              whatsapp: '01711223344',
              logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80',
              banner: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
              description: 'Premier electronics & smart gadgets importer in Dhaka.',
              address: 'Multiplan Center, New Elephant Road, Dhaka',
              notice: '🎉 Cash on delivery service available across Bangladesh!',
              rating: 4.9,
              reviewCount: 450,
              isVerified: true
            }
          ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxeshop_vendor_shops', JSON.stringify(vendorShops));
    } catch (e) {
      console.error(e);
    }
  }, [vendorShops]);

  const handleUpdateShopInfo = (updatedShop: VendorShopInfo) => {
    setVendorShops((prev) => {
      const exists = prev.some((s) => s.id === updatedShop.id || s.phone === updatedShop.phone);
      if (exists) {
        return prev.map((s) => (s.id === updatedShop.id || s.phone === updatedShop.phone ? updatedShop : s));
      }
      return [updatedShop, ...prev];
    });
  };

  // Fetch Products & Orders from Express Backend API
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.log('Using initial fallback products catalog');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.log('Using initial fallback orders');
    }
  };

  // Cart Functions
  const handleAddToCartQuick = (product: Product) => {
    const defaultVariant = product.variants[0];
    const unitPrice = product.basePrice + (defaultVariant?.priceExtra || 0);

    const existingIndex = cart.findIndex((c) => c.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: `${product.id}-${defaultVariant?.id || 'base'}`,
          product,
          selectedVariant: defaultVariant,
          quantity: 1,
          unitPrice,
          isWholesaleTierApplied: false
        }
      ]);
    }
    setIsCartOpen(true);
  };

  const handleAddToCartWithVariant = (
    product: Product,
    variant: ProductVariant | undefined,
    quantity: number,
    unitPrice: number,
    isWholesaleApplied: boolean
  ) => {
    const cartItemId = `${product.id}-${variant?.id || 'base'}`;
    const existingIndex = cart.findIndex((c) => c.id === cartItemId);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].unitPrice = unitPrice;
      updated[existingIndex].isWholesaleTierApplied = isWholesaleApplied;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: cartItemId,
          product,
          selectedVariant: variant,
          quantity,
          unitPrice,
          isWholesaleTierApplied: isWholesaleApplied
        }
      ]);
    }
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    const updated = cart.map((item) => {
      if (item.id === cartItemId) {
        // Recalculate wholesale tier rate
        let newUnitPrice = item.product.basePrice;
        let isWholesale = false;

        if (item.product.wholesalePriceRules.length > 0) {
          const rule = item.product.wholesalePriceRules.find(
            (r) => newQty >= r.minQty && (r.maxQty === undefined || newQty <= r.maxQty)
          );
          if (rule) {
            newUnitPrice = rule.pricePerUnit;
            if (newQty >= (item.product.wholesalePriceRules[1]?.minQty || 2)) {
              isWholesale = true;
            }
          }
        }

        const extra = item.selectedVariant ? item.selectedVariant.priceExtra : 0;
        return {
          ...item,
          quantity: newQty,
          unitPrice: newUnitPrice + extra,
          isWholesaleTierApplied: isWholesale
        };
      }
      return item;
    });
    setCart(updated);
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart(cart.filter((c) => c.id !== cartItemId));
  };

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    const cartSubtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartSubtotal })
      });

      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
        return true;
      } else {
        const errData = await res.json();
        setCouponError(errData.error || 'Invalid promo code');
        return false;
      }
    } catch (err) {
      setCouponError('Error validating promo code');
      return false;
    }
  };

  // Vendor / Admin Handlers
  const handleAddProduct = async (productData: Partial<Product>) => {
    // Reset category filter & search query so newly added product appears at top of storefront immediately
    setSelectedCategory('All');
    setSearchQuery('');

    const newProductTemp: Product = {
      id: `prod-${Date.now()}`,
      vendorId: productData.vendorId || 'v-admin',
      vendorName: productData.vendorName || 'E-Shop Direct',
      title: productData.title || 'New Published Product',
      slug: (productData.title || 'new-product').toLowerCase().replace(/\s+/g, '-'),
      category: productData.category || 'Electronic',
      subCategory: productData.subCategory || 'Accessories',
      description: productData.description || 'Verified product listing',
      images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'],
      rating: 5.0,
      reviewCount: 1,
      basePrice: Number(productData.basePrice) || 1000,
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
      deliveryTime: productData.deliveryTime || '2-3 Days',
      returnPolicy: productData.returnPolicy || '7 Days Replacement Warranty',
      returnTime: productData.returnTime || '7 Days',
      wholesalePriceRules: productData.wholesalePriceRules || [],
      variants: productData.variants && productData.variants.length > 0 ? productData.variants : [{ id: 'v1', colorName: 'Standard', size: 'Free Size', sku: 'SKU-001', stock: 50, priceExtra: 0 }],
      createdAt: new Date().toISOString()
    };

    // Prepend product locally for instantaneous UI response
    setProducts((prev) => [newProductTemp, ...prev]);

    // Send Automated Email Notification to Admin
    sendAdminEmailNotification('new_product', {
      title: newProductTemp.title,
      vendorName: newProductTemp.vendorName,
      category: newProductTemp.category,
      basePrice: newProductTemp.basePrice,
    });

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        const serverProd = await res.json();
        setProducts((prev) => [serverProd, ...prev.filter((p) => p.id !== newProductTemp.id)]);
      }
    } catch (err) {
      console.error('API call failed, maintaining local product insertion:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
        if (activeTrackerOrder?.id === orderId) {
          setActiveTrackerOrder(updatedOrder);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookOrderCourier = async (orderId: string, courierName: string, trackingId?: string) => {
    let prefix = 'TRK';
    if (courierName.toLowerCase().includes('steadfast')) prefix = 'STF';
    else if (courierName.toLowerCase().includes('pathao')) prefix = 'PTH';
    else if (courierName.toLowerCase().includes('redx')) prefix = 'REDX';
    else if (courierName.toLowerCase().includes('ecourier')) prefix = 'EC';
    else if (courierName.toLowerCase().includes('sundarban')) prefix = 'SDB';
    else if (courierName.toLowerCase().includes('paperfly')) prefix = 'PFL';

    const generatedTrk = trackingId || `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    let riderName = `${courierName} Agent`;
    let riderPhone = '+880 1711-223344';
    if (courierName.toLowerCase().includes('steadfast')) {
      riderName = 'Rahim Uddin (Steadfast Rider)';
      riderPhone = '+880 1812-445566';
    } else if (courierName.toLowerCase().includes('pathao')) {
      riderName = 'Tanvir Hossain (Pathao Express)';
      riderPhone = '+880 1819-998877';
    } else if (courierName.toLowerCase().includes('redx')) {
      riderName = 'Sajid Islam (RedX Agent)';
      riderPhone = '+880 1715-889900';
    }

    const courierDetails = {
      courierName,
      trackingId: generatedTrk,
      riderName,
      riderPhone
    };

    try {
      const res = await fetch(`/api/orders/${orderId}/courier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierDetails, status: 'In Delivery' })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
        if (activeTrackerOrder?.id === orderId) {
          setActiveTrackerOrder(updatedOrder);
        }
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, courierDetails, orderStatus: 'In Delivery' as OrderStatus } : o
          )
        );
      }
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, courierDetails, orderStatus: 'In Delivery' as OrderStatus } : o
        )
      );
    }
  };

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(p.category.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const cartSubtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Customer Mode: Full Dynamic Storefront */}
      {currentRole === 'customer' && (
        <CustomerStorefront
          themeConfig={themeConfig}
          banners={banners}
          products={products}
          buyerType={buyerType}
          vendorShops={vendorShops}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cart={cart}
          setSelectedDetailProduct={setSelectedDetailProduct}
          handleAddToCartQuick={handleAddToCartQuick}
          setSelectedShopForModal={setSelectedShopForModal}
          currentUser={currentUser}
          onOpenAuth={(mode) => {
            setAuthInitialMode(mode);
            setIsAuthModalOpen(true);
          }}
          onOpenSellerAuth={(mode) => {
            setSellerAuthInitialMode(mode);
            setIsSellerAuthOpen(true);
          }}
          handleLogout={handleLogout}
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          division={division}
          district={district}
          thana={thana}
          setIsLocationModalOpen={setIsLocationModalOpen}
          setIsCartOpen={setIsCartOpen}
          setIsOrderHistoryOpen={setIsOrderHistoryOpen}
          setIsSellerAuthOpen={setIsSellerAuthOpen}
        />
      )}

      {/* Admin or Vendor Mode: Render Navigation Header first, then Dashboard Panel */}
      {currentRole !== 'customer' && (
        <>
          <Header
            currentUser={currentUser}
            onOpenAuth={(mode) => {
              setAuthInitialMode(mode);
              setIsAuthModalOpen(true);
            }}
            onOpenSellerAuth={(mode) => {
              setSellerAuthInitialMode(mode);
              setIsSellerAuthOpen(true);
            }}
            onLogout={handleLogout}
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
            cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            selectedDivision={division}
            selectedDistrict={district}
            selectedThana={thana}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
            themeConfig={themeConfig}
            allProducts={products}
            onOpenProductDetail={setSelectedDetailProduct}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
            {currentRole === 'admin' && (
              <AdminPanel
                orders={orders}
                products={products}
                banners={banners}
                registeredUsers={registeredUsers}
                onUpdateRegisteredUsers={(updated) => setRegisteredUsers(updated)}
                onAddProduct={handleAddProduct}
                onDeleteProduct={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
                onDeleteOrder={(orderId) => setOrders((prev) => prev.filter((o) => o.id !== orderId))}
                onOpenInvoice={setActiveInvoiceOrder}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onBookCourier={handleBookOrderCourier}
                onSwitchToVendor={(sellerUser) => {
                  if (sellerUser) {
                    setCurrentUser(sellerUser);
                  }
                  setCurrentRole('vendor');
                }}
                onSwitchToUser={(user) => {
                  setCurrentUser(user);
                  setCurrentRole(user.role || 'customer');
                }}
                themeConfig={themeConfig}
                onSaveThemeConfig={handleSaveThemeConfig}
                onSaveBanners={handleSaveBanners}
                showToast={showToast}
              />
            )}

            {currentRole === 'vendor' && (
              <VendorPanel
                vendorUser={currentUser}
                products={products}
                orders={orders}
                onAddProduct={handleAddProduct}
                onDeleteProduct={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
                onOpenInvoice={setActiveInvoiceOrder}
              />
            )}
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-900 border border-amber-500/30 shrink-0 shadow-md">
                <img
                  src={brandLogo}
                  alt="A-TIDY Fashion Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white font-display block">
                  A-TIDY <span className="text-amber-500">FASHION</span>
                </span>
                <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">
                  Exclusive Modest Wear BD
                </span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Premium Modest Fashion, Hijab Collection & B2B Wholesale Platform in Bangladesh with nationwide fast delivery and verified invoice tracking.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-bold text-white uppercase text-[10px] tracking-wider">Payment Partners</p>
            <p className="text-[11px] text-slate-300">bKash Direct API • Nagad Direct API • SSLCommerz • COD</p>
            <p className="font-bold text-white uppercase text-[10px] tracking-wider pt-2">Delivery Coverage</p>
            <p className="text-[11px] text-slate-300">Inside Dhaka (৳60) • Outside Dhaka (৳120) • Thana Level (৳150)</p>
          </div>

          <div className="space-y-1">
            <p className="font-bold text-white uppercase text-[10px] tracking-wider">Support Center</p>
            <p className="text-[11px] text-slate-300">Hotline: 16212 (24/7 Support)</p>
            <p className="text-[11px] text-slate-300">Gulshan-1, Dhaka-1212, Bangladesh</p>
          </div>
        </div>

        {/* Prominent Seller Portal Section at Very Bottom */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800/80">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-amber-500/30 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg border border-amber-400/30">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-base sm:text-lg font-black text-white font-display">
                    Seller & Merchant Corner
                  </h4>
                  <span className="bg-amber-500/20 text-amber-400 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                    B2B Wholesale
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Sell your shop or brand products on Bangladesh's #1 wholesale merchant platform. Log in with your Seller ID or create a new seller account.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={() => {
                  setSellerAuthInitialMode('register');
                  setIsSellerAuthOpen(true);
                }}
                className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer border border-amber-400"
              >
                <UserPlus className="w-4 h-4" />
                <span>Seller Registration</span>
              </button>
              <button
                onClick={() => {
                  setSellerAuthInitialMode('login');
                  setIsSellerAuthOpen(true);
                }}
                className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Seller ID Log In</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}

      {/* Product Detail Modal */}
      {selectedDetailProduct && (
        <ProductDetailModal
          product={selectedDetailProduct}
          onClose={() => setSelectedDetailProduct(null)}
          onAddToCartWithVariant={handleAddToCartWithVariant}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        couponError={couponError}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cart}
          subtotal={cartSubtotal}
          discountAmount={appliedCoupon ? appliedCoupon.discountAmount : 0}
          promoCode={appliedCoupon?.code}
          buyerType={buyerType}
          defaultDivision={division}
          defaultDistrict={district}
          defaultThana={thana}
          currentUser={currentUser}
          onOrderSuccess={(createdOrder) => {
            setIsCheckoutOpen(false);
            setCart([]);
            setAppliedCoupon(null);
            setOrders([createdOrder, ...orders]);
            setActiveInvoiceOrder(createdOrder);
          }}
        />
      )}

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <LocationSelectorModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          selectedDivision={division}
          selectedDistrict={district}
          selectedThana={thana}
          onSaveLocation={(div, dist, th) => {
            setDivision(div);
            setDistrict(dist);
            setThana(th);
          }}
        />
      )}

      {/* Automated PDF / Printable Invoice Modal */}
      {activeInvoiceOrder && (
        <InvoiceModal
          order={activeInvoiceOrder}
          onClose={() => setActiveInvoiceOrder(null)}
          onTrackOrder={(ord) => {
            setActiveInvoiceOrder(null);
            setActiveTrackerOrder(ord);
          }}
        />
      )}

      {/* Live Order Tracker Modal */}
      {activeTrackerOrder && (
        <OrderTrackerModal
          order={activeTrackerOrder}
          onClose={() => setActiveTrackerOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onOpenInvoice={(ord) => {
            setActiveTrackerOrder(null);
            setActiveInvoiceOrder(ord);
          }}
        />
      )}

      {/* Customer Orders History Dialog */}
      {isOrderHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display">My Orders & Tracking</h3>
              <button
                onClick={() => setIsOrderHistoryOpen(false)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No order history found.</p>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                      <span className="bg-orange-100 text-orange-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {ord.orderStatus}
                      </span>
                    </div>

                    <p className="text-slate-600 font-medium">
                      {ord.items.length} item(s) • Total: ৳{ord.totalAmount.toLocaleString()} ({ord.paymentDetails.method.toUpperCase()})
                    </p>

                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => {
                          setIsOrderHistoryOpen(false);
                          setActiveTrackerOrder(ord);
                        }}
                        className="flex-1 bg-slate-900 hover:bg-orange-600 text-white font-bold py-1.5 rounded-xl text-[11px] cursor-pointer"
                      >
                        Track Order
                      </button>
                      <button
                        onClick={() => {
                          setIsOrderHistoryOpen(false);
                          setActiveInvoiceOrder(ord);
                        }}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-1.5 rounded-xl text-[11px] cursor-pointer"
                      >
                        View Invoice
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal (Log In / Registration) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        registeredUsers={registeredUsers}
        onRegisterUser={handleRegisterUser}
      />

      {/* Seller Portal Authentication Modal */}
      <SellerAuthModal
        isOpen={isSellerAuthOpen}
        initialMode={sellerAuthInitialMode}
        onClose={() => setIsSellerAuthOpen(false)}
        onSellerLoginSuccess={handleSellerLoginSuccess}
        onRegisterSellerUser={handleRegisterUser}
      />

      {/* Seller Shop Showcase Modal */}
      {selectedShopForModal && (
        <SellerShopModal
          isOpen={!!selectedShopForModal}
          shop={selectedShopForModal}
          shopProducts={products.filter(
            (p) =>
              p.vendorId === selectedShopForModal.id ||
              p.vendorName.toLowerCase().includes(selectedShopForModal.shopName.toLowerCase())
          )}
          onClose={() => setSelectedShopForModal(null)}
          onAddToCart={handleAddToCartQuick}
          onSelectProduct={setSelectedDetailProduct}
        />
      )}
      {/* Floating Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

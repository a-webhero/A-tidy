import React from 'react';
import { Header } from './Header';
import { BannerSlider } from './BannerSlider';
import { CategoryGrid } from './CategoryGrid';
import { ProductCard } from './ProductCard';
import { FlashDealsSection } from './FlashDealsSection';
import { ShopFlashCard } from './ShopFlashCard';
import { PromoBannersBlock } from './PromoBannersBlock';
import { CustomProductBlocksSection } from './CustomProductBlocksSection';
import { Footer } from './Footer';
import { Product, BuyerType, CartItem, BannerItem, ThemeConfig, UserRole } from '../types';
import { VendorShopInfo } from './SellerShopModal';
import { UserAccount } from './AuthModal';
import { Tag, Store } from 'lucide-react';

interface CustomerStorefrontProps {
  themeConfig: ThemeConfig;
  banners: BannerItem[];
  products: Product[];
  buyerType: BuyerType;
  vendorShops: VendorShopInfo[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cart: CartItem[];
  setSelectedDetailProduct: (p: Product) => void;
  handleAddToCartQuick: (p: Product) => void;
  setSelectedShopForModal: (shop: VendorShopInfo) => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenSellerAuth?: (mode: 'login' | 'register') => void;
  handleLogout: () => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  division: string;
  district: string;
  thana: string;
  setIsLocationModalOpen: (open: boolean) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsOrderHistoryOpen: (open: boolean) => void;
  setIsSellerAuthOpen: (open: boolean) => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({
  themeConfig,
  banners,
  products,
  buyerType,
  vendorShops,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  cart,
  setSelectedDetailProduct,
  handleAddToCartQuick,
  setSelectedShopForModal,
  currentUser,
  onOpenAuth,
  onOpenSellerAuth,
  handleLogout,
  currentRole,
  setCurrentRole,
  district,
  thana,
  setIsLocationModalOpen,
  setIsCartOpen,
  setIsOrderHistoryOpen,
  setIsSellerAuthOpen
}) => {
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(p.category.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const sortedSections = [...(themeConfig.sections || [])].sort((a, b) => a.order - b.order);

  const primaryColor = themeConfig?.primaryColor || '#f97316';
  const secondaryColor = themeConfig?.secondaryColor || '#0f172a';

  return (
    <div
      style={{
        backgroundColor: themeConfig?.backgroundColor || '#f8fafc',
        fontFamily: themeConfig?.fontFamily ? `'${themeConfig.fontFamily}', sans-serif` : undefined
      }}
      className="min-h-screen text-slate-800 flex flex-col transition-colors duration-300"
    >
      {/* Header Navigation */}
      <Header
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onOpenSellerAuth={onOpenSellerAuth}
        onLogout={handleLogout}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        selectedDivision=""
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

      {/* Main Dynamic Page Layout Sections */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-6 sm:space-y-8">
        {/* Wholesale Active Banner */}
        {buyerType === 'wholesale' && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm font-display">
                  Wholesale B2B Bulk Mode Active
                </h4>
                <p className="text-[11px] sm:text-xs text-blue-200">
                  Prices dynamically drop as quantity increases (e.g., 5-10 pcs @ ৳1,200 | 11+ pcs @ ৳1,100).
                </p>
              </div>
            </div>

            <span className="text-[10px] sm:text-xs bg-white/10 px-3 py-1 rounded-xl font-bold border border-white/20 shrink-0">
              Direct Factory Wholesale
            </span>
          </div>
        )}

        {/* Dynamic Section Ordering based on themeConfig.sections */}
        {sortedSections.map((sec) => {
          if (!sec.isVisible) return null;

          switch (sec.id) {
            case 'hero_slider':
              return <BannerSlider key={sec.id} banners={banners} />;

            case 'category_grid':
              return (
                <CategoryGrid
                  key={sec.id}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  themeConfig={themeConfig}
                />
              );

            case 'flash_deals':
              return (
                <FlashDealsSection
                  key={sec.id}
                  products={products}
                  buyerType={buyerType}
                  onOpenDetail={setSelectedDetailProduct}
                  onAddToCart={handleAddToCartQuick}
                />
              );

            case 'partner_shops':
              return (
                <div
                  key={sec.id}
                  style={{ backgroundColor: secondaryColor }}
                  className="rounded-3xl p-5 sm:p-6 border border-amber-500/30 text-white space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black font-display text-white flex items-center gap-2">
                        <Store className="w-5 h-5 text-amber-400" />
                        <span>Verified Partner Vendor Hubs</span>
                      </h3>
                      <p className="text-xs text-slate-300">
                        Browse official brand hubs and verified sellers across Bangladesh.
                      </p>
                    </div>
                    <span
                      style={{ backgroundColor: `${primaryColor}30`, color: primaryColor }}
                      className="border border-amber-500/30 font-bold px-3 py-1 rounded-full text-xs shrink-0"
                    >
                      {vendorShops.length} Partner Shops
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {vendorShops.map((shop) => {
                      const shopItemCount = products.filter(
                        (p) => p.vendorId === shop.id || p.vendorName.toLowerCase().includes(shop.shopName.toLowerCase())
                      ).length;

                      return (
                        <ShopFlashCard
                          key={shop.id}
                          shop={shop}
                          productCount={shopItemCount || 4}
                          onVisitShop={setSelectedShopForModal}
                          isInterleaved={false}
                        />
                      );
                    })}
                  </div>
                </div>
              );

            case 'promo_banners':
              return (
                <PromoBannersBlock
                  key={sec.id}
                  promoBanners={themeConfig.promoBanners}
                  themeConfig={themeConfig}
                />
              );

            case 'custom_blocks':
              return (
                <CustomProductBlocksSection
                  key={sec.id}
                  customBlocks={themeConfig.customBlocks}
                  products={products}
                  buyerType={buyerType}
                  onOpenDetail={setSelectedDetailProduct}
                  onAddToCart={handleAddToCartQuick}
                  cart={cart}
                  themeConfig={themeConfig}
                />
              );

            case 'product_grid':
              return (
                <div key={sec.id} className="space-y-4 my-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                        {selectedCategory === 'All' ? 'Featured Products Catalog' : `${selectedCategory} Products`}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Showing {filteredProducts.length} verified listings
                      </p>
                    </div>

                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{ color: primaryColor }}
                        className="text-xs font-bold hover:underline cursor-pointer"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {filteredProducts.map((product, index) => {
                      const shouldInsertShop = (index + 1) % 4 === 0 && vendorShops.length > 0;
                      const shopToInsert = shouldInsertShop
                        ? vendorShops[Math.floor(index / 4) % vendorShops.length]
                        : null;

                      const shopItemCount = shopToInsert
                        ? products.filter(
                            (p) =>
                              p.vendorId === shopToInsert.id ||
                              p.vendorName.toLowerCase().includes(shopToInsert.shopName.toLowerCase())
                          ).length
                        : 0;

                      return (
                        <React.Fragment key={product.id}>
                          <ProductCard
                            product={product}
                            buyerType={buyerType}
                            onOpenDetail={setSelectedDetailProduct}
                            onAddToCart={handleAddToCartQuick}
                            isInCart={cart.some((c) => c.product.id === product.id)}
                            themeConfig={themeConfig}
                          />

                          {shopToInsert && (
                            <ShopFlashCard
                              shop={shopToInsert}
                              productCount={shopItemCount || 4}
                              onVisitShop={setSelectedShopForModal}
                              isInterleaved={true}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Footer rendering if footer section is visible */}
      {sortedSections.some((s) => s.id === 'footer' && s.isVisible) && (
        <Footer
          themeConfig={themeConfig}
          onSelectCategory={setSelectedCategory}
          onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
          onOpenSellerAuth={(mode) => {
            setIsSellerAuthOpen(true);
            if (onOpenSellerAuth) onOpenSellerAuth(mode);
          }}
        />
      )}
    </div>
  );
};

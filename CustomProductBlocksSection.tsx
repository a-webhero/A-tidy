import React from 'react';
import { CustomProductBlockConfig, Product, BuyerType, ThemeConfig, CartItem } from '../types';
import { ProductCard } from './ProductCard';
import { ShoppingBag, Sparkles, Flame, Tag, ArrowRight } from 'lucide-react';

interface CustomProductBlocksSectionProps {
  customBlocks?: CustomProductBlockConfig[];
  products: Product[];
  buyerType: BuyerType;
  onOpenDetail: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  cart?: CartItem[];
  themeConfig?: ThemeConfig;
}

export const CustomProductBlocksSection: React.FC<CustomProductBlocksSectionProps> = ({
  customBlocks,
  products,
  buyerType,
  onOpenDetail,
  onAddToCart,
  cart = [],
  themeConfig
}) => {
  if (!customBlocks || customBlocks.length === 0) return null;

  const visibleBlocks = customBlocks.filter((b) => b.isVisible);
  if (visibleBlocks.length === 0) return null;

  const primaryColor = themeConfig?.primaryColor || '#f97316';
  const cardRadius = themeConfig?.cardRadius || '16px';

  return (
    <div className="space-y-8 my-6">
      {visibleBlocks.map((block) => {
        let blockProducts: Product[] = [];

        if (block.dataSource === 'automated') {
          const type = block.automatedType || 'latest';
          const clone = [...products];

          if (type === 'most_viewed') {
            blockProducts = clone.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          } else if (type === 'top_sales') {
            blockProducts = clone.sort((a, b) => (b.wholesalePriceRules.length || 0) - (a.wholesalePriceRules.length || 0));
          } else if (type === 'highest_discount') {
            blockProducts = clone.sort((a, b) => (b.discountAmount || 0) - (a.discountAmount || 0));
          } else {
            // latest
            blockProducts = clone.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
        } else if (block.dataSource === 'manual' && block.manualProductIds?.length) {
          blockProducts = products.filter((p) => block.manualProductIds?.includes(p.id));
        }

        // Fallback if empty
        if (blockProducts.length === 0) {
          blockProducts = products.slice(0, 4);
        }

        const displayProducts = blockProducts.slice(0, 8);
        const gridCols = block.columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

        return (
          <div
            key={block.id}
            style={{ borderRadius: cardRadius }}
            className="bg-white border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4"
          >
            {/* Block Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">
                    {block.title}
                  </h3>
                </div>
                {block.subtitle && (
                  <p className="text-xs text-slate-500 font-medium">{block.subtitle}</p>
                )}
              </div>

              <span className="text-xs font-bold text-slate-400">
                {displayProducts.length} Items
              </span>
            </div>

            {/* Block Content - Grid or Slider */}
            {block.layoutType === 'slider' ? (
              <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
                {displayProducts.map((prod) => (
                  <div key={prod.id} className="w-[180px] sm:w-[220px] shrink-0">
                    <ProductCard
                      product={prod}
                      buyerType={buyerType}
                      onOpenDetail={onOpenDetail}
                      onAddToCart={onAddToCart}
                      isInCart={cart.some((c) => c.product.id === prod.id)}
                      themeConfig={themeConfig}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid ${gridCols} gap-3 sm:gap-5`}>
                {displayProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    buyerType={buyerType}
                    onOpenDetail={onOpenDetail}
                    onAddToCart={onAddToCart}
                    isInCart={cart.some((c) => c.product.id === prod.id)}
                    themeConfig={themeConfig}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

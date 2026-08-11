import React from 'react';
import { Grid, Smartphone, Headphones, Laptop, Shirt, Sparkles, Coffee, Sofa, Watch, Tag, Tv, Glasses } from 'lucide-react';
import { ThemeConfig } from '../types';

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  themeConfig?: ThemeConfig;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onSelectCategory,
  themeConfig
}) => {
  const displayStyle = themeConfig?.categoryDisplayStyle || 'circle_icon';
  const primaryColor = themeConfig?.primaryColor || '#f97316';
  const buttonRadius = themeConfig?.buttonRadius || '12px';

  const defaultCategories = [
    { name: 'All', icon: Grid },
    { name: 'Electronic', icon: Smartphone },
    { name: 'Accessories', icon: Watch },
    { name: 'Headphone', icon: Headphones },
    { name: 'Laptop', icon: Laptop },
    { name: 'Fashion', icon: Shirt },
    { name: 'Beauty', icon: Sparkles },
    { name: 'Food & Drink', icon: Coffee },
    { name: 'Furniture', icon: Sofa }
  ];

  // If highlightedCategories is defined in themeConfig, filter or map accordingly
  const customList = themeConfig?.highlightedCategories && themeConfig.highlightedCategories.length > 0
    ? ['All', ...themeConfig.highlightedCategories]
    : defaultCategories.map(c => c.name);

  const categories = customList.map(catName => {
    const matched = defaultCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return {
      name: catName,
      icon: matched ? matched.icon : Tag
    };
  });

  return (
    <div className="space-y-3 my-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-base font-extrabold text-slate-900 font-display">
            Categories & Departments
          </h3>
          {selectedCategory !== 'All' && (
            <span
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
            >
              Filtered: {selectedCategory}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500 font-medium">Browse products by category</span>
      </div>

      {displayStyle === 'grid_box' ? (
        /* Box Grid Style */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5 sm:gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                style={{
                  borderRadius: buttonRadius,
                  borderColor: isSelected ? primaryColor : undefined,
                  backgroundColor: isSelected ? `${primaryColor}10` : '#ffffff'
                }}
                className={`flex flex-col items-center justify-center p-3 border transition-all cursor-pointer hover:shadow-md text-center group ${
                  isSelected ? 'shadow-md scale-102 font-black' : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  style={{
                    backgroundColor: isSelected ? primaryColor : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569'
                  }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-1.5 transition-colors group-hover:scale-110"
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold truncate max-w-full">{cat.name}</span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Circle Row Style */
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                style={{
                  borderRadius: '9999px',
                  backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155'
                }}
                className={`shrink-0 flex items-center space-x-2 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'shadow-md scale-102'
                    : 'border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div
                  style={{
                    backgroundColor: isSelected ? primaryColor : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569'
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate max-w-[120px]">{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};



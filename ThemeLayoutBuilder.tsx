import React, { useState, useEffect } from 'react';
import {
  Palette,
  Layout,
  Layers,
  Sliders,
  Type,
  Eye,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Globe,
  Upload,
  Image as ImageIcon,
  Zap,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Check,
  Smartphone,
  Monitor
} from 'lucide-react';
import { ThemeConfig, LayoutSectionConfig, CustomProductBlockConfig, PromoBannerItemConfig, Product } from '../types';
import { CustomerStorefront } from './CustomerStorefront';
import { INITIAL_BANNERS } from './BannerSlider';

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  primaryColor: '#f97316', // Orange-500
  secondaryColor: '#0f172a', // Slate-900
  backgroundColor: '#f8fafc',
  surfaceColor: '#ffffff',
  primaryTextColor: '#0f172a',
  secondaryTextColor: '#64748b',
  accentTextColor: '#ea580c',
  fontFamily: 'Plus Jakarta Sans',
  buttonRadius: '12px',
  cardRadius: '16px',
  categoryDisplayStyle: 'circle_icon',
  highlightedCategories: ['Electronics', 'Men Fashion', 'Women Fashion', 'Gadgets', 'Home Appliances'],
  lightLogoUrl: '',
  darkLogoUrl: '',
  showTopAnnouncement: true,
  announcementText: '🚀 Direct Wholesale & Retail Market Bangladesh • Fast Express Delivery!',
  announcementBgColor: '#f97316',
  enableLiveSearchSuggestions: true,
  searchBarPlacement: 'center',
  promoBanners: [
    {
      id: 'promo-1',
      title: '50% Flat Wholesale Offer',
      subtitle: 'On Selected Electronic Smart Gadgets',
      badge: 'LIMITED TIME',
      imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
      targetUrl: '#'
    },
    {
      id: 'promo-2',
      title: 'Premium Modesty Fashion',
      subtitle: 'Exclusive Three-Pieces & Sarees Collection',
      badge: 'NEW ARRIVAL',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
      targetUrl: '#'
    }
  ],
  customBlocks: [
    {
      id: 'block-trending',
      title: '🔥 Trending Wholesale Products',
      subtitle: 'Most viewed & fast moving items in Bangladesh market',
      dataSource: 'automated',
      automatedType: 'top_sales',
      layoutType: 'grid',
      columns: 4,
      isVisible: true
    },
    {
      id: 'block-discounted',
      title: '💥 Mega Flash Discounts',
      subtitle: 'Up to 60% off on premium original tech & fashion',
      dataSource: 'automated',
      automatedType: 'highest_discount',
      layoutType: 'slider',
      columns: 4,
      isVisible: true
    }
  ],
  facebookUrl: 'https://facebook.com',
  whatsappNumber: '01711223344',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com',
  showPaymentGateways: true,
  copyrightNotice: '© 2026 LuxeShop BD. All rights reserved. Powered by Wholesale BD Engine.',
  sections: [
    { id: 'top_announcement', title: 'Top Announcement Notice Bar', isVisible: true, order: 1 },
    { id: 'header_nav', title: 'Header & Main Search Navbar', isVisible: true, order: 2 },
    { id: 'hero_slider', title: '1. Hero Carousel Banner', isVisible: true, order: 3 },
    { id: 'category_grid', title: '2. All Categories Grid List', isVisible: true, order: 4 },
    { id: 'flash_deals', title: '3. Flash Card & Deals Section', isVisible: true, order: 5 },
    { id: 'product_grid', title: '4. All Products Catalog Grid', isVisible: true, order: 6 },
    { id: 'partner_shops', title: '5. Seller & Merchant Shops Grid', isVisible: true, order: 7 },
    { id: 'promo_banners', title: 'Offer Banners Block', isVisible: true, order: 8 },
    { id: 'custom_blocks', title: 'Dynamic Custom Collections', isVisible: true, order: 9 },
    { id: 'footer', title: 'Footer & Customer Care Details', isVisible: true, order: 10 }
  ]
};

export const THEME_PRESETS = [
  {
    name: 'Luxe Orange & Navy (Default)',
    config: {
      primaryColor: '#f97316',
      secondaryColor: '#0f172a',
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      fontFamily: 'Plus Jakarta Sans',
      buttonRadius: '12px' as const
    }
  },
  {
    name: 'Eid & Festival Gold Luxury',
    config: {
      primaryColor: '#d97706',
      secondaryColor: '#451a03',
      backgroundColor: '#fffbe3',
      surfaceColor: '#ffffff',
      fontFamily: 'Hind Siliguri',
      buttonRadius: '24px' as const
    }
  },
  {
    name: 'Black Friday Dark Gold',
    config: {
      primaryColor: '#eab308',
      secondaryColor: '#020617',
      backgroundColor: '#020617',
      surfaceColor: '#0f172a',
      fontFamily: 'Poppins',
      buttonRadius: '8px' as const
    }
  },
  {
    name: 'Minimal Corporate Blue',
    config: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e293b',
      backgroundColor: '#f1f5f9',
      surfaceColor: '#ffffff',
      fontFamily: 'Inter',
      buttonRadius: '8px' as const
    }
  },
  {
    name: 'E-commerce Emerald Green',
    config: {
      primaryColor: '#059669',
      secondaryColor: '#064e3b',
      backgroundColor: '#f0fdf4',
      surfaceColor: '#ffffff',
      fontFamily: 'Outfit',
      buttonRadius: '12px' as const
    }
  }
];

interface ThemeLayoutBuilderProps {
  themeConfig: ThemeConfig;
  products: Product[];
  categories: string[];
  onSaveThemeConfig: (updated: ThemeConfig) => void;
  showToast: (msg: string) => void;
}

export const ThemeLayoutBuilder: React.FC<ThemeLayoutBuilderProps> = ({
  themeConfig,
  products,
  categories,
  onSaveThemeConfig,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'layout' | 'blocks' | 'header_footer' | 'preview'>('style');
  const [config, setConfig] = useState<ThemeConfig>(themeConfig || DEFAULT_THEME_CONFIG);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (themeConfig) {
      setConfig(themeConfig);
    }
  }, [themeConfig]);

  const handleUpdate = <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    if (onSaveThemeConfig) {
      onSaveThemeConfig(updated);
    }
  };

  const handleApplyPreset = (presetConfig: Partial<ThemeConfig>) => {
    const updated = { ...config, ...presetConfig };
    setConfig(updated);
    if (onSaveThemeConfig) {
      onSaveThemeConfig(updated);
    }
    showToast('Theme preset applied live to website!');
  };

  const handleSaveDraft = () => {
    localStorage.setItem('luxeshop_theme_draft', JSON.stringify(config));
    showToast('Draft theme settings saved!');
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetKey: 'lightLogoUrl' | 'darkLogoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size is too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleUpdate(targetKey, event.target.result as string);
          showToast('Logo uploaded from device successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    onSaveThemeConfig(config);
    localStorage.setItem('luxeshop_theme_config', JSON.stringify(config));
    showToast('Theme & Page Layout Published Live!');
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...config.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    newSections.forEach((sec, idx) => {
      sec.order = idx + 1;
    });

    handleUpdate('sections', newSections);
  };

  const handleToggleSectionVisibility = (id: string) => {
    const newSections = config.sections.map((sec) =>
      sec.id === id ? { ...sec, isVisible: !sec.isVisible } : sec
    );
    handleUpdate('sections', newSections);
  };

  const handleAddCustomBlock = () => {
    const newBlock: CustomProductBlockConfig = {
      id: `block-${Date.now()}`,
      title: '✨ New Custom Collection',
      subtitle: 'Curated products for special buyers',
      dataSource: 'automated',
      automatedType: 'latest',
      layoutType: 'grid',
      columns: 4,
      isVisible: true
    };
    handleUpdate('customBlocks', [...config.customBlocks, newBlock]);
    showToast('New Custom Product Block created!');
  };

  const handleRemoveCustomBlock = (id: string) => {
    handleUpdate(
      'customBlocks',
      config.customBlocks.filter((b) => b.id !== id)
    );
    showToast('Block removed');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Presets Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950 rounded-3xl p-5 sm:p-6 text-white border border-orange-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-400" />
              <h2 className="text-lg sm:text-xl font-black font-display text-white">
                Theme & Layout Drag-and-Drop Builder
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Customize website colors, typography, section order, headers, footers, and live blocks in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleSaveDraft}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-2xl transition-all cursor-pointer border border-slate-700 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-slate-400" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={handlePublish}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Publish Changes Live</span>
            </button>
          </div>
        </div>

        {/* Presets Quick Picker */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="font-extrabold text-amber-400 shrink-0">Theme Presets:</span>
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset.config)}
              className="bg-slate-950/80 hover:bg-orange-950/60 text-slate-200 border border-slate-700 hover:border-amber-400 px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span
                className="w-3 h-3 rounded-full border border-white/40 inline-block"
                style={{ backgroundColor: preset.config.primaryColor }}
              />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-xs text-xs font-black">
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'style'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>1. Color & Style</span>
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'layout'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Layout Reordering</span>
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'blocks'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>3. Custom Blocks</span>
        </button>

        <button
          onClick={() => setActiveTab('header_footer')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'header_footer'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>4. Header & Footer</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'preview'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>5. Live Preview</span>
        </button>
      </div>

      {/* TAB 1: COLOR & STYLE EDITOR */}
      {activeTab === 'style' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Palette Controls */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
              <Palette className="w-5 h-5 text-orange-500" />
              <span>Color Palette Manager</span>
            </h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-slate-700 block mb-1">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => handleUpdate('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => handleUpdate('primaryColor', e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold uppercase w-32"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">Used in CTA buttons & badges</span>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => handleUpdate('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={config.secondaryColor}
                    onChange={(e) => handleUpdate('secondaryColor', e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold uppercase w-32"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">Used in top bar & hero text</span>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold uppercase w-32"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">
                  Surface / Card Background Color
                </label>                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.surfaceColor}
                    onChange={(e) => handleUpdate('surfaceColor', e.target.value)}
                    className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={config.surfaceColor}
                    onChange={(e) => handleUpdate('surfaceColor', e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold uppercase w-32"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Corner Radius Controls */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
              <Type className="w-5 h-5 text-orange-500" />
              <span>Typography & Corner Radius</span>
            </h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-slate-700 block mb-1">Google Font Family</label>
                <select
                  value={config.fontFamily}
                  onChange={(e) => handleUpdate('fontFamily', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                  <option value="Inter">Inter (Standard Modern UI)</option>
                  <option value="Poppins">Poppins (Geometric Round)</option>
                  <option value="Hind Siliguri">Hind Siliguri (Bengali High Clarity)</option>
                  <option value="Outfit">Outfit (Luxury Fashion)</option>
                  <option value="Roboto">Roboto (Classic Material)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Button Corner Radius</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Square (0px)', val: '0px' },
                    { label: 'Small (8px)', val: '8px' },
                    { label: 'Medium (12px)', val: '12px' },
                    { label: 'Pill (24px)', val: '24px' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => handleUpdate('buttonRadius', item.val as any)}
                      className={`p-2.5 rounded-xl border font-extrabold text-[11px] text-center transition-all cursor-pointer ${
                        config.buttonRadius === item.val
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Product Card Corner Radius</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Sharp (8px)', val: '8px' },
                    { label: 'Rounded (16px)', val: '16px' },
                    { label: 'Extra Rounded (24px)', val: '24px' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => handleUpdate('cardRadius', item.val as any)}
                      className={`p-2.5 rounded-xl border font-extrabold text-[11px] text-center transition-all cursor-pointer ${
                        config.cardRadius === item.val
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Live Component Box */}
              <div className="pt-2 border-t">
                <span className="text-[11px] text-slate-400 block mb-2 font-bold">Live Button & Card Preview:</span>
                <div
                  className="p-4 border border-slate-200 bg-slate-50 space-y-3"
                  style={{ borderRadius: config.cardRadius, fontFamily: config.fontFamily }}
                >
                  <p className="font-extrabold text-slate-900 text-sm">
                    {config.fontFamily} Font Preview
                  </p>
                  <button
                    className="text-white font-extrabold px-5 py-2.5 text-xs shadow-md transition-all cursor-pointer"
                    style={{ backgroundColor: config.primaryColor, borderRadius: config.buttonRadius }}
                  >
                    Sample Add to Cart Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAGE & LAYOUT REORDERING BUILDER */}
      {activeTab === 'layout' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-500" />
                <span>Homepage Section Drag & Position Manager</span>
              </h3>
              <p className="text-xs text-slate-500">
                Use Up/Down controls to rearrange sections or turn visibility ON/OFF.
              </p>
            </div>
            <span className="bg-orange-50 text-orange-700 border border-orange-200 font-extrabold text-xs px-3 py-1 rounded-full shrink-0">
              {config.sections.filter((s) => s.isVisible).length} Active Sections
            </span>
          </div>

          <div className="space-y-3">
            {config.sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  section.isVisible
                    ? 'bg-slate-50/80 border-slate-200 shadow-xs'
                    : 'bg-slate-100/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-800 font-black text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{section.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      ID: <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">{section.id}</code>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <div className="flex items-center space-x-1 border-r pr-2 mr-1 border-slate-300">
                    <button
                      onClick={() => handleMoveSection(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(index, 'down')}
                      disabled={index === config.sections.length - 1}
                      className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleSectionVisibility(section.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                      section.isVisible
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {section.isVisible ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM WIDGETS & BLOCKS */}
      {activeTab === 'blocks' && (
        <div className="space-y-6">
          {/* Category Display Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-500" />
              <span>Dynamic Category Block Style & Selection</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              <div>
                <label className="text-slate-700 block mb-2">Category Display Layout Style</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleUpdate('categoryDisplayStyle', 'circle_icon')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      config.categoryDisplayStyle === 'circle_icon'
                        ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-extrabold block">Option A: Circle Icon</span>
                    <span className="text-[11px] text-slate-500 block font-normal">
                      Round icon circles with horizontal scrolling
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdate('categoryDisplayStyle', 'grid_box')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      config.categoryDisplayStyle === 'grid_box'
                        ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-extrabold block">Option B: Grid Box</span>
                    <span className="text-[11px] text-slate-500 block font-normal">
                      Square card grids with image backgrounds
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-2">Homepage Highlighted Categories Mapper</label>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-2xl p-2.5 bg-slate-50 space-y-1">
                  {categories.map((cat) => {
                    const isSelected = config.highlightedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className="flex items-center justify-between p-1.5 hover:bg-white rounded-xl cursor-pointer text-xs font-extrabold"
                      >
                        <span>{cat}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleUpdate('highlightedCategories', [...config.highlightedCategories, cat]);
                            } else {
                              handleUpdate(
                                'highlightedCategories',
                                config.highlightedCategories.filter((c) => c !== cat)
                              );
                            }
                          }}
                          className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Product Collection Blocks */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  <span>Custom Product Collection Blocks</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Add dynamic showcase sections like "Trending Products", "Wholesale Savings", or "Top Discounted".
                </p>
              </div>

              <button
                onClick={handleAddCustomBlock}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Collection Block</span>
              </button>
            </div>

            <div className="space-y-4">
              {config.customBlocks.map((block, idx) => (
                <div
                  key={block.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 relative text-xs font-bold"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      Block #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveCustomBlock(block.id)}
                      className="text-rose-600 hover:text-rose-800 font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-700 block mb-1">Block Headline Title *</label>
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => {
                          const updated = [...config.customBlocks];
                          updated[idx].title = e.target.value;
                          handleUpdate('customBlocks', updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1">Subtitle / Short Note</label>
                      <input
                        type="text"
                        value={block.subtitle}
                        onChange={(e) => {
                          const updated = [...config.customBlocks];
                          updated[idx].subtitle = e.target.value;
                          handleUpdate('customBlocks', updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1">Automated Data Source Filter</label>
                      <select
                        value={block.automatedType || 'top_sales'}
                        onChange={(e) => {
                          const updated = [...config.customBlocks];
                          updated[idx].automatedType = e.target.value as any;
                          handleUpdate('customBlocks', updated);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                      >
                        <option value="top_sales">Top Sales & Best Sellers</option>
                        <option value="highest_discount">Highest Discount Offers</option>
                        <option value="latest">Latest Added Products</option>
                        <option value="most_viewed">Most Viewed Items</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HEADER & FOOTER CUSTOMIZER */}
      {activeTab === 'header_footer' && (
        <div className="space-y-6">
          {/* Logo & Brand Identity Customizer */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              <span>Logo & Brand Identity Options</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              {/* Primary Logo Card with Device Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <span>Website Main Logo</span>
                  </label>
                  {config.lightLogoUrl && (
                    <button
                      type="button"
                      onClick={() => handleUpdate('lightLogoUrl', '')}
                      className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Upload from Device Button */}
                <div>
                  <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-black text-xs shadow-xs transition-all text-center">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoFileUpload(e, 'lightLogoUrl')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1 text-center font-medium">
                    Supports PNG, JPG, WEBP, SVG (Max 5MB)
                  </p>
                </div>

                {/* Alternatively Image URL */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block mb-1">
                    Or Enter Image URL
                  </span>
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={config.lightLogoUrl || ''}
                    onChange={(e) => handleUpdate('lightLogoUrl', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                  />
                </div>

                {/* Live Preview Box */}
                {config.lightLogoUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      <img
                        src={config.lightLogoUrl}
                        alt="Website Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-slate-800 font-extrabold block text-xs">Live Header Logo Active</span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Displaying on website
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dark Mode Logo Card with Device Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    <span>Dark Mode Logo (Optional)</span>
                  </label>
                  {config.darkLogoUrl && (
                    <button
                      type="button"
                      onClick={() => handleUpdate('darkLogoUrl', '')}
                      className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Upload from Device Button */}
                <div>
                  <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black text-xs shadow-xs transition-all text-center">
                    <Upload className="w-4 h-4" />
                    <span>Upload Dark Logo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoFileUpload(e, 'darkLogoUrl')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1 text-center font-medium">
                    Supports PNG, JPG, WEBP, SVG (Max 5MB)
                  </p>
                </div>

                {/* Alternatively Image URL */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block mb-1">
                    Or Enter Dark Logo URL
                  </span>
                  <input
                    type="text"
                    placeholder="https://example.com/dark-logo.png"
                    value={config.darkLogoUrl || ''}
                    onChange={(e) => handleUpdate('darkLogoUrl', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                  />
                </div>

                {/* Live Preview Box */}
                {config.darkLogoUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-2xs">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      <img
                        src={config.darkLogoUrl}
                        alt="Dark Mode Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-white font-extrabold block text-xs">Dark Mode Logo Active</span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Website Brand Title</label>
                <input
                  type="text"
                  placeholder="e.g. LuxeShop"
                  value={config.siteTitle || 'LuxeShop'}
                  onChange={(e) => handleUpdate('siteTitle', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Title Accent Suffix</label>
                <input
                  type="text"
                  placeholder="e.g. BD or Fashion"
                  value={config.siteTitleSuffix || 'BD'}
                  onChange={(e) => handleUpdate('siteTitleSuffix', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-700 block mb-1">Brand Tagline / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Wholesale & Retail Market Bangladesh"
                  value={config.siteTagline || 'Wholesale & Retail Market'}
                  onChange={(e) => handleUpdate('siteTagline', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Header & Navbar Customizer */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              <span>Header & Search Bar Options</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={config.showTopAnnouncement}
                    onChange={(e) => handleUpdate('showTopAnnouncement', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                  />
                  <span>Show Top Header Announcement Marquee Bar</span>
                </label>

                <div>
                  <label className="text-slate-700 block mb-1">Announcement Notice Text</label>
                  <input
                    type="text"
                    value={config.announcementText}
                    onChange={(e) => handleUpdate('announcementText', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1">Announcement Bar Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.announcementBgColor || '#f97316'}
                      onChange={(e) => handleUpdate('announcementBgColor', e.target.value)}
                      className="w-10 h-9 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.announcementBgColor || '#f97316'}
                      onChange={(e) => handleUpdate('announcementBgColor', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold uppercase w-32"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={config.enableLiveSearchSuggestions}
                    onChange={(e) => handleUpdate('enableLiveSearchSuggestions', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                  />
                  <span>Enable Live Auto-Suggestion Search Bar</span>
                </label>

                <div>
                  <label className="text-slate-700 block mb-1">Search Bar Placeholder Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Search gadgets, smartphones, wholesale..."
                    value={config.searchPlaceholder || 'Search gadgets, smartphones, wholesale...'}
                    onChange={(e) => handleUpdate('searchPlaceholder', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1">Search Bar Placement</label>
                  <select
                    value={config.searchBarPlacement}
                    onChange={(e) => handleUpdate('searchBarPlacement', e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="center">Center Prominent Search Bar</option>
                    <option value="top_right">Top Right Search</option>
                    <option value="compact">Compact Search Icon</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Information & Contact Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              <span>Footer Company Info & Contact Options</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold">
              <div>
                <label className="text-slate-700 block mb-1">Footer Brand Title</label>
                <input
                  type="text"
                  placeholder="e.g. LuxeShop BD"
                  value={config.footerAboutTitle || 'LuxeShop BD'}
                  onChange={(e) => handleUpdate('footerAboutTitle', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Helpline Phone Number</label>
                <input
                  type="text"
                  placeholder="01711223344"
                  value={config.supportPhone || config.whatsappNumber || '01711223344'}
                  onChange={(e) => handleUpdate('supportPhone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Support Email Address</label>
                <input
                  type="text"
                  placeholder="support@luxeshopbd.com"
                  value={config.supportEmail || 'support@luxeshopbd.com'}
                  onChange={(e) => handleUpdate('supportEmail', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="text-slate-700 block mb-1">Footer About Us / Company Description</label>
                <textarea
                  rows={2}
                  value={config.footerAboutText || "Bangladesh's leading multi-vendor wholesale & retail e-commerce portal. Discover genuine smartphones, gadgets, apparel, and lifestyle items at factory rates."}
                  onChange={(e) => handleUpdate('footerAboutText', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Store / Office Address</label>
                <input
                  type="text"
                  placeholder="Dhaka, Bangladesh"
                  value={config.storeAddress || 'Dhaka, Bangladesh'}
                  onChange={(e) => handleUpdate('storeAddress', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Working Hours</label>
                <input
                  type="text"
                  placeholder="Daily: 9:00 AM - 11:00 PM"
                  value={config.workingHours || 'Daily: 9:00 AM - 11:00 PM'}
                  onChange={(e) => handleUpdate('workingHours', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Facebook Page Link</label>
                <input
                  type="text"
                  value={config.facebookUrl}
                  onChange={(e) => handleUpdate('facebookUrl', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">WhatsApp Support Number</label>
                <input
                  type="text"
                  value={config.whatsappNumber}
                  onChange={(e) => handleUpdate('whatsappNumber', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Instagram Link</label>
                <input
                  type="text"
                  value={config.instagramUrl}
                  onChange={(e) => handleUpdate('instagramUrl', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">YouTube Channel Link</label>
                <input
                  type="text"
                  value={config.youtubeUrl || 'https://youtube.com'}
                  onChange={(e) => handleUpdate('youtubeUrl', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3 border-t pt-3 mt-1">
                <h4 className="font-black text-slate-800 text-xs mb-3">Footer Value Badges Text</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Fast Shipping Text</label>
                    <input
                      type="text"
                      value={config.footerFastShippingText || 'Dhaka ৳60 • Outside ৳120'}
                      onChange={(e) => handleUpdate('footerFastShippingText', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Genuine Warranty Text</label>
                    <input
                      type="text"
                      value={config.footerGenuineWarrantyText || 'Official Brand Warranty'}
                      onChange={(e) => handleUpdate('footerGenuineWarrantyText', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Wholesale Rate Text</label>
                    <input
                      type="text"
                      value={config.footerWholesaleBadgeText || 'Direct Manufacturer Price'}
                      onChange={(e) => handleUpdate('footerWholesaleBadgeText', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Return Policy Text</label>
                    <input
                      type="text"
                      value={config.footerReturnPolicyText || 'Hassle-Free Replacement'}
                      onChange={(e) => handleUpdate('footerReturnPolicyText', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 md:col-span-3 border-t pt-3">
                <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-3">
                  <input
                    type="checkbox"
                    checked={config.showPaymentGateways}
                    onChange={(e) => handleUpdate('showPaymentGateways', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                  />
                  <span>Show bKash, Nagad, Rocket, SSLCommerz Logos in Footer</span>
                </label>

                <label className="text-slate-700 block mb-1">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={config.copyrightNotice}
                  onChange={(e) => handleUpdate('copyrightNotice', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REAL-TIME INTERACTIVE SPLIT-SCREEN PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-amber-400" />
              <span className="font-extrabold text-sm">Real-Time Interactive Live Preview Screen</span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-orange-500 text-white' : 'text-slate-400'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Desktop View</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-orange-500 text-white' : 'text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile View</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div
              className={`border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all ${
                previewDevice === 'mobile' ? 'w-[380px] max-h-[750px] overflow-y-auto' : 'w-full max-w-5xl max-h-[800px] overflow-y-auto'
              }`}
            >
              <CustomerStorefront
                themeConfig={config}
                banners={INITIAL_BANNERS}
                products={products}
                buyerType="retail"
                vendorShops={[]}
                selectedCategory="All"
                setSelectedCategory={() => {}}
                searchQuery=""
                setSearchQuery={() => {}}
                cart={[]}
                setSelectedDetailProduct={() => {}}
                handleAddToCartQuick={() => {}}
                setSelectedShopForModal={() => {}}
                currentUser={null}
                onOpenAuth={() => {}}
                handleLogout={() => {}}
                currentRole="customer"
                setCurrentRole={() => {}}
                division="Dhaka"
                district="Dhaka"
                thana="Mirpur"
                setIsLocationModalOpen={() => {}}
                setIsCartOpen={() => {}}
                setIsOrderHistoryOpen={() => {}}
                setIsSellerAuthOpen={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

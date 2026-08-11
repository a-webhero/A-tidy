import React, { useState, useEffect } from 'react';
import {
  Plus,
  Package,
  DollarSign,
  ShoppingBag,
  Tag,
  Check,
  Trash2,
  FileText,
  ArrowUpRight,
  Store,
  Upload,
  Sparkles,
  Edit2,
  Settings,
  Phone,
  MessageSquare,
  MapPin,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Percent,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Product, Order, OrderStatus, ProductVariant, WholesaleTierRule } from '../types';
import { UserAccount } from './AuthModal';
import { VendorShopInfo } from './SellerShopModal';
import { sendAdminEmailNotification } from './adminEmailService';
interface VendorPanelProps {
  currentUser?: UserAccount | null;
  products: Product[];
  orders: Order[];
  vendorShop?: VendorShopInfo;
  onAddProduct: (prod: Partial<Product>) => void;
  onUpdateProduct?: (prod: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onUpdateShopInfo?: (updatedShop: VendorShopInfo) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onOpenInvoice: (order: Order) => void;
}

export const VendorPanel: React.FC<VendorPanelProps> = ({
  currentUser,
  products,
  orders,
  vendorShop,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateShopInfo,
  onUpdateOrderStatus,
  onOpenInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'new-product' | 'shop-setup'>('overview');

  // Active Product Editing State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // New/Edit Product Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [subCategory, setSubCategory] = useState('Modest Wear');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState<number>(1500);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountAmount, setDiscountAmount] = useState<number>(10);
  const [isFlashSale, setIsFlashSale] = useState<boolean>(false);
  const [flashBadge, setFlashBadge] = useState<string>('HOT SALE');
  const [deliveryTime, setDeliveryTime] = useState<string>('24-48 Hours');
  const [returnPolicy, setReturnPolicy] = useState<string>('7 Days Replacement Guarantee');

  // Wholesale Rules State
  const [wholesaleRules, setWholesaleRules] = useState<WholesaleTierRule[]>([
    { minQty: 1, maxQty: 4, pricePerUnit: 1500 },
    { minQty: 5, maxQty: 10, pricePerUnit: 1200 },
    { minQty: 11, pricePerUnit: 1100 }
  ]);

  // Variant Manager State
  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: 'v1', colorName: 'Black', colorHex: '#000000', size: 'Free Size', sku: 'SKU-001', stock: 50, priceExtra: 0 },
    { id: 'v2', colorName: 'Maroon', colorHex: '#800000', size: 'XL', sku: 'SKU-002', stock: 30, priceExtra: 200 }
  ]);

  // SHOP CUSTOMIZATION FORM STATE
  const [shopName, setShopName] = useState(vendorShop?.shopName || currentUser?.name || 'A-TIDY Fashion BD');
  const [ownerName, setOwnerName] = useState(vendorShop?.ownerName || currentUser?.name || 'Sajjad Hossain');
  const [phone, setPhone] = useState(vendorShop?.phone || currentUser?.phone || '01800000000');
  const [whatsapp, setWhatsapp] = useState(vendorShop?.whatsapp || currentUser?.phone || '01800000000');
  const [email, setEmail] = useState(vendorShop?.email || currentUser?.email || 'seller@atidyfashion.bd');
  const [logo, setLogo] = useState(vendorShop?.logo || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80');
  const [banner, setBanner] = useState(vendorShop?.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80');
  const [shopDesc, setShopDesc] = useState(vendorShop?.description || 'Top verified merchant in Bangladesh providing premium clothing & lifestyle items.');
  const [address, setAddress] = useState(vendorShop?.address || 'Level 4, Jamuna Future Park, Dhaka');
  const [notice, setNotice] = useState(vendorShop?.notice || '🎉 Free express delivery on orders with 3+ items!');
  const [facebook, setFacebook] = useState(vendorShop?.facebook || 'facebook.com/atidyfashionbd');
  const [instagram, setInstagram] = useState(vendorShop?.instagram || 'instagram.com/atidyfashionbd');

  const [shopSaveSuccess, setShopSaveSuccess] = useState<string | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (vendorShop) {
      setShopName(vendorShop.shopName);
      setOwnerName(vendorShop.ownerName);
      setPhone(vendorShop.phone);
      if (vendorShop.whatsapp) setWhatsapp(vendorShop.whatsapp);
      if (vendorShop.email) setEmail(vendorShop.email);
      if (vendorShop.logo) setLogo(vendorShop.logo);
      if (vendorShop.banner) setBanner(vendorShop.banner);
      if (vendorShop.description) setShopDesc(vendorShop.description);
      if (vendorShop.address) setAddress(vendorShop.address);
      if (vendorShop.notice) setNotice(vendorShop.notice);
      if (vendorShop.facebook) setFacebook(vendorShop.facebook);
      if (vendorShop.instagram) setInstagram(vendorShop.instagram);
    }
  }, [vendorShop]);

  // Current Seller's Products & Orders
  const currentSellerName = shopName || currentUser?.name || 'Apple Official BD Hub';
  const myProducts = products.filter(
    (p) =>
      p.vendorId === currentUser?.phone ||
      p.vendorName.toLowerCase().includes(currentSellerName.toLowerCase()) ||
      p.vendorName === 'Apple Official BD Hub' ||
      p.vendorName === 'A-TIDY Fashion BD'
  );

  const vendorOrders = orders.filter(
    (o) =>
      o.vendorId === currentUser?.phone ||
      o.vendorName.toLowerCase().includes(currentSellerName.toLowerCase()) ||
      true // show orders
  );

  const totalVendorRevenue = vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommissionDeducted = Math.round(totalVendorRevenue * 0.05);
  const netWalletBalance = Math.max(0, totalVendorRevenue - totalCommissionDeducted);

  // Computed discount selling price
  const calculatedDiscountPrice =
    discountType === 'percent'
      ? Math.round(basePrice * (1 - discountAmount / 100))
      : Math.max(0, basePrice - discountAmount);

  // Image Upload Handler
  const handleProductImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const imgData = evt.target.result as string;
          setImagesList((prev) => [...prev, imgData]);
          if (!imageUrl) setImageUrl(imgData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrlToList = () => {
    if (imageUrl.trim()) {
      setImagesList((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  // Shop Logo / Banner Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) setLogo(evt.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) setBanner(evt.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Shop Customization
  const handleSaveShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: VendorShopInfo = {
      id: vendorShop?.id || currentUser?.phone || `vendor-${Date.now()}`,
      shopName,
      ownerName,
      phone,
      whatsapp,
      email,
      logo,
      banner,
      description: shopDesc,
      address,
      notice,
      facebook,
      instagram,
      rating: vendorShop?.rating || 4.9,
      reviewCount: vendorShop?.reviewCount || 120,
      totalSales: totalVendorRevenue,
      isVerified: true
    };

    if (onUpdateShopInfo) {
      onUpdateShopInfo(updated);
    }
    setShopSaveSuccess('Shop customization settings saved & updated successfully!');
    setTimeout(() => setShopSaveSuccess(null), 3000);
  };

  // Edit Product Setup
  const handleStartEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setTitle(prod.title);
    setCategory(prod.category);
    setSubCategory(prod.subCategory || 'General');
    setDescription(prod.description);
    setImagesList(prod.images || []);
    setImageUrl(prod.images[0] || '');
    setBasePrice(prod.basePrice);
    setDiscountAmount(prod.discountAmount || 0);
    setDiscountType(prod.discountType || 'percent');
    setIsFlashSale(!!prod.isFlashSale);
    setFlashBadge(prod.flashBadge || 'HOT SALE');
    setDeliveryTime(prod.deliveryTime || '24-48 Hours');
    setReturnPolicy(prod.returnPolicy || '7 Days Replacement Guarantee');
    setWholesaleRules(prod.wholesalePriceRules || []);
    setVariants(prod.variants || []);

    setActiveTab('new-product');
  };

  // Create or Update Product
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = imagesList.length > 0 ? imagesList : imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'];

    if (!title.trim()) {
      alert('Product title is required');
      return;
    }

    const prodPayload: Partial<Product> = {
      id: editingProductId || undefined,
      vendorId: currentUser?.phone || 'vendor-apple-store',
      vendorName: shopName || 'A-TIDY Partner Merchant',
      title: title.trim(),
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      category,
      subCategory,
      description: description.trim(),
      images: finalImages,
      basePrice,
      discountType,
      discountAmount,
      discountPrice: calculatedDiscountPrice,
      isFlashSale,
      flashBadge,
      deliveryTime,
      returnPolicy,
      isWholesaleAvailable: wholesaleRules.length > 0,
      wholesalePriceRules: wholesaleRules,
      variants
    };

    if (editingProductId && onUpdateProduct) {
      onUpdateProduct(prodPayload as Product);
      alert('Product updated successfully!');
    } else {
      onAddProduct(prodPayload);

      // Send Automated Admin Email Notification
      sendAdminEmailNotification('new_product', {
        title: title.trim(),
        vendorName: shopName || 'Vendor Merchant',
        category,
        basePrice,
      });

      alert('New product published to storefront successfully!');
    }

    // Reset Form
    setEditingProductId(null);
    setTitle('');
    setDescription('');
    setImagesList([]);
    setImageUrl('');
    setActiveTab('products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-4">
          <img
            src={logo}
            alt={shopName}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/80 shadow-lg bg-white shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">{shopName}</h2>
              <span className="bg-amber-500/20 text-amber-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Seller ID Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Owner: <strong className="text-white">{ownerName}</strong> ({phone}) • Balance: <strong className="text-amber-400">৳{netWalletBalance.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="bg-slate-800/90 p-1 rounded-2xl flex items-center text-xs font-bold overflow-x-auto gap-1 border border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-300 hover:text-white'
            }`}
          >
            My Products ({myProducts.length})
          </button>
          <button
            onClick={() => {
              setEditingProductId(null);
              setTitle('');
              setDescription('');
              setImagesList([]);
              setActiveTab('new-product');
            }}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'new-product' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Fulfillments ({vendorOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('shop-setup')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1 ${
              activeTab === 'shop-setup' ? 'bg-amber-400 text-slate-950 shadow-md font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Shop Customization</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Shop Sales</span>
              <p className="text-2xl font-black text-slate-900 font-display">
                ৳{totalVendorRevenue.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold">+22.4% this month</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Platform Commission Fee (5%)</span>
              <p className="text-2xl font-black text-rose-600 font-display">
                -৳{totalCommissionDeducted.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Automatic deduction</p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white p-5 rounded-3xl shadow-lg space-y-1 border border-amber-500/20">
              <span className="text-[10px] font-bold uppercase text-slate-400">Net Wallet Balance</span>
              <p className="text-2xl font-black text-amber-400 font-display">
                ৳{netWalletBalance.toLocaleString()}
              </p>
              <button
                onClick={() => alert('Withdrawal request sent to Admin! Payout via bKash / Bank within 24 hours.')}
                className="text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-xl transition-all cursor-pointer mt-1"
              >
                Withdraw Balance (bKash / Bank)
              </button>
            </div>
          </div>

          {/* Banner Promo Card for Shop Customization */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-black text-lg font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Customize Your Shop Page</span>
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                Set your shop logo, cover banner, WhatsApp contact details, and special offer notice to attract customers.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('shop-setup')}
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs px-5 py-2.5 rounded-2xl shrink-0 transition-all shadow-md cursor-pointer border border-amber-400/40"
            >
              Shop Customization
            </button>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-black text-slate-900 font-display">Recent Customer Orders</h3>
            <div className="divide-y divide-slate-100">
              {vendorOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900">{ord.customerName} ({ord.orderNumber})</p>
                    <p className="text-[11px] text-slate-500">
                      Phone: {ord.customerPhone} • {ord.items.length} item(s) • Total: <strong className="text-orange-600">৳{ord.totalAmount.toLocaleString()}</strong>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      {ord.orderStatus}
                    </span>
                    <button
                      onClick={() => onOpenInvoice(ord)}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-xl font-bold cursor-pointer transition-all"
                    >
                      Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">My Published Products ({myProducts.length})</h3>
              <p className="text-xs text-slate-500">All products active on main website marketplace</p>
            </div>
            <button
              onClick={() => {
                setEditingProductId(null);
                setTitle('');
                setDescription('');
                setImagesList([]);
                setActiveTab('new-product');
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myProducts.map((p) => {
              const finalPrice = p.discountPrice || p.basePrice;

              return (
                <div key={p.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex flex-col justify-between space-y-3 relative">
                  <div className="flex gap-3">
                    <img src={p.images[0]} className="w-20 h-20 rounded-xl object-cover bg-white border border-slate-200 shrink-0" alt="" />
                    <div className="truncate flex-1">
                      <span className="text-[10px] font-bold text-orange-600 uppercase">{p.category}</span>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{p.title}</h4>
                      <p className="text-xs font-black text-slate-900 mt-1">
                        ৳{finalPrice.toLocaleString()}{' '}
                        {p.discountPrice && <span className="text-[10px] text-slate-400 line-through font-normal">৳{p.basePrice.toLocaleString()}</span>}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Variants: {p.variants?.length || 1} • Wholesale: {p.wholesalePriceRules?.length > 0 ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleStartEditProduct(p)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 p-1.5 rounded-lg font-bold flex items-center space-x-1 cursor-pointer text-[11px]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      {onDeleteProduct && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${p.title}"?`)) onDeleteProduct(p.id);
                          }}
                          className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RICH ADMIN-GRADE ADD / EDIT PRODUCT FORM */}
      {activeTab === 'new-product' && (
        <form onSubmit={handleSaveProductSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-500" />
                <span>{editingProductId ? 'Edit Product Details' : 'Add New Product to Shop'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure prices, discount offers, wholesale quantity rules, and variant options.
              </p>
            </div>

            {editingProductId && (
              <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full border border-amber-200">
                Editing Mode
              </span>
            )}
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Premium Georgette Embroidered Three Piece"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-500"
              >
                <option value="Fashion">Fashion & Clothing</option>
                <option value="Electronic">Electronic & Gadgets</option>
                <option value="Accessories">Accessories</option>
                <option value="Beauty">Beauty & Cosmetics</option>
                <option value="Headphone">Headphone & Audio</option>
                <option value="Laptop">Laptop & Computers</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
              </select>
            </div>
          </div>

          {/* Pricing & Discounts */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-600" /> Pricing & Discount Configuration
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Base MRP Price (৳) *</label>
                <input
                  type="number"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-black text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'flat')}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="percent">Percentage (% OFF)</option>
                  <option value="flat">Flat Amount (৳ OFF)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Discount Value ({discountType === 'percent' ? '%' : '৳'})
                </label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-black text-rose-600"
                />
              </div>
            </div>

            <div className="text-xs font-bold text-amber-900 bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
              <span>Final Selling Price to Customers:</span>
              <strong className="text-sm font-black text-orange-600">৳{calculatedDiscountPrice.toLocaleString()}</strong>
            </div>
          </div>

          {/* Photos Upload & URL Gallery */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Product Images</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste Image URL or add photo below..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrlToList}
                  className="text-[11px] bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  + Add URL to Gallery
                </button>
              </div>

              <label className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                <Upload className="w-6 h-6 text-orange-600 mb-1" />
                <span className="font-extrabold text-xs text-orange-950">Upload Photo from Mobile / Laptop</span>
                <span className="text-[10px] text-orange-800 font-medium mt-0.5">Supports PNG, JPG, WEBP</span>
                <input type="file" accept="image/*" onChange={handleProductImageFileUpload} className="hidden" />
              </label>
            </div>

            {/* Gallery Previews */}
            {imagesList.length > 0 && (
              <div className="flex items-center space-x-2 pt-2 overflow-x-auto">
                {imagesList.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagesList(imagesList.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Product Description & Specs</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write detailed specifications, fabric, sizing guide, warranty..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium"
            />
          </div>

          {/* Wholesale Tier Pricing */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-900 flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Tiered Wholesale Quantity Pricing Rules</span>
              </span>
              <button
                type="button"
                onClick={() => setWholesaleRules([...wholesaleRules, { minQty: 10, pricePerUnit: 1000 }])}
                className="text-[11px] bg-blue-600 text-white px-3 py-1 rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
              >
                + Add Tier
              </button>
            </div>

            <div className="space-y-2">
              {wholesaleRules.map((tier, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-blue-100 text-xs">
                  <span className="font-bold text-slate-500 w-16">Tier {idx + 1}:</span>
                  <input
                    type="number"
                    value={tier.minQty}
                    onChange={(e) => {
                      const updated = [...wholesaleRules];
                      updated[idx].minQty = Number(e.target.value);
                      setWholesaleRules(updated);
                    }}
                    className="w-16 bg-slate-50 border p-1 text-center font-bold rounded-lg"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={tier.maxQty || ''}
                    onChange={(e) => {
                      const updated = [...wholesaleRules];
                      updated[idx].maxQty = e.target.value ? Number(e.target.value) : undefined;
                      setWholesaleRules(updated);
                    }}
                    className="w-16 bg-slate-50 border p-1 text-center font-bold rounded-lg"
                    placeholder="Max"
                  />
                  <span>pcs → Rate: ৳</span>
                  <input
                    type="number"
                    value={tier.pricePerUnit}
                    onChange={(e) => {
                      const updated = [...wholesaleRules];
                      updated[idx].pricePerUnit = Number(e.target.value);
                      setWholesaleRules(updated);
                    }}
                    className="w-24 bg-slate-50 border p-1 text-center font-black text-blue-700 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setWholesaleRules(wholesaleRules.filter((_, i) => i !== idx))}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Product Variants Matrix */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">
                Variants Matrix (Color, Size, SKU, Stock)
              </span>
              <button
                type="button"
                onClick={() =>
                  setVariants([
                    ...variants,
                    {
                      id: `v-${Date.now()}`,
                      colorName: 'Standard',
                      size: 'M',
                      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
                      stock: 20,
                      priceExtra: 0
                    }
                  ])
                }
                className="text-[11px] bg-slate-900 text-white px-3 py-1 rounded-xl font-bold hover:bg-slate-800 cursor-pointer"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={v.id} className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                  <input
                    type="text"
                    value={v.colorName}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].colorName = e.target.value;
                      setVariants(updated);
                    }}
                    placeholder="Color"
                    className="bg-slate-50 border p-1 rounded-lg font-semibold"
                  />
                  <input
                    type="text"
                    value={v.size || v.storage}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].size = e.target.value;
                      setVariants(updated);
                    }}
                    placeholder="Size/Storage"
                    className="bg-slate-50 border p-1 rounded-lg font-semibold"
                  />
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].sku = e.target.value;
                      setVariants(updated);
                    }}
                    placeholder="SKU"
                    className="bg-slate-50 border p-1 rounded-lg font-mono text-[10px]"
                  />
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].stock = Number(e.target.value);
                      setVariants(updated);
                    }}
                    placeholder="Stock Qty"
                    className="bg-slate-50 border p-1 rounded-lg font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 text-center py-1 font-bold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-orange-600 text-white font-extrabold py-4 rounded-2xl text-xs transition-all shadow-md cursor-pointer"
          >
            {editingProductId ? 'Update Product Details' : 'Publish Product to Main Marketplace'}
          </button>
        </form>
      )}

      {/* SHOP CUSTOMIZATION TAB */}
      {activeTab === 'shop-setup' && (
        <form onSubmit={handleSaveShopSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <span>Shop Customization & Profile Setup</span>
              </h3>
              <p className="text-xs text-slate-500">
                Set logo, cover banner, notice alert, physical store address, and social links shown on main website.
              </p>
            </div>
          </div>

          {shopSaveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shopSaveSuccess}</span>
            </div>
          )}

          {/* Shop Name & Owner Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Shop / Brand Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. A-TIDY Modest Wear Hub"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Owner Name *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Sajjad Hossain"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Logo & Banner Upload Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Logo Section */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block">Shop Logo Photo</label>
              <div className="flex items-center space-x-3">
                <img src={logo} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shrink-0 bg-white" />
                <div className="space-y-1 flex-1">
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="Image URL"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  />
                  <label className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer w-max transition-all">
                    <Upload className="w-3 h-3" />
                    <span>Upload Logo File</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Banner Section */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block">Shop Cover Banner Image</label>
              <div className="flex items-center space-x-3">
                <img src={banner} alt="" className="w-24 h-16 rounded-2xl object-cover border border-slate-300 shrink-0 bg-white" />
                <div className="space-y-1 flex-1">
                  <input
                    type="text"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    placeholder="Image URL"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  />
                  <label className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer w-max transition-all">
                    <Upload className="w-3 h-3" />
                    <span>Upload Banner File</span>
                    <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Notice */}
          <div className="space-y-1 bg-amber-50 border border-amber-200 p-4 rounded-2xl">
            <label className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Special Shop Offer Notice
            </label>
            <input
              type="text"
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder="e.g. 🎉 Free express delivery on orders with 2+ items!"
              className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs font-bold text-amber-900"
            />
          </div>

          {/* Contact & Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Mobile Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">WhatsApp Number *</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Physical Address / Store Location</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Level 4, Jamuna Future Park, Dhaka"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Facebook Page Link</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="facebook.com/yourshop"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Instagram Link</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="instagram.com/yourshop"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>
          </div>

          {/* Tagline / Bio */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Shop Tagline & Description</label>
            <textarea
              rows={3}
              value={shopDesc}
              onChange={(e) => setShopDesc(e.target.value)}
              placeholder="Write a welcoming description for your shop..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 rounded-2xl text-xs transition-all shadow-md cursor-pointer"
          >
            Save & Publish Shop Profile
          </button>
        </form>
      )}

      {/* ORDERS / FULFILLMENTS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-black text-slate-900 font-display">Order Fulfillments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer Info</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {vendorOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{ord.id}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                    </td>
                    <td className="p-3 font-extrabold text-orange-600">৳{ord.totalAmount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onOpenInvoice(ord)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

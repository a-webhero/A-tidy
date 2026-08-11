import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Percent,
  Truck,
  Sliders,
  CreditCard,
  Wallet,
  Coins,
  PlusCircle,
  MinusCircle,
  Receipt,
  Globe,
  Store,
  Server,
  Lock,
  Settings,
  Search,
  Bell,
  User,
  Plus,
  X,
  Menu,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Upload,
  Printer,
  ChevronRight,
  Trash2,
  Palette,
  Tag,
  Check,
  RotateCcw,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  DollarSign,
  PieChart,
  Eye,
  Filter,
  RefreshCw,
  Zap,
  CheckCircle,
  Edit,
  Edit2,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Key,
  Phone,
  MessageSquare,
  Facebook,
  Instagram,
  ExternalLink,
  Building2,
  MapPin,
  CheckSquare,
  AlertCircle,
  FolderKanban,
  Image as ImageIcon,
  Copy,
  Download,
  HardDrive,
  Send,
  Mail,
  LogIn
} from 'lucide-react';
import { Order, OrderStatus, Product, BannerItem, ThemeConfig } from '../types';
import { UserAccount } from './AuthModal';
import { INITIAL_BANNERS } from './BannerSlider';
import { ThemeLayoutBuilder, DEFAULT_THEME_CONFIG } from './ThemeLayoutBuilder';
import {
  getAdminEmailSettings,
  saveAdminEmailSettings,
  getAdminEmailLogs,
  sendAdminEmailNotification,
  AdminEmailSettings,
  AdminEmailLog
} from './adminEmailService';

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  category: 'product' | 'banner' | 'category' | 'seller' | 'general';
  size?: string;
  dimensions?: string;
  uploadedAt: string;
}

interface AdminPanelProps {
  orders: Order[];
  products: Product[];
  banners?: BannerItem[];
  themeConfig?: ThemeConfig;
  registeredUsers?: UserAccount[];
  onUpdateRegisteredUsers?: (users: UserAccount[]) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  onOpenInvoice: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onBookCourier?: (orderId: string, courierName: string, trackingId?: string) => void;
  onSwitchToVendor?: (sellerUser?: UserAccount) => void;
  onSwitchToUser?: (user: UserAccount) => void;
  onSaveBanners?: (banners: BannerItem[]) => void;
  onUpdateProducts?: (products: Product[]) => void;
  onSaveThemeConfig?: (themeConfig: ThemeConfig) => void;
  showToast?: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  products,
  banners,
  themeConfig,
  registeredUsers = [],
  onUpdateRegisteredUsers,
  onAddProduct,
  onDeleteProduct,
  onDeleteOrder,
  onOpenInvoice,
  onUpdateOrderStatus,
  onBookCourier,
  onSwitchToVendor,
  onSwitchToUser,
  onSaveBanners,
  onUpdateProducts,
  onSaveThemeConfig,
  showToast: parentShowToast,
}) => {
  // Navigation State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Theme Config State
  const [activeThemeConfig, setActiveThemeConfig] = useState<ThemeConfig>(() => {
    if (themeConfig) return themeConfig;
    try {
      const saved = localStorage.getItem('luxeshop_theme_config');
      return saved ? JSON.parse(saved) : DEFAULT_THEME_CONFIG;
    } catch {
      return DEFAULT_THEME_CONFIG;
    }
  });

  const handleSaveThemeConfig = (updated: ThemeConfig) => {
    setActiveThemeConfig(updated);
    localStorage.setItem('luxeshop_theme_config', JSON.stringify(updated));
    if (onSaveThemeConfig) {
      onSaveThemeConfig(updated);
    }
  };

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'customers'
    | 'products'
    | 'file_manager'
    | 'banners'
    | 'flash_cards'
    | 'categories'
    | 'attributes'
    | 'sellers'
    | 'zones'
    | 'courier'
    | 'payments'
    | 'currency'
    | 'theme'
    | 'website_settings'
    | 'email_notifications'
    | 'security'
  >('overview');

  // Customer Management State
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerRoleFilter, setCustomerRoleFilter] = useState<'all' | 'customer' | 'vendor' | 'admin'>('all');
  const [selectedCustomerForCard, setSelectedCustomerForCard] = useState<any | null>(null);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustRole, setNewCustRole] = useState<'customer' | 'vendor'>('customer');

  // Custom Delete Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'order' | 'customer';
    id: string;
    title: string;
    extra?: any;
  } | null>(null);

  // Sub-filter for Products tab (Retail, Seller, Wholesale)
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'retail' | 'seller' | 'wholesale'>('all');

  // Search & Filter State for Orders & Global Admin Search
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  // Email Notifications State
  const [emailSettings, setEmailSettings] = useState<AdminEmailSettings>(() => getAdminEmailSettings());
  const [emailLogs, setEmailLogs] = useState<AdminEmailLog[]>(() => getAdminEmailLogs());
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [selectedEmailLogModal, setSelectedEmailLogModal] = useState<AdminEmailLog | null>(null);

  useEffect(() => {
    const handleEmailSentEvent = () => {
      setEmailLogs(getAdminEmailLogs());
    };
    window.addEventListener('admin_email_sent', handleEmailSentEvent);
    return () => window.removeEventListener('admin_email_sent', handleEmailSentEvent);
  }, []);

  const handleSaveEmailSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAdminEmailSettings(emailSettings);
    showToast('Admin email notification settings saved successfully!');
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    await sendAdminEmailNotification('test', {
      adminEmail: emailSettings.adminEmail,
      testMessage: 'Testing Admin Email Dispatch Engine'
    });
    setTestEmailLoading(false);
    setEmailLogs(getAdminEmailLogs());
    showToast(`Test email notification sent to ${emailSettings.adminEmail}`);
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- BANNERS MANAGEMENT STATE ---
  const [bannersList, setBannersList] = useState<BannerItem[]>(() => {
    if (banners && banners.length > 0) return banners;
    const saved = localStorage.getItem('luxeshop_banners');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_BANNERS;
  });

  useEffect(() => {
    if (banners && banners.length > 0) {
      setBannersList(banners);
    }
  }, [banners]);

  const saveBanners = (updated: BannerItem[]) => {
    setBannersList(updated);
    localStorage.setItem('luxeshop_banners', JSON.stringify(updated));
    if (onSaveBanners) {
      onSaveBanners(updated);
    }
  };

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('');
  const [bannerCta, setBannerCta] = useState('');
  const [bannerBgGradient, setBannerBgGradient] = useState('from-slate-900 via-indigo-950 to-slate-900');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerPriceTag, setBannerPriceTag] = useState('');

  const handleOpenNewBannerModal = () => {
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerBadge('Offer Deal');
    setBannerCta('Shop Now');
    setBannerBgGradient('from-slate-900 via-indigo-950 to-slate-900');
    setBannerImage('https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80');
    setBannerPriceTag('');
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBannerModal = (b: BannerItem) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title);
    setBannerSubtitle(b.subtitle);
    setBannerBadge(b.badge);
    setBannerCta(b.cta);
    setBannerBgGradient(b.bgGradient || 'from-slate-900 via-indigo-950 to-slate-900');
    setBannerImage(b.image);
    setBannerPriceTag(b.priceTag);
    setIsBannerModalOpen(true);
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setBannerImage(evt.target.result as string);
          showToast('Banner photo uploaded from device!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) {
      alert('Please enter a banner title');
      return;
    }

    if (editingBannerId) {
      const updated = bannersList.map((b) =>
        b.id === editingBannerId
          ? {
              ...b,
              title: bannerTitle.trim(),
              subtitle: bannerSubtitle.trim(),
              badge: bannerBadge.trim() || 'Special Deal',
              cta: bannerCta.trim() || 'Shop Now',
              bgGradient: bannerBgGradient,
              image: bannerImage.trim(),
              priceTag: bannerPriceTag.trim(),
            }
          : b
      );
      saveBanners(updated);
      showToast('Banner updated successfully!');
    } else {
      const newBanner: BannerItem = {
        id: `banner-${Date.now()}`,
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        badge: bannerBadge.trim() || 'Special Deal',
        cta: bannerCta.trim() || 'Shop Now',
        bgGradient: bannerBgGradient,
        image:
          bannerImage.trim() ||
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        priceTag: bannerPriceTag.trim(),
        isActive: true,
      };
      saveBanners([newBanner, ...bannersList]);
      showToast('New Promo Banner added successfully!');
    }
    setIsBannerModalOpen(false);
  };

  const handleToggleBannerActive = (id: string) => {
    const updated = bannersList.map((b) =>
      b.id === id ? { ...b, isActive: b.isActive === false ? true : false } : b
    );
    saveBanners(updated);
    showToast('Banner status updated!');
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      const updated = bannersList.filter((b) => b.id !== id);
      saveBanners(updated);
      showToast('Banner deleted!');
    }
  };

  // --- FLASH CARDS / FLASH DEALS STATE ---
  const [selectedFlashProduct, setSelectedFlashProduct] = useState<string>('');
  const [flashBadgeText, setFlashBadgeText] = useState('⚡ FLASH SALE');
  const [flashDiscountType, setFlashDiscountType] = useState<'percent' | 'flat'>('percent');
  const [flashDiscountVal, setFlashDiscountVal] = useState<number>(20);
  const [flashEndsText, setFlashEndsText] = useState('12 Hours');
  const [flashStockPercent, setFlashStockPercent] = useState<number>(80);
  const [flashCardImage, setFlashCardImage] = useState<string>('');

  // Flash Card Edit Modal State
  const [editingFlashCard, setEditingFlashCard] = useState<Product | null>(null);
  const [editFlashTitle, setEditFlashTitle] = useState('');
  const [editFlashBasePrice, setEditFlashBasePrice] = useState<number>(0);
  const [editFlashBadgeText, setEditFlashBadgeText] = useState('⚡ FLASH SALE');
  const [editFlashDiscountType, setEditFlashDiscountType] = useState<'percent' | 'flat'>('percent');
  const [editFlashDiscountVal, setEditFlashDiscountVal] = useState<number>(20);
  const [editFlashStockPercent, setEditFlashStockPercent] = useState<number>(80);
  const [editFlashImage, setEditFlashImage] = useState<string>('');
  const [isFlashEditModalOpen, setIsFlashEditModalOpen] = useState(false);

  const handleAddFlashImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setFlashCardImage(evt.target.result as string);
          showToast('Flash Card photo uploaded from device!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFlashImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setEditFlashImage(evt.target.result as string);
          showToast('Flash Card photo updated from device!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditFlashModal = (p: Product) => {
    setEditingFlashCard(p);
    setEditFlashTitle(p.title);
    setEditFlashBasePrice(p.basePrice);
    setEditFlashBadgeText(p.flashBadge || '⚡ FLASH SALE');
    setEditFlashDiscountType(p.discountType || 'percent');
    setEditFlashDiscountVal(p.discountAmount || p.discountPercent || 20);
    setEditFlashStockPercent(p.flashStockPercent || 80);
    setEditFlashImage(p.images[0] || '');
    setIsFlashEditModalOpen(true);
  };

  const handleSaveFlashEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlashCard) return;

    const baseP = Math.max(1, editFlashBasePrice);
    let calcDiscountPrice = baseP;
    if (editFlashDiscountType === 'percent') {
      calcDiscountPrice = Math.round(baseP * (1 - editFlashDiscountVal / 100));
    } else {
      calcDiscountPrice = Math.max(0, baseP - editFlashDiscountVal);
    }

    const updatedProducts = products.map((p) => {
      if (p.id === editingFlashCard.id) {
        const updatedImages = editFlashImage
          ? [editFlashImage, ...(p.images ? p.images.slice(1) : [])]
          : p.images;

        return {
          ...p,
          title: editFlashTitle.trim() || p.title,
          basePrice: baseP,
          images: updatedImages,
          isFlashSale: true,
          flashBadge: editFlashBadgeText.trim() || '⚡ FLASH SALE',
          flashStockPercent: editFlashStockPercent,
          discountPercent:
            editFlashDiscountType === 'percent'
              ? editFlashDiscountVal
              : Math.round((editFlashDiscountVal / baseP) * 100),
          discountType: editFlashDiscountType,
          discountAmount: editFlashDiscountVal,
          discountPrice: calcDiscountPrice,
        };
      }
      return p;
    });

    if (onUpdateProducts) {
      onUpdateProducts(updatedProducts);
    }
    showToast('Flash Sale Card updated successfully!');
    setIsFlashEditModalOpen(false);
    setEditingFlashCard(null);
  };

  const handleAddFlashCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlashProduct) {
      alert('Please select a product for the Flash Card');
      return;
    }

    const updatedProducts = products.map((p) => {
      if (p.id === selectedFlashProduct) {
        let calcDiscountPrice = p.basePrice;
        if (flashDiscountType === 'percent') {
          calcDiscountPrice = Math.round(p.basePrice * (1 - flashDiscountVal / 100));
        } else {
          calcDiscountPrice = Math.max(0, p.basePrice - flashDiscountVal);
        }

        const updatedImages = flashCardImage
          ? [flashCardImage, ...(p.images ? p.images.slice(1) : [])]
          : p.images;

        return {
          ...p,
          images: updatedImages,
          isFlashSale: true,
          flashBadge: flashBadgeText.trim() || '⚡ FLASH SALE',
          flashEndsAt: flashEndsText.trim() || 'Limited Time',
          flashStockPercent: flashStockPercent,
          discountPercent:
            flashDiscountType === 'percent'
              ? flashDiscountVal
              : Math.round((flashDiscountVal / p.basePrice) * 100),
          discountType: flashDiscountType,
          discountAmount: flashDiscountVal,
          discountPrice: calcDiscountPrice,
        };
      }
      return p;
    });

    if (onUpdateProducts) {
      onUpdateProducts(updatedProducts);
    }
    showToast('Flash Sale Card added successfully!');
    setSelectedFlashProduct('');
    setFlashCardImage('');
  };

  const handleRemoveFlashCard = (productId: string) => {
    if (!confirm('Are you sure you want to remove this Flash Sale Card?')) return;
    const updatedProducts = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          isFlashSale: false,
          flashBadge: undefined,
          flashEndsAt: undefined,
          flashStockPercent: undefined,
          discountPrice: undefined,
          discountPercent: undefined,
        };
      }
      return p;
    });

    if (onUpdateProducts) {
      onUpdateProducts(updatedProducts);
    }
    showToast('Product removed from Flash Sale Cards.');
  };

  // --- 0. FILE MANAGER / MEDIA GALLERY STATE ---
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(() => {
    const saved = localStorage.getItem('luxeshop_media_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'm-1',
        name: 'Wireless Noise Cancelling Headphones',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        category: 'product',
        size: '245 KB',
        dimensions: '800x800',
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'm-2',
        name: 'Premium Leather Smart Watch',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        category: 'product',
        size: '310 KB',
        dimensions: '800x800',
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'm-3',
        name: 'Luxury Silk Abaya Collection',
        url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        category: 'product',
        size: '180 KB',
        dimensions: '800x800',
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'm-4',
        name: 'Store Hero Banner Summer Sale',
        url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
        category: 'banner',
        size: '520 KB',
        dimensions: '1200x600',
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'm-5',
        name: 'Electronic Category Feature',
        url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80',
        category: 'category',
        size: '290 KB',
        dimensions: '800x800',
        uploadedAt: new Date().toISOString(),
      },
    ];
  });

  const saveToMediaFiles = (newFile: MediaFile) => {
    setMediaFiles((prev) => {
      const updated = [newFile, ...prev];
      localStorage.setItem('luxeshop_media_files', JSON.stringify(updated));
      return updated;
    });
  };

  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [fileCategoryFilter, setFileCategoryFilter] = useState<'all' | 'product' | 'banner' | 'category' | 'seller' | 'general'>('all');
  const [newFileTitle, setNewFileTitle] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<'product' | 'banner' | 'category' | 'seller' | 'general'>('product');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [previewingMedia, setPreviewingMedia] = useState<MediaFile | null>(null);

  const handleDirectFileManagerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File, index: number) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const newMedia: MediaFile = {
            id: `m-upload-${Date.now()}-${index}`,
            name: file.name || `Photo-${Date.now()}`,
            url: dataUrl,
            category: newFileCategory,
            size: `${Math.round(file.size / 1024)} KB`,
            dimensions: 'Original',
            uploadedAt: new Date().toISOString(),
          };
          saveToMediaFiles(newMedia);
        };
        reader.readAsDataURL(file);
      });
      showToast(`${files.length} Photo(s) uploaded to File Manager successfully!`);
    }
  };

  const handleAddUrlToMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileUrl.trim()) return;
    const newMedia: MediaFile = {
      id: `m-url-${Date.now()}`,
      name: newFileTitle.trim() || `Image-${Date.now()}`,
      url: newFileUrl.trim(),
      category: newFileCategory,
      size: 'Web URL',
      dimensions: 'External',
      uploadedAt: new Date().toISOString(),
    };
    saveToMediaFiles(newMedia);
    showToast(`Image URL saved to File Manager!`);
    setNewFileTitle('');
    setNewFileUrl('');
  };

  const handleDeleteMediaFile = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete file "${name}" from File Manager?`)) {
      setMediaFiles((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        localStorage.setItem('luxeshop_media_files', JSON.stringify(updated));
        return updated;
      });
      showToast(`File "${name}" removed from File Manager.`);
      if (previewingMedia?.id === id) setPreviewingMedia(null);
    }
  };

  const handleCopyImageUrl = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    showToast(`Image URL copied for "${name}"!`);
  };

  // --- 1. PRODUCT ADD FORM STATE ---
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('Electronic');
  const [prodSubCategory, setProdSubCategory] = useState('Smartphones');
  const [prodBasePrice, setProdBasePrice] = useState('1500');
  const [prodDiscountType, setProdDiscountType] = useState<'none' | 'percent' | 'flat'>('percent');
  const [prodDiscountVal, setProdDiscountVal] = useState('15');
  const [isWholesaleEnabled, setIsWholesaleEnabled] = useState(false);
  const [prodType, setProdType] = useState<'retail' | 'seller' | 'wholesale'>('retail');
  const [prodVendorName, setProdVendorName] = useState('Super Admin Store');
  const [prodDesc, setProdDesc] = useState('');

  // Device File Image Upload & URL Fallback
  const [prodImageBase64, setProdImageBase64] = useState<string>('');
  const [prodImageUrl, setProdImageUrl] = useState('');

  // Selected Colors & Sizes
  const [selectedProdColors, setSelectedProdColors] = useState<string[]>(['Midnight Black', 'Space Gray']);
  const [selectedProdSizes, setSelectedProdSizes] = useState<string[]>(['M', 'L', '128GB']);

  // SEO & Delivery Policy
  const [prodSeoDesc, setProdSeoDesc] = useState('');
  const [prodSeoPhotoBase64, setProdSeoPhotoBase64] = useState<string>('');
  const [prodSeoPhotoUrl, setProdSeoPhotoUrl] = useState('');
  const [prodDeliveryTime, setProdDeliveryTime] = useState('2-3 Days');
  const [prodReturnPolicy, setProdReturnPolicy] = useState('7 Days Replacement Warranty');
  const [prodReturnTime, setProdReturnTime] = useState('7 Days');

  // Wholesale Tiers
  const [prodWholesaleQty1, setProdWholesaleQty1] = useState('5');
  const [prodWholesalePrice1, setProdWholesalePrice1] = useState('1100');
  const [prodWholesaleQty2, setProdWholesaleQty2] = useState('11');
  const [prodWholesalePrice2, setProdWholesalePrice2] = useState('990');

  // Handle Image Upload from Device
  const handleProductImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setProdImageBase64(dataUrl);
        
        // Auto-save to File Manager
        saveToMediaFiles({
          id: `m-prod-${Date.now()}`,
          name: file.name || `Product-${prodTitle || 'Image'}`,
          url: dataUrl,
          category: 'product',
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: '800x800',
          uploadedAt: new Date().toISOString(),
        });

        showToast('Product Image uploaded & saved to File Manager!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSeoPhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setProdSeoPhotoBase64(dataUrl);

        // Auto-save to File Manager
        saveToMediaFiles({
          id: `m-seo-${Date.now()}`,
          name: file.name || `SEO-${prodTitle || 'Photo'}`,
          url: dataUrl,
          category: 'product',
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: '800x800',
          uploadedAt: new Date().toISOString(),
        });

        showToast('SEO Photo uploaded & saved to File Manager!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) return;

    const finalImage =
      prodImageBase64 ||
      prodImageUrl.trim() ||
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80';

    const finalSeoPhoto = prodSeoPhotoBase64 || prodSeoPhotoUrl.trim() || finalImage;

    // Auto-save finalImage to File Manager if not present
    if (finalImage) {
      const exists = mediaFiles.some((m) => m.url === finalImage);
      if (!exists) {
        saveToMediaFiles({
          id: `m-prod-pub-${Date.now()}`,
          name: prodTitle.trim(),
          url: finalImage,
          category: 'product',
          size: '300 KB',
          dimensions: '800x800',
          uploadedAt: new Date().toISOString(),
        });
      }
    }

    const numBase = Number(prodBasePrice) || 1000;
    const numDiscVal = Number(prodDiscountVal) || 0;
    let calculatedSellingPrice = numBase;
    if (prodDiscountType === 'percent' && numDiscVal > 0) {
      calculatedSellingPrice = Math.round(numBase * (1 - numDiscVal / 100));
    } else if (prodDiscountType === 'flat' && numDiscVal > 0) {
      calculatedSellingPrice = Math.max(0, numBase - numDiscVal);
    }

    const isWholesale = isWholesaleEnabled || prodType === 'wholesale';

    const newProd: Product = {
      id: `prod-admin-${Date.now()}`,
      vendorId: prodType === 'seller' ? 'v-seller-custom' : 'v-admin',
      vendorName: prodType === 'seller' ? prodVendorName : 'BD Wholesale Hub',
      title: prodTitle.trim(),
      slug: prodTitle.toLowerCase().replace(/\s+/g, '-'),
      category: prodCategory,
      subCategory: prodSubCategory,
      description: prodDesc || 'High quality verified product with manufacturer warranty.',
      images: [finalImage],
      rating: 4.9,
      reviewCount: 24,
      basePrice: numBase,
      discountType: prodDiscountType === 'none' ? undefined : prodDiscountType,
      discountAmount: prodDiscountType === 'none' ? undefined : numDiscVal,
      discountPrice: prodDiscountType !== 'none' && calculatedSellingPrice < numBase ? calculatedSellingPrice : undefined,
      discountPercent: prodDiscountType === 'percent' ? numDiscVal : undefined,
      isWholesaleAvailable: isWholesale,
      seoDescription: prodSeoDesc || `${prodTitle} - Best price in Bangladesh`,
      seoPhoto: finalSeoPhoto,
      deliveryTime: prodDeliveryTime,
      returnPolicy: prodReturnPolicy,
      returnTime: prodReturnTime,
      wholesalePriceRules: isWholesale
        ? [
            { minQty: Number(prodWholesaleQty1) || 5, maxQty: 10, pricePerUnit: Number(prodWholesalePrice1) || Math.round(numBase * 0.85) },
            { minQty: Number(prodWholesaleQty2) || 11, pricePerUnit: Number(prodWholesalePrice2) || Math.round(numBase * 0.75) },
          ]
        : [],
      variants: selectedProdColors.map((col, idx) => ({
        id: `v-${idx}-${Date.now()}`,
        colorName: col,
        size: selectedProdSizes[0] || 'Standard',
        sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
        stock: 100,
        priceExtra: 0,
      })),
      createdAt: new Date().toISOString(),
    };

    onAddProduct(newProd);

    // Send Automated Admin Email Notification
    sendAdminEmailNotification('new_product', {
      title: prodTitle.trim(),
      vendorName: prodType === 'seller' ? prodVendorName : 'BD Wholesale Hub',
      category: prodCategory,
      basePrice: numBase,
    });

    showToast(`Product "${prodTitle}" published successfully!`);

    setProdTitle('');
    setProdDesc('');
    setProdImageBase64('');
    setProdImageUrl('');
    setProdSeoPhotoBase64('');
    setProdSeoPhotoUrl('');
  };

  // --- 2. CATEGORIES & SUB-CATEGORIES STATE ---
  const [categoryList, setCategoryList] = useState<
    { id: string; name: string; subCategories: string[]; iconName: string }[]
  >([
    { id: 'c1', name: 'Electronic', subCategories: ['Smartphones', 'Smart Watch', 'Headphones', 'Laptops'], iconName: 'Laptop' },
    { id: 'c2', name: 'Fashion', subCategories: ['Women Abaya', 'Hijab Set', 'Men Panjabi', 'Footwear'], iconName: 'ShoppingBag' },
    { id: 'c3', name: 'Home & Living', subCategories: ['Kitchenware', 'Bedding', 'Home Decor'], iconName: 'Home' },
    { id: 'c4', name: 'Beauty & Care', subCategories: ['Skincare', 'Fragrance', 'Haircare'], iconName: 'Sparkles' },
  ]);

  const [newCatName, setNewCatName] = useState('');
  const [selectedCatForSub, setSelectedCatForSub] = useState('Electronic');
  const [newSubCatName, setNewSubCatName] = useState('');

  // Modals for Categories Editing
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [editingSubCat, setEditingSubCat] = useState<{ catId: string; oldSub: string; newSub: string } | null>(null);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCategoryList((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, name: newCatName.trim(), subCategories: [], iconName: 'Tag' },
    ]);
    showToast(`Category "${newCatName}" added!`);
    setNewCatName('');
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;
    setCategoryList((prev) =>
      prev.map((c) => (c.id === editingCategory.id ? { ...c, name: editingCategory.name.trim() } : c))
    );
    showToast(`Category updated to "${editingCategory.name}"!`);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      setCategoryList((prev) => prev.filter((c) => c.id !== catId));
      showToast(`Category "${name}" deleted!`);
    }
  };

  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCatName.trim()) return;
    setCategoryList((prev) =>
      prev.map((c) =>
        c.name === selectedCatForSub
          ? { ...c, subCategories: [...c.subCategories, newSubCatName.trim()] }
          : c
      )
    );
    showToast(`Sub-category "${newSubCatName}" added to ${selectedCatForSub}!`);
    setNewSubCatName('');
  };

  const handleUpdateSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubCat || !editingSubCat.newSub.trim()) return;
    setCategoryList((prev) =>
      prev.map((c) =>
        c.id === editingSubCat.catId
          ? {
              ...c,
              subCategories: c.subCategories.map((s) => (s === editingSubCat.oldSub ? editingSubCat.newSub.trim() : s)),
            }
          : c
      )
    );
    showToast(`Sub-category updated to "${editingSubCat.newSub}"!`);
    setEditingSubCat(null);
  };

  const handleDeleteSubCategory = (catId: string, subName: string) => {
    setCategoryList((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, subCategories: c.subCategories.filter((s) => s !== subName) } : c
      )
    );
    showToast(`Sub-category "${subName}" deleted!`);
  };

  // --- 3. COLOR & SIZE ATTRIBUTES ---
  const [colorsList, setColorsList] = useState<{ id: string; name: string; hex: string }[]>([
    { id: 'col1', name: 'Midnight Black', hex: '#000000' },
    { id: 'col2', name: 'Emerald Green', hex: '#059669' },
    { id: 'col3', name: 'Navy Blue', hex: '#1e3a8a' },
    { id: 'col4', name: 'Rose Gold', hex: '#fb7185' },
    { id: 'col5', name: 'Space Gray', hex: '#475569' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#ff6b00');
  const [editingColor, setEditingColor] = useState<{ id: string; name: string; hex: string } | null>(null);

  const [sizesList, setSizesList] = useState<{ id: string; name: string }[]>([
    { id: 'sz1', name: 'S' },
    { id: 'sz2', name: 'M' },
    { id: 'sz3', name: 'L' },
    { id: 'sz4', name: 'XL' },
    { id: 'sz5', name: '2XL' },
    { id: 'sz6', name: 'Free Size' },
    { id: 'sz7', name: '64GB' },
    { id: 'sz8', name: '128GB' },
    { id: 'sz9', name: '256GB' },
  ]);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [editingSize, setEditingSize] = useState<{ id: string; name: string } | null>(null);

  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    setColorsList([...colorsList, { id: `col-${Date.now()}`, name: newColorName.trim(), hex: newColorHex }]);
    showToast(`Color "${newColorName}" added!`);
    setNewColorName('');
  };

  const handleUpdateColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColor || !editingColor.name.trim()) return;
    setColorsList((prev) =>
      prev.map((c) => (c.id === editingColor.id ? { ...c, name: editingColor.name.trim(), hex: editingColor.hex } : c))
    );
    showToast(`Color attribute updated!`);
    setEditingColor(null);
  };

  const handleDeleteColor = (id: string, name: string) => {
    setColorsList((prev) => prev.filter((c) => c.id !== id));
    showToast(`Color "${name}" removed!`);
  };

  const handleAddSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizeInput.trim()) return;
    setSizesList([...sizesList, { id: `sz-${Date.now()}`, name: newSizeInput.trim() }]);
    showToast(`Size Option "${newSizeInput}" added!`);
    setNewSizeInput('');
  };

  const handleUpdateSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSize || !editingSize.name.trim()) return;
    setSizesList((prev) =>
      prev.map((s) => (s.id === editingSize.id ? { ...s, name: editingSize.name.trim() } : s))
    );
    showToast(`Size option updated!`);
    setEditingSize(null);
  };

  const handleDeleteSize = (id: string, name: string) => {
    setSizesList((prev) => prev.filter((s) => s.id !== id));
    showToast(`Size "${name}" removed!`);
  };

  // --- 4. SELLER SHOPS & WALLET STATE ---
  interface WalletLogItem {
    id: string;
    type: 'add' | 'deduct';
    amount: number;
    reason: string;
    date: string;
    performedBy?: string;
  }

  interface SellerShopItem {
    id: string;
    shopName: string;
    ownerName: string;
    phone: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    logo: string;
    banner: string;
    description: string;
    password: string;
    commissionRate: number;
    totalSales: number;
    walletBalance: number;
    walletHistory?: WalletLogItem[];
    status: 'Active' | 'Suspended' | 'Pending';
  }

  // Platform Fee Configuration State
  interface PlatformFeeConfig {
    defaultCommissionRate: number;
    fixedFeePerOrder: number;
    minWithdrawalLimit: number;
    payoutProcessingDays: number;
  }

  const [platformFeeConfig, setPlatformFeeConfig] = useState<PlatformFeeConfig>(() => {
    try {
      const saved = localStorage.getItem('luxeshop_platform_fee_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      defaultCommissionRate: 5,
      fixedFeePerOrder: 20,
      minWithdrawalLimit: 1000,
      payoutProcessingDays: 3,
    };
  });

  const handleSavePlatformFeeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('luxeshop_platform_fee_config', JSON.stringify(platformFeeConfig));
    showToast('✅ Platform Fee & Seller Commission settings saved!');
  };

  const [sellerList, setSellerList] = useState<SellerShopItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxeshop_sellers_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'v101',
        shopName: 'Gadget World BD',
        ownerName: 'Rafiqul Islam',
        phone: '01711223344',
        whatsapp: '01711223344',
        facebook: 'facebook.com/gadgetworldbd',
        instagram: 'instagram.com/gadgetworldbd',
        logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80',
        banner: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
        description: 'Premier electronics & smart gadgets importer in Dhaka.',
        password: 'seller123',
        commissionRate: 5,
        totalSales: 245000,
        walletBalance: 15000,
        walletHistory: [
          { id: 'w1', type: 'add', amount: 20000, reason: 'Initial Wallet Deposit', date: '2026-08-01 10:30 AM' },
          { id: 'w2', type: 'deduct', amount: 5000, reason: 'Platform Order Commission Deduction', date: '2026-08-05 02:15 PM' }
        ],
        status: 'Active',
      },
      {
        id: 'v102',
        shopName: 'Modest Fashion House',
        ownerName: 'Nasrin Sultana',
        phone: '01899887766',
        whatsapp: '01899887766',
        facebook: 'facebook.com/modestfashionhouse',
        instagram: 'instagram.com/modestfashionhouse',
        logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
        description: 'Exclusive Abaya, Hijab Set & Premium Georgette dresses.',
        password: 'seller123',
        commissionRate: 7,
        totalSales: 182000,
        walletBalance: 8500,
        walletHistory: [
          { id: 'w3', type: 'add', amount: 8500, reason: 'Monthly Sales Payout', date: '2026-08-02 11:00 AM' }
        ],
        status: 'Active',
      },
      {
        id: 'v103',
        shopName: 'Tech Hub Wholesale',
        ownerName: 'Tanvir Hossain',
        phone: '01500112233',
        whatsapp: '01500112233',
        facebook: 'facebook.com/techhubws',
        instagram: 'instagram.com/techhubws',
        logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=200&q=80',
        banner: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
        description: 'Direct factory importer for smartphones and accessories.',
        password: 'seller123',
        commissionRate: 4,
        totalSales: 520000,
        walletBalance: 32000,
        walletHistory: [
          { id: 'w4', type: 'add', amount: 32000, reason: 'Bulk Wholesale Order Settlement', date: '2026-08-03 04:20 PM' }
        ],
        status: 'Active',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxeshop_sellers_list', JSON.stringify(sellerList));
    } catch (e) {
      console.error(e);
    }
  }, [sellerList]);

  // Wallet Adjustment Modal State
  const [walletModalSeller, setWalletModalSeller] = useState<SellerShopItem | null>(null);
  const [walletActionType, setWalletActionType] = useState<'add' | 'deduct'>('add');
  const [walletAmount, setWalletAmount] = useState<string>('');
  const [walletNote, setWalletNote] = useState<string>('');

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalSeller) return;
    const amt = parseFloat(walletAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('⚠️ Please enter a valid positive amount (৳)!');
      return;
    }

    const isDeduct = walletActionType === 'deduct';
    const currentBal = walletModalSeller.walletBalance ?? 0;

    if (isDeduct && amt > currentBal) {
      if (!window.confirm(`Warning: Deducting ৳${amt.toLocaleString()} exceeds current wallet balance (৳${currentBal.toLocaleString()}). Continue to allow negative balance?`)) {
        return;
      }
    }

    const updatedBalance = isDeduct ? currentBal - amt : currentBal + amt;

    const newLog: WalletLogItem = {
      id: `wl-${Date.now()}`,
      type: walletActionType,
      amount: amt,
      reason: walletNote.trim() || (isDeduct ? 'Admin Manual Wallet Deduction' : 'Admin Manual Wallet Deposit'),
      date: new Date().toLocaleString(),
      performedBy: 'Super Admin'
    };

    const updatedHistory = [newLog, ...(walletModalSeller.walletHistory || [])];

    const updatedSellerList = sellerList.map((s) => {
      if (s.id === walletModalSeller.id) {
        return {
          ...s,
          walletBalance: updatedBalance,
          walletHistory: updatedHistory,
        };
      }
      return s;
    });

    setSellerList(updatedSellerList);
    showToast(
      isDeduct
        ? `🔻 ৳${amt.toLocaleString()} deducted from ${walletModalSeller.shopName}'s wallet!`
        : `➕ ৳${amt.toLocaleString()} added to ${walletModalSeller.shopName}'s wallet!`
    );

    setWalletModalSeller(null);
    setWalletAmount('');
    setWalletNote('');
  };

  const [sellerOrderFilter, setSellerOrderFilter] = useState<string>('all');

  // Form State for Adding Seller
  const [newShopLogoBase64, setNewShopLogoBase64] = useState('');
  const [newShopBannerBase64, setNewShopBannerBase64] = useState('');
  const [newShopName, setNewShopName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopWhatsapp, setNewShopWhatsapp] = useState('');
  const [newShopFacebook, setNewShopFacebook] = useState('');
  const [newShopInstagram, setNewShopInstagram] = useState('');
  const [newShopDesc, setNewShopDesc] = useState('');
  const [newShopPassword, setNewShopPassword] = useState('seller123');
  const [newShopCommission, setNewShopCommission] = useState('5');

  // Edit Seller Modal
  const [editingSeller, setEditingSeller] = useState<SellerShopItem | null>(null);

  // Seller Login Portal State at Bottom
  const [loginSellerId, setLoginSellerId] = useState('v101');
  const [loginSellerPin, setLoginSellerPin] = useState('seller123');

  const handleSellerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewShopLogoBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSellerBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewShopBannerBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim() || !newShopPhone.trim()) return;

    const createdSeller: SellerShopItem = {
      id: `v-${Date.now()}`,
      shopName: newShopName.trim(),
      ownerName: newOwnerName.trim() || 'Verified Seller',
      phone: newShopPhone.trim(),
      whatsapp: newShopWhatsapp.trim() || newShopPhone.trim(),
      facebook: newShopFacebook.trim(),
      instagram: newShopInstagram.trim(),
      logo: newShopLogoBase64 || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80',
      banner: newShopBannerBase64 || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
      description: newShopDesc.trim() || 'Official partner store on A-TIDY Fashion Marketplace.',
      password: newShopPassword.trim() || 'seller123',
      commissionRate: Number(newShopCommission) || 5,
      totalSales: 0,
      walletBalance: 0,
      walletHistory: [
        { id: `w-${Date.now()}`, type: 'add', amount: 0, reason: 'Seller Shop Registered', date: new Date().toLocaleString() }
      ],
      status: 'Active',
    };

    setSellerList([createdSeller, ...sellerList]);
    showToast(`Seller Shop "${newShopName}" created successfully!`);

    setNewShopName('');
    setNewOwnerName('');
    setNewShopPhone('');
    setNewShopWhatsapp('');
    setNewShopFacebook('');
    setNewShopInstagram('');
    setNewShopDesc('');
    setNewShopLogoBase64('');
    setNewShopBannerBase64('');
  };

  const handleUpdateSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeller) return;
    setSellerList((prev) => prev.map((s) => (s.id === editingSeller.id ? editingSeller : s)));
    showToast(`Shop details for "${editingSeller.shopName}" updated!`);
    setEditingSeller(null);
  };

  const handleDeleteSeller = (id: string, shopName: string) => {
    if (confirm(`Are you sure you want to delete seller shop "${shopName}"?`)) {
      setSellerList((prev) => prev.filter((s) => s.id !== id));
      showToast(`Seller shop "${shopName}" deleted!`);
    }
  };

  const handleToggleSellerStatus = (id: string) => {
    setSellerList((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' } : s
      )
    );
    showToast(`Seller status updated!`);
  };

  const handleDirectSellerPanelLogin = () => {
    const selectedShop = sellerList.find((s) => s.id === loginSellerId);
    if (!selectedShop) {
      showToast('Please select a valid seller shop');
      return;
    }
    if (loginSellerPin.trim() !== selectedShop.password && loginSellerPin.trim() !== 'seller123') {
      showToast('Incorrect password for selected shop!');
      return;
    }

    showToast(`Logging in as ${selectedShop.shopName}...`);
    if (onSwitchToVendor) {
      onSwitchToVendor();
    }
  };

  // --- 5. DELIVERY ZONES & CHARGES STATE ---
  interface DeliveryZoneItem {
    id: string;
    name: string;
    district: string;
    thanas: string;
    fee: number;
    days: string;
    isActive: boolean;
  }

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneItem[]>([
    {
      id: 'z1',
      name: 'Inside Dhaka Metro',
      district: 'Dhaka',
      thanas: 'Uttara, Gulshan, Dhanmondi, Mirpur, Motijheel, Banani, Badda, Mohammadpur',
      fee: 60,
      days: '24-48 Hours',
      isActive: true,
    },
    {
      id: 'z2',
      name: 'Dhaka Suburbs',
      district: 'Savar, Gazipur, Keraniganj, Narayanganj',
      thanas: 'Savar HQ, Gazipur Sadar, Tongi, Keraniganj, Narayanganj Sadar',
      fee: 100,
      days: '2-3 Days',
      isActive: true,
    },
    {
      id: 'z3',
      name: 'Outside Dhaka (District Headquarters)',
      district: 'Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Mymensingh, Comilla, Bogra',
      thanas: 'All District HQ Sadar Thanas',
      fee: 120,
      days: '3-4 Days',
      isActive: true,
    },
    {
      id: 'z4',
      name: 'Remote Thana & Union Level Delivery',
      district: 'All Remote Districts & Island Unions',
      thanas: 'Union & Upazila Level Sub-offices',
      fee: 150,
      days: '3-5 Days',
      isActive: true,
    },
  ]);

  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDistrict, setNewZoneDistrict] = useState('');
  const [newZoneThanas, setNewZoneThanas] = useState('');
  const [newZoneFee, setNewZoneFee] = useState('120');
  const [newZoneDays, setNewZoneDays] = useState('2-4 Days');
  const [editingZone, setEditingZone] = useState<DeliveryZoneItem | null>(null);

  const handleAddZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;
    setDeliveryZones([
      ...deliveryZones,
      {
        id: `z-${Date.now()}`,
        name: newZoneName.trim(),
        district: newZoneDistrict.trim() || 'Custom District',
        thanas: newZoneThanas.trim() || 'All Thanas',
        fee: Number(newZoneFee) || 120,
        days: newZoneDays.trim() || '2-4 Days',
        isActive: true,
      },
    ]);
    showToast(`Delivery Zone "${newZoneName}" created!`);
    setNewZoneName('');
    setNewZoneDistrict('');
    setNewZoneThanas('');
  };

  const handleUpdateZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    setDeliveryZones((prev) => prev.map((z) => (z.id === editingZone.id ? editingZone : z)));
    showToast(`Delivery zone "${editingZone.name}" updated!`);
    setEditingZone(null);
  };

  const handleDeleteZone = (id: string, name: string) => {
    if (confirm(`Delete delivery zone "${name}"?`)) {
      setDeliveryZones((prev) => prev.filter((z) => z.id !== id));
      showToast(`Zone "${name}" deleted!`);
    }
  };

  const handleToggleZoneActive = (id: string) => {
    setDeliveryZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, isActive: !z.isActive } : z))
    );
    showToast('Zone active status toggled!');
  };

  // --- 6. COURIER SERVICES API STATE ---
  interface CourierServiceItem {
    id: string;
    name: string;
    code: string;
    apiKey: string;
    secretKey: string;
    apiUrl: string;
    storeId: string;
    webhookUrl: string;
    surchargeFee: number;
    isActive: boolean;
    isDefault: boolean;
    notes: string;
    token?: string;
  }

  const [courierList, setCourierList] = useState<CourierServiceItem[]>(() => {
    const saved = localStorage.getItem('luxeshop_courier_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to defaults
      }
    }
    return [
      {
        id: 'cr-steadfast',
        name: 'Steadfast Courier',
        code: 'steadfast',
        apiKey: 'wzxwcbfedit8zvye6jssebbx\\',
        secretKey: 'jv5jnrpgydfdzfl\\',
        apiUrl: 'https://portal.packzy.com/api/v1',
        storeId: 'SF-HUB-DHAKA',
        webhookUrl: 'https://luxeshopbd.com/api/webhooks/steadfast',
        surchargeFee: 0,
        isActive: false,
        isDefault: false,
        notes: 'Steadfast Courier API Integration for automated order parcel booking.',
      },
      {
        id: 'cr-pathao',
        name: 'Pathao Courier',
        code: 'pathao',
        apiKey: 'pth_live_88291039',
        secretKey: 'sec_pth_9918237',
        token: 'nAggE4j7YVXTGlkZyUUkxqajjxGMRWgiTTK8u5rC',
        apiUrl: 'https://api-hermes.pathao.com',
        storeId: 'STORE-DHAKA-01',
        webhookUrl: 'https://luxeshopbd.com/api/webhooks/pathao',
        surchargeFee: 0,
        isActive: true,
        isDefault: true,
        notes: 'Pathao Hermes Courier API Integration.',
      },
      {
        id: 'cr-redx',
        name: 'RedX Courier',
        code: 'redx',
        apiKey: 'redx_token_991203',
        secretKey: 'redx_sec_3321',
        token: 'redx_token_991203',
        apiUrl: 'https://api.redx.com.bd',
        storeId: 'HUB-1004',
        webhookUrl: 'https://luxeshopbd.com/api/webhooks/redx',
        surchargeFee: 10,
        isActive: true,
        isDefault: false,
        notes: 'RedX door-to-door parcel delivery.',
      },
      {
        id: 'cr-paperfly',
        name: 'Paperfly Courier',
        code: 'paperfly',
        apiKey: 'pf_mch_55410',
        secretKey: 'pf_pass_8812',
        apiUrl: 'https://api.paperfly.com.bd',
        storeId: 'PF-STORE-01',
        webhookUrl: 'https://luxeshopbd.com/api/webhooks/paperfly',
        surchargeFee: 0,
        isActive: true,
        isDefault: false,
        notes: 'Paperfly smart logistics API.',
      },
      {
        id: 'cr-ecourier',
        name: 'eCourier Bangladesh',
        code: 'ecourier',
        apiKey: 'ec_key_44102',
        secretKey: 'ec_sec_1102',
        apiUrl: 'https://backoffice.ecourier.com.bd/api',
        storeId: 'EC-DHAKA',
        webhookUrl: 'https://luxeshopbd.com/api/webhooks/ecourier',
        surchargeFee: 5,
        isActive: false,
        isDefault: false,
        notes: 'eCourier merchant API.',
      },
      {
        id: 'cr-sundarban',
        name: 'Sundarban Courier',
        code: 'sundarban',
        apiKey: 'snd_br_1012',
        secretKey: 'snd_sec_884',
        apiUrl: 'https://api.sundarbancourier.com.bd',
        storeId: 'SND-MOTIJHEEL',
        webhookUrl: 'https://luxeshopbd.com/api/webhooks/sundarban',
        surchargeFee: 0,
        isActive: false,
        isDefault: false,
        notes: 'Sundarban branch parcel booking.',
      },
    ];
  });

  const [testApiModalData, setTestApiModalData] = useState<{
    courierName: string;
    status: string;
    endpointUrl: string;
    apiKey: string;
    secretKey: string;
    sampleConsignmentId: string;
    responsePayload: string;
  } | null>(null);

  const [newCourierName, setNewCourierName] = useState('');
  const [newCourierApiKey, setNewCourierApiKey] = useState('');
  const [newCourierSecret, setNewCourierSecret] = useState('');
  const [newCourierUrl, setNewCourierUrl] = useState('');
  const [newCourierStoreId, setNewCourierStoreId] = useState('');

  // Courier Website & Tracking Helpers
  const getCourierPortalUrl = (courierName: string) => {
    const c = (courierName || '').toLowerCase();
    if (c.includes('steadfast')) {
      return 'https://portal.packzy.com';
    }
    if (c.includes('pathao')) {
      return 'https://merchant.pathao.com';
    }
    if (c.includes('redx')) {
      return 'https://redx.com.bd';
    }
    if (c.includes('paperfly')) {
      return 'https://paperfly.com.bd';
    }
    if (c.includes('ecourier')) {
      return 'https://backoffice.ecourier.com.bd';
    }
    if (c.includes('sundarban')) {
      return 'https://sundarbancourier.com.bd';
    }
    return 'https://portal.packzy.com';
  };

  const getCourierTrackingUrl = (courierName: string, trackingId?: string) => {
    const c = (courierName || '').toLowerCase();
    if (c.includes('steadfast')) {
      return trackingId ? `https://steadfast.com.bd/tracking?consignment_id=${trackingId}` : 'https://steadfast.com.bd/tracking';
    }
    if (c.includes('pathao')) {
      return 'https://pathao.com/courier-tracking/';
    }
    if (c.includes('redx')) {
      return trackingId ? `https://redx.com.bd/track-parcel/${trackingId}` : 'https://redx.com.bd/track-parcel/';
    }
    return 'https://portal.packzy.com';
  };

  // Order Courier Direct Booking State & Handlers
  const [orderSelectedCourier, setOrderSelectedCourier] = useState<Record<string, string>>({});
  const [editingCourierOrderId, setEditingCourierOrderId] = useState<string | null>(null);
  const [bookingSuccessModalData, setBookingSuccessModalData] = useState<{
    isOpen: boolean;
    orderNumber: string;
    courierName: string;
    trackingId: string;
    portalUrl: string;
    trackingUrl: string;
  } | null>(null);

  // Steadfast Courier Merchant Portal State
  const [courierSubTab, setCourierSubTab] = useState<'portal' | 'settings'>('portal');
  const [steadfastActiveFilter, setSteadfastActiveFilter] = useState<string>('All');
  const [steadfastSearchQuery, setSteadfastSearchQuery] = useState<string>('');
  const [selectedParcelDetail, setSelectedParcelDetail] = useState<any | null>(null);
  const [isAddParcelModalOpen, setIsAddParcelModalOpen] = useState<boolean>(false);

  // New Parcel Form State
  const [newParcelCustomerName, setNewParcelCustomerName] = useState('');
  const [newParcelPhone, setNewParcelPhone] = useState('');
  const [newParcelAddress, setNewParcelAddress] = useState('');
  const [newParcelPayment, setNewParcelPayment] = useState('750');
  const [newParcelCharge, setNewParcelCharge] = useState('105');

  // Manual Steadfast Consignments List
  const [manualSteadfastParcels, setManualSteadfastParcels] = useState<Array<{
    sl: number;
    date: string;
    id: string;
    customerName: string;
    phone: string;
    address: string;
    payment: number;
    charge: number;
    status: 'Pending' | 'Approval Pending' | 'Delivered' | 'Partly Delivered' | 'Cancelled';
  }>>([]);

  // AI Dashboard Active System Controls State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notificationsList, setNotificationsList] = useState<Array<{ id: string; title: string; time: string; read: boolean; type: string }>>([]);

  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState<boolean>(false);
  const [revenueTimeframe, setRevenueTimeframe] = useState<'8 Days' | '7 Days' | '30 Days' | 'This Month'>('8 Days');
  const [isRevenueTimeframeDropdownOpen, setIsRevenueTimeframeDropdownOpen] = useState<boolean>(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);
  const [monthlyTargetGoal, setMonthlyTargetGoal] = useState<number>(2000000);
  const [customGoalInput, setCustomGoalInput] = useState<string>('2000000');

  const handleCreateManualParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcelCustomerName.trim()) {
      showToast('⚠️ Please enter customer name');
      return;
    }
    const generatedId = `265${Math.floor(100000 + Math.random() * 900000)}`;
    const newParcel = {
      sl: 1,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      id: generatedId,
      customerName: newParcelCustomerName,
      phone: newParcelPhone || '01700000000',
      address: newParcelAddress || 'Dhaka',
      payment: Number(newParcelPayment) || 750,
      charge: Number(newParcelCharge) || 105,
      status: 'Pending' as const,
    };

    setManualSteadfastParcels([newParcel, ...manualSteadfastParcels]);
    setIsAddParcelModalOpen(false);
    setNewParcelCustomerName('');
    setNewParcelPhone('');
    setNewParcelAddress('');
    showToast(`✅ Consignment #${generatedId} created successfully in Steadfast Courier!`);
  };

  const getCombinedSteadfastParcels = () => {
    const bookedOrdersParcels = orders.map((ord, idx) => {
      const numOnly = ord.courierDetails?.trackingId?.replace(/\D/g, '');
      const consignmentId = numOnly && numOnly.length >= 6 ? numOnly : `2658${Math.floor(10000 + (parseInt(ord.orderNumber?.replace(/\D/g, '') || '100') * 13) % 90000)}`;

      let mappedStatus: 'Pending' | 'Approval Pending' | 'Delivered' | 'Partly Delivered' | 'Cancelled' = 'Pending';
      if (ord.orderStatus === 'Delivered') mappedStatus = 'Delivered';
      else if (ord.orderStatus === 'Cancelled') mappedStatus = 'Cancelled';
      else if (ord.orderStatus === 'Processing') mappedStatus = 'Approval Pending';
      else if (ord.orderStatus === 'In Delivery') mappedStatus = 'Pending';

      return {
        sl: idx + 1,
        date: ord.createdAt
          ? new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date(ord.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : 'August 04, 2026 01:15 PM',
        id: consignmentId,
        customerName: ord.customer?.fullName || 'Customer - ' + (ord.orderNumber || ord.id),
        phone: ord.customer?.phone || '01700000000',
        address: `${ord.customer?.address || ''}, ${ord.customer?.thana || ''}, ${ord.customer?.district || 'Dhaka'}`,
        payment: ord.totalAmount || 0,
        charge: ord.deliveryCharge || 105,
        status: mappedStatus,
        orderNumber: ord.orderNumber || ord.id,
        items: ord.items
      };
    });

    const combined = [...bookedOrdersParcels, ...manualSteadfastParcels];

    return combined
      .filter((item) => {
        if (steadfastActiveFilter !== 'All' && steadfastActiveFilter !== 'List by Date') {
          if (steadfastActiveFilter === 'Pending' && item.status !== 'Pending') return false;
          if (steadfastActiveFilter === 'Approval Pending' && item.status !== 'Approval Pending') return false;
          if (steadfastActiveFilter === 'Delivered' && item.status !== 'Delivered') return false;
          if (steadfastActiveFilter === 'Partly Delivered' && item.status !== 'Partly Delivered') return false;
          if (steadfastActiveFilter === 'Cancelled' && item.status !== 'Cancelled') return false;
        }

        if (steadfastSearchQuery.trim()) {
          const q = steadfastSearchQuery.toLowerCase().trim();
          const matchId = item.id.toLowerCase().includes(q);
          const matchName = item.customerName.toLowerCase().includes(q);
          const matchPhone = (item.phone || '').toLowerCase().includes(q);
          const matchOrder = (item.orderNumber || '').toLowerCase().includes(q);
          return matchId || matchName || matchPhone || matchOrder;
        }

        return true;
      })
      .map((item, index) => ({
        ...item,
        sl: index + 1
      }));
  };

  const handleDirectCourierSubmit = (ord: Order) => {
    const selectedCourier = orderSelectedCourier[ord.id] || courierList[0]?.name || 'Steadfast Courier';

    const trackingNum = `2658${Math.floor(100000 + Math.random() * 900000)}`;

    if (onBookCourier) {
      onBookCourier(ord.id, selectedCourier, trackingNum);
    } else if (onUpdateOrderStatus) {
      onUpdateOrderStatus(ord.id, 'In Delivery');
    }

    setEditingCourierOrderId(null);

    showToast(`✅ Order #${ord.orderNumber || ord.id} submitted to ${selectedCourier} (Consignment #${trackingNum}).`);
  };

  const handleBulkSubmitPendingOrders = () => {
    const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || !o.courierDetails);
    if (pendingOrders.length === 0) {
      showToast('ℹ️ All pending orders are already booked with Courier.');
      return;
    }

    const defaultCourier = courierList[0]?.name || 'Steadfast Courier';
    pendingOrders.forEach((o) => {
      const trackingNum = `2658${Math.floor(100000 + Math.random() * 900000)}`;
      if (onBookCourier) {
        onBookCourier(o.id, defaultCourier, trackingNum);
      }
    });

    showToast(`🚀 ${pendingOrders.length} pending order(s) submitted to ${defaultCourier}!`);
  };

  const renderSteadfastMerchantPortalContent = () => {
    const combinedParcels = getCombinedSteadfastParcels();

    return (
      <div className="bg-[#f8fafc] text-slate-800 rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden font-sans">
        {/* Steadfast Portal Top Bar */}
        <div className="bg-white border-b border-slate-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          {/* Left: Menu & Brand Logo */}
          <div className="flex items-center gap-3">
            <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#00b894] rounded-lg flex items-center justify-center text-white shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl font-display text-slate-900 tracking-tight flex items-center gap-1">
                Stead<span className="text-[#00b894]">Fast</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 bg-slate-100 px-1.5 py-0.5 rounded">Courier</span>
              </span>
            </div>

            {/* Search Consignment */}
            <div className="relative max-w-xs w-48 sm:w-64 ml-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={steadfastSearchQuery}
                onChange={(e) => setSteadfastSearchQuery(e.target.value)}
                placeholder="Search Consignment"
                className="w-full bg-slate-100/90 border border-slate-200/80 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#00b894]"
              />
            </div>
          </div>

          {/* Right: Balance, Lang, Notifications, Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('💰 Steadfast Merchant Current Balance: ৳ 45,820')}
              className="bg-white border border-[#00b894]/80 text-[#00b894] font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 hover:bg-emerald-50 cursor-pointer shadow-2xs transition-all"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="w-2.5 h-2.5 text-[#00b894]" />
              </div>
              <span>Check Balance</span>
            </button>

            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-lg">EN</span>

            <button
              onClick={() => showToast('🔔 292 new notifications in Steadfast Courier Merchant Portal')}
              className="relative p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full">292</span>
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white text-[10px] font-black flex items-center justify-center border-2 border-emerald-500 shadow-2xs">
                A-WEB
              </div>
            </div>
          </div>
        </div>

        {/* Top Sub-Nav Bar (Pills matching Steadfast screenshot) */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setSteadfastActiveFilter('All')}
            className="bg-white border border-slate-300 text-slate-900 font-extrabold px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 cursor-pointer"
          >
            <span className="text-rose-500">📕</span>
            <span>Consignments</span>
          </button>

          <button
            onClick={() => setIsAddParcelModalOpen(true)}
            className="bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 font-bold px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs hover:bg-emerald-50 cursor-pointer transition-all"
          >
            <span className="text-emerald-600 font-black">+</span>
            <span>Add Parcel</span>
          </button>

          <button
            onClick={() => showToast('⬆ Bulk Import feature open! Upload Excel / CSV file.')}
            className="bg-white border border-slate-200 text-slate-800 font-bold px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs hover:bg-amber-50 cursor-pointer"
          >
            <span className="text-amber-600">⬆</span>
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => showToast('➔ Pickup request scheduled with Steadfast Hub!')}
            className="bg-white border border-slate-200 text-slate-800 font-bold px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs hover:bg-yellow-50 cursor-pointer"
          >
            <span className="text-yellow-600">➔</span>
            <span>Pickup request</span>
          </button>

          <button
            onClick={() => showToast('❓ Steadfast 24/7 Merchant Support: 09600-000000')}
            className="bg-white border border-slate-200 text-slate-800 font-bold px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs hover:bg-cyan-50 cursor-pointer"
          >
            <span className="text-cyan-600">❓</span>
            <span>Support</span>
          </button>
        </div>

        {/* Portal Main Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 font-display tracking-tight">All Parcel</h2>
            <div className="text-xs font-bold text-slate-500">
              Total Parcels: <span className="text-[#00b894] font-black">{combinedParcels.length}</span>
            </div>
          </div>

          {/* Filter Tabs matching Steadfast screenshot */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
            {[
              { id: 'All', label: 'All' },
              { id: 'List by Date', label: 'List by Date' },
              { id: 'Pending', label: 'Pending' },
              { id: 'Approval Pending', label: 'Approval Pending' },
              { id: 'Delivered', label: 'Delivered' },
              { id: 'Partly Delivered', label: 'Partly Delivered' },
              { id: 'Cancelled', label: 'Cancelled' },
            ].map((tab) => {
              const isActive = steadfastActiveFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSteadfastActiveFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00b894] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* All Parcels Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50/70">
                  <th className="p-3.5 font-bold">SL#</th>
                  <th className="p-3.5 font-bold">Date</th>
                  <th className="p-3.5 font-bold">Id</th>
                  <th className="p-3.5 font-bold">Customer Name</th>
                  <th className="p-3.5 font-bold text-center">Payment</th>
                  <th className="p-3.5 font-bold text-center">Charge</th>
                  <th className="p-3.5 font-bold text-center">Status</th>
                  <th className="p-3.5 font-bold text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {combinedParcels.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                      No consignment parcels found matching filter.
                    </td>
                  </tr>
                ) : (
                  combinedParcels.map((item) => (
                    <tr key={`${item.id}-${item.sl}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-600">{item.sl}</td>
                      <td className="p-3.5 font-medium text-slate-600 min-w-[150px]">{item.date}</td>
                      <td className="p-3.5">
                        <span
                          onClick={() => setSelectedParcelDetail(item)}
                          className="font-mono font-extrabold text-[#00b894] hover:underline cursor-pointer text-xs"
                          title="Click to view full consignment details"
                        >
                          {item.id}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 min-w-[160px]">{item.customerName}</td>
                      <td className="p-3.5 font-extrabold text-slate-800 text-center">{item.payment}</td>
                      <td className="p-3.5 font-bold text-slate-600 text-center">{item.charge}</td>
                      <td className="p-3.5 text-center">
                        {item.status === 'Cancelled' && (
                          <span className="inline-block bg-[#e74c3c] text-white font-extrabold px-3 py-1 rounded-lg text-[11px] shadow-2xs">
                            Cancelled
                          </span>
                        )}
                        {item.status === 'Delivered' && (
                          <div className="inline-flex flex-col gap-0.5 items-center">
                            <span className="bg-[#2ecc71] text-white font-extrabold px-2.5 py-0.5 rounded-md text-[10px]">
                              Delivered
                            </span>
                            <span className="bg-[#27ae60] text-white font-bold px-2.5 py-0.5 rounded-md text-[9px]">
                              cleared
                            </span>
                          </div>
                        )}
                        {item.status === 'Partly Delivered' && (
                          <div className="inline-flex items-center gap-1">
                            <span className="bg-[#3498db] text-white font-extrabold px-2.5 py-1 rounded-lg text-[10px]">
                              Partially Delivered
                            </span>
                          </div>
                        )}
                        {item.status === 'Pending' && (
                          <span className="inline-block bg-[#00b894] text-white font-extrabold px-3 py-1 rounded-lg text-[11px]">
                            Pending
                          </span>
                        )}
                        {item.status === 'Approval Pending' && (
                          <span className="inline-block bg-[#f1c40f] text-slate-900 font-extrabold px-3 py-1 rounded-lg text-[11px]">
                            Approval Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setSelectedParcelDetail(item)}
                          className="text-[#00b894] font-extrabold text-xs hover:underline cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const updateCourierField = (id: string, field: keyof CourierServiceItem, value: any) => {
    setCourierList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveCourierCard = (courier: CourierServiceItem, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCourierList((prev) => {
      const updated = prev.map((c) => (c.id === courier.id ? courier : c));
      localStorage.setItem('luxeshop_courier_list', JSON.stringify(updated));
      return updated;
    });
    showToast(`✅ ${courier.name} API saved & verified! Status: ${courier.isActive ? 'Active' : 'Disabled'}`);
  };

  const handleTestCourierConnection = (courier: CourierServiceItem) => {
    const consignment = `${courier.code.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTestApiModalData({
      courierName: courier.name,
      status: courier.isActive ? '200 OK (Active)' : '403 Disabled (Inactive)',
      endpointUrl: courier.apiUrl || 'https://portal.packzy.com/api/v1',
      apiKey: courier.apiKey || courier.token || 'N/A',
      secretKey: courier.secretKey || 'N/A',
      sampleConsignmentId: consignment,
      responsePayload: JSON.stringify(
        {
          status: courier.isActive ? 200 : 403,
          success: courier.isActive,
          message: courier.isActive
            ? `${courier.name} API Handshake Successful. Ready for live order dispatch.`
            : `${courier.name} API is set to Disabled status.`,
          courier_code: courier.code,
          api_url: courier.apiUrl,
          credentials: {
            api_key: courier.apiKey ? `${courier.apiKey.slice(0, 10)}...` : 'N/A',
            secret_key: courier.secretKey ? `${courier.secretKey.slice(0, 6)}...` : 'N/A',
            store_id: courier.storeId || 'DEFAULT-HUB',
          },
          sample_consignment: {
            tracking_code: consignment,
            recipient: 'Demo Customer (Dhaka)',
            cod_amount: 1250,
            delivery_charge: 60,
            parcel_status: 'In Transit',
          },
          response_time_ms: Math.floor(18 + Math.random() * 25),
        },
        null,
        2
      ),
    });
  };

  const handleAddCustomCourierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourierName.trim()) return;
    const code = newCourierName.toLowerCase().replace(/\s+/g, '_');
    const created: CourierServiceItem = {
      id: `cr-${Date.now()}`,
      name: newCourierName.trim(),
      code,
      apiKey: newCourierApiKey.trim() || 'api_key_custom',
      secretKey: newCourierSecret.trim() || 'secret_key_custom',
      apiUrl: newCourierUrl.trim() || 'https://api.courier.com/v1',
      storeId: newCourierStoreId.trim() || 'STORE-01',
      webhookUrl: `https://luxeshopbd.com/api/webhooks/${code}`,
      surchargeFee: 0,
      isActive: true,
      isDefault: false,
      notes: 'Custom Courier API Endpoint',
    };
    const updated = [...courierList, created];
    setCourierList(updated);
    localStorage.setItem('luxeshop_courier_list', JSON.stringify(updated));
    showToast(`Courier service "${newCourierName}" added & saved!`);
    setNewCourierName('');
    setNewCourierApiKey('');
    setNewCourierSecret('');
    setNewCourierUrl('');
    setNewCourierStoreId('');
  };

  const handleDeleteCourier = (id: string, name: string) => {
    if (confirm(`Remove courier service "${name}"?`)) {
      const updated = courierList.filter((c) => c.id !== id);
      setCourierList(updated);
      localStorage.setItem('luxeshop_courier_list', JSON.stringify(updated));
      showToast(`Courier "${name}" deleted!`);
    }
  };

  const handleSetDefaultCourier = (id: string) => {
    const updated = courierList.map((c) => ({ ...c, isDefault: c.id === id }));
    setCourierList(updated);
    localStorage.setItem('luxeshop_courier_list', JSON.stringify(updated));
    showToast('Default courier updated!');
  };

  // --- 7. PAYMENT GATEWAYS STATE ---
  interface PaymentGatewayItem {
    id: string;
    name: string;
    code: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | 'cod' | 'custom';
    accountType: 'Personal' | 'Merchant';
    number: string;
    apiKey?: string;
    apiSecret?: string;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    branch?: string;
    routingNo?: string;
    codAdvanceFeeRequired?: boolean;
    advanceFeeAmount?: number;
    instructions?: string;
    isActive: boolean;
    badgeBg: string;
    badgeText: string;
  }

  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayItem[]>([
    {
      id: 'pg1',
      name: 'bKash Merchant Gateway',
      code: 'bkash',
      accountType: 'Merchant',
      number: '01700000000',
      apiKey: 'bKash_app_key_883910',
      apiSecret: 'bKash_app_sec_991823',
      instructions: 'Pay via bKash Merchant API or dial *247# to make payment.',
      isActive: true,
      badgeBg: 'bg-pink-100 border-pink-200 text-pink-900',
      badgeText: 'bKash Active',
    },
    {
      id: 'pg2',
      name: 'Nagad Personal / Merchant',
      code: 'nagad',
      accountType: 'Merchant',
      number: '01800000000',
      apiKey: 'nagad_pub_key_7712',
      apiSecret: 'nagad_priv_key_4412',
      instructions: 'Pay via Nagad App or dial *167# and input 8-digit TxnID.',
      isActive: true,
      badgeBg: 'bg-orange-100 border-orange-200 text-orange-900',
      badgeText: 'Nagad Active',
    },
    {
      id: 'pg3',
      name: 'Rocket Mobile Banking',
      code: 'rocket',
      accountType: 'Personal',
      number: '01900000000-9',
      instructions: 'Send Money via DBBL Rocket menu option 1 to personal number.',
      isActive: true,
      badgeBg: 'bg-purple-100 border-purple-200 text-purple-900',
      badgeText: 'Rocket Active',
    },
    {
      id: 'pg4',
      name: 'Upay Digital Wallet',
      code: 'upay',
      accountType: 'Personal',
      number: '01300000000',
      instructions: 'Send money or merchant payment via Upay mobile app.',
      isActive: true,
      badgeBg: 'bg-blue-100 border-blue-200 text-blue-900',
      badgeText: 'Upay Active',
    },
    {
      id: 'pg5',
      name: 'Bank Wire Transfer',
      code: 'bank',
      accountType: 'Merchant',
      number: '1502938481001',
      bankName: 'City Bank Ltd',
      bankAccountName: 'A-TIDY FASHION BD',
      bankAccountNumber: '1502938481001',
      branch: 'Gulshan-1 Branch, Dhaka',
      routingNo: '22526182',
      instructions: 'Deposit or wire funds to City Bank account.',
      isActive: true,
      badgeBg: 'bg-slate-100 border-slate-300 text-slate-900',
      badgeText: 'Bank Transfer Active',
    },
    {
      id: 'pg6',
      name: 'Cash on Delivery (COD)',
      code: 'cod',
      accountType: 'Personal',
      number: 'N/A',
      codAdvanceFeeRequired: true,
      advanceFeeAmount: 120,
      instructions: 'Pay remaining cash upon delivery. ৳120 advance shipping charge required.',
      isActive: true,
      badgeBg: 'bg-emerald-100 border-emerald-200 text-emerald-900',
      badgeText: 'COD Active',
    },
  ]);

  const [editingGateway, setEditingGateway] = useState<PaymentGatewayItem | null>(null);
  const [newGatewayName, setNewGatewayName] = useState('');
  const [newGatewayNumber, setNewGatewayNumber] = useState('');

  const handleAddCustomGatewaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGatewayName.trim()) return;
    const created: PaymentGatewayItem = {
      id: `pg-${Date.now()}`,
      name: newGatewayName.trim(),
      code: 'custom',
      accountType: 'Personal',
      number: newGatewayNumber.trim() || '01700000000',
      instructions: 'Follow standard payment instructions.',
      isActive: true,
      badgeBg: 'bg-amber-100 border-amber-200 text-amber-900',
      badgeText: 'Active',
    };
    setPaymentGateways([...paymentGateways, created]);
    showToast(`Payment gateway "${newGatewayName}" added!`);
    setNewGatewayName('');
    setNewGatewayNumber('');
  };

  const handleUpdateGatewaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGateway) return;
    setPaymentGateways((prev) => prev.map((g) => (g.id === editingGateway.id ? editingGateway : g)));
    showToast(`Payment Gateway "${editingGateway.name}" updated!`);
    setEditingGateway(null);
  };

  const handleDeleteGateway = (id: string, name: string) => {
    if (confirm(`Remove payment gateway "${name}"?`)) {
      setPaymentGateways((prev) => prev.filter((g) => g.id !== id));
      showToast(`Gateway "${name}" deleted!`);
    }
  };

  const handleToggleGatewayActive = (id: string) => {
    setPaymentGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isActive: !g.isActive } : g))
    );
    showToast('Payment method active status updated!');
  };

  // --- 8. MULTI-CURRENCY EXCHANGE RATES ---
  const [currencies, setCurrencies] = useState<{ code: string; symbol: string; name: string; rate: number; isDefault?: boolean; isActive?: boolean }[]>(() => {
    const saved = localStorage.getItem('luxeshop_currencies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rate: 1, isDefault: true, isActive: true },
      { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.0083, isDefault: false, isActive: true },
      { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.0076, isDefault: false, isActive: true },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 0.71, isDefault: false, isActive: true },
      { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rate: 0.031, isDefault: false, isActive: true },
      { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 0.030, isDefault: false, isActive: true },
    ];
  });

  const [newCurrCode, setNewCurrCode] = useState('');
  const [newCurrSymbol, setNewCurrSymbol] = useState('');
  const [newCurrName, setNewCurrName] = useState('');
  const [newCurrRate, setNewCurrRate] = useState('');
  const [calcBdtAmount, setCalcBdtAmount] = useState('1000');

  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrCode.trim() || !newCurrRate) return;
    const rateNum = Number(newCurrRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      showToast('Please enter a valid positive exchange rate.');
      return;
    }
    const created = {
      code: newCurrCode.trim().toUpperCase(),
      symbol: newCurrSymbol.trim() || '$',
      name: newCurrName.trim() || newCurrCode.trim().toUpperCase(),
      rate: rateNum,
      isDefault: false,
      isActive: true,
    };
    const updated = [...currencies, created];
    setCurrencies(updated);
    localStorage.setItem('luxeshop_currencies', JSON.stringify(updated));
    showToast(`Currency ${created.code} added!`);
    setNewCurrCode('');
    setNewCurrSymbol('');
    setNewCurrName('');
    setNewCurrRate('');
  };

  const handleUpdateCurrencyRate = (code: string, newRate: number) => {
    const updated = currencies.map((c) => (c.code === code ? { ...c, rate: newRate } : c));
    setCurrencies(updated);
    localStorage.setItem('luxeshop_currencies', JSON.stringify(updated));
    showToast(`Updated exchange rate for ${code}!`);
  };

  const handleToggleCurrencyActive = (code: string) => {
    const updated = currencies.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c));
    setCurrencies(updated);
    localStorage.setItem('luxeshop_currencies', JSON.stringify(updated));
    showToast(`Toggled ${code} active state.`);
  };

  const handleDeleteCurrency = (code: string) => {
    if (confirm(`Remove currency ${code}?`)) {
      const updated = currencies.filter((c) => c.code !== code);
      setCurrencies(updated);
      localStorage.setItem('luxeshop_currencies', JSON.stringify(updated));
      showToast(`Currency ${code} removed.`);
    }
  };

  // --- 9. WEBSITE THEME & ANNOUNCEMENT BAR ---
  const [announcementText, setAnnouncementText] = useState(() => {
    return localStorage.getItem('luxeshop_announcement') || '🚀 Direct Manufacturer Pricing | ৳60 Inside Dhaka • ৳120 Outside • ৳150 Thana';
  });
  const [primaryBrandColor, setPrimaryBrandColor] = useState('#f97316'); // Orange-500

  // --- 10. GENERAL WEBSITE SETTINGS & LOGO / HEADER / FOOTER ---
  const [siteLogoUrl, setSiteLogoUrl] = useState<string>(() => {
    return localStorage.getItem('luxeshop_site_logo') || activeThemeConfig?.lightLogoUrl || '';
  });
  const [siteTitle, setSiteTitle] = useState(() => activeThemeConfig?.siteTitle || localStorage.getItem('luxeshop_site_title') || 'LuxeShop');
  const [siteTitleSuffix, setSiteTitleSuffix] = useState(() => activeThemeConfig?.siteTitleSuffix || localStorage.getItem('luxeshop_site_suffix') || 'BD');
  const [siteTagline, setSiteTagline] = useState(() => activeThemeConfig?.siteTagline || localStorage.getItem('luxeshop_site_tagline') || 'Wholesale & Retail Market');
  const [sitePhone, setSitePhone] = useState(() => activeThemeConfig?.supportPhone || localStorage.getItem('luxeshop_site_phone') || '01700000000');
  const [siteEmail, setSiteEmail] = useState(() => activeThemeConfig?.supportEmail || localStorage.getItem('luxeshop_site_email') || 'support@luxeshopbd.com');
  const [siteAddress, setSiteAddress] = useState(() => activeThemeConfig?.storeAddress || localStorage.getItem('luxeshop_site_address') || 'Level 4, Suvastu Arcade, New Elephant Road, Dhaka-1205');
  const [workingHours, setWorkingHours] = useState(() => activeThemeConfig?.workingHours || localStorage.getItem('luxeshop_working_hours') || 'Daily: 9:00 AM - 11:00 PM');
  const [siteFacebook, setSiteFacebook] = useState(() => activeThemeConfig?.facebookUrl || localStorage.getItem('luxeshop_site_facebook') || 'https://facebook.com/luxeshopbd');
  const [siteWhatsapp, setSiteWhatsapp] = useState(() => activeThemeConfig?.whatsappNumber || localStorage.getItem('luxeshop_site_whatsapp') || '01700000000');
  const [siteInstagram, setSiteInstagram] = useState(() => activeThemeConfig?.instagramUrl || localStorage.getItem('luxeshop_site_instagram') || 'https://instagram.com/luxeshopbd');
  const [siteYoutube, setSiteYoutube] = useState(() => activeThemeConfig?.youtubeUrl || localStorage.getItem('luxeshop_site_youtube') || 'https://youtube.com');
  const [siteCopyright, setSiteCopyright] = useState(() => activeThemeConfig?.copyrightNotice || localStorage.getItem('luxeshop_site_copyright') || '© 2026 LuxeShop BD. All rights reserved.');
  const [footerAboutTitle, setFooterAboutTitle] = useState(() => activeThemeConfig?.footerAboutTitle || 'LuxeShop BD');
  const [footerAboutText, setFooterAboutText] = useState(() => activeThemeConfig?.footerAboutText || "Bangladesh's leading multi-vendor wholesale & retail e-commerce portal.");
  const [footerFastShippingText, setFooterFastShippingText] = useState(() => activeThemeConfig?.footerFastShippingText || 'Dhaka ৳60 • Outside ৳120');
  const [footerGenuineWarrantyText, setFooterGenuineWarrantyText] = useState(() => activeThemeConfig?.footerGenuineWarrantyText || 'Official Brand Warranty');
  const [footerWholesaleBadgeText, setFooterWholesaleBadgeText] = useState(() => activeThemeConfig?.footerWholesaleBadgeText || 'Direct Manufacturer Price');
  const [footerReturnPolicyText, setFooterReturnPolicyText] = useState(() => activeThemeConfig?.footerReturnPolicyText || 'Hassle-Free Replacement');

  const handleSiteLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB. Please select a smaller logo photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSiteLogoUrl(dataUrl);
        saveToMediaFiles({
          id: `m-logo-${Date.now()}`,
          name: file.name || `Brand-Logo-${Date.now()}`,
          url: dataUrl,
          category: 'banner',
          size: `${Math.round(file.size / 1024)} KB`,
          dimensions: 'Brand Logo',
          uploadedAt: new Date().toISOString(),
        });
        showToast('Logo uploaded from device & saved to File Manager!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveWebsiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${siteTitle} ${siteTitleSuffix}`.trim();
    localStorage.setItem('luxeshop_site_logo', siteLogoUrl);
    localStorage.setItem('luxeshop_site_name', fullName);
    localStorage.setItem('luxeshop_site_title', siteTitle);
    localStorage.setItem('luxeshop_site_suffix', siteTitleSuffix);
    localStorage.setItem('luxeshop_site_tagline', siteTagline);
    localStorage.setItem('luxeshop_site_phone', sitePhone);
    localStorage.setItem('luxeshop_site_email', siteEmail);
    localStorage.setItem('luxeshop_site_address', siteAddress);
    localStorage.setItem('luxeshop_working_hours', workingHours);
    localStorage.setItem('luxeshop_site_facebook', siteFacebook);
    localStorage.setItem('luxeshop_site_whatsapp', siteWhatsapp);
    localStorage.setItem('luxeshop_site_instagram', siteInstagram);
    localStorage.setItem('luxeshop_site_youtube', siteYoutube);
    localStorage.setItem('luxeshop_site_copyright', siteCopyright);
    localStorage.setItem('luxeshop_announcement', announcementText);

    // Sync into activeThemeConfig so whole site (Header & Footer) re-renders immediately
    const updatedTheme: ThemeConfig = {
      ...activeThemeConfig,
      lightLogoUrl: siteLogoUrl || activeThemeConfig.lightLogoUrl,
      darkLogoUrl: siteLogoUrl || activeThemeConfig.darkLogoUrl,
      siteTitle: siteTitle,
      siteTitleSuffix: siteTitleSuffix,
      siteTagline: siteTagline,
      announcementText: announcementText,
      facebookUrl: siteFacebook,
      whatsappNumber: siteWhatsapp,
      instagramUrl: siteInstagram,
      youtubeUrl: siteYoutube,
      copyrightNotice: siteCopyright,
      footerAboutTitle: footerAboutTitle,
      footerAboutText: footerAboutText,
      supportEmail: siteEmail,
      supportPhone: sitePhone,
      storeAddress: siteAddress,
      workingHours: workingHours,
      footerFastShippingText: footerFastShippingText,
      footerGenuineWarrantyText: footerGenuineWarrantyText,
      footerWholesaleBadgeText: footerWholesaleBadgeText,
      footerReturnPolicyText: footerReturnPolicyText,
    };

    handleSaveThemeConfig(updatedTheme);
    showToast('✅ Logo, Header, Footer & Store Settings saved successfully!');
  };

  // --- 11. SECURITY & ACCESS CONTROL ---
  const [adminPhone, setAdminPhone] = useState('01700000000');
  const [adminOldPassword, setAdminOldPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Admin password and security keys updated!');
    setAdminOldPassword('');
    setAdminNewPassword('');
  };

  // Calculated Analytics Data
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const totalDeliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    if (productTypeFilter === 'retail') return p.vendorId === 'v-admin' && (!p.wholesalePriceRules || p.wholesalePriceRules.length === 0);
    if (productTypeFilter === 'seller') return p.vendorId !== 'v-admin';
    if (productTypeFilter === 'wholesale') return p.wholesalePriceRules && p.wholesalePriceRules.length > 0;
    return true;
  });

  // Filtered Orders List
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !orderSearchQuery ||
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerPhone.includes(orderSearchQuery);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSeller =
      sellerOrderFilter === 'all' ||
      o.vendorId === sellerOrderFilter ||
      (o.vendorName && o.vendorName.toLowerCase().includes(sellerOrderFilter.toLowerCase()));
    return matchesSearch && matchesStatus && matchesSeller;
  });

  // Compiled Customer List (Registered users + Order Customers)
  const compiledCustomers = React.useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      phone: string;
      email: string;
      role: 'customer' | 'vendor' | 'admin';
      joinedDate: string;
      address: string;
      totalOrders: number;
      totalSpent: number;
      isRegistered: boolean;
    }> = [];

    const processedIdentifiers = new Set<string>();

    // 1. Registered Users
    (registeredUsers || []).forEach((user, idx) => {
      const identifier = user.phone || user.email || user.name;
      if (identifier) processedIdentifiers.add(identifier.toLowerCase());

      const userOrders = orders.filter(
        (o) =>
          (user.phone && o.customerPhone === user.phone) ||
          (user.email && o.customerEmail === user.email) ||
          (user.name && o.customerName?.toLowerCase() === user.name.toLowerCase())
      );
      const spent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const custId = (user as any).id || `CUST-${1001 + idx}`;

      list.push({
        id: custId,
        name: user.name || 'Registered Customer',
        phone: user.phone || 'N/A',
        email: user.email || 'N/A',
        role: user.role || 'customer',
        joinedDate: (user as any).joinedDate || 'August 2026',
        address: (user as any).address || 'Dhaka, Bangladesh',
        totalOrders: userOrders.length,
        totalSpent: spent,
        isRegistered: true,
      });
    });

    // 2. Orders Guest Customers
    orders.forEach((ord) => {
      const phoneKey = (ord.customerPhone || ord.customerEmail || ord.customerName || '').toLowerCase();
      if (phoneKey && !processedIdentifiers.has(phoneKey)) {
        processedIdentifiers.add(phoneKey);

        const guestOrders = orders.filter(
          (o) =>
            (ord.customerPhone && o.customerPhone === ord.customerPhone) ||
            (ord.customerEmail && o.customerEmail === ord.customerEmail) ||
            o.customerName === ord.customerName
        );
        const spent = guestOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const hashId = Math.abs(
          phoneKey.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
        );
        const custId = `CUST-${(hashId % 8999) + 1000}`;

        list.push({
          id: custId,
          name: ord.customerName || 'Order Guest',
          phone: ord.customerPhone || 'N/A',
          email: ord.customerEmail || 'N/A',
          role: 'customer',
          joinedDate: ord.createdAt
            ? new Date(ord.createdAt).toLocaleDateString()
            : 'Order Customer',
          address: `${ord.deliveryAddress?.thana || ''}, ${ord.deliveryAddress?.district || 'Dhaka'}`,
          totalOrders: guestOrders.length,
          totalSpent: spent,
          isRegistered: false,
        });
      }
    });

    return list;
  }, [registeredUsers, orders]);

  // Filtered Customers based on Search & Role
  const filteredCustomers = compiledCustomers.filter((c) => {
    const q = customerSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);

    const matchesRole = customerRoleFilter === 'all' || c.role === customerRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Handler to Add a New Customer
  const handleAddNewCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      showToast('⚠️ Please provide Customer Name & Phone Number');
      return;
    }

    const newId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAccount: any = {
      id: newId,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim() || `${newCustPhone.trim()}@customer.com`,
      password: '123456',
      role: newCustRole,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      address: newCustAddress.trim() || 'Dhaka, Bangladesh',
    };

    if (onUpdateRegisteredUsers) {
      onUpdateRegisteredUsers([...registeredUsers, newAccount]);
    }
    setIsAddCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAddress('');
    showToast(`✅ Customer ${newAccount.name} (${newId}) added successfully!`);
  };

  // Handler to Delete Customer
  const handleDeleteCustomer = (customer: any) => {
    setDeleteConfirmation({
      type: 'customer',
      id: customer.id || customer.phone,
      title: `Customer Account "${customer.name}" (${customer.id || customer.phone})`,
      extra: customer,
    });
  };

  // Handler to Login as Customer directly
  const handleLoginAsCustomer = (cust: any) => {
    const userObj: UserAccount = {
      id: cust.id,
      name: cust.name,
      phone: cust.phone !== 'N/A' ? cust.phone : '01700000000',
      email: cust.email !== 'N/A' ? cust.email : `${cust.phone || cust.id}@customer.com`,
      role: cust.role || 'customer',
      address: cust.address,
      joinedDate: cust.joinedDate,
    };

    if (onSwitchToUser) {
      onSwitchToUser(userObj);
      showToast(`🔓 Logged in as Customer: ${cust.name} (${cust.id})`);
    } else if (onSwitchToVendor && cust.role === 'vendor') {
      onSwitchToVendor(userObj);
      showToast(`🔓 Switched to Vendor Account: ${cust.name}`);
    } else {
      showToast(`🔓 Logged in as Customer: ${cust.name}`);
    }
  };

  // Handler to Delete Order
  const handleDeleteOrder = (orderId: string) => {
    setDeleteConfirmation({
      type: 'order',
      id: orderId,
      title: `Order #${orderId}`,
    });
  };

  // Execute actual deletion after modal confirmation
  const executeDeleteConfirm = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'order') {
      if (onDeleteOrder) {
        onDeleteOrder(deleteConfirmation.id);
      }
      showToast(`🗑️ Order #${deleteConfirmation.id} deleted successfully.`);
    } else if (deleteConfirmation.type === 'customer') {
      const customer = deleteConfirmation.extra;
      if (onUpdateRegisteredUsers && customer) {
        const updated = registeredUsers.filter(
          (u: any) => u.phone !== customer.phone && u.email !== customer.email && u.id !== customer.id
        );
        onUpdateRegisteredUsers(updated);
      }
      showToast(`🗑️ Customer ${customer?.name || deleteConfirmation.id} deleted successfully.`);
      if (selectedCustomerForCard && (selectedCustomerForCard.id === customer?.id || selectedCustomerForCard.phone === customer?.phone)) {
        setSelectedCustomerForCard(null);
      }
    }

    setDeleteConfirmation(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Toast Alert Popup */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-amber-400 border border-amber-400/40 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-rose-600 font-bold">This action cannot be undone!</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 font-medium">
              Are you sure you want to delete <strong className="text-slate-900">{deleteConfirmation.title}</strong>?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h1 className="font-extrabold text-sm flex items-center gap-1.5 font-display tracking-tight">
              A-TIDY Admin
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h1>
            <p className="text-[10px] text-slate-400">Control Panel</p>
          </div>
        </div>
        <span className="bg-slate-800 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-lg">
          ID: 01700000000
        </span>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 shadow-xs transition-transform duration-200 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Logo Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md font-black">
                AT
              </div>
              <div>
                <h2 className="font-black text-base text-slate-900 font-display tracking-tight">A-TIDY ADMIN</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SUPER ADMIN</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">Main Menu</p>

            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Orders</span>
              </div>
              {orders.length > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-white text-orange-600' : 'bg-slate-200 text-slate-700'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('customers');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 shrink-0" />
                <span>All Customers</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'customers' ? 'bg-white text-orange-600' : 'bg-slate-200 text-slate-700'
              }`}>
                {compiledCustomers.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('products');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4 shrink-0" />
                <span>Products & Stock</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'products' ? 'bg-white text-orange-600' : 'bg-slate-200 text-slate-700'
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('file_manager');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'file_manager'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FolderKanban className="w-4 h-4 shrink-0" />
                <span>File Manager</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'file_manager' ? 'bg-white text-orange-600' : 'bg-slate-200 text-slate-700'
              }`}>
                {mediaFiles.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('banners');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>Promo Banners</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'banners' ? 'bg-white text-orange-600' : 'bg-slate-200 text-slate-700'
              }`}>
                {bannersList.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('flash_cards');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'flash_cards'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Flash Cards & Deals</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === 'flash_cards' ? 'bg-white text-orange-600' : 'bg-amber-100 text-amber-800'
              }`}>
                {products.filter(p => p.isFlashSale).length}
              </span>
            </button>

            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pt-4 mb-2">Management</p>

            <button
              onClick={() => {
                setActiveTab('categories');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Tag className="w-4 h-4 shrink-0" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('attributes');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'attributes'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span>Colors & Sizes</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('sellers');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'sellers'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              <span>Sellers & Shops</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('zones');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'zones'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span>Delivery & Zones</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('courier');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'courier'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Server className="w-4 h-4 shrink-0" />
              <span>Courier APIs</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('payments');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Payment Gateways</span>
            </button>

            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pt-4 mb-2">System</p>

            <button
              onClick={() => {
                setActiveTab('currency');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'currency'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>Currency Rates</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('theme');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20 ring-2 ring-orange-300'
                  : 'text-orange-950 bg-orange-50 hover:bg-orange-100 font-extrabold border border-orange-200'
              }`}
            >
              <Palette className="w-4 h-4 shrink-0 text-orange-600" />
              <span>Theme & Layout Builder</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('website_settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'website_settings'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Website Settings</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('email_notifications');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'email_notifications'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                  : 'text-emerald-950 bg-emerald-50/80 hover:bg-emerald-100 font-bold border border-emerald-200/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Email & Alerts</span>
              </div>
              {emailLogs.length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {emailLogs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('security');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>Security & Access</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 flex items-center space-x-3 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="font-bold text-xs text-slate-900 truncate">Live Engine</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                v2.4 Connected
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TOP HEADER BAR */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 font-display tracking-tight flex items-center gap-2">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'orders' && 'Orders Center'}
              {activeTab === 'products' && 'Product Inventory'}
              {activeTab === 'file_manager' && 'Media & File Manager'}
              {activeTab === 'banners' && 'Promo Slider Banners'}
              {activeTab === 'flash_cards' && 'Flash Cards & Deals Manager'}
              {activeTab === 'categories' && 'Category Management'}
              {activeTab === 'attributes' && 'Colors & Size Attributes'}
              {activeTab === 'sellers' && 'Sellers & Vendor Shops'}
              {activeTab === 'zones' && 'Delivery Zones & Rates'}
              {activeTab === 'courier' && 'Courier API Integrations'}
              {activeTab === 'payments' && 'Payment Gateways'}
              {activeTab === 'currency' && 'Multi-Currency Settings'}
              {activeTab === 'theme' && 'Theme & Page Layout Drag-and-Drop Builder'}
              {activeTab === 'website_settings' && 'Website Settings'}
              {activeTab === 'security' && 'Security & Passwords'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Super Admin Control Panel • All systems operating normally
            </p>
          </div>

          {/* Search Box & Admin Profile */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search stock, order #, etc"
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setOrderSearchQuery(e.target.value);
                }}
                className="w-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-9 h-9 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationsList.some(n => !n.read) && (
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 absolute top-1.5 right-1.5 border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-400" />
                      <span className="font-extrabold text-sm font-display">System Notifications</span>
                    </div>
                    <button
                      onClick={() => {
                        setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
                        showToast('All notifications marked as read');
                      }}
                      className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg text-slate-200 transition-all cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notificationsList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-semibold">
                        No notifications found.
                      </div>
                    ) : (
                      notificationsList.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 flex items-start space-x-3 transition-colors ${
                            notif.read ? 'bg-white' : 'bg-orange-50/60 font-semibold'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                          <div className="flex-1 space-y-0.5">
                            <p className="text-xs text-slate-800 leading-snug">{notif.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{notif.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-slate-50 p-2 text-center border-t border-slate-100">
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Close Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Avatar Profile */}
            <button
              onClick={() => setIsAdminProfileOpen(true)}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 p-1 pr-3 rounded-2xl shrink-0 cursor-pointer transition-all"
              title="Super Admin Profile Settings"
            >
              <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                A
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">Super Admin</p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">01700000000</p>
              </div>
            </button>
          </div>
        </div>

        {/* --- OVERVIEW TAB CONTENT (MATCHING SCREENSHOT DESIGN) --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* ROW 1: KEY STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1: Total Sales */}
              <div
                onClick={() => {
                  setActiveTab('orders');
                  showToast('📊 Viewing total revenue & order details');
                }}
                className="bg-gradient-to-br from-amber-500/10 via-orange-50/50 to-white rounded-3xl border border-amber-200/60 p-5 space-y-3 relative overflow-hidden shadow-xs cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-orange-600 transition-colors">Total Sales</span>
                  <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                    ৳{totalGMV.toLocaleString()}
                  </h2>
                  <div className="flex items-center space-x-1.5 mt-1 text-slate-500 font-bold text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-time Live Sales</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div
                onClick={() => {
                  setActiveTab('orders');
                  showToast('📦 Viewing all customer orders');
                }}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-xs cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Total Orders</span>
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                    {orders.length.toLocaleString()}
                  </h2>
                  <div className="flex items-center space-x-1.5 mt-1 text-slate-500 font-bold text-xs">
                    <Package className="w-3.5 h-3.5 text-orange-500" />
                    <span>Live Order Count</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Total Visitors / Stock Items */}
              <div
                onClick={() => {
                  setActiveTab('products');
                  showToast('🏷️ Viewing product inventory stock & visitors');
                }}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3 shadow-xs cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Total Inventory Stock</span>
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                    {products.reduce((acc, p) => acc + (p.stock || 0), 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">Items</span>
                  </h2>
                  <div className="flex items-center space-x-1.5 mt-1 text-emerald-600 font-extrabold text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Product Catalog Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: REVENUE ANALYTICS & MONTHLY TARGET GAUGE & TOP CATEGORIES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Revenue Analytics Curve Chart */}
              <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 font-display">Revenue Analytics</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{revenueTimeframe} performance overview</p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsRevenueTimeframeDropdownOpen(!isRevenueTimeframeDropdownOpen)}
                      className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-all flex items-center gap-1"
                    >
                      <span>Last {revenueTimeframe}</span>
                      <span>▾</span>
                    </button>

                    {isRevenueTimeframeDropdownOpen && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1 divide-y divide-slate-100 text-xs">
                        {(['8 Days', '7 Days', '30 Days', 'This Month'] as const).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => {
                              setRevenueTimeframe(tf);
                              setIsRevenueTimeframeDropdownOpen(false);
                              showToast(`📈 Revenue chart timeframe updated: ${tf}`);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                              revenueTimeframe === tf ? 'bg-orange-500 text-white' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            Last {tf}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SVG Curve Graph Visual */}
                <div className="h-52 w-full relative pt-4">
                  {totalGMV > 0 ? (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeDasharray="4 4" />

                      <path
                        d="M 0 100 Q 75 40, 150 70 T 300 40 T 420 80 T 500 50 L 500 150 L 0 150 Z"
                        fill="url(#revenueGrad)"
                      />
                      <path
                        d="M 0 100 Q 75 40, 150 70 T 300 40 T 420 80 T 500 50"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <circle cx="300" cy="40" r="6" fill="#f97316" stroke="#ffffff" strokeWidth="3" />
                    </svg>
                  ) : (
                    <div className="w-full h-full border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                      <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-600">No Sales Recorded Yet (৳0 Revenue)</p>
                      <p className="text-[11px] text-slate-400 mt-1">New customer orders will automatically plot real-time revenue curves here.</p>
                    </div>
                  )}

                  {/* Date Labels */}
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2">
                    <span>12 Aug</span>
                    <span>13 Aug</span>
                    <span>14 Aug</span>
                    <span>15 Aug</span>
                    <span>16 Aug</span>
                    <span>17 Aug</span>
                    <span>18 Aug</span>
                    <span>19 Aug</span>
                  </div>
                </div>
              </div>

              {/* Monthly Target Arc Gauge */}
              <div
                onClick={() => setIsTargetModalOpen(true)}
                className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-xs cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 font-display group-hover:text-orange-600 transition-colors">Monthly Target</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Sales Goal Progress</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 font-bold px-2 py-1 rounded-lg">
                    Edit Goal
                  </span>
                </div>

                {/* Arc Ring */}
                <div className="flex flex-col items-center justify-center my-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="54" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                      <circle
                        cx="72"
                        cy="72"
                        r="54"
                        stroke="#f97316"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray="339.29"
                        strokeDashoffset={339.29 - (339.29 * Math.min(100, Math.round((totalGMV / monthlyTargetGoal) * 100))) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-slate-900">
                        {Math.min(100, Math.round((totalGMV / monthlyTargetGoal) * 100))}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-extrabold">Progress</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-700 text-center mt-2">
                    {totalGMV > 0 ? 'Goal Progressing 🎉' : 'Ready for New Orders 🚀'}
                  </p>
                </div>

                {/* Target Footer Summary */}
                <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/50 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Target</p>
                    <p className="font-black text-slate-900">৳{monthlyTargetGoal.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Revenue</p>
                    <p className="font-black text-orange-600">৳{totalGMV.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Top Categories Donut Breakdown */}
              <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-display">Top Categories</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Sales breakdown by type</p>
                </div>

                {/* Donut Chart Visual */}
                <div className="flex flex-col items-center my-1">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="48" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                      {totalGMV > 0 && (
                        <circle cx="64" cy="64" r="48" stroke="#f97316" strokeWidth="10" fill="transparent" strokeDasharray="301" strokeDashoffset="60" />
                      )}
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Total Sales</p>
                      <p className="text-sm font-black text-slate-900">৳{totalGMV.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Category Legends */}
                <div className="space-y-1.5 text-xs font-semibold">
                  <div
                    onClick={() => {
                      setActiveTab('categories');
                    }}
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Electronics
                    </span>
                    <span className="font-bold text-slate-900">৳0</span>
                  </div>
                  <div
                    onClick={() => {
                      setActiveTab('categories');
                    }}
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Fashion Abaya
                    </span>
                    <span className="font-bold text-slate-900">৳0</span>
                  </div>
                  <div
                    onClick={() => {
                      setActiveTab('categories');
                    }}
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Home & Kitchen
                    </span>
                    <span className="font-bold text-slate-900">৳0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: RECENT ORDERS QUICK TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900 font-display">Recent Customer Orders</h3>
                  <p className="text-xs text-slate-500">Live order feeds and instant status fulfillment</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center space-x-1"
                >
                  <span>View All Orders</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-3 font-mono font-bold text-slate-900">{ord.id}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{ord.customerName}</p>
                          <p className="text-[11px] text-slate-400">{ord.customerPhone}</p>
                        </td>
                        <td className="p-3">{ord.items.length} item(s)</td>
                        <td className="p-3 font-extrabold text-slate-900">৳{ord.totalAmount.toLocaleString()}</td>
                        <td className="p-3 font-bold uppercase text-[11px] text-slate-600">{ord.paymentDetails.method}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'In Delivery'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'Processing'
                                ? 'bg-amber-100 text-amber-800'
                                : ord.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => onOpenInvoice(ord)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- ORDERS TAB CONTENT --- */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-black text-lg text-slate-900 font-display flex items-center gap-2">
                  <span>Orders Management</span>
                  <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full">
                    {filteredOrders.length} Orders
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Filter, update delivery status, and print invoices</p>
              </div>

              {/* Status Tabs Filter & Bulk Courier Submit */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sellerOrderFilter}
                  onChange={(e) => setSellerOrderFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-2xs cursor-pointer"
                >
                  <option value="all">🏬 All Sellers / Merchants ({sellerList.length})</option>
                  {sellerList.map((s) => (
                    <option key={s.id} value={s.id}>{s.shopName} ({s.ownerName})</option>
                  ))}
                </select>

                <button
                  onClick={handleBulkSubmitPendingOrders}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs px-3.5 py-2 rounded-2xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Auto-Book All Pending Orders</span>
                </button>

                <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                  {(['all', 'Pending', 'Processing', 'In Delivery', 'Delivered', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {st === 'all' ? 'All Orders' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer Info</th>
                    <th className="p-3">Delivery Address</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-orange-600 font-extrabold">Courier Booking</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition-all">
                      <td className="p-3 font-mono font-bold text-slate-900">{ord.id}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{ord.customerName}</p>
                        <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                      </td>
                      <td className="p-3 max-w-xs truncate text-slate-600">
                        {typeof ord.shippingAddress === 'string'
                          ? ord.shippingAddress
                          : ord.shippingAddress
                          ? `${ord.shippingAddress.fullAddress || ''}${ord.shippingAddress.thana ? `, ${ord.shippingAddress.thana}` : ''}${ord.shippingAddress.district ? `, ${ord.shippingAddress.district}` : ''}`
                          : 'N/A'}
                      </td>
                      <td className="p-3 font-extrabold text-slate-900">৳{ord.totalAmount.toLocaleString()}</td>
                      <td className="p-3 font-bold uppercase text-[11px] text-slate-600">{ord.paymentDetails.method}</td>
                      <td className="p-3">
                        <select
                          value={ord.status}
                          onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border focus:outline-none cursor-pointer ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : ord.status === 'In Delivery'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : ord.status === 'Processing'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="In Delivery">In Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Direct Courier Selection & 1-Click Submit Cell */}
                      <td className="p-3 min-w-[240px]">
                        {ord.courierDetails && editingCourierOrderId !== ord.id ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-xl text-[11px] font-extrabold">
                                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{ord.courierDetails.courierName}</span>
                              </div>
                              <button
                                onClick={() => setEditingCourierOrderId(ord.id)}
                                className="text-slate-400 hover:text-orange-600 text-[10px] font-bold underline cursor-pointer"
                              >
                                Change
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                              <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                TRK: {ord.courierDetails.trackingId}
                              </span>

                              <a
                                href={getCourierPortalUrl(ord.courierDetails.courierName)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2 py-0.5 rounded-lg transition-all text-[10px] shadow-2xs cursor-pointer"
                                title="Open Merchant Portal"
                              >
                                <Globe className="w-2.5 h-2.5" />
                                <span>Go to Portal</span>
                              </a>

                              <a
                                href={getCourierTrackingUrl(ord.courierDetails.courierName, ord.courierDetails.trackingId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-lg transition-all text-[10px]"
                                title="Track Parcel Online"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>Tracking</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={orderSelectedCourier[ord.id] || courierList[0]?.name || 'Steadfast Courier'}
                              onChange={(e) =>
                                setOrderSelectedCourier((prev) => ({ ...prev, [ord.id]: e.target.value }))
                              }
                              className="bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold focus:outline-none focus:bg-white text-slate-800 cursor-pointer"
                            >
                              {courierList.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDirectCourierSubmit(ord)}
                              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-[11px] px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-xs shrink-0 active:scale-95"
                              title="Directly Submit Order & Book Courier"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit</span>
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => onOpenInvoice(ord)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CUSTOMERS TAB CONTENT --- */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-4 space-y-1 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Total Customers</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 font-display">{compiledCustomers.length}</h3>
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold">Active shopper database</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 p-4 space-y-1 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Registered Accounts</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-emerald-600 font-display">
                    {compiledCustomers.filter((c) => c.isRegistered).length}
                  </h3>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold">Logged-in verified profiles</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 p-4 space-y-1 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Order Guests</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-blue-600 font-display">
                    {compiledCustomers.filter((c) => !c.isRegistered).length}
                  </h3>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold">Placed orders via guest checkout</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-3xl p-4 flex flex-col justify-between shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase opacity-90">Quick Action</span>
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <button
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="w-full bg-white text-orange-600 hover:bg-orange-50 font-black text-xs py-2.5 px-3 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Customer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Customers Table Container */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-black text-lg text-slate-900 font-display flex items-center gap-2">
                    <span>Customer Accounts & IDs</span>
                    <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full">
                      {filteredCustomers.length} Shown
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">View customer profile details, unique Customer IDs, order histories, and digital ID cards</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search ID, Name, Phone, Email..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <select
                    value={customerRoleFilter}
                    onChange={(e: any) => setCustomerRoleFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customer Only</option>
                    <option value="vendor">Vendor / Seller</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-2xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Customer</span>
                  </button>
                </div>
              </div>

              {/* Customers List Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="p-3">Customer ID</th>
                      <th className="p-3">Customer Profile</th>
                      <th className="p-3">Phone & Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Total Orders</th>
                      <th className="p-3">Total Spent</th>
                      <th className="p-3">Joined Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-bold text-slate-600">No customers found</p>
                          <p className="text-[11px] mt-1">Try adjusting search filters or click "Add New Customer"</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-50/80 transition-all">
                          {/* Customer ID Badge */}
                          <td className="p-3 font-mono">
                            <div className="inline-flex items-center gap-1 bg-slate-900 text-orange-400 px-2.5 py-1 rounded-xl text-xs font-black shadow-2xs">
                              <span>{cust.id}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(cust.id);
                                  showToast(`📋 Copied Customer ID: ${cust.id}`);
                                }}
                                className="hover:text-white p-0.5 rounded cursor-pointer"
                                title="Copy ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Profile */}
                          <td className="p-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0">
                                {cust.name.substring(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{cust.name}</span>
                                  {cust.isRegistered && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded-full">Verified</span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400 line-clamp-1">{cust.address}</p>
                              </div>
                            </div>
                          </td>

                          {/* Phone & Email */}
                          <td className="p-3">
                            <p className="font-bold text-slate-800 font-mono text-[11px] flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{cust.phone}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-300" />
                              <span>{cust.email}</span>
                            </p>
                          </td>

                          {/* Role */}
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                cust.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : cust.role === 'vendor'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {cust.role === 'vendor' ? 'Seller / Vendor' : cust.role}
                            </span>
                          </td>

                          {/* Orders */}
                          <td className="p-3">
                            <span className="font-extrabold text-slate-900">{cust.totalOrders} Orders</span>
                          </td>

                          {/* Total Spent */}
                          <td className="p-3">
                            <span className="font-black text-emerald-600">৳{cust.totalSpent.toLocaleString()}</span>
                          </td>

                          {/* Joined Date */}
                          <td className="p-3 text-slate-500 font-semibold text-[11px]">
                            {cust.joinedDate}
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => handleLoginAsCustomer(cust)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Log In as this Customer"
                            >
                              <LogIn className="w-3 h-3" />
                              <span>Log In</span>
                            </button>

                            <button
                              onClick={() => setSelectedCustomerForCard(cust)}
                              className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/80 px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                              title="View Customer ID Card"
                            >
                              <User className="w-3 h-3" />
                              <span>ID Card</span>
                            </button>

                            <button
                              onClick={() => {
                                setOrderSearchQuery(cust.phone !== 'N/A' ? cust.phone : cust.name);
                                setActiveTab('orders');
                                showToast(`📦 Filtered orders for customer ${cust.name}`);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                              title="View Orders"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Orders</span>
                            </button>

                            <button
                              onClick={() => handleDeleteCustomer(cust)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB CONTENT (ADD + LIST) --- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Create Product Form Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-black text-base text-slate-900 font-display flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-500" />
                  <span>Publish New Product</span>
                </h2>
                <span className="text-xs bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-full">
                  Device Photo Upload Supported
                </span>
              </div>

              <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Product Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Luxury Silk Abaya Hijab Set"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Category */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Category</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                      >
                        {categoryList.map((cat) => (
                          <option key={cat.name} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Sub-Category</label>
                      <select
                        value={prodSubCategory}
                        onChange={(e) => setProdSubCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none"
                      >
                        {categoryList
                          .find((c) => c.name === prodCategory)
                          ?.subCategories.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          )) || <option value="General">General</option>}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Discount Options */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Base Price (৳)</label>
                    <input
                      type="number"
                      required
                      placeholder="1500"
                      value={prodBasePrice}
                      onChange={(e) => setProdBasePrice(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Discount Type</label>
                    <select
                      value={prodDiscountType}
                      onChange={(e) => setProdDiscountType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                    >
                      <option value="none">No Discount</option>
                      <option value="percent">Percent Discount (% OFF)</option>
                      <option value="flat">Flat Discount (৳ OFF)</option>
                    </select>
                  </div>

                  {prodDiscountType !== 'none' && (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        Discount Value {prodDiscountType === 'percent' ? '(%)' : '(৳)'}
                      </label>
                      <input
                        type="number"
                        placeholder={prodDiscountType === 'percent' ? '15' : '200'}
                        value={prodDiscountVal}
                        onChange={(e) => setProdDiscountVal(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-rose-600"
                      />
                    </div>
                  )}

                  {/* Wholesale Toggle */}
                  <div className="space-y-1 flex flex-col justify-center">
                    <label className="font-bold text-slate-700 block">Wholesale Product?</label>
                    <label className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-2 cursor-pointer hover:bg-slate-100 transition-all">
                      <input
                        type="checkbox"
                        checked={isWholesaleEnabled}
                        onChange={(e) => setIsWholesaleEnabled(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span className="font-bold text-xs text-slate-800">Tag as Wholesale Item</span>
                    </label>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Product Photo (From Device)</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-2 flex items-center justify-center space-x-2 cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-orange-600 shrink-0" />
                      <span className="font-bold text-orange-950 text-[11px]">Upload Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe key features, fabric details, or specifications..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 text-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>Publish Product Instantly</span>
                </button>
              </form>
            </div>

            {/* Published Products Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h3 className="font-black text-base text-slate-900 font-display border-b pb-2">
                Published Stock Products ({products.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div className="flex space-x-3">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{p.title}</h4>
                        <p className="text-[10px] text-slate-500">{p.category}</p>
                        <p className="font-black text-orange-600 text-xs mt-1">৳{p.basePrice.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Live Active
                      </span>
                      <button
                        onClick={() => {
                          onDeleteProduct(p.id);
                          showToast('Product removed!');
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- FILE MANAGER / MEDIA GALLERY TAB CONTENT --- */}
        {activeTab === 'file_manager' && (
          <div className="space-y-6">
            {/* Header Analytics Banner */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-slate-900 font-display">
                      File Manager & Media Gallery
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Central repository for all uploaded product images, banners, and store media
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Upload Device Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDirectFileManagerUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Statistics Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Media Files</p>
                  <p className="text-lg font-black text-slate-900">{mediaFiles.length} Files</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Product Photos</p>
                  <p className="text-lg font-black text-orange-600">
                    {mediaFiles.filter((m) => m.category === 'product').length} Photos
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Banners & Categories</p>
                  <p className="text-lg font-black text-blue-600">
                    {mediaFiles.filter((m) => m.category === 'banner' || m.category === 'category').length} Banners
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Estimated Storage</p>
                  <p className="text-lg font-black text-emerald-600">~{(mediaFiles.length * 0.35).toFixed(1)} MB</p>
                </div>
              </div>
            </div>

            {/* Upload Area & Link Importer */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-orange-500" />
                <span>Upload or Import Image to File Manager</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                {/* Drag Drop File Upload Card */}
                <div className="border-2 border-dashed border-orange-200 bg-orange-50/40 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-2 hover:bg-orange-50/80 transition-all">
                  <HardDrive className="w-8 h-8 text-orange-500" />
                  <p className="font-extrabold text-slate-900 text-sm">Select Image from Device / Phone</p>
                  <p className="text-[11px] text-slate-500">Supports PNG, JPG, WEBP, GIF up to 10MB</p>
                  <label className="mt-2 inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl cursor-pointer">
                    Browse Local Files
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDirectFileManagerUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Import via URL Form */}
                <form onSubmit={handleAddUrlToMedia} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="font-extrabold text-slate-900 text-sm">Or Import External Image URL</p>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Image Name / Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Summer Shirt Banner"
                      value={newFileTitle}
                      onChange={(e) => setNewFileTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Image URL Address *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newFileUrl}
                      onChange={(e) => setNewFileUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={newFileCategory}
                      onChange={(e) => setNewFileCategory(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-xl p-2 font-bold text-xs"
                    >
                      <option value="product">Tag: Product Image</option>
                      <option value="banner">Tag: Banner Photo</option>
                      <option value="category">Tag: Category Icon</option>
                      <option value="general">Tag: General Asset</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
                    >
                      Save Image URL
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search file name..."
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 font-bold"
                  />
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 font-bold w-full sm:w-auto">
                  {(
                    [
                      { id: 'all', label: 'All Media' },
                      { id: 'product', label: 'Product Photos' },
                      { id: 'banner', label: 'Banners' },
                      { id: 'category', label: 'Categories' },
                      { id: 'general', label: 'General' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFileCategoryFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs ${
                        fileCategoryFilter === f.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaFiles
                .filter((m) => {
                  const matchesSearch = !fileSearchQuery || m.name.toLowerCase().includes(fileSearchQuery.toLowerCase());
                  const matchesCategory = fileCategoryFilter === 'all' || m.category === fileCategoryFilter;
                  return matchesSearch && matchesCategory;
                })
                .map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-2.5 space-y-2 group hover:shadow-lg transition-all relative flex flex-col justify-between"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60">
                      <img
                        src={m.url}
                        alt={m.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {m.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-extrabold text-xs text-slate-900 truncate" title={m.name}>
                        {m.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>{m.size || '300 KB'}</span>
                        <span>{new Date(m.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleCopyImageUrl(m.url, m.name)}
                        className="flex-1 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 font-bold py-1.5 px-2 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Copy Image URL"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </button>

                      <button
                        onClick={() => setPreviewingMedia(m)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-all"
                        title="Preview Full Image"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteMediaFile(m.id, m.name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 rounded-lg cursor-pointer transition-all"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State */}
            {mediaFiles.filter((m) => {
              const matchesSearch = !fileSearchQuery || m.name.toLowerCase().includes(fileSearchQuery.toLowerCase());
              const matchesCategory = fileCategoryFilter === 'all' || m.category === fileCategoryFilter;
              return matchesSearch && matchesCategory;
            }).length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-slate-700 text-base">No Images Found</h3>
                <p className="text-xs text-slate-400">Try uploading a photo or selecting a different filter.</p>
              </div>
            )}

            {/* Fullscreen Image Preview Modal */}
            {previewingMedia && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-5 max-w-xl w-full space-y-4 shadow-2xl relative">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">{previewingMedia.name}</h3>
                    <button onClick={() => setPreviewingMedia(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-slate-900 max-h-96 flex items-center justify-center border border-slate-200">
                    <img src={previewingMedia.url} alt={previewingMedia.name} className="max-h-96 object-contain" />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold space-y-1">
                    <p className="text-slate-500">Image URL:</p>
                    <p className="text-slate-800 break-all bg-white p-2 rounded-lg border text-[11px] select-all font-mono">
                      {previewingMedia.url}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => handleDeleteMediaFile(previewingMedia.id, previewingMedia.name)}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete File</span>
                    </button>

                    <button
                      onClick={() => handleCopyImageUrl(previewingMedia.url, previewingMedia.name)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Direct Link</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- PROMO BANNERS TAB CONTENT --- */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h2 className="font-black text-lg text-slate-900 font-display flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-orange-500" />
                    <span>Homepage Slider & Promo Banners Manager</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Add, edit, reorder, or toggle homepage slider banner cards
                  </p>
                </div>

                <button
                  onClick={handleOpenNewBannerModal}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Banner</span>
                </button>
              </div>

              {/* Banners Grid / List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {bannersList.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`rounded-2xl border transition-all p-4 space-y-3 relative flex flex-col justify-between ${
                      banner.isActive !== false
                        ? 'bg-white border-slate-200 shadow-md'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Banner Card Preview */}
                    <div className={`rounded-2xl p-4 text-white bg-gradient-to-r ${banner.bgGradient || 'from-slate-900 to-indigo-950'} relative overflow-hidden space-y-2`}>
                      <div className="flex items-center justify-between">
                        <span className="bg-white/20 backdrop-blur-xs text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/20">
                          {banner.badge || 'Offer'}
                        </span>
                        <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded-full text-slate-300">
                          Slide #{index + 1}
                        </span>
                      </div>

                      <div className="space-y-1 pr-16">
                        <h3 className="font-black text-base line-clamp-1">{banner.title}</h3>
                        <p className="text-[11px] text-slate-200 line-clamp-1">{banner.subtitle}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
                        <span className="bg-white text-slate-900 px-2.5 py-1 rounded-lg">
                          {banner.cta || 'Shop Now'}
                        </span>
                        <span className="text-amber-300">{banner.priceTag}</span>
                      </div>

                      {banner.image && (
                        <div className="absolute top-3 right-3 w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-slate-800">
                          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                      <button
                        onClick={() => handleToggleBannerActive(banner.id)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer ${
                          banner.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {banner.isActive !== false ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active in Slider</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-slate-500" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenEditBannerModal(banner)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 p-2 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Edit / Add Modal */}
            {isBannerModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form
                  onSubmit={handleSaveBannerSubmit}
                  className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-orange-500" />
                      <span>{editingBannerId ? 'Edit Banner' : 'Create New Banner Card'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsBannerModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Banner Headline Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. iPhone 16 Pro Max Sale"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Subtitle / Short Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Extraordinary Visual & Exceptional Power"
                        value={bannerSubtitle}
                        onChange={(e) => setBannerSubtitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-extrabold text-slate-700 block mb-1">Badge Tag</label>
                        <input
                          type="text"
                          placeholder="e.g. Official Warranty"
                          value={bannerBadge}
                          onChange={(e) => setBannerBadge(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-extrabold text-slate-700 block mb-1">Button CTA Text</label>
                        <input
                          type="text"
                          placeholder="e.g. Shop Now"
                          value={bannerCta}
                          onChange={(e) => setBannerCta(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Price Tag / Offer Note</label>
                      <input
                        type="text"
                        placeholder="e.g. Starting at ৳148,000 or Up to 25% Off"
                        value={bannerPriceTag}
                        onChange={(e) => setBannerPriceTag(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">
                        Banner Image *
                      </label>
                      <div className="space-y-2">
                        <label className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-dashed border-orange-300 font-extrabold p-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs shadow-xs">
                          <Upload className="w-4 h-4 text-orange-600" />
                          <span>Upload Photo from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerFileUpload}
                            className="hidden"
                          />
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            placeholder="Or paste Image URL Address (https://...)"
                            value={bannerImage}
                            onChange={(e) => setBannerImage(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                          />
                        </div>

                        {bannerImage && (
                          <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                            <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setBannerImage('')}
                              className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-md hover:bg-rose-700 cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Background Theme Preset</label>
                      <select
                        value={bannerBgGradient}
                        onChange={(e) => setBannerBgGradient(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      >
                        <option value="from-slate-900 via-indigo-950 to-slate-900">Midnight Dark Blue</option>
                        <option value="from-orange-600 via-amber-600 to-orange-700">Orange Amber Burst</option>
                        <option value="from-blue-900 via-slate-900 to-indigo-950">Royal B2B Blue</option>
                        <option value="from-emerald-800 via-teal-900 to-slate-900">Emerald Green</option>
                        <option value="from-rose-800 via-purple-900 to-slate-900">Rose Luxury</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setIsBannerModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 shadow-md cursor-pointer"
                    >
                      Save Banner
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- FLASH CARDS & FLASH DEALS TAB CONTENT --- */}
        {activeTab === 'flash_cards' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="font-black text-lg text-slate-900 font-display flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>Flash Sale & Flash Cards Manager</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Set product flash discount cards, upload photos directly from device, edit or delete flash cards
                  </p>
                </div>
              </div>

              {/* Add Product To Flash Sale Form */}
              <form onSubmit={handleAddFlashCard} className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4 text-xs">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-orange-500" />
                  <span>Add Product To Flash Cards</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-extrabold text-slate-700 block mb-1">Select Product from Catalog *</label>
                    <select
                      required
                      value={selectedFlashProduct}
                      onChange={(e) => setSelectedFlashProduct(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (MRP: ৳{p.basePrice.toLocaleString()}) {p.isFlashSale ? '⚡ Already Flash' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Flash Badge Label</label>
                    <input
                      type="text"
                      placeholder="e.g. ⚡ FLASH SALE or 🔥 25% OFF"
                      value={flashBadgeText}
                      onChange={(e) => setFlashBadgeText(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Discount Type</label>
                    <select
                      value={flashDiscountType}
                      onChange={(e) => setFlashDiscountType(e.target.value as 'percent' | 'flat')}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                    >
                      <option value="percent">Percentage Off (%)</option>
                      <option value="flat">Flat Amount Off (৳)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Discount Value ({flashDiscountType === 'percent' ? '%' : '৳'})
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={flashDiscountVal}
                      onChange={(e) => setFlashDiscountVal(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Stock Claimed Progress (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={flashStockPercent}
                      onChange={(e) => setFlashStockPercent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  {/* Device Photo Upload for Flash Card */}
                  <div className="sm:col-span-3 space-y-2 pt-1 border-t border-slate-200/80">
                    <label className="font-extrabold text-slate-700 block">
                      Custom Flash Card Photo (Optional)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer text-xs shrink-0">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>Upload Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAddFlashImageUpload}
                          className="hidden"
                        />
                      </label>
                      {flashCardImage && (
                        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200">
                          <img src={flashCardImage} alt="Uploaded" className="w-10 h-10 object-cover rounded-lg" />
                          <span className="text-[11px] font-extrabold text-emerald-600">Photo Loaded!</span>
                          <button
                            type="button"
                            onClick={() => setFlashCardImage('')}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Add Flash Sale Card</span>
                  </button>
                </div>
              </form>

              {/* Active Flash Cards Table */}
              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                  <span>Active Flash Sale Cards ({products.filter((p) => p.isFlashSale).length})</span>
                  <span className="text-xs text-slate-500 font-medium">Click Edit to change photo, price, or discount</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter((p) => p.isFlashSale)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="bg-slate-50 rounded-2xl border border-amber-200/80 p-3.5 space-y-3 relative shadow-xs flex flex-col justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                          />
                          <div className="truncate flex-1">
                            <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                              {product.flashBadge || '⚡ FLASH'}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-900 truncate mt-1">
                              {product.title}
                            </h4>
                            <div className="flex items-baseline space-x-1 text-xs">
                              <span className="font-black text-orange-600">
                                ৳{(product.discountPrice || product.basePrice).toLocaleString()}
                              </span>
                              <span className="text-slate-400 line-through text-[10px]">
                                ৳{product.basePrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 border-t pt-2">
                          <span>Claimed: {product.flashStockPercent || 80}%</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditFlashModal(product)}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-lg font-black text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit Card</span>
                            </button>
                            <button
                              onClick={() => handleRemoveFlashCard(product.id)}
                              className="bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 p-1.5 rounded-lg transition-all cursor-pointer"
                              title="Delete Flash Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {products.filter((p) => p.isFlashSale).length === 0 && (
                    <div className="col-span-full bg-slate-50 rounded-2xl p-8 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200">
                      No products currently set as Flash Cards. Use the form above to add a product to Flash Cards.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Flash Card Modal */}
            {isFlashEditModalOpen && editingFlashCard && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form
                  onSubmit={handleSaveFlashEditSubmit}
                  className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span>Edit Flash Sale Card</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsFlashEditModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={editFlashTitle}
                        onChange={(e) => setEditFlashTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-extrabold text-slate-700 block mb-1">Base Price / MRP (৳)</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={editFlashBasePrice}
                          onChange={(e) => setEditFlashBasePrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-extrabold text-slate-700 block mb-1">Flash Badge Tag</label>
                        <input
                          type="text"
                          value={editFlashBadgeText}
                          onChange={(e) => setEditFlashBadgeText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-extrabold text-slate-700 block mb-1">Discount Type</label>
                        <select
                          value={editFlashDiscountType}
                          onChange={(e) => setEditFlashDiscountType(e.target.value as 'percent' | 'flat')}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                        >
                          <option value="percent">Percentage Off (%)</option>
                          <option value="flat">Flat Amount Off (৳)</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-extrabold text-slate-700 block mb-1">
                          Discount Value ({editFlashDiscountType === 'percent' ? '%' : '৳'})
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={editFlashDiscountVal}
                          onChange={(e) => setEditFlashDiscountVal(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Stock Claimed Progress (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={editFlashStockPercent}
                        onChange={(e) => setEditFlashStockPercent(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>

                    {/* Direct Device Photo Upload */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="font-extrabold text-slate-700 block mb-1">
                        Flash Card Photo
                      </label>
                      <div className="space-y-2">
                        <label className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold p-2.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs shadow-xs">
                          <Upload className="w-4 h-4 text-amber-600" />
                          <span>Upload Photo from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditFlashImageUpload}
                            className="hidden"
                          />
                        </label>

                        <input
                          type="url"
                          placeholder="Or paste Image URL Address (https://...)"
                          value={editFlashImage}
                          onChange={(e) => setEditFlashImage(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-xs"
                        />

                        {editFlashImage && (
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                            <img src={editFlashImage} alt="Flash Card" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingFlashCard) {
                          handleRemoveFlashCard(editingFlashCard.id);
                          setIsFlashEditModalOpen(false);
                        }
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Card</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsFlashEditModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-md cursor-pointer"
                      >
                        Save Flash Card
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- CATEGORIES TAB CONTENT --- */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-black text-lg text-slate-900 font-display">
                  Category & Sub-Category Management
                </h2>
                <p className="text-xs text-slate-500">Create, edit, and organize product categories & sub-categories</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Main Category */}
              <form onSubmit={handleAddCategory} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-orange-500" />
                  <span>Add Main Category</span>
                </h3>
                <input
                  type="text"
                  placeholder="e.g. Home Appliances"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                />
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  Save Main Category
                </button>
              </form>

              {/* Add Sub Category */}
              <form onSubmit={handleAddSubCategory} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-slate-700" />
                  <span>Add Sub-Category</span>
                </h3>
                <select
                  value={selectedCatForSub}
                  onChange={(e) => setSelectedCatForSub(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                >
                  {categoryList.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="e.g. Air Coolers"
                  value={newSubCatName}
                  onChange={(e) => setNewSubCatName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  Save Sub-Category
                </button>
              </form>
            </div>

            {/* Existing Categories Cards with Edit and Delete */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              {categoryList.map((cat) => (
                <div key={cat.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-orange-500" />
                      <span>{cat.name}</span>
                    </h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingCategory({ id: cat.id, name: cat.name })}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-all"
                        title="Edit Category Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-all"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.subCategories.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1.5 text-[11px] bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-bold shadow-2xs"
                      >
                        <span>{sub}</span>
                        <button
                          onClick={() => setEditingSubCat({ catId: cat.id, oldSub: sub, newSub: sub })}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubCategory(cat.id, sub)}
                          className="text-rose-400 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {cat.subCategories.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">No sub-categories yet</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Main Category Modal */}
            {editingCategory && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleUpdateCategory} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-extrabold text-sm text-slate-900">Edit Main Category</h3>
                    <button type="button" onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setEditingCategory(null)} className="px-3 py-1.5 rounded-xl border text-xs font-bold">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold">
                      Update Name
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Sub-Category Modal */}
            {editingSubCat && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleUpdateSubCategory} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-extrabold text-sm text-slate-900">Edit Sub-Category</h3>
                    <button type="button" onClick={() => setEditingSubCat(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editingSubCat.newSub}
                    onChange={(e) => setEditingSubCat({ ...editingSubCat, newSub: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setEditingSubCat(null)} className="px-3 py-1.5 rounded-xl border text-xs font-bold">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
                      Update Sub-Category
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- ATTRIBUTES TAB CONTENT --- */}
        {activeTab === 'attributes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Attributes */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h3 className="font-extrabold text-base text-slate-900 border-b pb-2 flex items-center justify-between">
                <span>Color Attributes</span>
                <span className="text-xs text-slate-400 font-medium">{colorsList.length} Options</span>
              </h3>
              <form onSubmit={handleAddColor} className="flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Color Name (e.g. Royal Blue)"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                />
                <button type="submit" className="bg-orange-500 text-white font-bold px-3.5 py-2 rounded-xl cursor-pointer">
                  Add Color
                </button>
              </form>
              <div className="flex flex-wrap gap-2 pt-2">
                {colorsList.map((col) => (
                  <span
                    key={col.id}
                    className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: col.hex }}></span>
                    <span>{col.name}</span>
                    <button
                      onClick={() => setEditingColor({ id: col.id, name: col.name, hex: col.hex })}
                      className="text-slate-400 hover:text-slate-700 ml-1"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteColor(col.id, col.name)}
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Size & Storage Options */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h3 className="font-extrabold text-base text-slate-900 border-b pb-2 flex items-center justify-between">
                <span>Size & Storage Options</span>
                <span className="text-xs text-slate-400 font-medium">{sizesList.length} Options</span>
              </h3>
              <form onSubmit={handleAddSize} className="flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Size (e.g. 512GB, 3XL)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
                <button type="submit" className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl cursor-pointer">
                  Add Size
                </button>
              </form>
              <div className="flex flex-wrap gap-2 pt-2">
                {sizesList.map((sz) => (
                  <span
                    key={sz.id}
                    className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    <span>{sz.name}</span>
                    <button
                      onClick={() => setEditingSize({ id: sz.id, name: sz.name })}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSize(sz.id, sz.name)}
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Edit Color Modal */}
            {editingColor && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleUpdateColor} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                  <h3 className="font-extrabold text-sm text-slate-900">Edit Color Attribute</h3>
                  <input
                    type="text"
                    value={editingColor.name}
                    onChange={(e) => setEditingColor({ ...editingColor, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                  <input
                    type="color"
                    value={editingColor.hex}
                    onChange={(e) => setEditingColor({ ...editingColor, hex: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setEditingColor(null)} className="px-3 py-1.5 rounded-xl border text-xs font-bold">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold">
                      Update Color
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Size Modal */}
            {editingSize && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleUpdateSize} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                  <h3 className="font-extrabold text-sm text-slate-900">Edit Size Option</h3>
                  <input
                    type="text"
                    value={editingSize.name}
                    onChange={(e) => setEditingSize({ ...editingSize, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setEditingSize(null)} className="px-3 py-1.5 rounded-xl border text-xs font-bold">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
                      Update Size
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- SELLERS TAB CONTENT --- */}
        {activeTab === 'sellers' && (
          <div className="space-y-6">
            {/* Platform Commission & Fee Setup Section */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border border-slate-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                <div>
                  <h2 className="font-black text-base font-display flex items-center gap-2 text-amber-400">
                    <Percent className="w-5 h-5 text-amber-400" />
                    <span>Platform Fee & Seller Commission Setup</span>
                  </h2>
                  <p className="text-xs text-slate-300">Set marketplace platform commission rates, per-order fixed fees, and payout rules</p>
                </div>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold px-3 py-1 rounded-full">
                  Global Settings
                </span>
              </div>

              <form onSubmit={handleSavePlatformFeeConfig} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Default Commission Rate (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={platformFeeConfig.defaultCommissionRate}
                      onChange={(e) => setPlatformFeeConfig({ ...platformFeeConfig, defaultCommissionRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 font-bold text-white pr-8"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Fixed Platform Fee Per Order (৳)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={platformFeeConfig.fixedFeePerOrder}
                      onChange={(e) => setPlatformFeeConfig({ ...platformFeeConfig, fixedFeePerOrder: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 font-bold text-white pr-8"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400">৳</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Min Withdrawal Threshold (৳)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={platformFeeConfig.minWithdrawalLimit}
                      onChange={(e) => setPlatformFeeConfig({ ...platformFeeConfig, minWithdrawalLimit: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 font-bold text-white pr-8"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400">৳</span>
                  </div>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Fee Settings</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Create Seller Shop Form */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="font-black text-base text-slate-900 font-display flex items-center gap-2">
                    <Store className="w-5 h-5 text-orange-500" />
                    <span>Create & Register Vendor Seller Shop</span>
                  </h2>
                  <p className="text-xs text-slate-500">Configure shop details, logos, social channels, and seller credentials</p>
                </div>
              </div>

              <form onSubmit={handleAddSellerSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Shop Name */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Shop Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bangladesh Fashion Gallery"
                      value={newShopName}
                      onChange={(e) => setNewShopName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  {/* Owner Name */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Owner Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mahfuzur Rahman"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Owner Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="01711223344"
                      value={newShopPhone}
                      onChange={(e) => setNewShopPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">WhatsApp Number</label>
                    <input
                      type="text"
                      placeholder="01711223344"
                      value={newShopWhatsapp}
                      onChange={(e) => setNewShopWhatsapp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  {/* Facebook Link */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Facebook Page ID / URL</label>
                    <input
                      type="text"
                      placeholder="facebook.com/myshopbd"
                      value={newShopFacebook}
                      onChange={(e) => setNewShopFacebook(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  {/* Instagram Link */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Instagram Handle</label>
                    <input
                      type="text"
                      placeholder="instagram.com/myshopbd"
                      value={newShopInstagram}
                      onChange={(e) => setNewShopInstagram(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  {/* Password / PIN */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Seller Password / PIN</label>
                    <input
                      type="text"
                      placeholder="seller123"
                      value={newShopPassword}
                      onChange={(e) => setNewShopPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  {/* Commission Rate */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Commission Rate (%)</label>
                    <input
                      type="number"
                      placeholder="5"
                      value={newShopCommission}
                      onChange={(e) => setNewShopCommission(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  {/* Shop Logo Device Upload */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Shop Logo Photo</label>
                    <label className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-2 flex items-center justify-center space-x-2 cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-orange-600 shrink-0" />
                      <span className="font-bold text-orange-950 text-[11px]">Upload Logo File</span>
                      <input type="file" accept="image/*" onChange={handleSellerLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Shop Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description about shop products, warranty, and return policies..."
                    value={newShopDesc}
                    onChange={(e) => setNewShopDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-2.5 rounded-2xl transition-all shadow-md cursor-pointer flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Seller Shop</span>
                </button>
              </form>
            </div>

            {/* Active Registered Seller Shops Grid */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center justify-between">
                <span>Registered Vendor Seller Shops ({sellerList.length})</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sellerList.map((s) => (
                  <div key={s.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <img src={s.logo} alt={s.shopName} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                        <div className="truncate flex-1">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">{s.shopName}</h4>
                          <p className="text-[11px] text-slate-500">Owner: {s.ownerName}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {s.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                        <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Phone: <span className="font-bold">{s.phone}</span></p>
                        <p className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp: <span className="font-bold">{s.whatsapp}</span></p>
                        {s.facebook && <p className="flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5 text-blue-600" /> {s.facebook}</p>}
                        {s.instagram && <p className="flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5 text-pink-600" /> {s.instagram}</p>}
                      </div>

                      {/* Wallet Balance & Commission Badge */}
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Wallet Balance</span>
                          <span className="font-black text-sm text-emerald-950 flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                            ৳ {(s.walletBalance ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block">Commission</span>
                          <span className="font-extrabold text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            {s.commissionRate}%
                          </span>
                        </div>
                      </div>

                      {/* Manage Wallet Button */}
                      <button
                        onClick={() => {
                          setWalletModalSeller(s);
                          setWalletActionType('add');
                          setWalletAmount('');
                          setWalletNote('');
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Manage Wallet (Add / Deduct Funds)</span>
                      </button>

                      <p className="text-xs text-slate-500 line-clamp-2 italic">{s.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setLoginSellerId(s.id);
                          if (onSwitchToVendor) {
                            onSwitchToVendor({
                              name: s.ownerName,
                              phone: s.phone,
                              email: `${s.id}@seller.bd`,
                              role: 'vendor'
                            });
                            showToast(`Logged in as ${s.shopName}`);
                          }
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Key className="w-3 h-3" />
                        <span>Login as Seller</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleToggleSellerStatus(s.id)}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
                          title="Toggle Active / Suspended"
                        >
                          {s.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-rose-500" />}
                        </button>
                        <button
                          onClick={() => setEditingSeller(s)}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
                          title="Edit Shop Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSeller(s.id, s.shopName)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg"
                          title="Delete Seller Shop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SELLER PANEL LOGIN PORTAL SECTION AT BOTTOM */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl border border-slate-700">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black font-display flex items-center gap-2">
                    <Key className="w-5 h-5 text-orange-400" />
                    <span>Seller Shop Direct Login Portal</span>
                  </h3>
                  <p className="text-xs text-slate-300">Log into any registered seller account directly to manage individual vendor products and orders.</p>
                </div>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold px-3 py-1 rounded-full text-xs">
                  Vendor Control Switch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold pt-1">
                <div className="space-y-1">
                  <label className="text-slate-300 block">Select Seller Shop</label>
                  <select
                    value={loginSellerId}
                    onChange={(e) => {
                      setLoginSellerId(e.target.value);
                      const shop = sellerList.find((s) => s.id === e.target.value);
                      if (shop) setLoginSellerPin(shop.password);
                    }}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-white font-bold"
                  >
                    {sellerList.map((s) => (
                      <option key={s.id} value={s.id}>{s.shopName} ({s.ownerName})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 block">Seller Password / PIN</label>
                  <input
                    type="password"
                    value={loginSellerPin}
                    onChange={(e) => setLoginSellerPin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleDirectSellerPanelLogin}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Login & Launch Seller Panel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* WALLET ADD / DEDUCT FUNDS MODAL OVERLAY */}
            {walletModalSeller && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-base text-slate-900">
                          Manage Wallet: {walletModalSeller.shopName}
                        </h3>
                        <p className="text-xs text-slate-500">Owner: {walletModalSeller.ownerName} ({walletModalSeller.phone})</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setWalletModalSeller(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Current Wallet Balance Card */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider block">Current Wallet Balance</span>
                      <span className="text-2xl font-black font-display">
                        ৳ {(walletModalSeller.walletBalance ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-extrabold border border-white/30">
                      Commission: {walletModalSeller.commissionRate}%
                    </div>
                  </div>

                  <form onSubmit={handleWalletSubmit} className="space-y-4 text-xs">
                    {/* Action Type Toggle */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-800 block">Select Action</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWalletActionType('add')}
                          className={`p-3 rounded-2xl font-black flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                            walletActionType === 'add'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>➕ Add Funds</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWalletActionType('deduct')}
                          className={`p-3 rounded-2xl font-black flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                            walletActionType === 'deduct'
                              ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <MinusCircle className="w-4 h-4" />
                          <span>➖ Deduct Funds</span>
                        </button>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-800 block">Amount (৳) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 5000"
                        value={walletAmount}
                        onChange={(e) => setWalletAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Reason / Notes */}
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-800 block">Reason / Note</label>
                      <input
                        type="text"
                        placeholder={walletActionType === 'add' ? 'e.g. Monthly Bonus / Deposit' : 'e.g. Platform Commission Deduction / Return Fee'}
                        value={walletNote}
                        onChange={(e) => setWalletNote(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => setWalletModalSeller(null)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-6 py-2.5 rounded-xl font-black text-xs text-white shadow-md cursor-pointer transition-all flex items-center space-x-1.5 ${
                          walletActionType === 'add'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        <span>{walletActionType === 'add' ? 'Add Funds Now' : 'Deduct Funds Now'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Transaction History Log */}
                  {walletModalSeller.walletHistory && walletModalSeller.walletHistory.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
                        <span>Recent Wallet Transactions</span>
                        <span className="text-[10px] text-slate-500 font-medium">History ({walletModalSeller.walletHistory.length})</span>
                      </h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {walletModalSeller.walletHistory.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              item.type === 'add'
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                : 'bg-rose-50/80 border-rose-200 text-rose-950'
                            }`}
                          >
                            <div>
                              <div className="font-bold flex items-center gap-1">
                                {item.type === 'add' ? (
                                  <span className="text-emerald-700 font-extrabold">➕ Added: ৳{item.amount.toLocaleString()}</span>
                                ) : (
                                  <span className="text-rose-700 font-extrabold">➖ Deducted: ৳{item.amount.toLocaleString()}</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-600">{item.reason}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Edit Seller Shop Modal */}
            {editingSeller && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleUpdateSellerSubmit} className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-extrabold text-sm text-slate-900">Edit Shop: {editingSeller.shopName}</h3>
                    <button type="button" onClick={() => setEditingSeller(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block">Shop Name</label>
                      <input
                        type="text"
                        value={editingSeller.shopName}
                        onChange={(e) => setEditingSeller({ ...editingSeller, shopName: e.target.value })}
                        className="w-full bg-slate-50 border p-2 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block">Owner Name</label>
                      <input
                        type="text"
                        value={editingSeller.ownerName}
                        onChange={(e) => setEditingSeller({ ...editingSeller, ownerName: e.target.value })}
                        className="w-full bg-slate-50 border p-2 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block">Phone Number</label>
                      <input
                        type="text"
                        value={editingSeller.phone}
                        onChange={(e) => setEditingSeller({ ...editingSeller, phone: e.target.value })}
                        className="w-full bg-slate-50 border p-2 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block">WhatsApp Number</label>
                      <input
                        type="text"
                        value={editingSeller.whatsapp}
                        onChange={(e) => setEditingSeller({ ...editingSeller, whatsapp: e.target.value })}
                        className="w-full bg-slate-50 border p-2 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block">Facebook</label>
                      <input
                        type="text"
                        value={editingSeller.facebook}
                        onChange={(e) => setEditingSeller({ ...editingSeller, facebook: e.target.value })}
                        className="w-full bg-slate-50 border p-2 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block">Instagram</label>
                      <input
                        type="text"
                        value={editingSeller.instagram}
                        onChange={(e) => setEditingSeller({ ...editingSeller, instagram: e.target.value })}
                        className="w-full bg-slate-50 border p-2 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block">Commission Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingSeller.commissionRate}
                        onChange={(e) => setEditingSeller({ ...editingSeller, commissionRate: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border p-2 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block">Wallet Balance (৳)</label>
                      <input
                        type="number"
                        value={editingSeller.walletBalance ?? 0}
                        onChange={(e) => setEditingSeller({ ...editingSeller, walletBalance: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border p-2 rounded-xl font-bold text-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block">Shop Description</label>
                    <textarea
                      rows={2}
                      value={editingSeller.description}
                      onChange={(e) => setEditingSeller({ ...editingSeller, description: e.target.value })}
                      className="w-full bg-slate-50 border p-2 rounded-xl font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button type="button" onClick={() => setEditingSeller(null)} className="px-4 py-2 border rounded-xl font-bold">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2 bg-orange-500 text-white rounded-xl font-bold">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- DELIVERY ZONES TAB CONTENT --- */}
        {activeTab === 'zones' && (
          <div className="space-y-6">
            {/* Add Zone Form */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span>Add Delivery Zone, District & Fee</span>
              </h2>

              <form onSubmit={handleAddZoneSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold">
                <div>
                  <label className="font-bold text-slate-700 block">Zone Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chittagong Metro"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block">District / Division</label>
                  <input
                    type="text"
                    placeholder="e.g. Chittagong, Cox's Bazar"
                    value={newZoneDistrict}
                    onChange={(e) => setNewZoneDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block">Delivery Charge (৳)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={newZoneFee}
                    onChange={(e) => setNewZoneFee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer">
                    Add Zone
                  </button>
                </div>
              </form>
            </div>

            {/* Delivery Zones Grid */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="font-black text-base text-slate-900 border-b pb-2">Configured Bangladesh Delivery Zones</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deliveryZones.map((z) => (
                  <div key={z.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-sm text-slate-900">{z.name}</p>
                      <span className="text-lg font-black text-orange-600">৳{z.fee}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Districts: <span className="font-bold">{z.district}</span></p>
                    <p className="text-xs text-slate-500">Thanas: {z.thanas}</p>
                    <p className="text-xs text-emerald-600 font-bold">Estimated Time: {z.days}</p>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleZoneActive(z.id)}
                        className="text-xs font-bold px-2 py-1 rounded-lg border bg-white"
                      >
                        {z.isActive ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => setEditingZone(z)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteZone(z.id, z.name)}
                        className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Zone Modal */}
            {editingZone && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleUpdateZoneSubmit} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
                  <h3 className="font-extrabold text-sm text-slate-900">Edit Zone: {editingZone.name}</h3>
                  <div>
                    <label className="font-bold text-slate-700 block">Zone Name</label>
                    <input
                      type="text"
                      value={editingZone.name}
                      onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block">Delivery Charge (৳)</label>
                    <input
                      type="number"
                      value={editingZone.fee}
                      onChange={(e) => setEditingZone({ ...editingZone, fee: Number(e.target.value) })}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block">Districts</label>
                    <input
                      type="text"
                      value={editingZone.district}
                      onChange={(e) => setEditingZone({ ...editingZone, district: e.target.value })}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl font-bold"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button type="button" onClick={() => setEditingZone(null)} className="px-4 py-2 border rounded-xl font-bold">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2 bg-orange-500 text-white rounded-xl font-bold">
                      Update Zone
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- COURIER SERVICES TAB CONTENT --- */}
        {activeTab === 'courier' && (
          <div className="space-y-6">
            {/* Header Sub-Nav Switcher */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCourierSubTab('portal')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                    courierSubTab === 'portal'
                      ? 'bg-[#00b894] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Steadfast Courier Portal (All Parcel)</span>
                  <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black">
                    {orders.length + manualSteadfastParcels.length}
                  </span>
                </button>

                <button
                  onClick={() => setCourierSubTab('settings')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                    courierSubTab === 'settings'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>API Credentials & Configurations</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getCourierPortalUrl('Steadfast Courier')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Open Portal Web Tab</span>
                </a>
              </div>
            </div>

            {courierSubTab === 'portal' ? (
              renderSteadfastMerchantPortalContent()
            ) : (
              <>
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="font-extrabold text-lg sm:text-xl flex items-center gap-2 font-display">
                      <Truck className="w-6 h-6 text-emerald-400" />
                      <span>Courier Services API Configuration</span>
                    </h2>
                    <p className="text-xs text-slate-300">
                      Manage Steadfast, Pathao, RedX, Paperfly, eCourier & Sundarban API credentials and delivery statuses.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      API Handshake Ready
                    </span>
                  </div>
                </div>

            {/* Courier List Cards Grid */}
            <div className="space-y-6">
              {courierList.map((cr) => (
                <div key={cr.id} className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">{cr.name}</h3>
                      {cr.isActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Live Active API
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestCourierConnection(cr)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Test API Ping</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourier(cr.id, cr.name)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Courier Integration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSaveCourierCard(cr, e)} className="space-y-4">
                    {/* Form Field Grid */}
                    {cr.code === 'steadfast' ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              API key <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cr.apiKey}
                              onChange={(e) => updateCourierField(cr.id, 'apiKey', e.target.value)}
                              placeholder="e.g. wzxwcbfedit8zvye6jssebbx\"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Secret key <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cr.secretKey}
                              onChange={(e) => updateCourierField(cr.id, 'secretKey', e.target.value)}
                              placeholder="e.g. jv5jnrpgydfdzfl\"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              URL <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cr.apiUrl}
                              onChange={(e) => updateCourierField(cr.id, 'apiUrl', e.target.value)}
                              placeholder="https://portal.packzy.com/api/v1"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                            <span className="text-xs font-bold text-slate-700">Status</span>
                            <button
                              type="button"
                              onClick={() => updateCourierField(cr.id, 'isActive', !cr.isActive)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                cr.isActive ? 'bg-[#00a86b]' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  cr.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : cr.code === 'pathao' ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              URL <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cr.apiUrl}
                              onChange={(e) => updateCourierField(cr.id, 'apiUrl', e.target.value)}
                              placeholder="https://api-hermes.pathao.com"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Token <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cr.token || cr.secretKey || cr.apiKey}
                              onChange={(e) => {
                                updateCourierField(cr.id, 'token', e.target.value);
                                updateCourierField(cr.id, 'secretKey', e.target.value);
                              }}
                              placeholder="nAggE4j7YVXTGlkZyUUkxqajjxGMRWgiTTK8u5rC"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Client ID / Store ID
                            </label>
                            <input
                              type="text"
                              value={cr.storeId}
                              onChange={(e) => updateCourierField(cr.id, 'storeId', e.target.value)}
                              placeholder="STORE-DHAKA-01"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                            <span className="text-xs font-bold text-slate-700">Status</span>
                            <button
                              type="button"
                              onClick={() => updateCourierField(cr.id, 'isActive', !cr.isActive)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                cr.isActive ? 'bg-[#00a86b]' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  cr.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : cr.code === 'redx' ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              URL <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cr.apiUrl}
                              onChange={(e) => updateCourierField(cr.id, 'apiUrl', e.target.value)}
                              placeholder="https://api.redx.com.bd"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              API Token <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cr.apiKey}
                              onChange={(e) => updateCourierField(cr.id, 'apiKey', e.target.value)}
                              placeholder="redx_token_991203"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Store ID
                            </label>
                            <input
                              type="text"
                              value={cr.storeId}
                              onChange={(e) => updateCourierField(cr.id, 'storeId', e.target.value)}
                              placeholder="HUB-1004"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                            <span className="text-xs font-bold text-slate-700">Status</span>
                            <button
                              type="button"
                              onClick={() => updateCourierField(cr.id, 'isActive', !cr.isActive)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                cr.isActive ? 'bg-[#00a86b]' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  cr.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              URL <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cr.apiUrl}
                              onChange={(e) => updateCourierField(cr.id, 'apiUrl', e.target.value)}
                              placeholder="https://api.courier.com.bd"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              API Key / User <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={cr.apiKey}
                              onChange={(e) => updateCourierField(cr.id, 'apiKey', e.target.value)}
                              placeholder="API Key or User"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Secret Key / Password <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={cr.secretKey}
                              onChange={(e) => updateCourierField(cr.id, 'secretKey', e.target.value)}
                              placeholder="Secret Key or Password"
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                            <span className="text-xs font-bold text-slate-700">Status</span>
                            <button
                              type="button"
                              onClick={() => updateCourierField(cr.id, 'isActive', !cr.isActive)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                cr.isActive ? 'bg-[#00a86b]' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  cr.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Bottom Submit Action */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="submit"
                        className="bg-[#00a86b] hover:bg-[#008f5a] active:scale-98 text-white font-extrabold text-xs px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-md shadow-emerald-600/10 flex items-center space-x-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Submit</span>
                      </button>

                      {cr.isDefault ? (
                        <span className="text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                          Primary Dispatch Service
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultCourier(cr.id)}
                          className="text-xs font-bold text-slate-600 hover:text-orange-600 hover:underline cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ))}
            </div>

            {/* Add Custom Courier API Integration Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2 font-display">
                <Plus className="w-5 h-5 text-orange-500" />
                <span>Add Custom Courier Provider API</span>
              </h2>

              <form onSubmit={handleAddCustomCourierSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-semibold">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Provider Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangladesh Post e-Courier"
                    value={newCourierName}
                    onChange={(e) => setNewCourierName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">API Endpoint URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://api.express.com"
                    value={newCourierUrl}
                    onChange={(e) => setNewCourierUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">API Key / User</label>
                  <input
                    type="text"
                    placeholder="key_live_xxx"
                    value={newCourierApiKey}
                    onChange={(e) => setNewCourierApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secret Key</label>
                  <input
                    type="password"
                    placeholder="sec_xxx"
                    value={newCourierSecret}
                    onChange={(e) => setNewCourierSecret(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl cursor-pointer transition-all">
                    Connect Provider
                  </button>
                </div>
              </form>
            </div>

            {/* Test API Response Modal */}
            {testApiModalData && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <h3 className="font-black text-base text-slate-900">{testApiModalData.courierName} Sandbox Ping</h3>
                    </div>
                    <button onClick={() => setTestApiModalData(null)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 bg-slate-900 text-emerald-400 font-mono p-4 rounded-2xl text-[11px] overflow-x-auto shadow-inner">
                    <p className="text-slate-400">// Endpoint: {testApiModalData.endpointUrl}</p>
                    <p className="text-amber-300">// Status Code: {testApiModalData.status}</p>
                    <pre className="mt-2 text-slate-200 font-mono text-[11px] whitespace-pre-wrap">{testApiModalData.responsePayload}</pre>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <button
                      onClick={() => setTestApiModalData(null)}
                      className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
                    >
                      Close Connection Monitor
                    </button>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        )}

        {/* --- PAYMENT GATEWAYS TAB CONTENT --- */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Add Custom Payment Gateway */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <span>Add Payment Method / Gateway</span>
              </h2>

              <form onSubmit={handleAddCustomGatewaySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
                <div>
                  <label className="font-bold text-slate-700 block">Gateway Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. bKash / Nagad / Upay / City Bank"
                    value={newGatewayName}
                    onChange={(e) => setNewGatewayName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block">Account / Wallet Number</label>
                  <input
                    type="text"
                    placeholder="01700000000"
                    value={newGatewayNumber}
                    onChange={(e) => setNewGatewayNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer">
                    Enable Gateway
                  </button>
                </div>
              </form>
            </div>

            {/* Payment Gateways Grid */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="font-black text-base text-slate-900 border-b pb-2">Configured Mobile Banking & Payment Gateways</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold">
                {paymentGateways.map((g) => (
                  <div key={g.id} className={`p-4 rounded-2xl border space-y-3 relative ${g.badgeBg}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-sm">{g.name}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${g.isActive ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-600'}`}>
                        {g.isActive ? 'ON' : 'OFF'}
                      </span>
                    </div>

                    <div className="space-y-1 bg-white/80 p-2.5 rounded-xl text-slate-800">
                      <p className="text-slate-600">Account Number: <span className="font-black text-slate-900">{g.number}</span></p>
                      <p className="text-slate-600">Type: <span className="font-bold">{g.accountType}</span></p>
                      {g.codAdvanceFeeRequired && (
                        <p className="text-amber-800 font-bold">Advance Shipping Required: ৳{g.advanceFeeAmount}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-200/60">
                      <button
                        onClick={() => handleToggleGatewayActive(g.id)}
                        className="p-1 hover:bg-white rounded-lg"
                        title="Toggle Active"
                      >
                        {g.isActive ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                      </button>
                      <button
                        onClick={() => setEditingGateway(g)}
                        className="p-1 hover:bg-white rounded-lg text-slate-700"
                        title="Edit Settings"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGateway(g.id, g.name)}
                        className="p-1 hover:bg-white rounded-lg text-rose-600"
                        title="Delete Gateway"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Payment Gateway Modal */}
            {editingGateway && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleUpdateGatewaySubmit} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
                  <h3 className="font-extrabold text-sm text-slate-900">Edit Payment Gateway: {editingGateway.name}</h3>
                  <div>
                    <label className="font-bold text-slate-700 block">Number / Merchant ID</label>
                    <input
                      type="text"
                      value={editingGateway.number}
                      onChange={(e) => setEditingGateway({ ...editingGateway, number: e.target.value })}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block">Payment Instructions</label>
                    <textarea
                      rows={2}
                      value={editingGateway.instructions || ''}
                      onChange={(e) => setEditingGateway({ ...editingGateway, instructions: e.target.value })}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl font-medium"
                    />
                  </div>
                  {editingGateway.code === 'cod' && (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingGateway.codAdvanceFeeRequired}
                          onChange={(e) => setEditingGateway({ ...editingGateway, codAdvanceFeeRequired: e.target.checked })}
                        />
                        <span className="font-bold text-slate-800">Require Advance Shipping Charge for COD</span>
                      </label>
                      <input
                        type="number"
                        value={editingGateway.advanceFeeAmount || 120}
                        onChange={(e) => setEditingGateway({ ...editingGateway, advanceFeeAmount: Number(e.target.value) })}
                        className="w-full bg-white border p-2 rounded-xl font-bold"
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button type="button" onClick={() => setEditingGateway(null)} className="px-4 py-2 border rounded-xl font-bold">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2 bg-orange-500 text-white rounded-xl font-bold">
                      Save Gateway Settings
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* --- CURRENCY RATES TAB CONTENT --- */}
        {activeTab === 'currency' && (
          <div className="space-y-6">
            {/* Add Currency Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-500" />
                <span>Add Foreign Exchange Rate (Base: 1 BDT)</span>
              </h2>

              <form onSubmit={handleAddCurrency} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-semibold">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Currency Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAR / GBP"
                    value={newCurrCode}
                    onChange={(e) => setNewCurrCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. ﷼ / £"
                    value={newCurrSymbol}
                    onChange={(e) => setNewCurrSymbol(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Currency Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Saudi Riyal"
                    value={newCurrName}
                    onChange={(e) => setNewCurrName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rate (1 BDT = ?)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    placeholder="e.g. 0.031"
                    value={newCurrRate}
                    onChange={(e) => setNewCurrRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer transition-all">
                    Add Currency
                  </button>
                </div>
              </form>
            </div>

            {/* Currencies Table / Grid */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center justify-between">
                <span>Active Exchange Rates</span>
                <span className="text-xs text-slate-500 font-normal">Base Currency: 1.00 BDT (৳)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold">
                {currencies.map((c) => (
                  <div key={c.code} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-sm">
                          {c.symbol}
                        </span>
                        <div>
                          <p className="font-extrabold text-sm text-slate-900">{c.code}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{c.name}</p>
                        </div>
                      </div>
                      {c.isDefault ? (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                          Primary Base
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleCurrencyActive(c.code)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer ${
                            c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </button>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 block uppercase">Conversion Rate (1 BDT)</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 font-bold">{c.symbol}</span>
                        <input
                          type="number"
                          step="0.0001"
                          disabled={c.isDefault}
                          value={c.rate}
                          onChange={(e) => handleUpdateCurrencyRate(c.code, Number(e.target.value))}
                          className="w-full font-black text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-1.5 disabled:opacity-60 disabled:bg-slate-100"
                        />
                      </div>
                    </div>

                    {!c.isDefault && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleDeleteCurrency(c.code)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Currency Price Conversion Simulator */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-sm text-amber-400 font-display">Live Currency Price Preview Simulator</h3>
                </div>
                <span className="text-xs text-slate-400">Test Multi-Currency Product Conversion</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Enter Price in BDT (৳)</label>
                  <input
                    type="number"
                    value={calcBdtAmount}
                    onChange={(e) => setCalcBdtAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-base font-black text-amber-300 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currencies.map((c) => {
                    const converted = (Number(calcBdtAmount) || 0) * c.rate;
                    return (
                      <div key={c.code} className="bg-slate-800/90 border border-slate-700 p-3 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-bold">{c.name} ({c.code})</p>
                        <p className="text-base font-black text-white mt-0.5">
                          {c.symbol} {converted.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- DYNAMIC THEME & LAYOUT BUILDER TAB CONTENT --- */}
        {activeTab === 'theme' && (
          <ThemeLayoutBuilder
            themeConfig={activeThemeConfig}
            products={products}
            categories={categoryList.map((c) => c.name)}
            onSaveThemeConfig={handleSaveThemeConfig}
            showToast={showToast}
          />
        )}

        {/* --- WEBSITE SETTINGS TAB CONTENT --- */}
        {activeTab === 'website_settings' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveWebsiteSettings} className="space-y-6">
              {/* BRAND LOGO UPLOAD & MANAGEMENT */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
                <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-orange-500" />
                    <span>Website Brand Logo Management</span>
                  </span>
                  <span className="text-xs text-slate-500 font-normal">PNG / JPEG / WebP</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Current Logo Preview Box */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl min-h-[140px]">
                    {siteLogoUrl ? (
                      <div className="relative group space-y-2 text-center">
                        <img
                          src={siteLogoUrl}
                          alt="Brand Logo"
                          className="h-16 w-auto max-w-[200px] object-contain mx-auto rounded-lg shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSiteLogoUrl('');
                            showToast('Logo removed. Default logo will be used.');
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-full cursor-pointer transition-all inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove Custom Logo</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto font-black text-lg">
                          AT
                        </div>
                        <p className="text-xs font-bold text-slate-600">Default Brand Logo</p>
                        <p className="text-[10px] text-slate-400">No custom logo uploaded yet</p>
                      </div>
                    )}
                  </div>

                  {/* Device File Upload & URL Inputs */}
                  <div className="md:col-span-2 space-y-4 text-xs font-semibold">
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-orange-500" />
                        <span>Upload Brand Logo From Your Device</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSiteLogoFileUpload}
                        className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-2 transition-all"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Recommended size: 250x80 px or transparent PNG logo</p>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Or Paste External Logo Image URL</label>
                      <input
                        type="text"
                        value={siteLogoUrl}
                        onChange={(e) => setSiteLogoUrl(e.target.value)}
                        placeholder="https://example.com/my-logo.png"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* General Store Identity & Header Options */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
                <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-orange-500" />
                  <span>Header & General Store Identity Settings</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Store Brand Title *</label>
                    <input
                      type="text"
                      required
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      placeholder="e.g. LuxeShop"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Title Suffix</label>
                    <input
                      type="text"
                      value={siteTitleSuffix}
                      onChange={(e) => setSiteTitleSuffix(e.target.value)}
                      placeholder="e.g. BD / Market"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tagline Slogan</label>
                    <input
                      type="text"
                      value={siteTagline}
                      onChange={(e) => setSiteTagline(e.target.value)}
                      placeholder="Wholesale & Retail Market"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Support Hotline Phone *</label>
                    <input
                      type="text"
                      required
                      value={sitePhone}
                      onChange={(e) => setSitePhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Official Email Address *</label>
                    <input
                      type="email"
                      required
                      value={siteEmail}
                      onChange={(e) => setSiteEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Store Working Hours</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="Daily: 9:00 AM - 11:00 PM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="font-bold text-slate-700 block mb-1">Store Headquarters / Warehouse Address</label>
                    <input
                      type="text"
                      value={siteAddress}
                      onChange={(e) => setSiteAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Top Header Marquee Announcement */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
                <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-500" />
                  <span>Top Header Marquee Announcement Banner</span>
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Announcement Banner Message</label>
                    <input
                      type="text"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="e.g. 🚀 Direct Wholesale Prices | ৳60 Inside Dhaka • ৳120 Outside"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div className="bg-slate-900 text-white p-3 rounded-xl text-center font-bold text-xs shadow-xs flex items-center justify-center gap-2">
                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Wholesale BD</span>
                    <span className="truncate">{announcementText || 'Your announcement will appear here'}</span>
                  </div>
                </div>
              </div>

              {/* Footer Information & About Section */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
                <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  <span>Footer Information & Value Proposition Options</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Footer About Section Title</label>
                    <input
                      type="text"
                      value={footerAboutTitle}
                      onChange={(e) => setFooterAboutTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fast Shipping Badge Text</label>
                    <input
                      type="text"
                      value={footerFastShippingText}
                      onChange={(e) => setFooterFastShippingText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Footer About Summary Description</label>
                    <textarea
                      rows={2}
                      value={footerAboutText}
                      onChange={(e) => setFooterAboutText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Genuine Quality Badge Text</label>
                    <input
                      type="text"
                      value={footerGenuineWarrantyText}
                      onChange={(e) => setFooterGenuineWarrantyText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Wholesale B2B Rate Badge Text</label>
                    <input
                      type="text"
                      value={footerWholesaleBadgeText}
                      onChange={(e) => setFooterWholesaleBadgeText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Return Policy Badge Text</label>
                    <input
                      type="text"
                      value={footerReturnPolicyText}
                      onChange={(e) => setFooterReturnPolicyText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Social Channels & Contact Links */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
                <h2 className="font-black text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-500" />
                  <span>Social Media & Customer Support Handles</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Facebook Page URL</label>
                    <input
                      type="text"
                      value={siteFacebook}
                      onChange={(e) => setSiteFacebook(e.target.value)}
                      placeholder="https://facebook.com/myshop"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">WhatsApp Hotline Number</label>
                    <input
                      type="text"
                      value={siteWhatsapp}
                      onChange={(e) => setSiteWhatsapp(e.target.value)}
                      placeholder="01700000000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Instagram Profile Link</label>
                    <input
                      type="text"
                      value={siteInstagram}
                      onChange={(e) => setSiteInstagram(e.target.value)}
                      placeholder="https://instagram.com/myshop"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">YouTube Channel Link</label>
                    <input
                      type="text"
                      value={siteYoutube}
                      onChange={(e) => setSiteYoutube(e.target.value)}
                      placeholder="https://youtube.com/myshop"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-4">
                    <label className="font-bold text-slate-700 block mb-1">Footer Copyright Notice</label>
                    <input
                      type="text"
                      value={siteCopyright}
                      onChange={(e) => setSiteCopyright(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action Bar */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save All Website Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
            <h2 className="font-black text-base text-slate-900 border-b pb-2">Security & Access Control</h2>
            <form onSubmit={handleUpdateSecurity} className="max-w-md space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Admin Mobile Number</label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">New Security Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Update Security Keys
              </button>
            </form>
          </div>
        )}

        {/* --- EMAIL & ADMIN ALERTS TAB --- */}
        {activeTab === 'email_notifications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Banner Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/60 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Real-time Admin Email Dispatch Engine</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
                  Automated Admin Email Notifications
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                  Set your admin email address to receive real-time email alerts whenever a new customer registers, a new order is placed, a seller opens an account, or a new product is added to the store.
                </p>
              </div>
            </div>

            {/* Email Settings Configuration Form */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    <span>Admin Email Target & Trigger Settings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure which events dispatch automated emails to your inbox</p>
                </div>
                <button
                  onClick={handleSendTestEmail}
                  disabled={testEmailLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testEmailLoading ? 'Sending Test Email...' : 'Send Test Notification Email'}</span>
                </button>
              </div>

              <form onSubmit={handleSaveEmailSettingsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Admin Inbox Email Address *</label>
                    <input
                      type="email"
                      required
                      value={emailSettings.adminEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, adminEmail: e.target.value })}
                      placeholder="e.g. awebheroofficial@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">All notification emails will be sent to this email address.</p>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Sender Name / System Label</label>
                    <input
                      type="text"
                      required
                      value={emailSettings.senderName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                      placeholder="e.g. LuxeShop BD System"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Displayed as the sender name in the admin email inbox.</p>
                  </div>
                </div>

                {/* EmailJS Credentials Bar */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>EmailJS API Credentials</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">Active</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px] font-bold">EmailJS Service ID</label>
                      <input
                        type="text"
                        required
                        value={emailSettings.emailjsServiceId || 'service_z99bsab'}
                        onChange={(e) => setEmailSettings({ ...emailSettings, emailjsServiceId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px] font-bold">EmailJS Template ID</label>
                      <input
                        type="text"
                        required
                        value={emailSettings.emailjsTemplateId || 'template_npm7y57'}
                        onChange={(e) => setEmailSettings({ ...emailSettings, emailjsTemplateId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 text-[11px] font-bold">EmailJS Public Key</label>
                      <input
                        type="text"
                        required
                        value={emailSettings.emailjsPublicKey || 'ANbHP5Ew3uwAn-0Tn'}
                        onChange={(e) => setEmailSettings({ ...emailSettings, emailjsPublicKey: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Checkboxes */}
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                    Active Notification Event Triggers
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Trigger 1: New Customer */}
                    <label className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      emailSettings.notifyOnNewCustomer
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        checked={emailSettings.notifyOnNewCustomer}
                        onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnNewCustomer: e.target.checked })}
                        className="mt-1 w-4 h-4 accent-emerald-600 rounded"
                      />
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5 text-slate-900">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>New Customer Signup</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Receive an instant email when a new customer registers.
                        </p>
                      </div>
                    </label>

                    {/* Trigger 2: New Order */}
                    <label className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      emailSettings.notifyOnNewOrder
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        checked={emailSettings.notifyOnNewOrder}
                        onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnNewOrder: e.target.checked })}
                        className="mt-1 w-4 h-4 accent-emerald-600 rounded"
                      />
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5 text-slate-900">
                          <ShoppingBag className="w-4 h-4 text-emerald-600" />
                          <span>New Order Placement</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Receive full order details and customer info via email.
                        </p>
                      </div>
                    </label>

                    {/* Trigger 3: New Seller */}
                    <label className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      emailSettings.notifyOnNewSeller
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        checked={emailSettings.notifyOnNewSeller}
                        onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnNewSeller: e.target.checked })}
                        className="mt-1 w-4 h-4 accent-emerald-600 rounded"
                      />
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5 text-slate-900">
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span>New Seller Registration</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Get notified when a new vendor opens a store.
                        </p>
                      </div>
                    </label>

                    {/* Trigger 4: New Product */}
                    <label className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      emailSettings.notifyOnNewProduct
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        checked={emailSettings.notifyOnNewProduct}
                        onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnNewProduct: e.target.checked })}
                        className="mt-1 w-4 h-4 accent-emerald-600 rounded"
                      />
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5 text-slate-900">
                          <Package className="w-4 h-4 text-emerald-600" />
                          <span>New Product Publish</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Get an email whenever a product is published.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Save Email Configuration</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Outbox Email Logs Section */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    <span>Sent Admin Email Outbox Logs</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    History of all automated notification emails generated and sent to {emailSettings.adminEmail}
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
                  Total Sent: <span className="text-emerald-600 font-black">{emailLogs.length}</span>
                </div>
              </div>

              {/* Email Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                      <th className="p-3">Time</th>
                      <th className="p-3">Event Type</th>
                      <th className="p-3">Subject / Header</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {emailLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                          No email notifications sent yet. Perform an action like placing an order or click "Send Test Notification Email".
                        </td>
                      </tr>
                    ) : (
                      emailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span className={`inline-block font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider ${
                              log.eventType === 'new_customer'
                                ? 'bg-blue-100 text-blue-800'
                                : log.eventType === 'new_order'
                                ? 'bg-emerald-100 text-emerald-800 font-black'
                                : log.eventType === 'new_seller'
                                ? 'bg-purple-100 text-purple-800'
                                : log.eventType === 'new_product'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {log.eventType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-800 max-w-xs truncate">
                            {log.subject}
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            {log.recipientEmail}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Delivered</span>
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setSelectedEmailLogModal(log)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[11px] px-3 py-1 rounded-lg cursor-pointer transition-all"
                            >
                              View Email Body
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Email Body Detail Modal */}
            {selectedEmailLogModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base font-display">
                      <Mail className="w-5 h-5 text-emerald-600" />
                      <span>Admin Email Notification Body</span>
                    </div>
                    <button
                      onClick={() => setSelectedEmailLogModal(null)}
                      className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                      <p className="font-bold text-slate-900">
                        Subject: <span className="font-mono text-emerald-700">{selectedEmailLogModal.subject}</span>
                      </p>
                      <p className="text-slate-600">
                        To Admin Inbox: <span className="font-mono font-bold text-slate-800">{selectedEmailLogModal.recipientEmail}</span>
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        Dispatched At: {new Date(selectedEmailLogModal.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
                      {selectedEmailLogModal.body}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedEmailLogModal(null)}
                      className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
                    >
                      Close View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Courier Booking Success & Direct Website Redirect Modal */}
        {bookingSuccessModalData && bookingSuccessModalData.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base font-display">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Courier Booking Successful</span>
                </div>
                <button
                  onClick={() => setBookingSuccessModalData(null)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-emerald-900 space-y-1 font-semibold">
                  <p className="font-bold text-sm">
                    Order: <span className="font-mono text-emerald-700">{bookingSuccessModalData.orderNumber}</span>
                  </p>
                  <p>
                    Courier: <span className="font-extrabold text-emerald-800">{bookingSuccessModalData.courierName}</span>
                  </p>
                  <p className="font-mono text-xs">
                    Tracking Code: <span className="font-extrabold text-orange-600">{bookingSuccessModalData.trackingId}</span>
                  </p>
                </div>

                <p className="text-slate-600 text-center font-medium">
                  The parcel has been successfully assigned to <strong className="text-slate-900">{bookingSuccessModalData.courierName}</strong>. Click below to access the tracking portal:
                </p>

                <div className="space-y-2 pt-1">
                  <a
                    href={bookingSuccessModalData.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Open {bookingSuccessModalData.courierName} Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {bookingSuccessModalData.trackingUrl && (
                    <a
                      href={bookingSuccessModalData.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <Truck className="w-4 h-4 text-orange-600" />
                      <span>Track Parcel</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setBookingSuccessModalData(null)}
                  className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs cursor-pointer hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Manual Parcel Modal (Steadfast Courier) */}
        {isAddParcelModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base font-display">
                  <Plus className="w-5 h-5 text-[#00b894]" />
                  <span>Add New Consignment Parcel</span>
                </div>
                <button
                  onClick={() => setIsAddParcelModalOpen(false)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateManualParcel} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newParcelCustomerName}
                    onChange={(e) => setNewParcelCustomerName(e.target.value)}
                    placeholder="e.g. Tariqul Islam"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Mobile Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newParcelPhone}
                    onChange={(e) => setNewParcelPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Delivery Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={newParcelAddress}
                    onChange={(e) => setNewParcelAddress(e.target.value)}
                    placeholder="e.g. House 14, Road 5, Mirpur-10, Dhaka"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">COD Amount (৳) *</label>
                    <input
                      type="number"
                      required
                      value={newParcelPayment}
                      onChange={(e) => setNewParcelPayment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Delivery Charge (৳)</label>
                    <input
                      type="number"
                      value={newParcelCharge}
                      onChange={(e) => setNewParcelCharge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddParcelModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#00b894] hover:bg-[#00a382] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    Save Consignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Selected Parcel Detail Modal */}
        {selectedParcelDetail && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base font-display">
                  <Truck className="w-5 h-5 text-[#00b894]" />
                  <span>Consignment Details — #{selectedParcelDetail.id}</span>
                </div>
                <button
                  onClick={() => setSelectedParcelDetail(null)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Consignment ID:</span>
                  <span className="font-mono font-black text-[#00b894] text-sm">{selectedParcelDetail.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Date Created:</span>
                  <span className="font-medium text-slate-800">{selectedParcelDetail.date}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Customer Name:</span>
                  <span className="font-extrabold text-slate-900">{selectedParcelDetail.customerName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Phone Number:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedParcelDetail.phone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Address:</span>
                  <span className="font-medium text-slate-800 text-right max-w-[220px]">{selectedParcelDetail.address}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
                  <span className="text-slate-500 font-bold">COD Collectable Payment:</span>
                  <span className="font-black text-slate-900 text-sm">৳ {selectedParcelDetail.payment}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Delivery Fee / Charge:</span>
                  <span className="font-bold text-slate-700">৳ {selectedParcelDetail.charge}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Consignment Status:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-[11px]">
                    {selectedParcelDetail.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href={`https://steadfast.com.bd/t/${selectedParcelDetail.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 text-[#00b894] border border-[#00b894]/40 hover:bg-emerald-100 font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Steadfast Tracking Link</span>
                </a>

                <button
                  onClick={() => setSelectedParcelDetail(null)}
                  className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Super Admin Profile Modal */}
        {isAdminProfileOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base font-display">
                  <User className="w-5 h-5 text-orange-500" />
                  <span>Super Admin Account Profile</span>
                </div>
                <button
                  onClick={() => setIsAdminProfileOpen(false)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 bg-orange-50/60 border border-orange-200/60 p-4 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  A
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">System Super Admin</h4>
                  <p className="text-xs font-semibold text-orange-600">Master Access Credentials Active</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Mobile: +880 1700-000000</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">Security Passkey Level:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> 2FA Encrypted
                  </span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">Courier API Master Key:</span>
                  <span className="font-mono font-bold text-slate-900">st_live_98a72f...</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">Active System Engine:</span>
                  <span className="font-bold text-slate-900">A-TIDY Fashion OS v4.2</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsAdminProfileOpen(false);
                    showToast('🔒 Passkey security & API keys verified');
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs cursor-pointer"
                >
                  Verify Access
                </button>
                <button
                  onClick={() => setIsAdminProfileOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set Monthly Sales Goal Target Modal */}
        {isTargetModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base font-display">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  <span>Edit Monthly Sales Target</span>
                </div>
                <button
                  onClick={() => setIsTargetModalOpen(false)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const parsed = parseInt(customGoalInput.replace(/,/g, ''), 10);
                  if (parsed && parsed > 0) {
                    setMonthlyTargetGoal(parsed);
                    setIsTargetModalOpen(false);
                    showToast(`🎯 Monthly Target updated to ৳${parsed.toLocaleString()}!`);
                  } else {
                    showToast('⚠️ Please enter a valid positive number');
                  }
                }}
                className="space-y-4 text-xs font-semibold"
              >
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Monthly Sales Goal (BDT ৳) *</label>
                  <input
                    type="number"
                    required
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    placeholder="e.g. 2000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Current total revenue: ৳{(totalGMV || 1700000).toLocaleString()}</p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsTargetModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    Update Target
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CUSTOMER ID CARD MODAL */}
        {selectedCustomerForCard && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-5 relative">
                <button
                  onClick={() => setSelectedCustomerForCard(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                    AT
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm font-display tracking-tight text-amber-400">
                      A-TIDY SHOPPING ONLINE
                    </h3>
                    <p className="text-[10px] text-slate-300 font-mono tracking-widest uppercase">
                      OFFICIAL DIGITAL CUSTOMER ID CARD
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-5 bg-gradient-to-b from-orange-50/30 to-white">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-2xl flex items-center justify-center shadow-md">
                      {selectedCustomerForCard.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">
                        {selectedCustomerForCard.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-black bg-slate-900 text-orange-400 px-2 py-0.5 rounded-lg">
                          {selectedCustomerForCard.id}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {selectedCustomerForCard.role.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-slate-200">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                    <p className="font-bold text-slate-800 font-mono">{selectedCustomerForCard.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                    <p className="font-bold text-slate-800 truncate">{selectedCustomerForCard.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Orders</p>
                    <p className="font-extrabold text-orange-600">{selectedCustomerForCard.totalOrders} Orders</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Value</p>
                    <p className="font-extrabold text-emerald-600">৳{selectedCustomerForCard.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Address Location</p>
                    <p className="font-semibold text-slate-700">{selectedCustomerForCard.address}</p>
                  </div>
                </div>

                {/* Barcode Mockup */}
                <div className="bg-slate-900 text-white p-3 rounded-2xl flex flex-col items-center justify-center space-y-1">
                  <div className="flex items-center space-x-1 tracking-tighter opacity-80 font-mono text-xs select-none">
                    ||||| ||| ||||||| || |||||| ||| ||||| |||||| ||
                  </div>
                  <p className="font-mono text-[10px] text-amber-400 font-bold">
                    BARCODE: {selectedCustomerForCard.id}-VERIFIED
                  </p>
                </div>

                {/* Action Controls */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoginAsCustomer(selectedCustomerForCard)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Log In as Customer</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(selectedCustomerForCard)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="Delete Customer Account"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print ID Card</span>
                    </button>
                    <button
                      onClick={() => setSelectedCustomerForCard(null)}
                      className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-2xl cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD NEW CUSTOMER MODAL */}
        {isAddCustomerModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base font-display">
                  <Plus className="w-5 h-5 text-orange-500" />
                  <span>Add New Customer Account</span>
                </div>
                <button
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddNewCustomerSubmit} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Tanvir Hasan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="01712345678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Email Address</label>
                    <input
                      type="email"
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Account Role</label>
                  <select
                    value={newCustRole}
                    onChange={(e: any) => setNewCustRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="customer">Retail Buyer / Customer</option>
                    <option value="vendor">Vendor / Wholesale Seller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Delivery Address</label>
                  <textarea
                    rows={2}
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    placeholder="Dhanmondi 27, Dhaka, Bangladesh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Account</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

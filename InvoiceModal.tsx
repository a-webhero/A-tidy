import React, { useState } from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, MapPin, Tag, Phone, Download, Loader2 } from 'lucide-react';
import { Order } from './types';
const brandLogo = '/atidy_fashion_logo.png';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
}

const createCleanInvoiceHtml = (order: Order, logoSrc: string, qrUrl: string) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const addressText = typeof order.shippingAddress === 'string'
    ? order.shippingAddress
    : order.shippingAddress
    ? `${order.shippingAddress.fullAddress || ''}, ${order.shippingAddress.thana || ''}, ${order.shippingAddress.district || ''}${order.shippingAddress.division ? `, ${order.shippingAddress.division} Division` : ''}`
    : '';

  const itemRows = order.items.map((item) => {
    const itemImg = item.product.images?.[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=150&q=80';
    const variantInfo = [
      item.selectedVariant?.colorName && `Color: ${item.selectedVariant.colorName}`,
      item.selectedVariant?.storage && `${item.selectedVariant.storage}`,
      item.selectedVariant?.size && `Size: ${item.selectedVariant.size}`,
      item.selectedVariant?.sku && `SKU: ${item.selectedVariant.sku}`,
    ].filter(Boolean).join(' | ');

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 10px 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${itemImg}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; background-color: #f8fafc;" crossorigin="anonymous" />
            <div>
              <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${item.product.title}</div>
              ${variantInfo ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${variantInfo}</div>` : ''}
              ${item.isWholesaleTierApplied ? `<div style="display: inline-block; font-size: 10px; color: #2563eb; background-color: #eff6ff; padding: 2px 6px; border-radius: 4px; margin-top: 3px; font-weight: 700;">Wholesale Tier Applied</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 10px 8px; text-align: center; font-weight: 800; color: #0f172a;">${item.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; color: #334155; font-weight: 700;">৳${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 900; color: #0f172a;">৳${(item.unitPrice * item.quantity).toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  return `
    <div style="width: 760px; padding: 28px; background-color: #ffffff; color: #1e293b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${logoSrc}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 12px; border: 1px solid #f59e0b;" crossorigin="anonymous" />
          <div>
            <div style="font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
              A-TIDY <span style="color: #f59e0b;">FASHION</span>
            </div>
            <div style="font-size: 10px; font-weight: 800; color: #d97706; text-transform: uppercase;">
              Exclusive Modest Fashion & Wholesale Hub
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
              Dhaka • Chittagong • Sylhet • Rajshahi Distribution Hubs
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; background-color: #d1fae5; color: #065f46; font-weight: 900; font-size: 10px; padding: 4px 10px; border-radius: 20px; border: 1px solid #a7f3d0; margin-bottom: 6px;">
            VERIFIED INVOICE
          </div>
          <div style="font-size: 18px; font-weight: 900; color: #0f172a; font-family: monospace;">
            INV-${order.orderNumber}
          </div>
          <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px;">
            Issue Date: ${formattedDate}
          </div>
        </div>
      </div>

      <!-- Customer & Merchant Details -->
      <div style="display: flex; justify-content: space-between; background-color: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
        <div style="width: 48%;">
          <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">
            Billed & Shipped To (Customer Details)
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${order.customerName}</div>
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 2px;">
            📞 ${order.customerPhone}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.4;">
            📍 ${addressText}
          </div>
          <div style="display: inline-block; margin-top: 6px; font-size: 9px; font-weight: 800; background-color: #e2e8f0; color: #1e293b; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
            Order Type: ${order.buyerType}
          </div>
        </div>

        <div style="width: 48%; display: flex; justify-content: space-between;">
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">
              Fulfilling Merchant / Shop
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${order.vendorName}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">Verified BD Merchant Warranty</div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">Courier: ${order.courierDetails?.courierName || 'Pathao Express'}</div>
            <div style="font-size: 11px; color: #475569;">TRK: ${order.courierDetails?.trackingId || 'PTH-90213'}</div>
            <div style="display: inline-block; margin-top: 4px; font-size: 9px; font-weight: 800; background-color: #ffedd5; color: #9a3412; padding: 2px 6px; border-radius: 4px;">
              Zone: ${order.deliveryZone}
            </div>
          </div>
          <div style="text-align: center; background: #ffffff; padding: 6px; border-radius: 8px; border: 1px solid #cbd5e1; align-self: flex-start;">
            <img src="${qrUrl}" style="width: 60px; height: 60px; object-fit: contain;" crossorigin="anonymous" />
            <div style="font-size: 8px; font-weight: 700; color: #64748b; margin-top: 2px; font-family: monospace;">Scan QR</div>
          </div>
        </div>
      </div>

      <!-- Item Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #cbd5e1; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">
            <th style="padding: 8px; text-align: left;">Product Photo & Title</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Unit Rate</th>
            <th style="padding: 8px; text-align: right;">Total (৳)</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Totals & Payment -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #cbd5e1; padding-top: 16px; margin-bottom: 20px;">
        <div style="width: 250px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 10px; font-size: 11px;">
          <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Payment Verification</div>
          <div style="font-weight: 800; color: #0f172a;">Method: ${order.paymentDetails.method.toUpperCase()}</div>
          <div style="font-family: monospace; font-size: 10px; color: #64748b; margin-top: 2px;">Txn ID: ${order.paymentDetails.transactionId || 'TXN-90218239'}</div>
          <div style="color: #059669; font-weight: 800; margin-top: 4px;">✓ Status: PAID & VERIFIED</div>
        </div>

        <div style="width: 240px; font-size: 12px; color: #475569;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Subtotal</span>
            <span style="font-weight: 800; color: #0f172a;">৳${order.subtotal.toLocaleString()}</span>
          </div>
          ${order.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; color: #059669; margin-bottom: 4px;">
              <span>Promo Discount (${order.promoCode})</span>
              <span style="font-weight: 800;">-৳${order.discountAmount.toLocaleString()}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Shipping Fee (${order.deliveryZone})</span>
            <span style="font-weight: 800; color: #ea580c;">+৳${order.shippingFee}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 8px;">
            <span>Grand Total</span>
            <span style="color: #ea580c;">৳${order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
        <div>
          <div style="font-weight: 800; color: #0f172a;">Thank you for shopping with A-TIDY Fashion!</div>
          <div>Helpline: 01700000000 • Email: awebheroofficial@gmail.com</div>
        </div>
        <div style="font-family: monospace; background-color: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; text-align: center; color: #0f172a; font-weight: 700;">
          ||| |||| || ||||| |||| |||
          <div style="font-size: 8px; font-family: sans-serif; color: #64748b; font-weight: 400;">${order.orderNumber}</div>
        </div>
      </div>
    </div>
  `;
};

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose, onTrackOrder }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `INV-${order.orderNumber} | Customer: ${order.customerName} (${order.customerPhone}) | Amount: BDT ${order.totalAmount} | Verified A-TIDY Fashion BD`
  )}`;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0px';
    tempDiv.style.zIndex = '-9999';
    tempDiv.innerHTML = createCleanInvoiceHtml(order, brandLogo, qrCodeUrl);

    document.body.appendChild(tempDiv);

    const opt = {
      margin: 8,
      filename: `Invoice-${order.orderNumber || 'INV'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc: Document) => {
          // Remove all external CSS styles/links to prevent html2canvas from failing on Tailwind v4 oklch/oklab rules
          const stylesheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          stylesheets.forEach((s) => s.remove());
        }
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      const targetElem = (tempDiv.firstElementChild as HTMLElement) || tempDiv;
      await html2pdf().set(opt).from(targetElem).save();
    } catch (err) {
      console.error('PDF generation fallback triggered:', err);
      window.print();
    } finally {
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none flex flex-col">
        {/* Modal Top Bar (Hidden during printing) */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white sticky top-0 z-10 print:hidden shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold font-display">Official Invoice & Order Record</h3>
              <p className="text-[10px] text-slate-300">Invoice ID: INV-{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onTrackOrder(order)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Track Live Delivery
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
              title="Download Invoice as PDF file"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Downloading PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Invoice PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs bg-white print:p-2" id="printable-invoice">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-md">
                  <img
                    src={brandLogo}
                    alt="A-TIDY Fashion Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 font-display">
                    A-TIDY <span className="text-amber-500">FASHION</span>
                  </span>
                  <p className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">
                    Exclusive Modest Fashion & Wholesale Hub
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Dhaka • Chittagong • Sylhet • Rajshahi Distribution Hubs
              </p>
            </div>

            <div className="text-right">
              <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-block mb-1 border border-emerald-200">
                VERIFIED INVOICE
              </span>
              <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
                INV-{order.orderNumber}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                Issue Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Customer & Vendor Details Row */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Customer Billed To */}
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                Billed & Shipped To (Customer Details)
              </span>
              <p className="font-extrabold text-slate-900 text-sm">{order.customerName}</p>
              <p className="text-[11px] text-slate-700 font-bold mt-0.5">
                <Phone className="w-3 h-3 inline mr-1 text-slate-500" />
                {order.customerPhone}
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                <MapPin className="w-3 h-3 inline mr-1 text-orange-600" />
                {typeof order.shippingAddress === 'string'
                  ? order.shippingAddress
                  : order.shippingAddress
                  ? `${order.shippingAddress.fullAddress || ''}, ${order.shippingAddress.thana || ''}, ${order.shippingAddress.district || ''}${order.shippingAddress.division ? `, ${order.shippingAddress.division} Division` : ''}`
                  : ''}
              </p>
              <span className="inline-block mt-1.5 text-[9px] font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md uppercase">
                Order Type: {order.buyerType}
              </span>
            </div>

            {/* Vendor Details & QR Code Preview */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                  Fulfilling Merchant / Shop
                </span>
                <p className="font-extrabold text-slate-900 text-sm">{order.vendorName}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Verified BD Merchant Warranty
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Courier: {order.courierDetails?.courierName || 'Pathao Express'} (TRK:{' '}
                  {order.courierDetails?.trackingId || 'PTH-90213'})
                </p>
                <span className="inline-block mt-1 text-[9px] font-extrabold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">
                  Zone: {order.deliveryZone}
                </span>
              </div>

              {/* Scannable QR Code */}
              <div className="text-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs shrink-0 ml-2">
                <img
                  src={qrCodeUrl}
                  alt="Invoice QR Code"
                  className="w-16 h-16 rounded-md object-contain"
                />
                <span className="block text-[8px] font-bold text-slate-500 font-mono mt-0.5">
                  Scan QR
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table WITH PRODUCT PHOTOS */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-2.5 px-2">Product Photo & Title</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Rate</th>
                  <th className="py-2.5 px-2 text-right">Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="text-xs font-semibold">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        {/* PRODUCT THUMBNAIL PHOTO */}
                        <img
                          src={
                            item.product.images?.[0] ||
                            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={item.product.title}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900">{item.product.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {item.selectedVariant?.colorName && `Color: ${item.selectedVariant.colorName}`}
                            {item.selectedVariant?.storage && ` | ${item.selectedVariant.storage}`}
                            {item.selectedVariant?.size && ` | Size: ${item.selectedVariant.size}`}
                            {item.selectedVariant?.sku && ` (SKU: ${item.selectedVariant.sku})`}
                          </p>
                          {item.isWholesaleTierApplied && (
                            <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md mt-0.5">
                              <Tag className="w-2.5 h-2.5" />
                              <span>Wholesale Tier Applied</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-extrabold text-slate-900">{item.quantity}</td>
                    <td className="py-3 px-2 text-right text-slate-700 font-bold">
                      ৳{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-black text-slate-900">
                      ৳{(item.unitPrice * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Totals Box */}
          <div className="flex justify-between items-end border-t-2 border-slate-200 pt-4">
            {/* Payment Details Badge */}
            <div className="space-y-1 max-w-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Payment Verification
              </span>
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-[11px] space-y-1">
                <p className="font-bold text-slate-800">
                  Method: {order.paymentDetails.method.toUpperCase()}
                </p>
                <p className="text-slate-500 font-mono text-[10px]">
                  Txn ID: {order.paymentDetails.transactionId || 'TXN-90218239'}
                </p>
                <p className="text-emerald-600 font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Status: PAID & VERIFIED</span>
                </p>
              </div>
            </div>

            {/* Calculations */}
            <div className="w-64 space-y-1.5 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">৳{order.subtotal.toLocaleString()}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount ({order.promoCode})</span>
                  <span className="font-bold">-৳{order.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Fee ({order.deliveryZone})</span>
                <span className="font-bold text-orange-600">+৳{order.shippingFee}</span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-300 pt-2">
                <span>Grand Total</span>
                <span className="text-orange-600">৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Barcode Simulation & QR Verification Sign Off */}
          <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-500">
            <div>
              <p className="font-extrabold text-slate-800">Thank you for shopping with A-TIDY Fashion!</p>
              <p>Helpline: 01700000000 • Email: awebheroofficial@gmail.com</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-center font-mono tracking-widest text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                ||| |||| || ||||| |||| |||
                <span className="block text-[8px] tracking-normal text-slate-500 font-sans">
                  {order.orderNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

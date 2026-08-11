import React, { useState, useEffect } from 'react';
import { X, MapPin, Truck, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle, Phone } from 'lucide-react';
import { BANGLADESH_LOCATIONS, calculateDeliveryFee } from './bangladeshLocations';
import { CartItem, PaymentMethod, Order, BuyerType } from './types';
import { UserAccount } from './AuthModal';
import { sendAdminEmailNotification } from './adminEmailService';
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  buyerType: BuyerType;
  onOrderSuccess: (order: Order) => void;
  defaultDivision?: string;
  defaultDistrict?: string;
  defaultThana?: string;
  currentUser?: UserAccount | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discountAmount,
  promoCode,
  buyerType,
  onOrderSuccess,
  defaultDivision = 'Dhaka',
  defaultDistrict = 'Dhaka City',
  defaultThana = 'Gulshan',
  currentUser
}) => {
  // Address State
  const [fullName, setFullName] = useState(currentUser?.name || 'Abir Hasan');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '01712345678');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setFullName(currentUser.name);
      if (currentUser.phone) setPhoneNumber(currentUser.phone);
    }
  }, [currentUser]);
  const [division, setDivision] = useState(defaultDivision);
  const [district, setDistrict] = useState(defaultDistrict);
  const [thana, setThana] = useState(defaultThana);
  const [fullAddress, setFullAddress] = useState('House 42, Road 11, Block D');
  const [zipCode, setZipCode] = useState('1212');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [payAdvanceDeliveryFee, setPayAdvanceDeliveryFee] = useState(true);

  // Gateway Verification Modal State (bKash / Nagad / SSLCommerz simulator)
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [walletNumber, setWalletNumber] = useState('');
  const [walletOtp, setWalletOtp] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [gatewayStep, setGatewayStep] = useState<'number' | 'otp' | 'pin'>('number');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Auto-calculated Delivery Fee & Zone
  const selectedDivObj = BANGLADESH_LOCATIONS.find((d) => d.name === division) || BANGLADESH_LOCATIONS[0];
  const availableDistricts = selectedDivObj.districts;
  const selectedDistObj = availableDistricts.find((d) => d.name === district) || availableDistricts[0];
  const availableThanas = selectedDistObj ? selectedDistObj.thanas : [];

  // Recalculate fee whenever district or thana changes
  const deliveryCalc = calculateDeliveryFee(selectedDistObj?.id || 'dhaka-city', thana || 'gulshan');
  const shippingFee = deliveryCalc.fee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Reset district/thana if division changes
  const handleDivisionChange = (newDivName: string) => {
    setDivision(newDivName);
    const newDiv = BANGLADESH_LOCATIONS.find((d) => d.name === newDivName);
    if (newDiv && newDiv.districts.length > 0) {
      setDistrict(newDiv.districts[0].name);
      if (newDiv.districts[0].thanas.length > 0) {
        setThana(newDiv.districts[0].thanas[0].name);
      }
    }
  };

  const handleDistrictChange = (newDistName: string) => {
    setDistrict(newDistName);
    const newDist = availableDistricts.find((d) => d.name === newDistName);
    if (newDist && newDist.thanas.length > 0) {
      setThana(newDist.thanas[0].name);
    }
  };

  if (!isOpen) return null;

  // Submit Order Logic
  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phoneNumber.trim() || !fullAddress.trim()) {
      alert('Please fill in recipient name, phone number, and street address');
      return;
    }

    // If online payment (bKash/Nagad/SSLCommerz), open wallet dialog
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'sslcommerz') {
      setWalletNumber(phoneNumber);
      setGatewayStep('number');
      setShowGatewayModal(true);
      return;
    }

    // Cash on Delivery flow
    await submitOrderToBackend({
      method: 'cod',
      status: payAdvanceDeliveryFee ? 'paid' : 'pending',
      advanceFeePaid: payAdvanceDeliveryFee ? shippingFee : 0,
      transactionId: payAdvanceDeliveryFee ? `ADV-${Math.random().toString(36).substring(2, 9).toUpperCase()}` : undefined
    });
  };

  const handleSimulateGatewaySubmit = async () => {
    if (gatewayStep === 'number') {
      if (!walletNumber.trim()) return;
      setGatewayStep('otp');
      setWalletOtp('892341'); // auto fill for smooth demo
    } else if (gatewayStep === 'otp') {
      setGatewayStep('pin');
    } else if (gatewayStep === 'pin') {
      setIsProcessing(true);
      setTimeout(async () => {
        const generatedTxn = `${paymentMethod.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
        setTransactionId(generatedTxn);
        setIsProcessing(false);
        setShowGatewayModal(false);

        await submitOrderToBackend({
          method: paymentMethod,
          status: 'paid',
          transactionId: generatedTxn
        });
      }, 1200);
    }
  };

  const submitOrderToBackend = async (payDetails: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName,
          customerPhone: phoneNumber,
          buyerType,
          shippingAddress: {
            fullName,
            phoneNumber,
            division,
            district,
            thana,
            fullAddress,
            zipCode
          },
          deliveryZone: deliveryCalc.zone,
          shippingFee,
          items: cartItems,
          subtotal,
          discountAmount,
          promoCode,
          totalAmount: grandTotal,
          paymentDetails: payDetails
        })
      });

      if (response.ok) {
        const createdOrder: Order = await response.json();

        // Send Automated Admin Email Notification
        sendAdminEmailNotification('new_order', {
          orderNumber: createdOrder.orderNumber,
          customerName: createdOrder.customerName,
          customerPhone: createdOrder.customerPhone,
          customerEmail: createdOrder.customerEmail,
          totalAmount: createdOrder.totalAmount,
          paymentMethod: createdOrder.paymentDetails.method,
          deliveryZone: createdOrder.deliveryZone,
          itemsCount: createdOrder.items.length,
        });

        setIsProcessing(false);
        onOrderSuccess(createdOrder);
      } else {
        alert('Order processing failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error placing order');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Checkout</h3>
              <p className="text-[10px] text-slate-400">Bangladesh Delivery & Payment Selection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Content */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Location & Address Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Shipping Address (Bangladesh)</span>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Recipient Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    placeholder="01712345678"
                  />
                </div>
              </div>
            </div>

            {/* Division Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Division</label>
              <select
                value={division}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
              >
                {BANGLADESH_LOCATIONS.map((div) => (
                  <option key={div.id} value={div.name}>
                    {div.name} Division
                  </option>
                ))}
              </select>
            </div>

            {/* District & Thana Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">District</label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist.id} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Thana / Upazila</label>
                <select
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
                >
                  {availableThanas.map((th) => (
                    <option key={th.id} value={th.name}>
                      {th.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detailed Street Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Street Address / House / Road</label>
              <div className="relative">
                <Home className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  placeholder="e.g. House 14, Road 5, Block B"
                />
              </div>
            </div>

            {/* Delivery Charge Auto-Calculated Banner */}
            <div className="bg-orange-50/80 border border-orange-200/80 rounded-2xl p-3 flex items-center space-x-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                ৳{shippingFee}
              </div>
              <div>
                <p className="font-extrabold text-orange-950">
                  Zone: {deliveryCalc.zone}
                </p>
                <p className="text-[10px] text-orange-800 font-medium">
                  {deliveryCalc.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Gateways & Order Summary */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span>Payment Method</span>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* bKash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-50/70 ring-2 ring-pink-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center">
                  bK
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">bKash</p>
                  <p className="text-[9px] text-slate-400 font-medium">Direct Wallet API</p>
                </div>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                  NG
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Nagad</p>
                  <p className="text-[9px] text-slate-400 font-medium">Direct Wallet API</p>
                </div>
              </button>

              {/* SSLCommerz */}
              <button
                type="button"
                onClick={() => setPaymentMethod('sslcommerz')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                  paymentMethod === 'sslcommerz'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-black text-xs flex items-center justify-center">
                  SSL
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Cards / Bank</p>
                  <p className="text-[9px] text-slate-400 font-medium">SSLCommerz Gateway</p>
                </div>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  COD
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Cash on Delivery</p>
                  <p className="text-[9px] text-slate-400 font-medium">Pay on Hand</p>
                </div>
              </button>
            </div>

            {/* Advance Delivery Charge toggle for COD */}
            {paymentMethod === 'cod' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1.5">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payAdvanceDeliveryFee}
                    onChange={(e) => setPayAdvanceDeliveryFee(e.target.checked)}
                    className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900">
                      Pay Delivery Charge (৳{shippingFee}) Advance via bKash/Nagad
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      Ensures instant order confirmation and priority dispatch from seller stock.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Order Cost Breakdown Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Promo Discount ({promoCode})</span>
                  <span className="font-bold">-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee ({deliveryCalc.zone})</span>
                <span className="font-bold text-orange-600">+৳{shippingFee}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-orange-600 text-base">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Processing Order...'
                  : paymentMethod === 'cod'
                  ? 'Confirm COD Order'
                  : `Pay ৳${grandTotal.toLocaleString()} with ${paymentMethod.toUpperCase()}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Gateway Simulation Popup Modal (bKash / Nagad / SSLCommerz) */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg ${
                paymentMethod === 'bkash'
                  ? 'bg-pink-600 shadow-pink-500/30'
                  : paymentMethod === 'nagad'
                  ? 'bg-orange-600 shadow-orange-500/30'
                  : 'bg-blue-700 shadow-blue-500/30'
              }`}
            >
              {paymentMethod === 'bkash' ? 'bKash' : paymentMethod === 'nagad' ? 'Nagad' : 'SSL'}
            </div>

            <div>
              <h4 className="text-base font-extrabold text-slate-900 font-display">
                {paymentMethod.toUpperCase()} Online Payment Gateway
              </h4>
              <p className="text-xs font-bold text-orange-600 mt-0.5">
                Amount: ৳{grandTotal.toLocaleString()}
              </p>
            </div>

            {gatewayStep === 'number' && (
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Your {paymentMethod.toUpperCase()} Wallet Number
                </label>
                <input
                  type="text"
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:border-orange-500"
                  placeholder="017XXXXXXXX"
                />
              </div>
            )}

            {gatewayStep === 'otp' && (
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  value={walletOtp}
                  onChange={(e) => setWalletOtp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-center tracking-widest focus:outline-none focus:border-orange-500"
                  placeholder="892341"
                />
                <p className="text-[10px] text-slate-400 text-center">
                  Demo Code auto-filled: 892341
                </p>
              </div>
            )}

            {gatewayStep === 'pin' && (
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  5-Digit Wallet PIN
                </label>
                <input
                  type="password"
                  maxLength={5}
                  value={walletPin}
                  onChange={(e) => setWalletPin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-center tracking-widest focus:outline-none focus:border-orange-500"
                  placeholder="•••••"
                />
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGatewayModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulateGatewaySubmit}
                disabled={isProcessing}
                className="flex-1 bg-slate-900 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {isProcessing ? 'Verifying PIN...' : gatewayStep === 'pin' ? 'Confirm Pay' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

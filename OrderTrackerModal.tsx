import React from 'react';
import { X, CheckCircle2, Clock, Truck, MapPin, Phone, ShieldCheck, FileText } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  onOpenInvoice: (order: Order) => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onOpenInvoice
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="text-sm font-bold font-display">Live Order Tracking</h3>
              <p className="text-[10px] text-slate-300">Order #{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenInvoice(order)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-2.5 py-1 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Status Badge */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Current Status
              </span>
              <p className="text-base font-black text-slate-900 font-display">
                {order.orderStatus}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase shadow-xs ${
                order.orderStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>

          {/* Stepper Timeline (Matching Image 1 top right) */}
          <div className="space-y-4 px-2">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Orders Lifecycle
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {order.trackingSteps.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs transition-all ${
                      step.completed
                        ? 'bg-orange-600 ring-4 ring-orange-100'
                        : step.active
                        ? 'bg-amber-500 animate-pulse ring-4 ring-amber-100'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span className="text-[10px]">{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div>
                    <div className="flex justify-between items-baseline">
                      <h5 className="text-xs font-extrabold text-slate-900">{step.title}</h5>
                      <span className="text-[10px] text-slate-400 font-medium">{step.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Rider Card */}
          {order.courierDetails && (
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold">{order.courierDetails.riderName}</p>
                  <p className="text-[10px] text-slate-300">
                    {order.courierDetails.courierName} • Tracking: {order.courierDetails.trackingId}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${order.courierDetails.riderPhone}`}
                className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-colors flex items-center space-x-1 text-xs font-bold"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Call Rider</span>
              </a>
            </div>
          )}

          {/* Status Simulator Controls (For testing/demo) */}
          {onUpdateStatus && (
            <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-3 text-xs space-y-2">
              <span className="font-bold text-orange-900 text-[10px] uppercase block">
                Simulate Status Update (Demo Feature):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['Confirmed', 'Dispatched', 'In Delivery', 'Delivered'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(order.id, st)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      order.orderStatus === st
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-orange-100 border border-orange-200'
                    }`}
                  >
                    Set {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

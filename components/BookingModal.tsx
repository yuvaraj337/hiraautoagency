'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, ArrowRight, Loader2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Bike, Variant } from './BikeConfiguratorModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bikes: Bike[];
  preselectedBikeId?: string;
  preselectedVariantId?: string;
  onBookingComplete?: (booking: any) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  bikes,
  preselectedBikeId,
  preselectedVariantId,
  onBookingComplete
}: BookingModalProps) {
  const [selectedBikeId, setSelectedBikeId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [paymentOption, setPaymentOption] = useState<'ADVANCE' | 'FULL'>('ADVANCE');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  // Initialize selected bike and variant
  useEffect(() => {
    if (preselectedBikeId) {
      setSelectedBikeId(preselectedBikeId);
    } else if (bikes.length > 0 && !selectedBikeId) {
      setSelectedBikeId(bikes[0].id);
    }
  }, [preselectedBikeId, bikes]);

  useEffect(() => {
    const currentBike = bikes.find((b) => b.id === selectedBikeId);
    if (currentBike && currentBike.variants && currentBike.variants.length > 0) {
      if (preselectedVariantId && currentBike.variants.some((v) => v.id === preselectedVariantId)) {
        setSelectedVariantId(preselectedVariantId);
      } else {
        setSelectedVariantId(currentBike.variants[0].id);
      }
    }
  }, [selectedBikeId, preselectedVariantId, bikes]);

  if (!isOpen) return null;

  const currentBike = bikes.find((b) => b.id === selectedBikeId);
  const currentVariant = currentBike?.variants?.find((v) => v.id === selectedVariantId) || currentBike?.variants?.[0];
  const totalPrice = currentVariant?.ex_showroom_price || 0;
  // Configured advance fee defaults to ₹5,000
  const advanceAmount = 5000;
  const payAmount = paymentOption === 'FULL' ? totalPrice : advanceAmount;
  const balanceRemaining = totalPrice - payAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          bikeId: selectedBikeId,
          variantId: selectedVariantId,
          paymentType: paymentOption,
          preferredDate,
          preferredTime,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      // Automatically verify payment order server-side for sandbox test simulation
      if (data.paymentOrder) {
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: data.paymentOrder.paymentId,
            orderId: data.paymentOrder.orderId,
            gatewayTransactionId: `TXN_${Date.now()}`
          })
        });
      }

      setSuccessBooking(data.booking);
      if (onBookingComplete) onBookingComplete(data.booking);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessBooking(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/15 p-6 sm:p-8 shadow-2xl my-auto text-left">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successBooking ? (
          /* SUCCESS CONFIRMATION VIEW */
          <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full bg-yamaha-racing/30 text-yamaha-cyan text-xs font-bold uppercase tracking-wider">
              Booking Confirmed
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display mt-2">
              CONGRATULATIONS!
            </h3>
            <p className="text-sm text-gray-300 max-w-md mx-auto mt-1">
              Your official Yamaha booking has been registered with Hira Auto Agency.
            </p>

            {/* Receipt Summary Card */}
            <div className="mt-6 p-5 rounded-2xl bg-black/40 border border-white/10 text-left space-y-2.5 max-w-md mx-auto text-xs">
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-gray-400">Booking ID:</span>
                <span className="font-bold text-yamaha-cyan font-mono text-sm">{successBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Motorcycle:</span>
                <span className="font-bold text-white">{successBooking.bikeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Variant:</span>
                <span className="font-bold text-white">{successBooking.variantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Type:</span>
                <span className="font-bold text-emerald-400">{successBooking.paymentType} PAYMENT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="font-bold text-white font-display text-sm">₹{successBooking.amountToPay.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-gray-400">Remaining Balance:</span>
                <span className="font-bold text-amber-400 font-display text-sm">₹{successBooking.balanceAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200 max-w-md mx-auto flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>A confirmation WhatsApp has been dispatched to your mobile number.</span>
            </div>

            <button
              onClick={handleReset}
              className="mt-6 px-8 py-3 rounded-xl bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        ) : (
          /* BOOKING FORM */
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-yamaha-cyan text-xs font-bold uppercase tracking-widest mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Authorized Yamaha Booking</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                BOOK YOUR MOTORCYCLE
              </h2>
              <p className="text-xs text-gray-400">
                Reserve your ride online at Hira Auto Agency, Mohanpur.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Bike Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Select Model</label>
                <select
                  value={selectedBikeId}
                  onChange={(e) => setSelectedBikeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none bg-yamaha-card"
                  required
                >
                  {bikes.map((b) => (
                    <option key={b.id} value={b.id} className="bg-yamaha-card">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Variant Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Select Variant</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none bg-yamaha-card"
                  required
                >
                  {currentBike?.variants?.map((v) => (
                    <option key={v.id} value={v.id} className="bg-yamaha-card">
                      {v.name} (₹{v.ex_showroom_price.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit phone number"
                    className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Preferred Delivery / Visit Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Preferred Time</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none bg-yamaha-card"
                  >
                    <option value="10:00 AM">10:00 AM - Morning</option>
                    <option value="11:30 AM">11:30 AM - Morning</option>
                    <option value="02:30 PM">02:30 PM - Afternoon</option>
                    <option value="04:30 PM">04:30 PM - Evening</option>
                    <option value="06:00 PM">06:00 PM - Evening</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Special Notes / Exchange Query</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Looking for zero down payment finance or exchange bonus"
                  className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Payment Options Selection */}
            <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-2">
                Select Booking Payment Option
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('ADVANCE')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentOption === 'ADVANCE'
                      ? 'bg-yamaha-racing/20 border-yamaha-cyan shadow-md shadow-yamaha-blue/30'
                      : 'glass-card border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white uppercase">Advance Token</span>
                    <span className="text-xs font-black text-yamaha-cyan font-display">₹{advanceAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Configured booking deposit to lock priority allocation.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('FULL')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentOption === 'FULL'
                      ? 'bg-yamaha-racing/20 border-yamaha-cyan shadow-md shadow-yamaha-blue/30'
                      : 'glass-card border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white uppercase">Full Payment</span>
                    <span className="text-xs font-black text-white font-display">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Complete ex-showroom payment with instant vehicle reserve.</p>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-white/10">
                <span className="text-gray-400">Amount to Pay Now:</span>
                <span className="text-base font-black text-white font-display">
                  ₹{payAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yamaha-blue/40 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Secure Booking...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Confirm & Pay ₹{payAmount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

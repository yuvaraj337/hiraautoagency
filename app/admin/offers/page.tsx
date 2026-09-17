'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  CheckCircle,
  XCircle,
  Calendar,
  Sparkles,
  Percent,
  RefreshCw,
  Gift,
  ArrowRight
} from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  bike_id?: string;
  bike_name?: string;
  discount_text: string;
  start_date?: string;
  end_date?: string;
  cta_text: string;
  is_active: number;
  created_at: string;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ctaText, setCtaText] = useState('Claim Offer Now');
  const [creating, setCreating] = useState(false);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/offers');
      const data = await res.json();
      if (data.success) {
        setOffers(data.offers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleToggleOffer = async (id: string, currentStatus: number) => {
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_active: currentStatus === 1 ? 0 : 1
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOffers();
      } else {
        alert(data.error || 'Failed to update offer');
      }
    } catch (e) {
      alert('Error updating offer');
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          discount_text: discountText,
          start_date: startDate || null,
          end_date: endDate || null,
          cta_text: ctaText,
          is_active: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        setDiscountText('');
        await fetchOffers();
      } else {
        alert(data.error || 'Failed to create offer');
      }
    } catch (e) {
      alert('Error creating offer');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Tag className="w-6 h-6 text-yamaha-cyan" />
            Dealership Promotional Offers & Schemes
          </h1>
          <p className="text-sm text-white/50">
            Publish seasonal discounts, finance schemes, exchange bonuses, and festive benefits for Hira Auto Agency customers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-yamaha-racing hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-yamaha-blue/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Scheme
          </button>
          <button
            onClick={fetchOffers}
            title="Refresh"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full bg-[#0D111A] border border-white/10 rounded-2xl p-12 text-center text-white/40">
            <div className="w-8 h-8 rounded-full border-2 border-yamaha-cyan border-t-transparent animate-spin mx-auto mb-3" />
            Loading promotional schemes...
          </div>
        ) : offers.length === 0 ? (
          <div className="col-span-full bg-[#0D111A] border border-white/10 rounded-2xl p-12 text-center text-white/40">
            No active promotional schemes currently configured.
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-[#0D111A] border rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                offer.is_active === 1
                  ? 'border-white/10 hover:border-yamaha-cyan/40 shadow-xl'
                  : 'border-white/5 opacity-60'
              }`}
            >
              {/* Accent Banner */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yamaha-racing via-yamaha-cyan to-blue-600" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-yamaha-racing/20 text-yamaha-cyan border border-yamaha-cyan/30 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    {offer.discount_text || 'Special Scheme'}
                  </span>

                  <button
                    onClick={() => handleToggleOffer(offer.id, offer.is_active)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      offer.is_active === 1
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {offer.is_active === 1 ? 'Live on Site' : 'Paused / Inactive'}
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">
                    {offer.description}
                  </p>
                </div>
              </div>

              {/* Dates & Footer */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {offer.end_date ? `Valid till ${offer.end_date}` : 'Limited period scheme'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-yamaha-cyan">
                  {offer.cta_text} →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE OFFER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateOffer} className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Gift className="w-5 h-5 text-yamaha-cyan" />
              Create Promotional Campaign
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                Scheme Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mahagama Festive Dhamaka: ₹5,000 Exchange Bonus"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#141A29] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                Highlight Badge (Discount / Benefit)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SAVE ₹5,000 or LOW EMI ₹2,999/MO"
                value={discountText}
                onChange={(e) => setDiscountText(e.target.value)}
                className="w-full bg-[#141A29] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                Scheme Details & Description
              </label>
              <textarea
                rows={3}
                placeholder="Get flat exchange bonus on trading any old bike for new Yamaha MT-15 or FZ-S V4. Complimentary Yamaha helmet included."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#141A29] border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-yamaha-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Valid From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yamaha-cyan text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Valid Till
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yamaha-cyan text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                CTA Button Text
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full bg-[#141A29] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-yamaha-cyan text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-yamaha-racing hover:bg-blue-600 text-white shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? 'Publishing...' : 'Publish Offer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

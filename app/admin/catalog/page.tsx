'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Edit,
  Save,
  Plus,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Tag,
  Sliders,
  DollarSign,
  ChevronDown,
  ChevronUp,
  XCircle,
  Sparkles
} from 'lucide-react';

interface Variant {
  id: string;
  bike_id: string;
  name: string;
  ex_showroom_price: number;
  color_name: string;
  color_hex: string;
  image_url?: string;
  in_stock: number;
}

interface Bike {
  id: string;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  engine_cc: number;
  max_power: string;
  max_torque: string;
  is_featured: number;
  variants: Variant[];
}

export default function AdminCatalogPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [expandedBikeId, setExpandedBikeId] = useState<string | null>(null);

  // Edit Variant Price Modal
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editInStock, setEditInStock] = useState<boolean>(true);
  const [savingVariant, setSavingVariant] = useState(false);

  // Add Variant Modal
  const [addingForBike, setAddingForBike] = useState<Bike | null>(null);
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState<number>(0);
  const [newVarColor, setNewVarColor] = useState('Racing Blue');
  const [newVarHex, setNewVarHex] = useState('#0020B2');
  const [addingVariant, setAddingVariant] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/catalog');
      const data = await res.json();
      if (data.success) {
        setBikes(data.bikes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleUpdateVariant = async () => {
    if (!editingVariant) return;
    setSavingVariant(true);
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_VARIANT_PRICE',
          variantId: editingVariant.id,
          price: editPrice,
          inStock: editInStock
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Price updated successfully. Public website reflects change immediately.');
        setEditingVariant(null);
        await fetchCatalog();
      } else {
        alert(data.error || 'Failed to update variant price');
      }
    } catch (e) {
      alert('Error updating price');
    } finally {
      setSavingVariant(false);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingForBike || !newVarName || newVarPrice <= 0) return;
    setAddingVariant(true);
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_VARIANT',
          bikeId: addingForBike.id,
          name: newVarName,
          ex_showroom_price: newVarPrice,
          color_name: newVarColor,
          color_hex: newVarHex
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('New variant added to catalog successfully!');
        setAddingForBike(null);
        setNewVarName('');
        setNewVarPrice(0);
        await fetchCatalog();
      } else {
        alert(data.error || 'Failed to add variant');
      }
    } catch (e) {
      alert('Error adding variant');
    } finally {
      setAddingVariant(false);
    }
  };

  const filteredBikes = bikes.filter((b) => {
    const matchesCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
    if (!searchQuery) return matchesCategory;
    const q = searchQuery.toLowerCase();
    const matchesName = b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q);
    const matchesVariant = b.variants.some(v => v.name.toLowerCase().includes(q));
    return matchesCategory && (matchesName || matchesVariant);
  });

  const totalVariants = bikes.reduce((acc, b) => acc + (b.variants?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Package className="w-6 h-6 text-yamaha-cyan" />
            Live Catalog & Price Management
          </h1>
          <p className="text-sm text-white/50">
            Official showroom price list for Hira Auto Agency. Price changes edited here directly sync with the live customer-facing catalog in real-time.
          </p>
        </div>

        <button
          onClick={fetchCatalog}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Ribbon */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs uppercase font-bold text-white/40 block">Models Cataloged</span>
            <span className="text-xl font-black text-white">{bikes.length} Motorcycle Lines</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <span className="text-xs uppercase font-bold text-white/40 block">Total Active Variants</span>
            <span className="text-xl font-black text-yamaha-cyan">{totalVariants} Verified Variants</span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <div className="hidden sm:block">
            <span className="text-xs uppercase font-bold text-white/40 block">Price Base</span>
            <span className="text-xs font-semibold text-emerald-400">Ex-Showroom Mahagama, Godda</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'R15', 'MT', 'FZ', 'XSR', 'SCOOTERS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                categoryFilter === cat
                  ? 'bg-yamaha-cyan text-black font-extrabold shadow-sm'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Model Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-12 text-center text-white/40">
            <div className="w-8 h-8 rounded-full border-2 border-yamaha-cyan border-t-transparent animate-spin mx-auto mb-3" />
            Loading live catalog...
          </div>
        ) : filteredBikes.length === 0 ? (
          <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-12 text-center text-white/40">
            No bikes found matching your criteria.
          </div>
        ) : (
          filteredBikes.map((bike) => {
            const isExpanded = expandedBikeId === bike.id || expandedBikeId === null; // default expanded
            return (
              <div
                key={bike.id}
                className="bg-[#0D111A] border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                {/* Bike Header Banner */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-yamaha-cyan font-black text-sm">
                      {bike.category.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black uppercase text-white tracking-wide">
                          {bike.name}
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-white/60 uppercase">
                          {bike.category}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">{bike.tagline}</p>
                    </div>
                  </div>

                  {/* Engine Specs & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-xs text-white/70 font-mono">
                      <span>{bike.engine_cc} CC</span>
                      <span>•</span>
                      <span>{bike.max_power}</span>
                      <span>•</span>
                      <span>{bike.max_torque}</span>
                    </div>

                    <button
                      onClick={() => setAddingForBike(bike)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-yamaha-cyan" />
                      Add Variant
                    </button>

                    <button
                      onClick={() => setExpandedBikeId(expandedBikeId === bike.id ? 'NONE' : bike.id)}
                      className="p-1.5 text-white/40 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Variants Table for this Bike */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70">
                      <thead className="bg-[#121722] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10 font-bold">
                        <tr>
                          <th className="py-3 px-5">Variant Edition</th>
                          <th className="py-3 px-5">Color Scheme</th>
                          <th className="py-3 px-5">Ex-Showroom Price</th>
                          <th className="py-3 px-5">Inventory Status</th>
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {bike.variants.map((v) => (
                          <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-5 font-bold text-white text-xs">
                              {v.name}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                                  style={{ backgroundColor: v.color_hex || '#0020B2' }}
                                />
                                <span className="text-xs text-white/80">{v.color_name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 font-mono font-bold text-yamaha-cyan text-sm">
                              ₹{v.ex_showroom_price.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-5">
                              {v.in_stock === 1 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  In Showroom Stock
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Book on Order (3-7 Days)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                onClick={() => {
                                  setEditingVariant(v);
                                  setEditPrice(v.ex_showroom_price);
                                  setEditInStock(v.in_stock === 1);
                                }}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-lg border border-white/10 transition-colors inline-flex items-center gap-1.5"
                              >
                                <Edit className="w-3 h-3 text-yamaha-cyan" />
                                Edit Price
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* EDIT PRICE MODAL */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yamaha-cyan" />
                Edit Ex-Showroom Price
              </h3>
              <button
                onClick={() => setEditingVariant(null)}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-[#141A29] p-4 rounded-xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Variant:</span>
                <span className="font-bold text-white">{editingVariant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Color Scheme:</span>
                <span className="text-white/80">{editingVariant.color_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Current Price:</span>
                <span className="font-mono text-white/70">₹{editingVariant.ex_showroom_price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  New Ex-Showroom Price (₹)
                </label>
                <input
                  type="number"
                  step="10"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseInt(e.target.value || '0', 10))}
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-lg focus:outline-none focus:border-yamaha-cyan"
                />
                <span className="text-[11px] text-white/40 block mt-1">
                  Updates instantly across public homepage, catalog cards, and configurator modals.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={editInStock}
                  onChange={(e) => setEditInStock(e.target.checked)}
                  className="rounded border-white/20 bg-[#141A29] text-yamaha-cyan focus:ring-yamaha-cyan"
                />
                <label htmlFor="inStockCheck" className="text-xs text-white/80 select-none cursor-pointer">
                  Variant currently physically available in Mahagama showroom stock
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingVariant(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateVariant}
                disabled={savingVariant || editPrice <= 0}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-yamaha-racing hover:bg-blue-600 text-white shadow-lg shadow-yamaha-blue/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {savingVariant ? 'Saving...' : 'Publish Price Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VARIANT MODAL */}
      {addingForBike && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddVariant} className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Plus className="w-5 h-5 text-yamaha-cyan" />
              Add Variant to {addingForBike.name}
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                Variant Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Monster Energy MotoGP Edition"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                className="w-full bg-[#141A29] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                Ex-Showroom Price (₹)
              </label>
              <input
                type="number"
                required
                placeholder="175000"
                value={newVarPrice || ''}
                onChange={(e) => setNewVarPrice(parseInt(e.target.value || '0', 10))}
                className="w-full bg-[#141A29] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-yamaha-cyan text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Color Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metallic Black"
                  value={newVarColor}
                  onChange={(e) => setNewVarColor(e.target.value)}
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yamaha-cyan text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Color Swatch
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newVarHex}
                    onChange={(e) => setNewVarHex(e.target.value)}
                    className="w-10 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newVarHex}
                    onChange={(e) => setNewVarHex(e.target.value)}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-2 py-2 text-white font-mono focus:outline-none text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAddingForBike(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingVariant}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-yamaha-racing hover:bg-blue-600 text-white shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {addingVariant ? 'Adding...' : 'Add Variant'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

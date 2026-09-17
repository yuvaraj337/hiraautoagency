'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowRight, Eye, Calendar, Sparkles, Check } from 'lucide-react';
import { Bike } from './BikeConfiguratorModal';

interface CatalogSectionProps {
  bikes: Bike[];
  onSelectBike: (bike: Bike) => void;
  onBookBike: (bikeId: string, variantId: string) => void;
  onBookVisit: (bikeId: string) => void;
}

const CATEGORIES = [
  { label: 'ALL MODELS', value: 'ALL' },
  { label: 'R15 SERIES', value: 'R15' },
  { label: 'MT HYPER NAKED', value: 'MT' },
  { label: 'FZ STREET', value: 'FZ' },
  { label: 'XSR HERITAGE', value: 'XSR' },
  { label: 'SCOOTERS & AEROX', value: 'SCOOTERS' },
];

export default function CatalogSection({
  bikes,
  onSelectBike,
  onBookBike,
  onBookVisit,
}: CatalogSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high'>('featured');

  // Filter & Sort Logic
  const filteredBikes = useMemo(() => {
    let list = [...bikes];

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((b) => b.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.variants?.some((v) => v.name.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price_low') {
      list.sort((a, b) => {
        const pA = a.variants?.[0]?.ex_showroom_price || 0;
        const pB = b.variants?.[0]?.ex_showroom_price || 0;
        return pA - pB;
      });
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => {
        const pA = a.variants?.[0]?.ex_showroom_price || 0;
        const pB = b.variants?.[0]?.ex_showroom_price || 0;
        return pB - pA;
      });
    }

    return list;
  }, [bikes, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="catalog" className="relative py-24 bg-[#080B10] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yamaha-cyan" />
              <p className="text-xs uppercase font-bold tracking-widest text-yamaha-cyan">
                Official 2026 Price List • Mahagama Showroom
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight leading-tight">
              YAMAHA MOTORCYCLE <br />
              <span className="text-gradient-yamaha">& SCOOTER CATALOG</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-xl">
              Verified client catalog featuring all 23 factory variants with authentic ex-showroom pricing.
            </p>
          </div>

          {/* Quick Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search model or variant..."
                className="pl-9 pr-4 py-2.5 rounded-xl glass-card text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yamaha-cyan w-full sm:w-56"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl glass-card text-xs text-white focus:outline-none focus:border-yamaha-cyan appearance-none pr-8 cursor-pointer font-medium"
              >
                <option value="featured" className="bg-yamaha-card text-white">Sort: Featured Lineup</option>
                <option value="price_low" className="bg-yamaha-card text-white">Price: Low to High</option>
                <option value="price_high" className="bg-yamaha-card text-white">Price: High to Low</option>
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-yamaha-racing text-white shadow-lg shadow-yamaha-blue/40 scale-105'
                  : 'glass-card text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBikes.map((bike) => {
            const minPrice = Math.min(...(bike.variants?.map((v) => v.ex_showroom_price) || [0]));
            const maxPrice = Math.max(...(bike.variants?.map((v) => v.ex_showroom_price) || [0]));
            const defaultVariant = bike.variants?.[0];

            return (
              <div
                key={bike.id}
                className="group rounded-2xl glass-card border border-white/10 overflow-hidden flex flex-col justify-between hover:border-yamaha-cyan/40 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-yamaha-blue/20"
              >
                {/* Bike Card Header */}
                <div className="p-5 pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-yamaha-cyan text-[10px] font-bold uppercase tracking-wider">
                      {bike.category}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">
                      {bike.variants?.length} Variants
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white uppercase font-display leading-tight">
                    {bike.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{bike.tagline}</p>
                </div>

                {/* Bike Image Stage */}
                <div
                  onClick={() => onSelectBike(bike)}
                  className="relative h-56 w-full p-4 flex items-center justify-center cursor-pointer overflow-hidden group-hover:scale-105 transition-transform duration-500"
                >
                  {/* Subtle radial floor spotlight */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-10 bg-yamaha-blue/20 rounded-full blur-xl pointer-events-none" />
                  <img
                    src={bike.image_url}
                    alt={bike.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                  />
                </div>

                {/* Card Bottom: Variants preview, Price and CTAs */}
                <div className="p-5 pt-3 bg-black/30 border-t border-white/5">
                  {/* Variants preview list */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-medium">
                      <span>Available Variants:</span>
                      <span className="text-yamaha-cyan font-bold text-[10px]">Ex-Showroom</span>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1 text-xs">
                      {bike.variants?.slice(0, 3).map((v) => (
                        <div key={v.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-300 truncate max-w-[180px]">• {v.name}</span>
                          <span className="font-bold text-white font-display">
                            ₹{v.ex_showroom_price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                      {(bike.variants?.length || 0) > 3 && (
                        <p className="text-[10px] text-gray-500 italic">
                          + {(bike.variants?.length || 0) - 3} more variant options
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Starting Price */}
                  <div className="flex items-baseline justify-between pt-3 border-t border-white/10 mb-4">
                    <span className="text-[11px] uppercase font-bold text-gray-400">Starting At</span>
                    <span className="text-xl font-black text-white font-display">
                      ₹{minPrice.toLocaleString('en-IN')}*
                    </span>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectBike(bike)}
                      className="py-2.5 px-3 rounded-xl glass-panel hover:bg-white/10 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-yamaha-cyan" />
                      <span>Configure</span>
                    </button>

                    <button
                      onClick={() => defaultVariant && onBookBike(bike.id, defaultVariant.id)}
                      className="py-2.5 px-3 rounded-xl bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-yamaha-blue/30 transition-transform active:scale-95"
                    >
                      <span>Book Bike</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredBikes.length === 0 && (
          <div className="text-center py-16 glass-card rounded-2xl p-8">
            <p className="text-base text-gray-400 font-medium">
              No motorcycles found matching &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-yamaha-racing text-white text-xs font-bold uppercase"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Mandatory Ex-Showroom Disclaimer Notice */}
        <div className="mt-12 p-4 rounded-xl glass-panel border border-white/10 text-center">
          <p className="text-xs text-gray-400">
            <strong className="text-white">Price Policy:</strong> All listed prices are official Ex-Showroom Mahagama. On-road price will vary based on location, statutory registration, compulsory third-party insurance, road taxes, and applicable local charges. Zero hidden fees at Hira Auto Agency.
          </p>
        </div>
      </div>
    </section>
  );
}

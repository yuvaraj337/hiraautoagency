'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, ArrowRight, ShieldCheck, Gauge, Zap, Fuel, Scale, Flame } from 'lucide-react';

export interface Variant {
  id: string;
  bike_id: string;
  name: string;
  ex_showroom_price: number;
  color_name: string;
  color_hex: string;
  image_url: string;
  in_stock: number;
}

export interface Bike {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  engine_cc: string;
  max_power: string;
  max_torque: string;
  fuel_capacity: string;
  mileage: string;
  curb_weight: string;
  image_url: string;
  variants: Variant[];
}

interface BikeConfiguratorModalProps {
  bike: Bike | null;
  isOpen: boolean;
  onClose: () => void;
  onBookBike: (bikeId: string, variantId: string) => void;
  onBookVisit: (bikeId: string, variantId: string) => void;
}

export default function BikeConfiguratorModal({
  bike,
  isOpen,
  onClose,
  onBookBike,
  onBookVisit
}: BikeConfiguratorModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'specs'>('overview');

  useEffect(() => {
    if (bike && bike.variants && bike.variants.length > 0) {
      setSelectedVariantId(bike.variants[0].id);
    }
  }, [bike]);

  if (!isOpen || !bike) return null;

  const currentVariant = bike.variants?.find((v) => v.id === selectedVariantId) || bike.variants?.[0];
  const displayImage = currentVariant?.image_url || bike.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      {/* Modal Container: Split View Matching Reference Frame 20 */}
      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl my-auto animate-scaleUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* LEFT PANEL: Deep Yamaha Blue / Dark Cinematic Studio */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#001678] via-[#0020B2] to-[#040A1E] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-left">
            {/* Subtle background glow */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-yamaha-cyan/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Category & Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-black/30 text-yamaha-cyan text-[10px] font-bold uppercase tracking-wider border border-white/10">
                  {bike.category}
                </span>
                <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider">
                  Official Yamaha India
                </span>
              </div>

              {/* Bike Title */}
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
                {bike.name}
              </h2>
              <p className="text-xs text-blue-200 font-medium">{bike.tagline}</p>

              {/* Sub-tabs: Overview vs Specs */}
              <div className="flex items-center gap-4 mt-4 border-b border-white/15 pb-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors relative py-1 ${
                    activeTab === 'overview'
                      ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-yamaha-cyan'
                      : 'text-blue-300 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors relative py-1 ${
                    activeTab === 'specs'
                      ? 'text-white after:content-[""] after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-[2px] after:bg-yamaha-cyan'
                      : 'text-blue-300 hover:text-white'
                  }`}
                >
                  Technical Specs
                </button>
              </div>
            </div>

            {/* Center: Large Motorcycle Image */}
            <div className="relative my-6 flex items-center justify-center min-h-[220px]">
              <img
                src={displayImage}
                alt={currentVariant?.name || bike.name}
                className="max-h-[240px] max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)] transform hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Bottom: Price & Quick Action */}
            <div className="pt-4 border-t border-white/15">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                    Ex-Showroom Mahagama
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-white font-display">
                    ₹{currentVariant?.ex_showroom_price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    In Stock at Dealership
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onBookBike(bike.id, currentVariant.id)}
                  className="flex-1 py-3 rounded-xl bg-white text-yamaha-blue hover:bg-gray-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95"
                >
                  <span>Book This Bike</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onBookVisit(bike.id, currentVariant.id)}
                  className="py-3 px-4 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/20 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Visit Showroom</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Configuration & Detailed Specs */}
          <div className="lg:col-span-6 bg-[#0B0E14] p-6 sm:p-8 flex flex-col justify-between text-left">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">
                Configure the Bike
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                Select your preferred variant, color, and inspect factory specifications.
              </p>

              {/* 1. Variant Selector */}
              <div className="mb-6">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-2">
                  Select Variant ({bike.variants?.length} Options)
                </label>
                <div className="space-y-2">
                  {bike.variants?.map((variant) => {
                    const isSelected = variant.id === currentVariant?.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                          isSelected
                            ? 'bg-yamaha-card border-yamaha-cyan/60 shadow-md shadow-yamaha-blue/20'
                            : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: variant.color_hex || '#0020B2' }}
                          />
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">
                              {variant.name}
                            </p>
                            <p className="text-[10px] text-gray-400">{variant.color_name}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-white font-display">
                            ₹{variant.ex_showroom_price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Specs Grid or Overview Text */}
              {activeTab === 'overview' ? (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-2">
                    Key Highlights & Overview
                  </label>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    {bike.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="glass-card p-2.5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-1.5 text-yamaha-cyan mb-1">
                        <Gauge className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold">Max Power</span>
                      </div>
                      <p className="text-xs font-bold text-white">{bike.max_power}</p>
                    </div>

                    <div className="glass-card p-2.5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold">Max Torque</span>
                      </div>
                      <p className="text-xs font-bold text-white">{bike.max_torque}</p>
                    </div>

                    <div className="glass-card p-2.5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                        <Fuel className="w-3.5 h-3.5" />
                        <span className="text-[9px] uppercase font-bold">Fuel Efficiency</span>
                      </div>
                      <p className="text-xs font-bold text-white">{bike.mileage}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-2">
                    Factory Technical Specifications
                  </label>
                  <div className="divide-y divide-white/5 text-xs">
                    <div className="py-2 flex justify-between">
                      <span className="text-gray-400">Displacement</span>
                      <span className="font-bold text-white">{bike.engine_cc}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-gray-400">Maximum Horsepower</span>
                      <span className="font-bold text-white">{bike.max_power}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-gray-400">Maximum Torque</span>
                      <span className="font-bold text-white">{bike.max_torque}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-gray-400">Fuel Tank Capacity</span>
                      <span className="font-bold text-white">{bike.fuel_capacity}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-gray-400">Kerb Weight</span>
                      <span className="font-bold text-white">{bike.curb_weight}</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span className="text-gray-400">Claimed Mileage</span>
                      <span className="font-bold text-white">{bike.mileage}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer on price */}
            <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-gray-500 leading-relaxed">
              *Ex-showroom Mahagama price. On-road price will vary based on RTO registration, mandatory insurance, local road tax and selected genuine Yamaha accessories.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

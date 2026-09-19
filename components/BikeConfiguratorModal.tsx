'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

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

// REAL ASSET COLOR MAPPINGS FOR EACH MODEL
const MODEL_COLOR_ASSETS: Record<string, Record<string, string>> = {
  'yamaha-r15-v4': {
    'Carbon Edition': '/bikes/r15-v4-m-carbon.png',
    'Metallic Silver': '/bikes/r15-m-silver.png',
    'Racing Blue': '/bikes/r15-v4-quick-shifter.png',
    'Metallic Red': '/bikes/r15-v4.png',
    'Matte Black': '/bikes/r15-v3-s.png',
    'Monster Energy Edition': '/bikes/r15-v4-monster.png',
    'R-15 V4 (M) Carbon': '/bikes/r15-v4-m-carbon.png',
    'R-15 (M) Silver': '/bikes/r15-m-silver.png',
    'R-15 V4 (Quick Shifter)': '/bikes/r15-v4-quick-shifter.png',
    'R15 V4': '/bikes/r15-v4.png',
    'R-15 V3 (S)': '/bikes/r15-v3-s.png',
    'R-15 V4 (Monster)': '/bikes/r15-v4-monster.png',
  },
  'bike_r15': {
    'Carbon Edition': '/bikes/r15-v4-m-carbon.png',
    'Metallic Silver': '/bikes/r15-m-silver.png',
    'Racing Blue': '/bikes/r15-v4-quick-shifter.png',
    'Metallic Red': '/bikes/r15-v4.png',
    'Matte Black': '/bikes/r15-v3-s.png',
    'Monster Energy Edition': '/bikes/r15-v4-monster.png',
    'R-15 V4 (M) Carbon': '/bikes/r15-v4-m-carbon.png',
    'R-15 (M) Silver': '/bikes/r15-m-silver.png',
    'R-15 V4 (Quick Shifter)': '/bikes/r15-v4-quick-shifter.png',
    'R15 V4': '/bikes/r15-v4.png',
    'R-15 V3 (S)': '/bikes/r15-v3-s.png',
    'R-15 V4 (Monster)': '/bikes/r15-v4-monster.png',
  },
  'yamaha-mt-15-v2': {
    'Ice Fluo-Vermillion': '/bikes/mt-15-dlx-tft.png',
    'Metallic Black': '/bikes/mt-15-std-black.png',
    'Monster Energy MotoGP': '/bikes/mt-15-monster.png',
    'Cyan Storm': '/bikes/mt-15-cyan-blue.png',
    'MT-15 V2 (DLX TFT)': '/bikes/mt-15-dlx-tft.png',
    'MT-15 (STD) Black': '/bikes/mt-15-std-black.png',
    'MT-15 (Monster)': '/bikes/mt-15-monster.png',
    'MT-15 (STD) Cyan Blue': '/bikes/mt-15-cyan-blue.png',
  },
  'bike_mt15': {
    'Ice Fluo-Vermillion': '/bikes/mt-15-dlx-tft.png',
    'Metallic Black': '/bikes/mt-15-std-black.png',
    'Monster Energy MotoGP': '/bikes/mt-15-monster.png',
    'Cyan Storm': '/bikes/mt-15-cyan-blue.png',
    'MT-15 V2 (DLX TFT)': '/bikes/mt-15-dlx-tft.png',
    'MT-15 (STD) Black': '/bikes/mt-15-std-black.png',
    'MT-15 (Monster)': '/bikes/mt-15-monster.png',
    'MT-15 (STD) Cyan Blue': '/bikes/mt-15-cyan-blue.png',
  },
  'yamaha-fzs-v4-hybrid': {
    'Metallic Black': '/bikes/fz-v3.png',
    'Rave Matte Grey': '/bikes/fz-rave.png',
    'Matte Red': '/bikes/fzs-v3-std.png',
    'Metallic Grey / Chrome': '/bikes/fz-s-v4-hybrid.png',
    'F-Z V3': '/bikes/fz-v3.png',
    'FZ V3': '/bikes/fz-v3.png',
    'F-Z Rave': '/bikes/fz-rave.png',
    'FZ Rave': '/bikes/fz-rave.png',
    'FZ-S V3 (STD)': '/bikes/fzs-v3-std.png',
    'FZ-S V4 Hybrid': '/bikes/fz-s-v4-hybrid.png',
  },
  'bike_fzs': {
    'Metallic Black': '/bikes/fz-v3.png',
    'Rave Matte Grey': '/bikes/fz-rave.png',
    'Matte Red': '/bikes/fzs-v3-std.png',
    'Metallic Grey / Chrome': '/bikes/fz-s-v4-hybrid.png',
    'F-Z V3': '/bikes/fz-v3.png',
    'FZ V3': '/bikes/fz-v3.png',
    'F-Z Rave': '/bikes/fz-rave.png',
    'FZ Rave': '/bikes/fz-rave.png',
    'FZ-S V3 (STD)': '/bikes/fzs-v3-std.png',
    'FZ-S V4 Hybrid': '/bikes/fz-s-v4-hybrid.png',
  },
  'yamaha-xsr-155': {
    'Heritage Black': '/bikes/xsr-black.png',
    'Timeless Silver': '/bikes/xsr-silver.png',
    'Vintage Red': '/bikes/xsr-red.png',
    'Classic Blue': '/bikes/xsr-blue.png',
    'Military Green': '/bikes/xsr-green.png',
    'XSR Black': '/bikes/xsr-black.png',
    'XSR Silver': '/bikes/xsr-silver.png',
    'XSR Red': '/bikes/xsr-red.png',
    'XSR Blue': '/bikes/xsr-blue.png',
    'XSR Green': '/bikes/xsr-green.png',
  },
  'xsr-155': {
    'Heritage Black': '/bikes/xsr-black.png',
    'Timeless Silver': '/bikes/xsr-silver.png',
    'Vintage Red': '/bikes/xsr-red.png',
    'Classic Blue': '/bikes/xsr-blue.png',
    'Military Green': '/bikes/xsr-green.png',
    'XSR Black': '/bikes/xsr-black.png',
    'XSR Silver': '/bikes/xsr-silver.png',
    'XSR Red': '/bikes/xsr-red.png',
    'XSR Blue': '/bikes/xsr-blue.png',
    'XSR Green': '/bikes/xsr-green.png',
  },
  'bike_xsr': {
    'Heritage Black': '/bikes/xsr-black.png',
    'Timeless Silver': '/bikes/xsr-silver.png',
    'Vintage Red': '/bikes/xsr-red.png',
    'Classic Blue': '/bikes/xsr-blue.png',
    'Military Green': '/bikes/xsr-green.png',
    'XSR Black': '/bikes/xsr-black.png',
    'XSR Silver': '/bikes/xsr-silver.png',
    'XSR Red': '/bikes/xsr-red.png',
    'XSR Blue': '/bikes/xsr-blue.png',
    'XSR Green': '/bikes/xsr-green.png',
  },
  'yamaha-fascino-125': {
    'Vivid Red': '/bikes/fascino-drum.png',
    'Dark Matte Blue': '/bikes/fascino-drum.png',
    'Light Green': '/bikes/fascino-drum.png',
    'Metallic Black': '/bikes/fascino-drum.png',
  },
  'yamaha-fascino-drum': {
    'Vivid Red': '/bikes/fascino-drum.png',
    'Dark Matte Blue': '/bikes/fascino-drum.png',
    'Light Green': '/bikes/fascino-drum.png',
    'Metallic Black': '/bikes/fascino-drum.png',
  },
  'yamaha-rayzr-125': {
    'Drum': '/bikes/ray-zr-drum.png',
    'Street Rally': '/bikes/ray-zr-street-rally.png',
    'Ray ZR (Drum)': '/bikes/ray-zr-drum.png',
    'Ray ZR (Street Rally)': '/bikes/ray-zr-street-rally.png',
    'Matte Black': '/bikes/ray-zr-drum.png',
    'Matte Titan': '/bikes/ray-zr-street-rally.png',
    'Matte Copper / Black': '/bikes/ray-zr-street-rally.png',
    'Matte Copper': '/bikes/ray-zr-street-rally.png',
    'Dark Matte Blue': '/bikes/ray-zr-street-rally.png',
    'Vermillion': '/bikes/ray-zr-street-rally.png',
    'Metallic Black': '/bikes/ray-zr-drum.png',
  },
  'yamaha-ray-zr-125': {
    'Drum': '/bikes/ray-zr-drum.png',
    'Street Rally': '/bikes/ray-zr-street-rally.png',
    'Ray ZR (Drum)': '/bikes/ray-zr-drum.png',
    'Ray ZR (Street Rally)': '/bikes/ray-zr-street-rally.png',
    'Matte Black': '/bikes/ray-zr-drum.png',
    'Matte Titan': '/bikes/ray-zr-street-rally.png',
    'Matte Copper / Black': '/bikes/ray-zr-street-rally.png',
    'Matte Copper': '/bikes/ray-zr-street-rally.png',
    'Dark Matte Blue': '/bikes/ray-zr-street-rally.png',
    'Vermillion': '/bikes/ray-zr-street-rally.png',
    'Metallic Black': '/bikes/ray-zr-drum.png',
  },
  'yamaha-aerox-155': {
    'Racing Blue': '/bikes/aerox-s.png',
    'Racing Blue (Version S Smart Key)': '/bikes/aerox-s.png',
    'Metallic Black': '/bikes/aerox-s.png',
  },
  'yamaha-aerox-s': {
    'Racing Blue': '/bikes/aerox-s.png',
    'Racing Blue (Version S Smart Key)': '/bikes/aerox-s.png',
    'Metallic Black': '/bikes/aerox-s.png',
  },
};

export default function BikeConfiguratorModal({
  bike,
  isOpen,
  onClose,
  onBookBike,
  onBookVisit,
}: BikeConfiguratorModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedColorName, setSelectedColorName] = useState<string>('');

  useEffect(() => {
    if (bike && bike.variants && bike.variants.length > 0) {
      setSelectedVariantId(bike.variants[0].id);
      setSelectedColorName(bike.variants[0].color_name);
    }
  }, [bike]);

  if (!isOpen || !bike) return null;

  const currentVariant =
    bike.variants?.find((v) => v.id === selectedVariantId) || bike.variants?.[0];

  // Resolve image based on selected color name
  const modelColors = MODEL_COLOR_ASSETS[bike.slug] || {};
  const activeColorImage =
    modelColors[selectedColorName] ||
    (currentVariant && modelColors[currentVariant.color_name]) ||
    currentVariant?.image_url ||
    bike.image_url;

  const handleSelectColor = (colorName: string) => {
    setSelectedColorName(colorName);
    // Also sync with matching variant if exists
    const matchingVar = bike.variants?.find(
      (v) => v.color_name.toLowerCase() === colorName.toLowerCase()
    );
    if (matchingVar) {
      setSelectedVariantId(matchingVar.id);
    }
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    const v = bike.variants?.find((item) => item.id === variantId);
    if (v) {
      setSelectedColorName(v.color_name);
    }
  };

  // Get distinct colors for this model
  const availableColors = Array.from(
    new Set(bike.variants?.map((v) => v.color_name) || [])
  ).map((colorName) => {
    const variant = bike.variants?.find((v) => v.color_name === colorName);
    return {
      name: colorName,
      hex: variant?.color_hex || '#0066FF',
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      {/* Modal Container: Split View */}
      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-[#0A0E17] border border-white/15 shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* LEFT PANEL: Large Motorcycle Image (Changes smoothly when color changes) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#060b18] via-[#081228] to-[#040812] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-left border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Subtle Blue Glow in background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#0066FF]/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-[#00E5FF] text-[10px] font-bold uppercase tracking-wider border border-[#0066FF]/40">
                  {bike.category}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Official Yamaha Dealership
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
                {bike.name}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{bike.tagline}</p>
            </div>

            {/* Center: Large Motorcycle Image (Smoothly updates to selected color) */}
            <div className="relative my-8 flex items-center justify-center min-h-[240px] sm:min-h-[280px]">
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-[#0066FF]/25 rounded-full blur-md" />
              <img
                key={activeColorImage}
                src={activeColorImage}
                alt={`${bike.name} - ${selectedColorName}`}
                className="max-h-[260px] sm:max-h-[300px] max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] transition-all duration-300 transform hover:scale-105"
              />
            </div>

            {/* Bottom: Price & Stock Status */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    Ex-Showroom Mohanpur
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-white font-display">
                    ₹{currentVariant?.ex_showroom_price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    In Stock at Mohanpur
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Configuration, Available Colors & CTAs */}
          <div className="lg:col-span-6 bg-[#070A11] p-6 sm:p-8 flex flex-col justify-between text-left">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1 font-display">
                  Color & Variant Configuration
                </h3>
                <p className="text-xs text-gray-400">
                  Select your color preference and factory variant below.
                </p>
              </div>

              {/* COLOR SELECTOR (Clicking updates the large left image immediately) */}
              {availableColors.length > 0 && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-2.5">
                    Available Colors: <span className="text-[#00E5FF] font-semibold">{selectedColorName}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {availableColors.map((col) => {
                      const isSelected = selectedColorName.toLowerCase() === col.name.toLowerCase();
                      const isTrim = col.name === 'Drum' || col.name === 'Street Rally';
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => handleSelectColor(col.name)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0066FF]/20 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.4)] scale-105 text-white'
                              : 'bg-white/5 border-white/10 hover:border-white/30 text-gray-400'
                          }`}
                        >
                          {!isTrim && col.hex && (
                            <span
                              className="w-4 h-4 rounded-full border border-white/40 shrink-0 shadow-inner"
                              style={{ backgroundColor: col.hex }}
                            />
                          )}
                          <span className="text-xs font-bold">{col.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VARIANT SELECTOR */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-2.5">
                  Factory Variants ({bike.variants?.length} Available)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {bike.variants?.map((v) => {
                    const isSelected = v.id === currentVariant?.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariant(v.id)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0066FF]/20 border-[#0066FF] shadow-md shadow-blue-600/20'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">
                              {v.name}
                            </p>
                            <p className="text-[10px] text-gray-400">{v.color_name}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-white font-display">
                            ₹{v.ex_showroom_price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Engine Specifications */}
              <div className="grid grid-cols-3 gap-2 bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Engine</span>
                  <span className="text-xs font-black text-white font-display">{bike.engine_cc}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Max Power</span>
                  <span className="text-xs font-black text-white font-display">{bike.max_power?.split('@')[0] || bike.max_power}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Kerb Weight</span>
                  <span className="text-xs font-black text-white font-display">{bike.curb_weight}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Pass Selected Model, Variant, and Color into Flow */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
              <button
                onClick={() => currentVariant && onBookVisit(bike.id, currentVariant.id)}
                className="flex-1 py-3 px-3 rounded-xl border border-[#0066FF]/60 hover:border-[#00E5FF] bg-black/40 hover:bg-[#0066FF]/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Showroom Visit</span>
              </button>

              <button
                onClick={() => currentVariant && onBookBike(bike.id, currentVariant.id)}
                className="flex-1 py-3 px-3 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

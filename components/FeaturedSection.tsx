'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowRight, Zap, Shield, Flame, Gauge, Sparkles } from 'lucide-react';

interface FeaturedSectionProps {
  onSelectBike: (bikeSlug: string) => void;
  onOpenBookingModal: (bikeSlug: string) => void;
  onOpenVisitModal: () => void;
}

const HERO_BIKES = [
  {
    id: 'r15',
    slug: 'yamaha-r15-v4',
    name: 'Yamaha R15 V4',
    category: 'Supersport',
    headline: 'BORN OF RACING DNA',
    tagline: 'MotoGP Inspired Precision',
    description:
      'Engineered directly from Yamaha championship-winning YZR-M1 machines. Equipped with Variable Valve Actuation (VVA), Traction Control, and Quick Shifter for razor-sharp track and road dominance.',
    image: '/assets/bikes/hero_r15_v4.jpg',
    power: '18.4 PS',
    torque: '14.2 Nm',
    engine: '155 cc Liquid-Cooled 4V',
    transmission: '6-Speed with Assist & Slipper',
    price: 'From ₹1,75,650*',
    badgeText: '18.4 PS Race Power',
    accentColor: '#0020B2',
    glowColor: 'rgba(0, 32, 178, 0.4)',
    features: [
      { title: 'Variable Valve Actuation', desc: 'Seamless torque across low, mid, and peak RPM powerband' },
      { title: 'Upside-Down (USD) Forks', desc: 'Exceptional stability under aggressive cornering and hard braking' },
      { title: 'Quick Shifter & TCS', desc: 'Clutchless upshifts paired with electronic traction supervision' }
    ]
  },
  {
    id: 'mt15',
    slug: 'yamaha-mt-15-v2',
    name: 'Yamaha MT-15 V2',
    category: 'Hyper Naked',
    headline: 'THE DARK SIDE OF JAPAN',
    tagline: 'Raw Street Agility',
    description:
      'Torque-rich, predatory, and agile. The MT-15 V2 brings raw streetfighter styling with dual-slant LED eyes, Deltabox frame, inverted front suspension, and connected Bluetooth instrumentation.',
    image: '/assets/bikes/hero_mt15_v2.jpg',
    power: '18.4 PS',
    torque: '14.1 Nm',
    engine: '155 cc Liquid-Cooled 4V SOHC',
    transmission: '6-Speed Manual',
    price: 'From ₹1,66,710*',
    badgeText: '139 kg Featherweight',
    accentColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.35)',
    features: [
      { title: 'Predatory LED Bi-Projector', desc: 'Hyper-focused beam with menacing twin-eye daytime running lights' },
      { title: 'Deltabox Chassis', desc: 'Rigid perimeter frame offering superior rigidity and flickability' },
      { title: 'Aluminum Swingarm', desc: 'Race-inspired lightweight swingarm for unmatched rear wheel traction' }
    ]
  },
  {
    id: 'fzs',
    slug: 'yamaha-fzs-v4-hybrid',
    name: 'Yamaha FZ-S V4 Hybrid',
    category: 'Street Fighter',
    headline: 'LORD OF THE STREETS',
    tagline: 'Intelligent Urban Power',
    description:
      'The pioneer of muscular street motorcycling in India. Features intelligent mild-hybrid electric assist, Class-D Bi-functional LED headlamp, Traction Control System, and plush all-day touring ergonomics.',
    image: '/assets/bikes/hero_fzs_v4.jpg',
    power: '12.4 PS',
    torque: '13.3 Nm',
    engine: '149 cc Blue Core Fuel-Injected',
    transmission: '5-Speed Constant Mesh',
    price: 'From ₹1,42,000*',
    badgeText: 'Mild-Hybrid Assist',
    accentColor: '#60A5FA',
    glowColor: 'rgba(96, 165, 250, 0.35)',
    features: [
      { title: 'Traction Control System (TCS)', desc: 'Prevents wheel spin on slippery roads for uncompromised safety' },
      { title: 'Smart Motor Generator (SMG)', desc: 'Whisper-quiet engine start with supplemental electric torque assist' },
      { title: 'Y-Connect Bluetooth', desc: 'Real-time mileage tracking, maintenance alert and last parking spot' }
    ]
  },
  {
    id: 'aerox',
    slug: 'yamaha-aerox-s',
    name: 'Yamaha Aerox S',
    category: 'Maxi Sports',
    headline: 'MAX SPEED & SMART STYLE',
    tagline: 'Smart Key Maxi-Sports Experience',
    description:
      'The ultimate performance scooter. Powered by the same 155cc liquid-cooled VVA engine as the R15, featuring Smart Key keyless ignition with Answer-Back, wide 14-inch sports wheels, and 24.5L storage.',
    image: '/assets/bikes/hero_aerox_s.jpg',
    power: '15.0 PS',
    torque: '13.9 Nm',
    engine: '155 cc Liquid-Cooled VVA',
    transmission: 'V-Belt Automatic CVT',
    price: '₹1,50,350*',
    badgeText: 'Smart Key Keyless',
    accentColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    features: [
      { title: 'Smart Key Proximity System', desc: 'Keyless start, seat opener, fuel lid unlock and buzzer answer-back' },
      { title: '14-inch Sports Alloy Wheels', desc: 'Superbike-style large diameter tires offering exceptional high-speed poise' },
      { title: 'Twin External Reservoir Shocks', desc: 'Supple gas-charged rear damping designed for dynamic riding' }
    ]
  }
];

export default function FeaturedSection({ onSelectBike, onOpenBookingModal, onOpenVisitModal }: FeaturedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeBikeIndex, setActiveBikeIndex] = useState(0);
  const [scrollFraction, setScrollFraction] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalDist = containerRef.current.offsetHeight - window.innerHeight;
      if (totalDist <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalDist));
      setScrollFraction(progress);

      // Map progress to 4 bikes:
      // 0.00 - 0.25 -> Bike 0 (R15)
      // 0.25 - 0.50 -> Bike 1 (MT-15)
      // 0.50 - 0.75 -> Bike 2 (FZ-S)
      // 0.75 - 1.00 -> Bike 3 (Aerox S)
      const index = Math.min(HERO_BIKES.length - 1, Math.floor(progress * HERO_BIKES.length));
      setActiveBikeIndex(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentBike = HERO_BIKES[activeBikeIndex];

  // For Bike 4 (Aerox S), compute graceful downward translation as progress nears 1.0
  const isLastBike = activeBikeIndex === 3;
  const aeroxExitProgress = Math.max(0, (scrollFraction - 0.85) / 0.15);
  const aeroxTranslateY = isLastBike ? aeroxExitProgress * 120 : 0;
  const aeroxScale = isLastBike ? 1 - aeroxExitProgress * 0.15 : 1;

  return (
    <section ref={containerRef} className="relative h-[420vh] w-full bg-[#06080D]">
      {/* Pinned Studio Stage Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-20 pb-12">
        {/* Dynamic Studio Ambient Spotlight & Colored Glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 opacity-40"
          style={{ backgroundColor: currentBike.accentColor }}
        />

        {/* Top Header Bar: Section Label & Category Selector Pills */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yamaha-cyan animate-pulse" />
              <p className="text-xs uppercase tracking-widest text-yamaha-cyan font-bold">
                Featured Yamaha Motorcycles
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display">
              {currentBike.headline}
            </h2>
          </div>

          {/* Category Tabs / Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-full glass-panel">
            {HERO_BIKES.map((bike, idx) => (
              <button
                key={bike.id}
                onClick={() => {
                  if (containerRef.current) {
                    const totalDist = containerRef.current.offsetHeight - window.innerHeight;
                    const targetScrollTop = containerRef.current.offsetTop + (idx / HERO_BIKES.length) * totalDist + 50;
                    window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  activeBikeIndex === idx
                    ? 'bg-yamaha-racing text-white shadow-md shadow-yamaha-blue/50 scale-105'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {bike.name.replace('Yamaha ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Center Arena: 3-Column Layout (Matching Reference Frame 11 & 13) */}
        <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 my-auto">
          {/* LEFT COLUMN: Dynamic Spec Card */}
          <div className="lg:col-span-4 z-30">
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
                style={{ backgroundColor: currentBike.accentColor }}
              />

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-yamaha-cyan">
                  {currentBike.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold">
                  {currentBike.badgeText}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display leading-tight mb-1">
                {currentBike.name}
              </h3>
              <p className="text-xs font-semibold text-gray-400 mb-3">{currentBike.tagline}</p>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-5 font-normal">
                {currentBike.description}
              </p>

              <div className="flex items-baseline gap-2 mb-6 pb-4 border-b border-white/10">
                <span className="text-xs uppercase text-gray-400 font-semibold">Ex-Showroom:</span>
                <span className="text-xl sm:text-2xl font-black text-white font-display">
                  {currentBike.price}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <button
                  onClick={() => onOpenBookingModal(currentBike.slug)}
                  className="flex-1 py-3 px-4 rounded-xl bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform transform active:scale-95 shadow-lg shadow-yamaha-blue/40"
                >
                  <span>Book This Bike</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSelectBike(currentBike.slug)}
                  className="py-3 px-4 rounded-xl glass-card hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
                >
                  Configure & Specs
                </button>
              </div>
            </div>
          </div>

          {/* CENTER: Studio Motorcycle Display with Reflections */}
          <div className="lg:col-span-5 relative flex items-center justify-center h-[300px] sm:h-[420px] lg:h-[480px]">
            {HERO_BIKES.map((bike, idx) => (
              <div
                key={bike.id}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out ${
                  activeBikeIndex === idx
                    ? 'opacity-100 scale-100'
                    : idx < activeBikeIndex
                    ? 'opacity-0 -translate-x-12 scale-95 pointer-events-none'
                    : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
                }`}
                style={{
                  transform:
                    isLastBike && idx === 3
                      ? `translateY(${aeroxTranslateY}px) scale(${aeroxScale})`
                      : undefined
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={bike.image}
                    alt={bike.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: Feature Highlights Cards */}
          <div className="hidden lg:flex lg:col-span-3 flex-col space-y-3 z-30">
            {currentBike.features.map((feat, fIdx) => (
              <div
                key={fIdx}
                className="glass-panel p-4 rounded-xl border border-white/10 hover:border-yamaha-cyan/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentBike.accentColor }}
                  />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {feat.title}
                  </h4>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM: Horizontal Tech Specs Ribbon (Matching Reference Video) */}
        <div className="relative z-20 glass-panel rounded-xl py-3 px-6 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <Gauge className="w-5 h-5 text-yamaha-cyan" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Engine Power</p>
              <p className="text-xs sm:text-sm font-bold text-white">{currentBike.power}</p>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Peak Torque</p>
              <p className="text-xs sm:text-sm font-bold text-white">{currentBike.torque}</p>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Displacement</p>
              <p className="text-xs sm:text-sm font-bold text-white">{currentBike.engine}</p>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Transmission</p>
              <p className="text-xs sm:text-sm font-bold text-white">{currentBike.transmission}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

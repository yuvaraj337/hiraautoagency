'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Mouse } from 'lucide-react';

interface FeaturedSectionProps {
  onSelectBike: (bikeSlug: string) => void;
  onOpenBookingModal: (bikeSlug: string) => void;
  onOpenVisitModal: () => void;
}

interface ShowcaseBike {
  id: string;
  indexStr: string;
  slug: string;
  category: string;
  namePrefix: string;
  nameSuffix: string;
  nameSuffixGradient?: boolean;
  subtitle: string;
  description: string;
  showcaseImage: string;
  thumbnail: string;
  accentColor: string;
}

const SHOWCASE_BIKES: ShowcaseBike[] = [
  {
    id: 'r15',
    indexStr: '01',
    slug: 'yamaha-r15-v4',
    category: 'RACE INSPIRED',
    namePrefix: 'R15',
    nameSuffix: 'V4',
    nameSuffixGradient: true,
    subtitle: 'LIVE THE RACING DNA',
    description: 'MotoGP inspired. Built for the streets. Precision, control and pure adrenaline.',
    showcaseImage: '/assets/bikes/showcase/showcase_bike_1.png',
    thumbnail: '/assets/bikes/thumbs/thumb_r15.png',
    accentColor: '#0066FF',
  },
  {
    id: 'mt15',
    indexStr: '02',
    slug: 'yamaha-mt-15-v2',
    category: 'THE DARK WARRIOR',
    namePrefix: 'MT',
    nameSuffix: '-15',
    nameSuffixGradient: false,
    subtitle: 'DARK SIDE OF JAPAN',
    description: 'Aggressive. Agile. Unstoppable. Built for those who break limits.',
    showcaseImage: '/assets/bikes/showcase/showcase_bike_2.png',
    thumbnail: '/assets/bikes/thumbs/thumb_mt15.png',
    accentColor: '#00E5FF',
  },
  {
    id: 'fzs',
    indexStr: '03',
    slug: 'yamaha-fzs-v4-hybrid',
    category: 'THE STREET ICON',
    namePrefix: 'FZ-S',
    nameSuffix: 'V4',
    nameSuffixGradient: true,
    subtitle: 'LORD OF THE STREETS',
    description: 'Refined performance. Unmatched style. Everyday thrill.',
    showcaseImage: '/assets/bikes/showcase/showcase_bike_3.png',
    thumbnail: '/assets/bikes/thumbs/thumb_fzs.png',
    accentColor: '#3B82F6',
  },
  {
    id: 'r3',
    indexStr: '04',
    slug: 'yamaha-r15-v4',
    category: 'BORN TO THRILL',
    namePrefix: 'R3',
    nameSuffix: '',
    nameSuffixGradient: false,
    subtitle: 'PURE PERFORMANCE',
    description: 'Track DNA. Real capability. The next level.',
    showcaseImage: '/assets/bikes/showcase/showcase_bike_4.png',
    thumbnail: '/assets/bikes/thumbs/thumb_r3.png',
    accentColor: '#2563EB',
  },
  {
    id: 'aerox',
    indexStr: '05',
    slug: 'yamaha-aerox-s',
    category: 'URBAN FREEDOM',
    namePrefix: 'AEROX',
    nameSuffix: '155',
    nameSuffixGradient: false,
    subtitle: 'PLAY YOUR STYLE',
    description: 'Sporty. Smart. Unstoppable. The ultimate urban ride.',
    showcaseImage: '/assets/bikes/showcase/showcase_bike_5.png',
    thumbnail: '/assets/bikes/thumbs/thumb_aerox.png',
    accentColor: '#0066FF',
  },
];

const TOTAL_BIKES = SHOWCASE_BIKES.length; // Exactly 5 bikes

export default function FeaturedSection({ onSelectBike }: FeaturedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalDist = containerRef.current.offsetHeight - window.innerHeight;
      if (totalDist <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalDist));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute active bike index: 0..4
  const activeBikeIndex = Math.min(
    TOTAL_BIKES - 1,
    Math.max(0, Math.floor(scrollProgress * TOTAL_BIKES))
  );

  const currentBike = SHOWCASE_BIKES[activeBikeIndex];

  // Smooth scroll handler when clicking a model on the right selector
  const handleSelectModel = (index: number) => {
    if (!containerRef.current) return;
    const totalDist = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = containerRef.current.offsetTop + ((index + 0.5) / TOTAL_BIKES) * totalDist;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  // Calculate smooth cross-fade opacity for each bike
  const getBikeOpacity = (idx: number) => {
    const slot = 1 / TOTAL_BIKES; // 0.20 per bike
    const center = (idx + 0.5) * slot;
    const dist = Math.abs(scrollProgress - center);

    if (dist <= 0.07) return 1;
    if (dist >= 0.13) return 0;
    return 1 - (dist - 0.07) / (0.13 - 0.07);
  };

  return (
    <section
      id="showcase"
      ref={containerRef}
      className="relative h-[500vh] w-full bg-[#06080C] select-none"
    >
      {/* Pinned Viewport Container (100vw x 100vh) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between bg-[#06080C]">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-950/20 via-transparent to-black pointer-events-none" />

        {/* ========================================================================= */}
        {/* CENTER 3D MOTORCYCLE STAGE (WITH REFLECTIONS, GHOST BIKES, WATERMARKS)    */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-4">
          {SHOWCASE_BIKES.map((bike, idx) => {
            const opacity = getBikeOpacity(idx);
            if (opacity <= 0.005) return null;

            return (
              <div
                key={bike.id}
                className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out"
                style={{
                  opacity,
                  transform: `scale(${0.98 + opacity * 0.02}) translateY(${(1 - opacity) * 6}px)`,
                }}
              >
                <img
                  src={bike.showcaseImage}
                  alt={`${bike.namePrefix} ${bike.nameSuffix}`}
                  className="w-full max-w-6xl max-h-[72vh] sm:max-h-[78vh] object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]"
                />
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* LEFT CONTENT HUD (1:1 MATCHING REFERENCE STORYBOARD)                      */}
        {/* ========================================================================= */}
        <div className="absolute left-6 sm:left-12 md:left-16 lg:left-20 top-1/2 -translate-y-1/2 z-20 max-w-xs sm:max-w-sm md:max-w-md pointer-events-auto">
          {/* Vertical Progress Pill Counters (01 / 05) */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs sm:text-sm font-black text-white tracking-widest">
              {currentBike.indexStr} <span className="text-white/40 font-medium">/ 05</span>
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-4 w-1 rounded-full transition-all duration-300 ${
                    step === activeBikeIndex
                      ? 'bg-[#0088FF] h-6 shadow-[0_0_10px_rgba(0,136,255,0.8)]'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <div className="h-4 w-px bg-white/20 ml-1" />
          </div>

          {/* Category Tag */}
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#0088FF] mb-1">
            {currentBike.category}
          </p>

          {/* Model Name Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-2">
            {currentBike.namePrefix}{' '}
            {currentBike.nameSuffix && (
              <span
                className={
                  currentBike.nameSuffixGradient
                    ? 'bg-clip-text text-transparent bg-gradient-to-r from-[#0066FF] to-[#00E5FF]'
                    : 'text-[#0088FF]'
                }
              >
                {currentBike.nameSuffix}
              </span>
            )}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-extrabold uppercase text-white tracking-wider mb-2">
            {currentBike.subtitle}
          </p>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-white/70 leading-relaxed max-w-sm mb-6 font-normal">
            {currentBike.description}
          </p>

          {/* Watch Story Action Control */}
          <button
            onClick={() => onSelectBike(currentBike.slug)}
            className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-white hover:text-[#00E5FF] group cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center group-hover:border-[#00E5FF] group-hover:scale-105 transition-all">
              <Play className="w-3.5 h-3.5 fill-white text-white group-hover:fill-[#00E5FF] group-hover:text-[#00E5FF] ml-0.5 transition-colors" />
            </div>
            <span>WATCH THE STORY</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT VERTICAL MOTORCYCLE SELECTOR (1:1 MATCHING REFERENCE)               */}
        {/* ========================================================================= */}
        <div className="absolute right-6 sm:right-10 md:right-14 lg:right-16 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-end pointer-events-auto">
          <div className="relative flex flex-col space-y-2 py-2 pr-4">
            {/* Continuous Vertical Guide Line */}
            <div className="absolute right-[5px] top-4 bottom-4 w-[1.5px] bg-white/15 z-0" />

            {SHOWCASE_BIKES.map((bike, idx) => {
              const isActive = activeBikeIndex === idx;
              return (
                <div
                  key={bike.id}
                  onClick={() => handleSelectModel(idx)}
                  className={`relative z-10 flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-950/50 border border-blue-500 shadow-[0_0_18px_rgba(0,102,255,0.45)] text-white scale-105'
                      : 'hover:bg-white/5 border border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <img
                    src={bike.thumbnail}
                    alt={bike.namePrefix}
                    className="w-9 h-6 object-contain"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider min-w-[70px]">
                    {bike.namePrefix} {bike.nameSuffix}
                  </span>

                  {/* Node Dot on Vertical Line */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? 'bg-white border-blue-500 shadow-[0_0_8px_#00E5FF] scale-125'
                        : 'bg-[#06080C] border-white/30'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Scroll To Explore Indicator */}
          <div className="flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-white/50 pr-4">
            <Mouse className="w-3.5 h-3.5 text-white/60 animate-bounce" />
            <span>SCROLL TO EXPLORE</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE COMPACT SELECTOR & PROGRESS (VISIBLE ON MOBILE & TABLET)          */}
        {/* ========================================================================= */}
        <div className="relative z-20 md:hidden w-full px-6 pb-6 pt-2 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5">
            {SHOWCASE_BIKES.map((bike, idx) => (
              <button
                key={bike.id}
                onClick={() => handleSelectModel(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeBikeIndex === idx
                    ? 'bg-[#0088FF] text-white shadow-md shadow-blue-600/40'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {bike.namePrefix}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold text-white/60">
            <span>{currentBike.indexStr} / 05</span>
          </div>
        </div>
      </div>
    </section>
  );
}

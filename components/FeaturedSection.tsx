'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapPin, Calendar, Mouse, Search, SlidersHorizontal, Eye, ArrowRight } from 'lucide-react';
import { Bike } from './BikeConfiguratorModal';

export interface FeaturedSectionProps {
  bikes?: Bike[];
  onSelectBike: (bikeOrSlug: Bike | string) => void;
  onOpenBookingModal: (bikeId: string, variantId?: string) => void;
  onOpenVisitModal: () => void;
}

interface ShowcaseBikeData {
  id: string;
  indexStr: string;
  slug: string;
  category: string;
  namePrefix: string;
  nameSuffix: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  specs: { value: string; label: string }[];
  catalogSubtitle: string;
  catalogPrice: string;
  defaultPriceNumber: number;
}

// EXACT 4 MOTORCYCLES MATCHING 6-PANEL STORYBOARD (NO AEROX, NO 5TH BIKE)
const FOUR_SHOWCASE_BIKES: ShowcaseBikeData[] = [
  {
    id: 'bike_r15',
    indexStr: '01',
    slug: 'yamaha-r15-v4',
    category: 'RACE INSPIRED',
    namePrefix: 'R15',
    nameSuffix: 'V4',
    name: 'R15 V4',
    subtitle: 'LIVE THE RACING DNA',
    description: 'MotoGP inspired design. Pure adrenaline. Built for the streets.',
    image: '/bikes/r15-v4.png',
    specs: [
      { value: '18.4 PS', label: 'Max Power' },
      { value: '141 kg', label: 'Kerb Weight' },
      { value: 'VVA', label: 'Technology' },
      { value: 'Dual Channel ABS', label: 'Confidence' },
    ],
    catalogSubtitle: 'Racing DNA',
    catalogPrice: '₹1,75,650',
    defaultPriceNumber: 175650,
  },
  {
    id: 'bike_mt15',
    indexStr: '02',
    slug: 'yamaha-mt-15-v2',
    category: 'THE DARK WARRIOR',
    namePrefix: 'MT',
    nameSuffix: '-15',
    name: 'MT-15',
    subtitle: 'DARK SIDE OF JAPAN',
    description: 'Aggressive. Agile. Unstoppable. Built for those who break limits.',
    image: '/bikes/mt-15-v2.png',
    specs: [
      { value: '18.4 PS', label: 'Max Power' },
      { value: '138 kg', label: 'Kerb Weight' },
      { value: 'VVA', label: 'Technology' },
      { value: 'Dual Channel ABS', label: 'Confidence' },
    ],
    catalogSubtitle: 'Dark Side of Japan',
    catalogPrice: '₹1,67,610',
    defaultPriceNumber: 167610,
  },
  {
    id: 'bike_fzs',
    indexStr: '03',
    slug: 'yamaha-fzs-v4-hybrid',
    category: 'THE STREET ICON',
    namePrefix: 'FZ-S',
    nameSuffix: 'V4',
    name: 'FZ-S V4',
    subtitle: 'LORD OF THE STREETS',
    description: 'Refined performance. Unmatched style. Everyday thrill.',
    image: '/bikes/fz-s-v4-hybrid.png',
    specs: [
      { value: '12.4 PS', label: 'Max Power' },
      { value: '137 kg', label: 'Kerb Weight' },
      { value: 'FI', label: 'Technology' },
      { value: 'Dual Channel ABS', label: 'Confidence' },
    ],
    catalogSubtitle: 'Lord of the Streets',
    catalogPrice: '₹1,42,000',
    defaultPriceNumber: 142000,
  },
  {
    id: 'bike_xsr',
    indexStr: '04',
    slug: 'yamaha-xsr-155',
    category: 'MODERN CLASSIC',
    namePrefix: 'XSR',
    nameSuffix: '',
    name: 'XSR',
    subtitle: 'PURE JAPANESE CHARACTER',
    description: 'Timeless design. Modern performance.',
    image: '/bikes/xsr.png',
    specs: [
      { value: '19.4 PS', label: 'Max Power' },
      { value: '134 kg', label: 'Kerb Weight' },
      { value: 'Assist & Slipper Clutch', label: 'Technology' },
      { value: 'Single Channel ABS', label: 'Confidence' },
    ],
    catalogSubtitle: 'Pure Japanese Character',
    catalogPrice: '₹1,63,900',
    defaultPriceNumber: 163900,
  },
];

const CATEGORIES = [
  { label: 'ALL MODELS', value: 'ALL' },
  { label: 'R15 SERIES', value: 'R15' },
  { label: 'MT HYPER NAKED', value: 'MT' },
  { label: 'FZ STREET', value: 'FZ' },
  { label: 'XSR HERITAGE', value: 'XSR' },
  { label: 'SCOOTERS & AEROX', value: 'SCOOTERS' },
];

export default function FeaturedSection({
  bikes = [],
  onSelectBike,
  onOpenBookingModal,
  onOpenVisitModal,
}: FeaturedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const card4TargetRef = useRef<HTMLDivElement>(null);

  // Normalized scroll progress 0..1 across the pinned showcase container
  const [scrollProgress, setScrollProgress] = useState(0);

  // Dynamic geometry target for XSR transition into Card 4
  const [targetOffset, setTargetOffset] = useState({ dx: 0, dy: 0, scale: 0.44 });

  // Catalog search and filter state
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high'>('featured');

  // Preload the 4 transparent PNGs
  useEffect(() => {
    FOUR_SHOWCASE_BIKES.forEach((bike) => {
      const img = new Image();
      img.src = bike.image;
    });
  }, []);

  // Update target geometry of Card 4 image slot
  const updateTargetGeometry = useCallback(() => {
    if (!card4TargetRef.current) return;
    const rect = card4TargetRef.current.getBoundingClientRect();
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight * 0.45;

    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    const dx = targetCenterX - viewportCenterX;
    const dy = targetCenterY - viewportCenterY;

    const showcaseHeight = Math.min(window.innerHeight * 0.65, 480);
    const scale = Math.max(0.35, Math.min(0.55, rect.height / showcaseHeight));

    setTargetOffset({ dx, dy, scale });
  }, []);

  // Optimized Scroll Handling using requestAnimationFrame
  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const totalDist = containerRef.current.offsetHeight - window.innerHeight;
        if (totalDist <= 0) return;

        const currentScroll = -rect.top;
        const progress = Math.max(0, Math.min(1, currentScroll / totalDist));
        setScrollProgress(progress);

        if (progress >= 0.72) {
          updateTargetGeometry();
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateTargetGeometry);
    handleScroll();
    updateTargetGeometry();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateTargetGeometry);
    };
  }, [updateTargetGeometry]);

  // Compute active bike in showcase (0..3)
  // Range 0..0.80 is divided into 4 segments of 0.20
  const activeBikeIndex = useMemo(() => {
    if (scrollProgress >= 0.60) return 3; // XSR
    if (scrollProgress >= 0.40) return 2; // FZ-S V4
    if (scrollProgress >= 0.20) return 1; // MT-15
    return 0; // R15 V4
  }, [scrollProgress]);

  const currentBike = FOUR_SHOWCASE_BIKES[activeBikeIndex];

  // Click on vertical selector jumps smoothly to target bike
  const handleSelectModel = (index: number) => {
    if (!containerRef.current) return;
    const totalDist = containerRef.current.offsetHeight - window.innerHeight;
    // Map index 0..3 to centers: 0.08, 0.28, 0.48, 0.68
    const targetProgress = index * 0.20 + 0.08;
    const targetScroll = containerRef.current.offsetTop + targetProgress * totalDist;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  // Helper to open booking with correct pre-selected bike & variant
  const handleBookBikeAction = (slugOrId: string) => {
    const found = bikes.find((b) => b.slug === slugOrId || b.id === slugOrId);
    if (found && found.variants?.[0]) {
      onOpenBookingModal(found.id, found.variants[0].id);
    } else {
      onOpenBookingModal(slugOrId);
    }
  };

  // =========================================================================
  // CONTINUOUS TRANSFORM & DEPTH CALCULATIONS FOR THE 4 INDEPENDENT PNGs
  // =========================================================================
  const getBikeLayerStyle = (index: number) => {
    // Transition to catalog happens between 0.80 and 0.98
    const isTransitionPhase = scrollProgress >= 0.80;
    const t = Math.max(0, Math.min(1, (scrollProgress - 0.82) / (0.97 - 0.82)));
    const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Special behavior for Bike 3 (XSR) during transition into catalog card
    if (index === 3) {
      if (isTransitionPhase) {
        const currX = targetOffset.dx * easedT;
        const currY = targetOffset.dy * easedT;
        const currScale = 1.0 + (targetOffset.scale - 1.0) * easedT;

        return {
          opacity: 1,
          transform: `translate3d(${currX}px, ${currY}px, 0) scale(${currScale})`,
          zIndex: 50,
          filter:
            t > 0.05 && t < 0.95
              ? `drop-shadow(0 0 ${12 + Math.sin(t * Math.PI) * 25}px rgba(0, 163, 255, ${0.6 + Math.sin(t * Math.PI) * 0.35}))`
              : 'drop-shadow(0 20px 35px rgba(0,0,0,0.9))',
          pointerEvents: 'none' as const,
        };
      }
    }

    // In transition phase, non-XSR bikes fade out completely
    if (isTransitionPhase) {
      const fadeOut = Math.max(0, 1 - (scrollProgress - 0.80) / 0.08);
      return {
        opacity: fadeOut * 0.18,
        transform: `translate3d(${index === 0 ? -160 : index === 1 ? 140 : -120}px, 0, 0) scale(0.68)`,
        filter: 'brightness(0.35) blur(2px)',
        zIndex: 10,
        pointerEvents: 'none' as const,
      };
    }

    // Normal 4-bike showcase progression (progress 0..0.80)
    const slotCenter = 0.08 + index * 0.20;
    const diff = scrollProgress - slotCenter;

    // Active dominant bike
    if (Math.abs(diff) <= 0.06) {
      const sway = diff * 80;
      return {
        opacity: 1,
        transform: `translate3d(${sway}px, 0, 0) scale(1.0)`,
        filter: 'brightness(1.0) blur(0px)',
        zIndex: 30,
        pointerEvents: 'auto' as const,
      };
    }

    // Bike transitioning away (receding to ghost)
    if (diff > 0.06 && diff < 0.18) {
      const exitProgress = (diff - 0.06) / 0.12;
      return {
        opacity: 1.0 - exitProgress * 0.82,
        transform: `translate3d(${-exitProgress * 140}px, 0, 0) scale(${1.0 - exitProgress * 0.30})`,
        filter: `brightness(${1.0 - exitProgress * 0.65}) blur(${exitProgress * 2}px)`,
        zIndex: 20,
        pointerEvents: 'none' as const,
      };
    }

    // Bike transitioning in (coming from ghost into center)
    if (diff < -0.06 && diff > -0.18) {
      const enterProgress = (-diff - 0.06) / 0.12;
      return {
        opacity: 1.0 - enterProgress * 0.82,
        transform: `translate3d(${enterProgress * 120}px, 0, 0) scale(${1.0 - enterProgress * 0.28})`,
        filter: `brightness(${1.0 - enterProgress * 0.65}) blur(${enterProgress * 2}px)`,
        zIndex: 20,
        pointerEvents: 'none' as const,
      };
    }

    // Inactive ghost layers in showroom depth behind active bike
    const ghostOffsets = [
      { x: -160, y: -15, scale: 0.68 }, // R15 ghost
      { x: 140, y: -10, scale: 0.70 }, // MT-15 ghost
      { x: -120, y: 12, scale: 0.69 }, // FZ-S ghost
      { x: 150, y: -15, scale: 0.68 }, // XSR ghost
    ];
    const offset = ghostOffsets[index];

    return {
      opacity: 0.18,
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${offset.scale})`,
      filter: 'brightness(0.35) blur(2px)',
      zIndex: 10,
      pointerEvents: 'none' as const,
    };
  };

  // UI HUD Opacity (fades out as transition to catalog begins)
  const showcaseUiOpacity = Math.max(0, 1 - Math.max(0, scrollProgress - 0.80) / 0.06);

  // Catalog Preview Opacity (fades in as XSR flies into card slot)
  const catalogPreviewOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.83) / 0.12));

  // Filter & Sort for the full client catalog
  const filteredBikes = useMemo(() => {
    let list = [...bikes];
    if (selectedCategory !== 'ALL') {
      list = list.filter((b) => b.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.variants?.some((v) => v.name.toLowerCase().includes(q))
      );
    }
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
    <section id="showcase-catalog-section" ref={containerRef} className="relative w-full bg-[#06080C] select-none">
      {/* ========================================================================= */}
      {/* 1. SCROLL-PINNED SHOWCASE VIEWPORT (550vh SCROLL DISTANCE)                */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[550vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#06080C] flex flex-col justify-between">
          {/* DARK CORNERS RADIAL VIGNETTE (Center: Bright Showroom / Corners: Deep Black) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,transparent_30%,rgba(6,8,14,0.65)_70%,rgba(2,3,6,0.98)_100%)] pointer-events-none z-10" />

          {/* BLUE ATMOSPHERIC ILLUMINATION */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,102,255,0.18)_0%,rgba(0,60,180,0.06)_50%,transparent_75%)] pointer-events-none z-0" />

          {/* ========================================================================= */}
          {/* FLOATING FLOOR GLOW & CONTACT SHADOW (Beneath dominant bike)              */}
          {/* ========================================================================= */}
          <div
            className="absolute bottom-[24%] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-300"
            style={{ opacity: showcaseUiOpacity }}
          >
            {/* Wide Elliptical Floor Glow */}
            <div className="w-[500px] sm:w-[720px] md:w-[900px] h-[75px] sm:h-[105px] bg-[radial-gradient(ellipse_at_center,rgba(0,140,255,0.45)_0%,rgba(0,70,220,0.15)_50%,transparent_75%)] rounded-[100%] blur-xl" />

            {/* Glowing Light Ring */}
            <div className="absolute w-[420px] sm:w-[600px] md:w-[760px] h-[55px] sm:h-[75px] rounded-[100%] border border-[#00A3FF]/40 shadow-[0_0_25px_rgba(0,163,255,0.35)]" />

            {/* Soft Tire Contact Shadow */}
            <div className="absolute w-[360px] sm:w-[520px] md:w-[650px] h-[30px] sm:h-[40px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.4)_50%,transparent_80%)] rounded-[100%] blur-sm" />
          </div>

          {/* ========================================================================= */}
          {/* FOUR INDEPENDENT MOTORCYCLE PNG OBJECTS SIMULTANEOUSLY IN DOM             */}
          {/* (NO IMAGE-SRC SWAPPING • CONTINUOUS 3D DEPTH TRANSFORMS)                 */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-4">
            {/* 1. R15 V4 */}
            <div
              className="bike-layer bike-r15 absolute inset-0 flex items-center justify-center"
              style={getBikeLayerStyle(0)}
            >
              <img
                src="/bikes/r15-v4.png"
                alt="Yamaha R15 V4"
                className="w-full max-w-4xl max-h-[60vh] sm:max-h-[68vh] md:max-h-[74vh] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              />
            </div>

            {/* 2. MT-15 V2 */}
            <div
              className="bike-layer bike-mt15 absolute inset-0 flex items-center justify-center"
              style={getBikeLayerStyle(1)}
            >
              <img
                src="/bikes/mt-15-v2.png"
                alt="Yamaha MT-15 V2"
                className="w-full max-w-4xl max-h-[60vh] sm:max-h-[68vh] md:max-h-[74vh] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              />
            </div>

            {/* 3. FZ-S V4 HYBRID */}
            <div
              className="bike-layer bike-fzs absolute inset-0 flex items-center justify-center"
              style={getBikeLayerStyle(2)}
            >
              <img
                src="/bikes/fz-s-v4-hybrid.png"
                alt="Yamaha FZ-S V4 Hybrid"
                className="w-full max-w-4xl max-h-[60vh] sm:max-h-[68vh] md:max-h-[74vh] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              />
            </div>

            {/* 4. XSR (Transitions physically into Card 4 image slot) */}
            <div
              className="bike-layer bike-xsr absolute inset-0 flex items-center justify-center"
              style={getBikeLayerStyle(3)}
            >
              <img
                src="/bikes/xsr.png"
                alt="Yamaha XSR"
                className="w-full max-w-4xl max-h-[60vh] sm:max-h-[68vh] md:max-h-[74vh] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LEFT CONTENT HUD (1:1 MATCHING 6-PANEL STORYBOARD)                        */}
          {/* ========================================================================= */}
          <div
            className="absolute left-6 sm:left-10 md:left-14 lg:left-16 top-1/2 -translate-y-1/2 z-30 flex items-start pointer-events-auto transition-opacity duration-300"
            style={{ opacity: showcaseUiOpacity }}
          >
            <div className="max-w-xs sm:max-w-sm md:max-w-md">
              {/* Category Tag */}
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#00E5FF] mb-1">
                {currentBike.category}
              </p>

              {/* Large Model Name Heading */}
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-2 font-display">
                {currentBike.namePrefix}{' '}
                {currentBike.nameSuffix && (
                  <span className="text-[#0088FF]">{currentBike.nameSuffix}</span>
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

              {/* Action Buttons: SHOWROOM VISIT & BOOK NOW */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  onClick={onOpenVisitModal}
                  className="px-5 py-2.5 rounded-xl border border-[#0066FF]/60 hover:border-[#00E5FF] bg-black/40 hover:bg-[#0066FF]/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>SHOWROOM VISIT</span>
                </button>

                <button
                  onClick={() => handleBookBikeAction(currentBike.slug)}
                  className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  <span>BOOK NOW</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT VERTICAL SELECTOR (EXACTLY 4 MOTORCYCLES WITH THUMBNAILS)          */}
          {/* ========================================================================= */}
          <div
            className="absolute right-6 sm:right-10 md:right-14 lg:right-16 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-end pointer-events-auto transition-opacity duration-300"
            style={{ opacity: showcaseUiOpacity }}
          >
            <div className="relative flex flex-col space-y-2.5 py-2 pr-4">
              {/* Thin Vertical Progress Line */}
              <div className="absolute right-[5px] top-4 bottom-4 w-[1.5px] bg-white/15 z-0" />

              {FOUR_SHOWCASE_BIKES.map((bike, idx) => {
                const isActive = activeBikeIndex === idx;
                return (
                  <div
                    key={bike.id}
                    onClick={() => handleSelectModel(idx)}
                    className={`relative z-10 flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-950/60 border border-[#0066FF] shadow-[0_0_16px_rgba(0,102,255,0.5)] text-white scale-105'
                        : 'hover:bg-white/5 border border-transparent text-gray-400 hover:text-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={bike.image}
                      alt={bike.name}
                      className="w-10 h-7 object-contain"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider min-w-[70px]">
                      {bike.name}
                    </span>

                    {/* Active Dot Node */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? 'bg-white border-[#0088FF] shadow-[0_0_8px_#00E5FF] scale-125'
                          : 'bg-[#06080C] border-white/30'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Scroll Indicator Below Selector */}
            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-white/50 pr-4">
              <Mouse className="w-3.5 h-3.5 text-white/60 animate-bounce" />
              <span>{activeBikeIndex === 3 ? 'SCROLL FOR CATALOG' : 'SCROLL TO EXPLORE'}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM HUD: PROGRESS COUNTER + TECHNICAL SPECIFICATIONS STRIP             */}
          {/* ========================================================================= */}
          <div
            className="absolute bottom-6 left-6 sm:left-10 md:left-14 lg:left-16 right-6 sm:right-10 md:right-14 lg:right-16 z-30 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pointer-events-auto transition-opacity duration-300"
            style={{ opacity: showcaseUiOpacity }}
          >
            {/* Counter and 4-Segment Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-black text-white tracking-widest">
                {currentBike.indexStr} <span className="text-white/40 font-medium">/ 04</span>
              </span>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === activeBikeIndex
                        ? 'w-8 bg-[#0088FF] shadow-[0_0_8px_#0088FF]'
                        : 'w-4 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Verified Project Technical Specifications Strip */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
              {currentBike.specs.map((spec, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xs sm:text-sm font-black text-white font-display">
                    {spec.value}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {spec.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PINNED TRANSITION OVERLAY: REVEALING CATALOG CARDS AS XSR LANDS            */}
          {/* (Fades in during scroll progress 0.82..0.98 as XSR flies into Card 4)     */}
          {/* ========================================================================= */}
          <div
            className="absolute inset-0 z-25 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none"
            style={{
              opacity: catalogPreviewOpacity,
              transform: `translateY(${(1 - catalogPreviewOpacity) * 30}px)`,
              transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
            }}
          >
            {/* Header matching Reference B */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00E5FF] mb-1">
                  EXPLORE THE RANGE
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight leading-none">
                  YAMAHA MOTORCYCLES
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Find the perfect Yamaha for your journey.
                </p>
              </div>
            </div>

            {/* 4 Cards Row matching Reference B */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {FOUR_SHOWCASE_BIKES.map((bike, idx) => {
                const isCard4Xsr = idx === 3;
                return (
                  <div
                    key={bike.id}
                    ref={isCard4Xsr ? card4TargetRef : undefined}
                    className="relative rounded-2xl bg-gradient-to-b from-[#0a1020]/90 to-[#050811]/95 border border-[#0055ff]/40 p-4 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden"
                  >
                    {/* Large Bike Image Container with Blue Floor Reflection */}
                    <div className="relative h-44 sm:h-48 w-full flex items-center justify-center overflow-hidden mb-3">
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-5 bg-[#0066FF]/25 rounded-full blur-md" />
                      {/* For Card 4 (XSR), this placeholder receives the flying XSR */}
                      <img
                        src={bike.image}
                        alt={bike.name}
                        className={`max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transition-opacity duration-300 ${
                          isCard4Xsr && scrollProgress < 0.96 ? 'opacity-0' : 'opacity-100'
                        }`}
                      />
                    </div>

                    {/* Content below Image */}
                    <div>
                      <h3 className="text-xl font-black text-white font-display leading-tight">
                        {bike.name}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3 font-medium">
                        {bike.catalogSubtitle}
                      </p>

                      <div className="mb-4">
                        <div className="text-xl font-black text-white font-display">
                          {bike.catalogPrice}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">
                          Ex-Showroom Price
                        </div>
                      </div>

                      {/* Stacked Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={onOpenVisitModal}
                          className="w-full py-2 px-3 rounded-xl border border-[#0066FF]/60 bg-[#0c1427]/60 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all pointer-events-auto"
                        >
                          <MapPin className="w-3 h-3 text-[#00E5FF]" />
                          <span>SHOWROOM VISIT</span>
                        </button>
                        <button
                          onClick={() => handleBookBikeAction(bike.slug)}
                          className="w-full py-2 px-3 rounded-xl bg-[#0066FF] text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all pointer-events-auto"
                        >
                          <Calendar className="w-3 h-3 text-white" />
                          <span>BOOK NOW</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMPLETE YAMAHA CATALOG SECTION (#catalog ANCHOR)                      */}
      {/* ========================================================================= */}
      <div id="catalog" className="relative py-20 bg-[#06080C] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Search and Sort (Matching Reference B) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00E5FF] mb-1">
                EXPLORE THE RANGE
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight leading-none">
                YAMAHA MOTORCYCLES
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Find the perfect Yamaha for your journey.
              </p>
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search motorcycles..."
                  className="pl-10 pr-4 py-2.5 rounded-full bg-[#0d1424]/90 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0066FF] w-full sm:w-64 transition-colors"
                />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#0d1424]/90 border border-white/10 text-xs text-white focus:outline-none focus:border-[#0066FF] appearance-none pr-9 cursor-pointer font-medium"
                >
                  <option value="featured" className="bg-[#0a0f18] text-white">Sort by: Popularity</option>
                  <option value="price_low" className="bg-[#0a0f18] text-white">Price: Low to High</option>
                  <option value="price_high" className="bg-[#0a0f18] text-white">Price: High to Low</option>
                </select>
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* THE 4 FEATURED CARDS (1:1 MATCHING REFERENCE B)                        */}
          {/* ======================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-16">
            {FOUR_SHOWCASE_BIKES.map((bike) => {
              const matchedBike = bikes.find((b) => b.slug === bike.slug);
              return (
                <div
                  key={bike.id}
                  className="group relative rounded-2xl bg-gradient-to-b from-[#0a1020]/90 to-[#050811]/95 border border-[#0055ff]/40 hover:border-[#0088ff] p-5 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_40px_rgba(0,102,255,0.25)] transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Large Bike Image Container with Showroom Blue Reflection */}
                  <div
                    onClick={() => matchedBike && onSelectBike(matchedBike)}
                    className="relative h-48 sm:h-52 w-full flex items-center justify-center overflow-hidden mb-3 cursor-pointer group-hover:scale-105 transition-transform duration-500"
                  >
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-[#0066FF]/25 rounded-full blur-md" />
                    <img
                      src={bike.image}
                      alt={bike.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
                    />
                  </div>

                  {/* Content Below Image */}
                  <div>
                    <h3 className="text-2xl font-black text-white font-display tracking-tight leading-none mb-1">
                      {bike.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-4 font-medium">
                      {bike.catalogSubtitle}
                    </p>

                    <div className="mb-5">
                      <div className="text-2xl font-black text-white font-display">
                        {bike.catalogPrice}
                      </div>
                      <div className="text-[11px] text-gray-400 uppercase font-semibold mt-0.5">
                        Ex-Showroom Price
                      </div>
                    </div>

                    {/* Stacked Action Buttons */}
                    <div className="space-y-2.5">
                      <button
                        onClick={onOpenVisitModal}
                        className="w-full py-2.5 rounded-xl border border-[#0066FF]/60 hover:border-[#00E5FF] bg-[#0c1427]/60 hover:bg-[#0066FF]/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>SHOWROOM VISIT</span>
                      </button>

                      <button
                        onClick={() => handleBookBikeAction(bike.slug)}
                        className="w-full py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-98"
                      >
                        <Calendar className="w-3.5 h-3.5 text-white" />
                        <span>BOOK NOW</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================================= */}
          {/* GLOWING DIVIDER: DISCOVER MORE AT HIRA AUTO AGENCY                     */}
          {/* ======================================================================= */}
          <div className="flex items-center justify-center gap-4 my-14">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#0066FF]/40 to-transparent" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">
              DISCOVER MORE AT HIRA AUTO AGENCY
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#0066FF]/40 to-transparent" />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-[#0066FF] text-white shadow-lg shadow-blue-600/40 scale-105'
                    : 'glass-card text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Complete Catalog Grid (All Models, Variants, Scooters, etc.) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBikes.map((bike) => {
              const minPrice = Math.min(...(bike.variants?.map((v) => v.ex_showroom_price) || [0]));
              const defaultVariant = bike.variants?.[0];

              return (
                <div
                  key={bike.id}
                  className="group rounded-2xl glass-card border border-white/10 overflow-hidden flex flex-col justify-between hover:border-[#0088ff]/40 transition-all duration-300 hover:-translate-y-1 shadow-xl"
                >
                  <div className="p-5 pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#00E5FF] text-[10px] font-bold uppercase tracking-wider">
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

                  {/* Image Stage */}
                  <div
                    onClick={() => onSelectBike(bike)}
                    className="relative h-52 w-full p-4 flex items-center justify-center cursor-pointer overflow-hidden group-hover:scale-105 transition-transform duration-500"
                  >
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-48 h-8 bg-[#0066FF]/20 rounded-full blur-xl pointer-events-none" />
                    <img
                      src={bike.image_url}
                      alt={bike.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  {/* Card Bottom: Variants, Price, CTAs */}
                  <div className="p-5 pt-3 bg-black/30 border-t border-white/5">
                    {/* Variants preview */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-medium">
                        <span>Available Variants:</span>
                        <span className="text-[#00E5FF] font-bold text-[10px]">Ex-Showroom</span>
                      </div>
                      <div className="space-y-1 max-h-20 overflow-y-auto pr-1 text-xs">
                        {bike.variants?.slice(0, 3).map((v) => (
                          <div key={v.id} className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-300 truncate max-w-[180px]">• {v.name}</span>
                            <span className="font-bold text-white font-display">
                              ₹{v.ex_showroom_price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
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
                        className="py-2 px-3 rounded-xl glass-panel hover:bg-white/10 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>Configure</span>
                      </button>

                      <button
                        onClick={() => defaultVariant && onOpenBookingModal(bike.id, defaultVariant.id)}
                        className="py-2 px-3 rounded-xl bg-[#0066FF] hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-transform active:scale-95"
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

          {/* Empty Search State */}
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
                className="mt-4 px-4 py-2 rounded-xl bg-[#0066FF] text-white text-xs font-bold uppercase"
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
      </div>
    </section>
  );
}

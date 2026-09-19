'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapPin, Calendar, Mouse, Search, SlidersHorizontal, Eye, ArrowRight, Check } from 'lucide-react';
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
}

// EXACT FOUR MOTORCYCLES (NO AEROX IN CINEMATIC SHOWCASE)
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

// VERIFIED CLIENT CATALOG DATA (ALL 7 MODELS & 23 VARIANTS WITH EXACT CLIENT PRICES)
const DEFAULT_CATALOG_BIKES: Bike[] = [
  {
    id: 'bike_r15',
    slug: 'yamaha-r15-v4',
    name: 'Yamaha R15 V4',
    category: 'R15',
    tagline: 'Born of Racing DNA',
    description: 'MotoGP inspired design. Pure adrenaline. Built for the streets.',
    engine_cc: '155 cc',
    max_power: '18.4 PS @ 10,000 RPM',
    max_torque: '14.2 Nm @ 7,500 RPM',
    fuel_capacity: '11 L',
    mileage: '45 kmpl',
    curb_weight: '141 kg',
    image_url: '/bikes/r15-v4-m-carbon.png',
    variants: [
      { id: 'var_r15_m_carbon', bike_id: 'bike_r15', name: 'R-15 V4 (M) Carbon', ex_showroom_price: 201340, color_name: 'Carbon Edition', color_hex: '#1C1D21', image_url: '/bikes/r15-v4-m-carbon.png', in_stock: 1 },
      { id: 'var_r15_m_silver', bike_id: 'bike_r15', name: 'R-15 (M) Silver', ex_showroom_price: 191130, color_name: 'Metallic Silver', color_hex: '#C0C0C0', image_url: '/bikes/r15-m-silver.png', in_stock: 1 },
      { id: 'var_r15_qs', bike_id: 'bike_r15', name: 'R-15 V4 (Quick Shifter)', ex_showroom_price: 180300, color_name: 'Racing Blue', color_hex: '#0020B2', image_url: '/bikes/r15-v4-quick-shifter.png', in_stock: 1 },
      { id: 'var_r15_std', bike_id: 'bike_r15', name: 'R15 V4', ex_showroom_price: 175650, color_name: 'Metallic Red', color_hex: '#D41427', image_url: '/bikes/r15-v4.png', in_stock: 1 },
      { id: 'var_r15_v3_s', bike_id: 'bike_r15', name: 'R-15 V3 (S)', ex_showroom_price: 159970, color_name: 'Matte Black', color_hex: '#222222', image_url: '/bikes/r15-v3-s.png', in_stock: 1 },
      { id: 'var_r15_monster', bike_id: 'bike_r15', name: 'R-15 V4 (Monster)', ex_showroom_price: 176850, color_name: 'Monster Energy Edition', color_hex: '#111111', image_url: '/bikes/r15-v4-monster.png', in_stock: 1 },
    ],
  },
  {
    id: 'bike_mt15',
    slug: 'yamaha-mt-15-v2',
    name: 'Yamaha MT-15 V2',
    category: 'MT',
    tagline: 'The Dark Side of Japan',
    description: 'Aggressive. Agile. Unstoppable. Built for those who break limits.',
    engine_cc: '155 cc',
    max_power: '18.4 PS @ 10,000 RPM',
    max_torque: '14.1 Nm @ 7,500 RPM',
    fuel_capacity: '10 L',
    mileage: '48 kmpl',
    curb_weight: '139 kg',
    image_url: '/bikes/mt-15-dlx-tft.png',
    variants: [
      { id: 'var_mt15_dlx_tft', bike_id: 'bike_mt15', name: 'MT-15 V2 (DLX TFT)', ex_showroom_price: 176930, color_name: 'Ice Fluo-Vermillion', color_hex: '#EAEAEA', image_url: '/bikes/mt-15-dlx-tft.png', in_stock: 1 },
      { id: 'var_mt15_std_black', bike_id: 'bike_mt15', name: 'MT-15 (STD) Black', ex_showroom_price: 166710, color_name: 'Metallic Black', color_hex: '#151515', image_url: '/bikes/mt-15-std-black.png', in_stock: 1 },
      { id: 'var_mt15_monster', bike_id: 'bike_mt15', name: 'MT-15 (Monster)', ex_showroom_price: 169110, color_name: 'Monster Energy MotoGP', color_hex: '#0A0E1A', image_url: '/bikes/mt-15-monster.png', in_stock: 1 },
      { id: 'var_mt15_std_cyan', bike_id: 'bike_mt15', name: 'MT-15 (STD) Cyan Blue', ex_showroom_price: 167610, color_name: 'Cyan Storm', color_hex: '#00E5FF', image_url: '/bikes/mt-15-cyan-blue.png', in_stock: 1 },
    ],
  },
  {
    id: 'bike_fzs',
    slug: 'yamaha-fzs-v4-hybrid',
    name: 'Yamaha FZ-S V4 Hybrid',
    category: 'FZ',
    tagline: 'Lord of the Streets',
    description: 'Refined performance. Unmatched style. Everyday thrill.',
    engine_cc: '149 cc',
    max_power: '12.4 PS @ 7,250 RPM',
    max_torque: '13.3 Nm @ 5,500 RPM',
    fuel_capacity: '13 L',
    mileage: '50 kmpl',
    curb_weight: '136 kg',
    image_url: '/bikes/fz-s-v4-hybrid.png',
    variants: [
      { id: 'var_fz_v3', bike_id: 'bike_fzs', name: 'F-Z V3', ex_showroom_price: 117560, color_name: 'Metallic Black', color_hex: '#1A1A1A', image_url: '/bikes/fz-v3.png', in_stock: 1 },
      { id: 'var_fz_rave', bike_id: 'bike_fzs', name: 'F-Z Rave', ex_showroom_price: 125880, color_name: 'Rave Matte Grey', color_hex: '#3E424B', image_url: '/bikes/fz-rave.png', in_stock: 1 },
      { id: 'var_fzs_v3_std', bike_id: 'bike_fzs', name: 'FZ-S V3 (STD)', ex_showroom_price: 131680, color_name: 'Matte Red', color_hex: '#B32428', image_url: '/bikes/fzs-v3-std.png', in_stock: 1 },
      { id: 'var_fzs_v4_hybrid', bike_id: 'bike_fzs', name: 'FZ-S V4 Hybrid', ex_showroom_price: 142000, color_name: 'Metallic Grey / Chrome', color_hex: '#646D7E', image_url: '/bikes/fz-s-v4-hybrid.png', in_stock: 1 },
    ],
  },
  {
    id: 'bike_xsr',
    slug: 'yamaha-xsr-155',
    name: 'Yamaha XSR 155',
    category: 'XSR',
    tagline: 'Pure Japanese Character',
    description: 'Timeless design. Modern performance. Born to be timeless.',
    engine_cc: '155 cc',
    max_power: '19.3 PS @ 10,000 RPM',
    max_torque: '14.7 Nm @ 8,500 RPM',
    fuel_capacity: '10.4 L',
    mileage: '46 kmpl',
    curb_weight: '134 kg',
    image_url: '/bikes/xsr-black.png',
    variants: [
      { id: 'var_xsr_black', bike_id: 'bike_xsr', name: 'XSR Black', ex_showroom_price: 163900, color_name: 'Heritage Black', color_hex: '#181818', image_url: '/bikes/xsr-black.png', in_stock: 1 },
      { id: 'var_xsr_silver', bike_id: 'bike_xsr', name: 'XSR Silver', ex_showroom_price: 161900, color_name: 'Timeless Silver', color_hex: '#D8D8D8', image_url: '/bikes/xsr-silver.png', in_stock: 1 },
      { id: 'var_xsr_red', bike_id: 'bike_xsr', name: 'XSR Red', ex_showroom_price: 157900, color_name: 'Vintage Red', color_hex: '#C82333', image_url: '/bikes/xsr-red.png', in_stock: 1 },
      { id: 'var_xsr_blue', bike_id: 'bike_xsr', name: 'XSR Blue', ex_showroom_price: 157090, color_name: 'Classic Blue', color_hex: '#0047AB', image_url: '/bikes/xsr-blue.png', in_stock: 1 },
      { id: 'var_xsr_green', bike_id: 'bike_xsr', name: 'XSR Green', ex_showroom_price: 163900, color_name: 'Military Green', color_hex: '#354B3E', image_url: '/bikes/xsr-green.png', in_stock: 1 },
    ],
  },
  {
    id: 'bike_rayzr',
    slug: 'yamaha-ray-zr-125',
    name: 'Yamaha Ray ZR 125 Fi',
    category: 'SCOOTERS',
    tagline: 'The Armoured Street Fighter',
    description: 'Tough, aggressive scooter styling with hybrid assist and ultra-light 99 kg kerb weight.',
    engine_cc: '125 cc',
    max_power: '8.2 PS @ 6,500 RPM',
    max_torque: '10.3 Nm @ 5,000 RPM',
    fuel_capacity: '5.2 L',
    mileage: '58 kmpl',
    curb_weight: '99 kg',
    image_url: '/bikes/ray-zr-drum.png',
    variants: [
      { id: 'var_rayzr_drum', bike_id: 'bike_rayzr', name: 'Ray ZR (Drum)', ex_showroom_price: 82880, color_name: 'Drum', color_hex: '#111111', image_url: '/bikes/ray-zr-drum.png', in_stock: 1 },
      { id: 'var_rayzr_rally', bike_id: 'bike_rayzr', name: 'Ray ZR (Street Rally)', ex_showroom_price: 96930, color_name: 'Street Rally', color_hex: '#A55D35', image_url: '/bikes/ray-zr-street-rally.png', in_stock: 1 },
    ],
  },
  {
    id: 'bike_fascino',
    slug: 'yamaha-fascino-125',
    name: 'Yamaha Fascino (Drum)',
    category: 'SCOOTERS',
    tagline: 'Classic European Elegance',
    description: 'Signature chrome accents, quiet start generator, and hybrid assist technology.',
    engine_cc: '125 cc',
    max_power: '8.2 PS @ 6,500 RPM',
    max_torque: '10.3 Nm @ 5,000 RPM',
    fuel_capacity: '5.2 L',
    mileage: '60 kmpl',
    curb_weight: '99 kg',
    image_url: '/bikes/fascino-drum.png',
    variants: [
      { id: 'var_fascino_drum', bike_id: 'bike_fascino', name: 'Fascino (Drum)', ex_showroom_price: 80980, color_name: 'Vivid Red', color_hex: '#D71920', image_url: '/bikes/fascino-drum.png', in_stock: 1 },
    ],
  },
  {
    id: 'bike_aerox',
    slug: 'yamaha-aerox-s',
    name: 'Yamaha Aerox S',
    category: 'SCOOTERS',
    tagline: 'The Maxi-Sports Scooter with Smart Key',
    description: 'Maxi-sports scooter with 155cc liquid-cooled VVA engine and Smart Key keyless system.',
    engine_cc: '155 cc',
    max_power: '15.0 PS @ 8,000 RPM',
    max_torque: '13.9 Nm @ 6,500 RPM',
    fuel_capacity: '5.5 L',
    mileage: '40 kmpl',
    curb_weight: '126 kg',
    image_url: '/bikes/aerox-s.png',
    variants: [
      { id: 'var_aerox_s', bike_id: 'bike_aerox', name: 'Aerox S', ex_showroom_price: 150350, color_name: 'Racing Blue', color_hex: '#0020B2', image_url: '/bikes/aerox-s.png', in_stock: 1 },
    ],
  },
];

export default function FeaturedSection({
  bikes = [],
  onSelectBike,
  onOpenBookingModal,
  onOpenVisitModal,
}: FeaturedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const card4TargetRef = useRef<HTMLDivElement>(null);

  // Normalized scroll progress across pinned showcase
  const [scrollProgress, setScrollProgress] = useState(0);

  // Real destination coordinates for XSR shared-element landing
  const [targetOffset, setTargetOffset] = useState({ dx: 0, dy: 0, scale: 0.44 });

  // Catalog search and filter state
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high'>('featured');

  // Preload all 4 PNGs on component mount
  useEffect(() => {
    FOUR_SHOWCASE_BIKES.forEach((b) => {
      const img = new Image();
      img.src = b.image;
    });
  }, []);

  // Update dynamic XSR landing target using getBoundingClientRect()
  const updateTargetGeometry = useCallback(() => {
    if (!card4TargetRef.current) return;
    const rect = card4TargetRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight * (isMobile ? 0.32 : 0.45);

    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    const dx = targetCenterX - viewportCenterX;
    const dy = targetCenterY - viewportCenterY;

    const showcaseHeight = Math.min(window.innerHeight * (isMobile ? 0.42 : 0.65), 480);
    const scale = Math.max(0.32, Math.min(0.58, rect.height / showcaseHeight));

    setTargetOffset({ dx, dy, scale });
  }, []);

  // Scroll Engine with single requestAnimationFrame loop
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

        if (progress >= 0.70) {
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

  // =========================================================================
  // 5-PHASE STATE MACHINE WITH GENEROUS SPACING & DEDICATED XSR HOLD
  // =========================================================================
  // Phase 1: 0.00 - 0.22 -> R15 V4 (State 01)
  // Phase 2: 0.22 - 0.44 -> MT-15 (State 02)
  // Phase 3: 0.44 - 0.66 -> FZ-S V4 HYBRID (State 03 - GUARANTEED DOMINANT)
  // Phase 4: 0.66 - 0.74 -> XSR entrance into dominance
  // Phase 5: 0.74 - 0.88 -> XSR HOLD PHASE (State 04 - CLEAR STABLE HOLD)
  // Phase 6: 0.88 - 1.00 -> XSR -> Catalog Card Transition
  const activeBikeIndex = useMemo(() => {
    if (scrollProgress >= 0.66) return 3; // XSR (Phases 4 & 5)
    if (scrollProgress >= 0.44) return 2; // FZ-S V4 (Phase 3)
    if (scrollProgress >= 0.22) return 1; // MT-15 (Phase 2)
    return 0; // R15 V4 (Phase 1)
  }, [scrollProgress]);

  const currentBike = FOUR_SHOWCASE_BIKES[activeBikeIndex];

  // XSR has physically landed in Card 4 once progress >= 0.98
  const isXsrLanded = scrollProgress >= 0.98;

  // Jump smoothly to a specific bike state via selector
  const handleSelectModel = (index: number) => {
    if (!containerRef.current) return;
    const totalDist = containerRef.current.offsetHeight - window.innerHeight;
    // Map index to generous centers: 0.10, 0.32, 0.54, 0.80 (XSR hold)
    const targetProgress = index === 3 ? 0.80 : index === 2 ? 0.54 : index === 1 ? 0.32 : 0.10;
    const targetScroll = containerRef.current.offsetTop + targetProgress * totalDist;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  // Open booking modal with pre-selected bike
  const handleBookBikeAction = (slugOrId: string) => {
    const found = bikes.find((b) => b.slug === slugOrId || b.id === slugOrId);
    if (found && found.variants?.[0]) {
      onOpenBookingModal(found.id, found.variants[0].id);
    } else {
      onOpenBookingModal(slugOrId);
    }
  };

  // Open visit modal
  const handleOpenVisitAction = (slugOrId: string) => {
    onOpenVisitModal();
  };

  // =========================================================================
  // GPU-OPTIMIZED TRANSFORM & OPACITY CALCULATIONS FOR 4 PERSISTENT PNGs
  // (NO DYNAMIC BLUR / NO DYNAMIC DROP-SHADOW TO GUARANTEE 60/120 FPS)
  // =========================================================================
  const getBikeLayerStyle = (index: number) => {
    const isTransitionPhase = scrollProgress >= 0.88;

    // Bike 3 (XSR) shared-element transition into Card 4
    if (index === 3) {
      if (isTransitionPhase) {
        // Transition progress 0..1 between 0.88 and 0.97
        const t = Math.max(0, Math.min(1, (scrollProgress - 0.88) / (0.97 - 0.88)));
        const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const currX = targetOffset.dx * easedT;
        const currY = targetOffset.dy * easedT;
        const currScale = 1.0 + (targetOffset.scale - 1.0) * easedT;

        // When landed (t >= 0.98), hide flying transition layer since card now reveals image
        if (isXsrLanded) {
          return {
            opacity: 0,
            transform: `translate3d(${targetOffset.dx}px, ${targetOffset.dy}px, 0) scale(${targetOffset.scale})`,
            pointerEvents: 'none' as const,
            zIndex: 50,
          };
        }

        return {
          opacity: 1,
          transform: `translate3d(${currX}px, ${currY}px, 0) scale(${currScale})`,
          zIndex: 50,
          pointerEvents: 'none' as const,
        };
      }
    }

    // In transition phase, non-XSR bikes fade away smoothly
    if (isTransitionPhase) {
      const fadeOut = Math.max(0, 1 - (scrollProgress - 0.88) / 0.04);
      return {
        opacity: fadeOut * 0.16,
        transform: `translate3d(${index === 0 ? -160 : index === 1 ? 140 : -120}px, 0, 0) scale(0.68)`,
        zIndex: 10,
        pointerEvents: 'none' as const,
      };
    }

    // Normal 4-bike showcase progression (progress 0.00..0.88)
    // Centers: R15=0.10, MT15=0.32, FZS=0.54, XSR=0.80
    const center = index === 3 ? 0.80 : index === 2 ? 0.54 : index === 1 ? 0.32 : 0.10;
    const diff = scrollProgress - center;

    // Active dominant bike
    if (Math.abs(diff) <= 0.08) {
      const sway = diff * 50;
      return {
        opacity: 1,
        transform: `translate3d(${sway}px, 0, 0) scale(1.0)`,
        zIndex: 30,
        pointerEvents: 'auto' as const,
      };
    }

    // Bike transitioning away (receding to ghost)
    if (diff > 0.08 && diff < 0.22) {
      const exitP = (diff - 0.08) / 0.14;
      return {
        opacity: 1.0 - exitP * 0.84, // down to 0.16
        transform: `translate3d(${-exitP * 140}px, 0, 0) scale(${1.0 - exitP * 0.30})`,
        zIndex: 20,
        pointerEvents: 'none' as const,
      };
    }

    // Bike transitioning in (coming forward into center)
    if (diff < -0.08 && diff > -0.22) {
      const enterP = (-diff - 0.08) / 0.14;
      return {
        opacity: 1.0 - enterP * 0.84, // down to 0.16
        transform: `translate3d(${enterP * 120}px, 0, 0) scale(${1.0 - enterP * 0.28})`,
        zIndex: 20,
        pointerEvents: 'none' as const,
      };
    }

    // Inactive ghost layers in showroom background depth behind active bike
    const ghostOffsets = [
      { x: -160, y: -15, scale: 0.68 },
      { x: 140, y: -10, scale: 0.70 },
      { x: -120, y: 12, scale: 0.69 },
      { x: 150, y: -15, scale: 0.68 },
    ];
    const offset = ghostOffsets[index];

    return {
      opacity: 0.16,
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${offset.scale})`,
      zIndex: 10,
      pointerEvents: 'none' as const,
    };
  };

  // Showcase UI HUD Opacity (fades out only after XSR hold completes at 0.88)
  const showcaseUiOpacity = Math.max(0, 1 - Math.max(0, scrollProgress - 0.88) / 0.04);

  // Catalog Preview Opacity (fades in as XSR flies into Card 4 slot)
  const catalogPreviewOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.90) / 0.07));

  // Filter & Sort for the full client catalog
  const filteredBikes = useMemo(() => {
    const sourceList = bikes && bikes.length > 0 ? bikes : DEFAULT_CATALOG_BIKES;
    let list = [...sourceList];
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
        const pA = Math.min(...(a.variants?.map((v) => v.ex_showroom_price) || [0]));
        const pB = Math.min(...(b.variants?.map((v) => v.ex_showroom_price) || [0]));
        return pA - pB;
      });
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => {
        const pA = Math.min(...(a.variants?.map((v) => v.ex_showroom_price) || [0]));
        const pB = Math.min(...(b.variants?.map((v) => v.ex_showroom_price) || [0]));
        return pB - pA;
      });
    }
    return list;
  }, [bikes, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="showcase-catalog-section" ref={containerRef} className="relative w-full bg-[#06080C] select-none">
      {/* ========================================================================= */}
      {/* 1. SCROLL-PINNED SHOWCASE VIEWPORT (800vh SCROLL DISTANCE)                */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[800vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#06080C] flex flex-col justify-between">
          {/* DARK CORNERS RADIAL VIGNETTE (Center: Bright Showroom / Corners: Deep Black) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,transparent_30%,rgba(6,8,14,0.65)_70%,rgba(2,3,6,0.98)_100%)] pointer-events-none z-10" />

          {/* BLUE ATMOSPHERIC ILLUMINATION */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,102,255,0.18)_0%,rgba(0,60,180,0.06)_50%,transparent_75%)] pointer-events-none z-0" />

          {/* ========================================================================= */}
          {/* FLOATING FLOOR GLOW & CONTACT SHADOW (Beneath dominant bike)              */}
          {/* ========================================================================= */}
          <div
            className="absolute bottom-[24%] md:bottom-[22%] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-300"
            style={{ opacity: showcaseUiOpacity }}
          >
            {/* Wide Elliptical Floor Glow */}
            <div className="w-[450px] sm:w-[700px] md:w-[880px] h-[70px] sm:h-[100px] bg-[radial-gradient(ellipse_at_center,rgba(0,140,255,0.45)_0%,rgba(0,70,220,0.15)_50%,transparent_75%)] rounded-[100%] blur-xl" />

            {/* Glowing Light Ring */}
            <div className="absolute w-[380px] sm:w-[580px] md:w-[740px] h-[50px] sm:h-[70px] rounded-[100%] border border-[#00A3FF]/40 shadow-[0_0_25px_rgba(0,163,255,0.35)]" />

            {/* Soft Tire Contact Shadow */}
            <div className="absolute w-[320px] sm:w-[500px] md:w-[620px] h-[25px] sm:h-[35px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.4)_50%,transparent_80%)] rounded-[100%] blur-sm" />
          </div>

          {/* ========================================================================= */}
          {/* FOUR PERSISTENT MOTORCYCLE PNG OBJECTS SIMULTANEOUSLY IN DOM              */}
          {/* (NO SRC SWAPPING • GPU TRANSFORM COMPOSITING • NO LAG)                    */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-4">
            {/* 1. R15 V4 */}
            <div
              className="bike-layer bike-r15 absolute inset-0 flex items-center justify-center will-change-transform"
              style={getBikeLayerStyle(0)}
            >
              <img
                src="/bikes/r15-v4.png"
                alt="Yamaha R15 V4"
                className="w-full max-w-4xl max-h-[56vh] sm:max-h-[66vh] md:max-h-[72vh] object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
              />
            </div>

            {/* 2. MT-15 V2 */}
            <div
              className="bike-layer bike-mt15 absolute inset-0 flex items-center justify-center will-change-transform"
              style={getBikeLayerStyle(1)}
            >
              <img
                src="/bikes/mt-15-v2.png"
                alt="Yamaha MT-15 V2"
                className="w-full max-w-4xl max-h-[56vh] sm:max-h-[66vh] md:max-h-[72vh] object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
              />
            </div>

            {/* 3. FZ-S V4 HYBRID (ACTUAL DOMINANT STATE 03) */}
            <div
              className="bike-layer bike-fzs absolute inset-0 flex items-center justify-center will-change-transform"
              style={getBikeLayerStyle(2)}
            >
              <img
                src="/bikes/fz-s-v4-hybrid.png"
                alt="Yamaha FZ-S V4 Hybrid"
                className="w-full max-w-4xl max-h-[56vh] sm:max-h-[66vh] md:max-h-[72vh] object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
              />
            </div>

            {/* 4. XSR (ACTUAL DOMINANT STATE 04 + DEDICATED HOLD + SHARED-ELEMENT FLIGHT) */}
            <div
              className="bike-layer bike-xsr absolute inset-0 flex items-center justify-center will-change-transform"
              style={getBikeLayerStyle(3)}
            >
              <img
                src="/bikes/xsr.png"
                alt="Yamaha XSR"
                className="w-full max-w-4xl max-h-[56vh] sm:max-h-[66vh] md:max-h-[72vh] object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DESKTOP LEFT CONTENT HUD (1:1 MATCHING STORYBOARD)                        */}
          {/* ========================================================================= */}
          <div
            className="hidden md:flex absolute left-8 sm:left-12 lg:left-16 top-1/2 -translate-y-1/2 z-30 items-start pointer-events-auto transition-opacity duration-300"
            style={{ opacity: showcaseUiOpacity }}
          >
            <div className="max-w-xs sm:max-w-sm md:max-w-md">
              {/* Category Tag */}
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00E5FF] mb-1">
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
              <div className="flex flex-row items-center gap-2.5">
                <button
                  onClick={() => handleOpenVisitAction(currentBike.slug)}
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
          {/* DESKTOP RIGHT VERTICAL SELECTOR (EXACTLY 4 MOTORCYCLES WITH THUMBNAILS)   */}
          {/* ========================================================================= */}
          <div
            className="hidden md:flex absolute right-8 sm:right-12 lg:right-16 top-1/2 -translate-y-1/2 z-30 flex-col items-end pointer-events-auto transition-opacity duration-300"
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
          {/* DESKTOP BOTTOM HUD: PROGRESS COUNTER + TECHNICAL SPECIFICATIONS STRIP     */}
          {/* ========================================================================= */}
          <div
            className="hidden md:flex absolute bottom-6 left-8 sm:left-12 lg:left-16 right-8 sm:right-12 lg:right-16 z-30 items-end justify-between gap-4 pointer-events-auto transition-opacity duration-300"
            style={{ opacity: showcaseUiOpacity }}
          >
            {/* Counter and 4-Segment Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-white tracking-widest">
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

            {/* Verified Technical Specifications Strip */}
            <div className="flex items-center gap-6 lg:gap-8 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10">
              {currentBike.specs.map((spec, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-sm font-black text-white font-display">
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
          {/* DEDICATED MOBILE SECTION 2 COMPOSITION (NO TEXT/BIKE OVERLAP)             */}
          {/* ========================================================================= */}
          <div
            className="md:hidden flex flex-col justify-between h-full w-full pt-16 pb-4 px-4 pointer-events-auto z-30 transition-opacity duration-300"
            style={{ opacity: showcaseUiOpacity }}
          >
            {/* Top Compact Horizontal Selector */}
            <div className="flex items-center justify-center gap-2 py-1.5 z-30">
              {FOUR_SHOWCASE_BIKES.map((bike, idx) => (
                <button
                  key={bike.id}
                  onClick={() => handleSelectModel(idx)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeBikeIndex === idx
                      ? 'bg-[#0088FF] text-white shadow-md shadow-blue-600/40 scale-105'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {bike.namePrefix}
                </button>
              ))}
            </div>

            {/* Middle Spacer for Floating Motorcycle */}
            <div className="h-[36vh] w-full pointer-events-none" />

            {/* Dedicated Mobile Text & Actions Area (Strictly Below Motorcycle) */}
            <div className="flex flex-col justify-end bg-black/60 backdrop-blur-sm p-4 rounded-2xl border border-white/10 z-30">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#00E5FF] mb-0.5">
                {currentBike.category}
              </p>
              <h2 className="text-2xl font-black text-white font-display leading-tight">
                {currentBike.name}
              </h2>
              <p className="text-[11px] font-extrabold uppercase text-white/90 tracking-wider mt-0.5">
                {currentBike.subtitle}
              </p>
              <p className="text-xs text-white/70 line-clamp-2 mt-1 leading-relaxed">
                {currentBike.description}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => handleOpenVisitAction(currentBike.slug)}
                  className="py-2 px-2 rounded-xl border border-[#0066FF]/60 bg-black/40 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3 h-3 text-[#00E5FF]" />
                  <span>SHOWROOM VISIT</span>
                </button>
                <button
                  onClick={() => handleBookBikeAction(currentBike.slug)}
                  className="py-2 px-2 rounded-xl bg-[#0066FF] text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Calendar className="w-3 h-3 text-white" />
                  <span>BOOK NOW</span>
                </button>
              </div>

              {/* Mobile Bottom Status Bar */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-[10px] font-bold text-white/80">
                <div className="flex items-center gap-2">
                  <span>{currentBike.indexStr} / 04</span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-1 rounded-full ${
                          step === activeBikeIndex ? 'w-4 bg-[#0088FF]' : 'w-2 bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-gray-300">
                  {currentBike.specs[0].value} • {currentBike.specs[1].value}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PINNED TRANSITION OVERLAY: REVEALING CATALOG CARDS AS XSR FLIES IN         */}
          {/* (Fades in during scroll progress 0.90..0.98. Card 4 image slot is EMPTY!)  */}
          {/* ========================================================================= */}
          <div
            className="absolute inset-0 z-25 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none"
            style={{
              opacity: catalogPreviewOpacity,
              transform: `translateY(${(1 - catalogPreviewOpacity) * 25}px)`,
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
              {FOUR_SHOWCASE_BIKES.map((bike, idx) => {
                const isCard4Xsr = idx === 3;
                return (
                  <div
                    key={bike.id}
                    className="relative rounded-2xl bg-gradient-to-b from-[#0a1020]/90 to-[#050811]/95 border border-[#0055ff]/40 p-3 sm:p-4 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden"
                  >
                    {/* Large Bike Image Container with Blue Floor Reflection */}
                    <div
                      ref={isCard4Xsr ? card4TargetRef : undefined}
                      className="relative h-28 sm:h-44 md:h-48 w-full flex items-center justify-center overflow-hidden mb-2 sm:mb-3"
                    >
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-4 sm:h-5 bg-[#0066FF]/25 rounded-full blur-md" />

                      {/* CRITICAL: Card 4 Image Slot is COMPLETELY EMPTY before XSR lands! */}
                      {isCard4Xsr ? (
                        <img
                          src={bike.image}
                          alt={bike.name}
                          className={`max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transition-opacity duration-300 ${
                            isXsrLanded ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      ) : (
                        <img
                          src={bike.image}
                          alt={bike.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] opacity-100"
                        />
                      )}
                    </div>

                    {/* Content below Image */}
                    <div>
                      <h3 className="text-sm sm:text-xl font-black text-white font-display leading-tight">
                        {bike.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-400 mb-2 sm:mb-3 font-medium truncate">
                        {bike.catalogSubtitle}
                      </p>

                      <div className="mb-2 sm:mb-4">
                        <div className="text-sm sm:text-xl font-black text-white font-display">
                          {bike.catalogPrice}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold">
                          Ex-Showroom Price
                        </div>
                      </div>

                      {/* Stacked Action Buttons (Inactive until XSR lands) */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <button
                          onClick={() => isXsrLanded && handleOpenVisitAction(bike.slug)}
                          className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl border border-[#0066FF]/60 bg-[#0c1427]/60 text-white font-bold text-[9px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                            isXsrLanded ? 'pointer-events-auto cursor-pointer hover:bg-[#0066FF]/20' : 'pointer-events-none opacity-50'
                          }`}
                        >
                          <MapPin className="w-3 h-3 text-[#00E5FF]" />
                          <span>SHOWROOM VISIT</span>
                        </button>
                        <button
                          onClick={() => isXsrLanded && handleBookBikeAction(bike.slug)}
                          className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl bg-[#0066FF] text-white font-bold text-[9px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all ${
                            isXsrLanded ? 'pointer-events-auto cursor-pointer hover:bg-[#0052cc]' : 'pointer-events-none opacity-50'
                          }`}
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
      {/* 2. ONE COMPLETE YAMAHA CATALOG SECTION (#catalog ANCHOR)                  */}
      {/* ========================================================================= */}
      <div id="catalog" className="relative py-20 bg-[#06080C] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Search and Sort (Matching Reference B) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00E5FF] mb-1">
                EXPLORE THE RANGE
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight leading-none">
                YAMAHA MOTORCYCLES
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Find the perfect Yamaha for your journey. Official Mohanpur lineup.
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

          {/* Category Filter Pills (Directly below header) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-[#0066FF] text-white shadow-lg shadow-blue-600/40 scale-105'
                    : 'glass-card text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ONE Complete Catalog Grid (All Models, Variants, Scooters from verified database) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBikes.map((bike) => {
              const minPrice = Math.min(...(bike.variants?.map((v) => v.ex_showroom_price) || [0]));
              const defaultVariant = bike.variants?.[0];

              return (
                <div
                  key={bike.id}
                  className="group rounded-2xl bg-gradient-to-b from-[#0a1020]/90 to-[#050811]/95 border border-[#0055ff]/35 hover:border-[#0088ff] p-5 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_40px_rgba(0,102,255,0.25)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#00E5FF] text-[10px] font-bold uppercase tracking-wider">
                        {bike.category}
                      </span>
                      <button
                        onClick={() => onSelectBike(bike)}
                        className="text-[11px] text-[#00E5FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{bike.variants?.length || 1} Colors</span>
                      </button>
                    </div>

                    {/* 1. LARGE IMAGE (Click opens Color Configurator) */}
                    <div
                      onClick={() => onSelectBike(bike)}
                      className="relative h-48 sm:h-52 w-full flex items-center justify-center overflow-hidden mb-3 cursor-pointer group-hover:scale-105 transition-transform duration-500"
                    >
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-[#0066FF]/25 rounded-full blur-md" />
                      <img
                        src={bike.image_url}
                        alt={bike.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
                      />
                    </div>

                    {/* 2. MODEL */}
                    <h3
                      onClick={() => onSelectBike(bike)}
                      className="text-xl sm:text-2xl font-black text-white font-display tracking-tight leading-none mb-1 cursor-pointer hover:text-[#00E5FF] transition-colors"
                    >
                      {bike.name}
                    </h3>

                    {/* 3. VARIANT/DESCRIPTION */}
                    <p className="text-xs text-gray-400 mb-3 font-medium line-clamp-2">
                      {bike.tagline || bike.description}
                    </p>

                    {/* Color Swatches Preview */}
                    {bike.variants && bike.variants.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-3">
                        {bike.variants.slice(0, 5).map((v) => (
                          <span
                            key={v.id}
                            className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
                            style={{ backgroundColor: v.color_hex || '#0066FF' }}
                            title={v.color_name}
                          />
                        ))}
                        {bike.variants.length > 5 && (
                          <span className="text-[10px] text-gray-400 font-bold ml-1">
                            +{bike.variants.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    {/* 4. PRICE & 5. EX-SHOWROOM PRICE (Strictly Below Image) */}
                    <div className="mb-4 pt-3 border-t border-white/10">
                      <div className="text-2xl font-black text-white font-display">
                        ₹{minPrice.toLocaleString('en-IN')}*
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">
                        Ex-Showroom Price
                      </div>
                    </div>

                    {/* 6. SHOWROOM VISIT & 7. BOOK NOW */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleOpenVisitAction(bike.slug || bike.id)}
                        className="w-full py-2.5 rounded-xl border border-[#0066FF]/60 hover:border-[#00E5FF] bg-[#0c1427]/60 hover:bg-[#0066FF]/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>SHOWROOM VISIT</span>
                      </button>

                      <button
                        onClick={() => handleBookBikeAction(bike.slug || bike.id)}
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
                className="mt-4 px-4 py-2 rounded-xl bg-[#0066FF] text-white text-xs font-bold uppercase cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Mandatory Ex-Showroom Disclaimer Notice */}
          <div className="mt-12 p-4 rounded-xl glass-panel border border-white/10 text-center">
            <p className="text-xs text-gray-400">
              <strong className="text-white">Price Policy:</strong> All listed prices are official Ex-Showroom Mohanpur. On-road price will vary based on location, statutory registration, compulsory third-party insurance, road taxes, and applicable local charges. Zero hidden fees at Hira Auto Agency.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

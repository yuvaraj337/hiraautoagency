'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown, Calendar, ArrowRight, ShieldCheck, Wrench, Award } from 'lucide-react';

interface HeroSectionProps {
  onOpenVisitModal: () => void;
  onExploreBikes: () => void;
}

const TOTAL_FRAMES = 240;

export default function HeroSection({ onOpenVisitModal, onExploreBikes }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [framesLoadedCount, setFramesLoadedCount] = useState(0);
  const [isInitialFrameReady, setIsInitialFrameReady] = useState(false);

  // Cached frame images
  const framesCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameIndexRef = useRef<number>(0);
  const isRenderingRef = useRef(false);

  // Format frame filename
  const getFramePath = useCallback((index: number, mobile: boolean) => {
    const frameNum = String(index + 1).padStart(6, '0');
    const folder = mobile ? 'hero-mobile' : 'hero-desktop';
    return `/frames/${folder}/frame_${frameNum}.jpg`;
  }, []);

  // Detect mobile vs desktop
  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
        // Clear cache on device switch so correct aspect frames are cached
        framesCache.current.clear();
        setFramesLoadedCount(0);
      }
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [isMobile]);

  // Progressive Preloading Engine
  useEffect(() => {
    let isMounted = true;
    const cache = framesCache.current;

    // 1. Immediately load frame 0 (First Frame)
    const firstImg = new Image();
    firstImg.src = getFramePath(0, isMobile);
    firstImg.onload = () => {
      if (!isMounted) return;
      cache.set(0, firstImg);
      setIsInitialFrameReady(true);
      renderFrame(0);
    };

    // 2. Load keyframes (every 4th frame) for responsive scrubbing
    const loadKeyframes = async () => {
      for (let i = 4; i < TOTAL_FRAMES; i += 4) {
        if (!isMounted) return;
        if (!cache.has(i)) {
          const img = new Image();
          img.src = getFramePath(i, isMobile);
          img.onload = () => {
            if (isMounted) {
              cache.set(i, img);
              setFramesLoadedCount((prev) => prev + 1);
            }
          };
        }
      }
    };

    // 3. Fill in intermediate frames asynchronously
    const loadAllRemainingFrames = async () => {
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        if (!isMounted) return;
        if (!cache.has(i)) {
          const img = new Image();
          img.src = getFramePath(i, isMobile);
          img.onload = () => {
            if (isMounted) {
              cache.set(i, img);
              setFramesLoadedCount((prev) => prev + 1);
            }
          };
          // Short pause every 15 frames to prevent network starvation
          if (i % 15 === 0) {
            await new Promise((r) => setTimeout(r, 20));
          }
        }
      }
    };

    loadKeyframes().then(loadAllRemainingFrames);

    return () => {
      isMounted = false;
    };
  }, [isMobile, getFramePath]);

  // Render Frame onto Canvas with faithful aspect ratio
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find closest loaded frame if current isn't yet ready
    let img = framesCache.current.get(frameIndex);
    if (!img || !img.complete) {
      for (let offset = 1; offset < 20; offset++) {
        const lower = framesCache.current.get(Math.max(0, frameIndex - offset));
        if (lower && lower.complete) {
          img = lower;
          break;
        }
        const higher = framesCache.current.get(Math.min(TOTAL_FRAMES - 1, frameIndex + offset));
        if (higher && higher.complete) {
          img = higher;
          break;
        }
      }
    }

    if (!img || !img.complete) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw image maintaining cover aspect ratio without clipping sky
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;

    let drawW = width;
    let drawH = height;
    let drawX = 0;
    let drawY = 0;

    if (canvasAspect > imgAspect) {
      drawW = width;
      drawH = width / imgAspect;
      drawY = (height - drawH) / 2;
    } else {
      drawH = height;
      drawW = height * imgAspect;
      drawX = (width - drawW) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    currentFrameIndexRef.current = frameIndex;
  }, []);

  // Handle Resize of Canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(currentFrameIndexRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame]);

  // Scroll Engine: Map Scroll Progress to Frame Index
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollDistance = containerRef.current.offsetHeight - window.innerHeight;

      if (totalScrollDistance <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollDistance));

      setScrollProgress(rawProgress);

      const targetFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(rawProgress * (TOTAL_FRAMES - 1))));

      if (!isRenderingRef.current) {
        isRenderingRef.current = true;
        requestAnimationFrame(() => {
          renderFrame(targetFrame);
          isRenderingRef.current = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [renderFrame]);

  return (
    <section ref={containerRef} className="relative h-[380vh] w-full bg-black">
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Canvas Frame Renderer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Ambient Top Vignette to guarantee Navbar readability over changing sky */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Ambient Bottom Vignette for text clarity and ground integration */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />

        {/* HERO TEXT STATE 1 (Progress 0.00 - 0.32) */}
        <div
          className={`absolute left-6 md:left-16 bottom-24 md:bottom-28 z-20 max-w-xl transition-all duration-500 pointer-events-none ${
            scrollProgress < 0.32
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-3 text-yamaha-cyan text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-yamaha-cyan animate-ping" />
            Yamaha Showroom • Mahagama
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none font-display">
            READY <br />
            <span className="text-gradient-yamaha">TO RIDE</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-300 font-medium max-w-md">
            Step into the world of pure Yamaha performance at Hira Auto Agency.
          </p>
        </div>

        {/* HERO TEXT STATE 2 (Progress 0.36 - 0.66) */}
        <div
          className={`absolute left-6 md:left-16 bottom-24 md:bottom-28 z-20 max-w-xl transition-all duration-500 pointer-events-none ${
            scrollProgress >= 0.35 && scrollProgress < 0.68
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-3 text-yamaha-cyan text-xs font-bold uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" />
            Engineered in Japan
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none font-display">
            FEEL <br />
            <span className="text-gradient-yamaha">THE RIDE</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-300 font-medium max-w-md">
            Unrivaled MotoGP DNA, cutting-edge VVA performance and street dominance.
          </p>
        </div>

        {/* HERO TEXT STATE 3 (Progress 0.70 - 1.00) */}
        <div
          className={`absolute left-6 md:left-16 bottom-24 md:bottom-28 z-20 max-w-xl transition-all duration-500 ${
            scrollProgress >= 0.68
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-3 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Authorized Yamaha Dealership
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none font-display">
            YOUR RIDE <br />
            <span className="text-gradient-yamaha">STARTS HERE</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-300 font-medium max-w-md">
            Discover Yamaha motorcycles and scooters at Hira Auto Agency, Mahagama, Godda.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreBikes}
              className="px-6 py-3 rounded-full bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-yamaha-blue/40 focus:outline-none"
            >
              <span>EXPLORE BIKES</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenVisitModal}
              className="px-6 py-3 rounded-full glass-panel hover:bg-white/10 text-white font-bold text-xs md:text-sm uppercase tracking-wider flex items-center gap-2 transition-all focus:outline-none"
            >
              <Calendar className="w-4 h-4 text-yamaha-cyan" />
              <span>BOOK A SHOWROOM VISIT</span>
            </button>
          </div>
        </div>

        {/* FLOATING STATS / BADGES PILLS (Right Side - Matching Reference Video) */}
        <div className="hidden lg:flex flex-col gap-2.5 absolute right-12 bottom-28 z-20 pointer-events-none">
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-yamaha-racing/30 border border-yamaha-cyan/30 flex items-center justify-center text-yamaha-cyan">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Authorized Dealer</p>
              <p className="text-xs font-bold text-white">100% Genuine Yamaha</p>
            </div>
          </div>

          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Certified Support</p>
              <p className="text-xs font-bold text-white">Factory Trained Techs</p>
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR (Visible in State 1 & 2) */}
        {scrollProgress < 0.7 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none animate-bounce">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">
              Scroll To Enter Showroom
            </span>
            <ChevronDown className="w-4 h-4 text-yamaha-cyan" />
          </div>
        )}

        {/* BOTTOM MARQUEE TICKER (Matching Reference Video Frame) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/90 border-t border-white/10 py-1.5 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            <div className="flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-gray-300 px-4">
              <span className="text-yamaha-cyan">★ HIRA AUTO AGENCY MAHAGAMA</span>
              <span>• OFFICIAL YAMAHA DEALERSHIP</span>
              <span className="text-emerald-400">• FESTIVE EXCHANGE BONUS UP TO ₹5,000</span>
              <span>• R15 V4 & MT-15 READY STOCK</span>
              <span className="text-amber-400">• LOW DOWN PAYMENT FINANCE SCHEMES</span>
              <span>• 100% GENUINE YAMAHA SPARES & ACCESSORIES</span>
              <span className="text-yamaha-cyan">• KECHUA CHOWK, MAHAGAMA MAIN ROAD</span>
            </div>
            <div className="flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-gray-300 px-4" aria-hidden="true">
              <span className="text-yamaha-cyan">★ HIRA AUTO AGENCY MAHAGAMA</span>
              <span>• OFFICIAL YAMAHA DEALERSHIP</span>
              <span className="text-emerald-400">• FESTIVE EXCHANGE BONUS UP TO ₹5,000</span>
              <span>• R15 V4 & MT-15 READY STOCK</span>
              <span className="text-amber-400">• LOW DOWN PAYMENT FINANCE SCHEMES</span>
              <span>• 100% GENUINE YAMAHA SPARES & ACCESSORIES</span>
              <span className="text-yamaha-cyan">• KECHUA CHOWK, MAHAGAMA MAIN ROAD</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

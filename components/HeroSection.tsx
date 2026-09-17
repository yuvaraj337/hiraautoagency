'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

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

  // Calculate smooth cinematic opacity curves for the 3 text states
  // State 1: 0.00 -> 0.33
  const state1Opacity =
    scrollProgress < 0.25
      ? 1
      : scrollProgress > 0.33
      ? 0
      : 1 - (scrollProgress - 0.25) / (0.33 - 0.25);

  // State 2: 0.34 -> 0.66
  const state2Opacity =
    scrollProgress < 0.32 || scrollProgress > 0.67
      ? 0
      : scrollProgress < 0.40
      ? (scrollProgress - 0.32) / (0.40 - 0.32)
      : scrollProgress > 0.59
      ? 1 - (scrollProgress - 0.59) / (0.67 - 0.59)
      : 1;

  // State 3: 0.68 -> 1.00
  const state3Opacity =
    scrollProgress < 0.66
      ? 0
      : scrollProgress < 0.74
      ? (scrollProgress - 0.66) / (0.74 - 0.66)
      : 1;

  return (
    <section ref={containerRef} className="relative h-[380vh] w-full bg-black">
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Canvas Frame Renderer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Subtle Ambient Top Vignette to preserve Navbar legibility */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/75 via-black/25 to-transparent pointer-events-none z-10" />

        {/* Subtle Ambient Bottom Vignette for scene grounding */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none z-10" />

        {/* ========================================================================= */}
        {/* COMPACT CINEMATIC HERO TEXT OVERLAY (MATCHING REFERENCE POSITION & SCALE) */}
        {/* Normalized Placement: Horizontally 60-75% of viewport, Vertically 55-70% */}
        {/* ========================================================================= */}
        <div className="absolute left-[8%] sm:left-[12%] md:left-[62%] lg:left-[64%] top-[60%] sm:top-[62%] md:top-[58%] lg:top-[60%] -translate-y-1/2 z-20 pointer-events-none select-none max-w-[280px] sm:max-w-[320px]">
          {/* STATE 1: READY / TO RIDE */}
          <div
            className="transition-opacity duration-300 ease-out"
            style={{
              opacity: state1Opacity,
              transform: `translateY(${(1 - state1Opacity) * 5}px)`,
              display: state1Opacity <= 0.01 ? 'none' : 'block',
            }}
          >
            <h1 className="font-automotive text-3xl sm:text-4xl md:text-[2.25rem] lg:text-[2.5rem] font-black uppercase text-white leading-[0.9] tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              READY<br />
              TO RIDE
            </h1>
            <p className="mt-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/55 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              Scroll to enter showroom
            </p>
          </div>

          {/* STATE 2: FEEL / THE RIDE */}
          <div
            className="transition-opacity duration-300 ease-out"
            style={{
              opacity: state2Opacity,
              transform: `translateY(${(1 - state2Opacity) * 5}px)`,
              display: state2Opacity <= 0.01 ? 'none' : 'block',
            }}
          >
            <h2 className="font-automotive text-3xl sm:text-4xl md:text-[2.25rem] lg:text-[2.5rem] font-black uppercase text-white leading-[0.9] tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              FEEL<br />
              THE RIDE
            </h2>
            <p className="mt-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/55 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              Pure Yamaha MotoGP DNA
            </p>
          </div>

          {/* STATE 3: YOUR RIDE / STARTS HERE */}
          <div
            className="transition-opacity duration-300 ease-out"
            style={{
              opacity: state3Opacity,
              transform: `translateY(${(1 - state3Opacity) * 5}px)`,
              display: state3Opacity <= 0.01 ? 'none' : 'block',
              pointerEvents: state3Opacity > 0.5 ? 'auto' : 'none',
            }}
          >
            <h2 className="font-automotive text-3xl sm:text-4xl md:text-[2.25rem] lg:text-[2.5rem] font-black uppercase text-white leading-[0.9] tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              YOUR RIDE<br />
              STARTS HERE
            </h2>
            <p className="mt-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/55 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              Hira Auto Agency • Mahagama
            </p>
            <div className="mt-3.5 flex items-center gap-3">
              <button
                onClick={onExploreBikes}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/90 hover:text-white border-b border-white/30 hover:border-yamaha-cyan pb-0.5 transition-colors cursor-pointer"
              >
                <span>Explore Models</span>
                <ArrowRight className="w-3 h-3 text-yamaha-cyan" />
              </button>
            </div>
          </div>
        </div>

        {/* SUBTLE STAT PILLS (Bottom Right - Matching Reference Video Frames) */}
        <div className="hidden lg:flex items-center gap-2 absolute right-8 bottom-6 z-20 pointer-events-none opacity-70">
          <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-white/70">
            <span className="text-yamaha-cyan font-black mr-1">100%</span> Genuine Yamaha
          </div>
          <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-white/70">
            <span className="text-emerald-400 font-black mr-1">Authorized</span> Mahagama
          </div>
        </div>

        {/* MINIMAL SUBTLE SCROLL CUE (Active in State 1 & 2) */}
        {scrollProgress < 0.65 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none opacity-50 transition-opacity">
            <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-white/60 mb-0.5">
              Scroll
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white/60 animate-bounce" />
          </div>
        )}

        {/* ULTRA-SLIM CINEMATIC TICKER (Bottom Edge - Matching Reference Video) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/85 border-t border-white/5 py-1 overflow-hidden pointer-events-none">
          <div className="flex whitespace-nowrap animate-marquee text-[10px] font-semibold tracking-widest uppercase text-white/40">
            <div className="flex items-center gap-8 px-4">
              <span>★ HIRA AUTO AGENCY MAHAGAMA</span>
              <span>• OFFICIAL YAMAHA DEALERSHIP</span>
              <span>• R15 V4 & MT-15 READY STOCK</span>
              <span>• FESTIVE EXCHANGE BONUS AVAILABLE</span>
              <span>• KECHUA CHOWK, MAHAGAMA MAIN ROAD, GODDA</span>
            </div>
            <div className="flex items-center gap-8 px-4" aria-hidden="true">
              <span>★ HIRA AUTO AGENCY MAHAGAMA</span>
              <span>• OFFICIAL YAMAHA DEALERSHIP</span>
              <span>• R15 V4 & MT-15 READY STOCK</span>
              <span>• FESTIVE EXCHANGE BONUS AVAILABLE</span>
              <span>• KECHUA CHOWK, MAHAGAMA MAIN ROAD, GODDA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

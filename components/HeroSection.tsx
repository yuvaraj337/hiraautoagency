'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

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

  // Navigation click handler to smoothly scroll to any hero state
  const handleScrollToStage = useCallback((targetStage: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const totalDistance = containerRef.current.offsetHeight - window.innerHeight;
    let targetProgress = 0;
    if (targetStage === 1) targetProgress = 0;
    else if (targetStage === 2) targetProgress = 0.52;
    else if (targetStage === 3) targetProgress = 0.88;

    window.scrollTo({
      top: containerTop + targetProgress * totalDistance,
      behavior: 'smooth',
    });
  }, []);

  // Smooth cinematic transitions for the 3 Reference Hero States:
  // State 1 (0.00 - 0.35): Exterior View -> "READY TO RIDE?" (Reference Image 1)
  // State 2 (0.35 - 0.72): Inside Showroom -> "FEEL THE RIDE" (Reference Image 2)
  // State 3 (0.72 - 1.00): At Reception -> "YOUR RIDE STARTS HERE" (Reference Image 3)

  const state1Opacity =
    scrollProgress < 0.28
      ? 1
      : scrollProgress > 0.36
      ? 0
      : 1 - (scrollProgress - 0.28) / (0.36 - 0.28);

  const state2Opacity =
    scrollProgress < 0.30 || scrollProgress > 0.74
      ? 0
      : scrollProgress < 0.38
      ? (scrollProgress - 0.30) / (0.38 - 0.30)
      : scrollProgress > 0.66
      ? 1 - (scrollProgress - 0.66) / (0.74 - 0.66)
      : 1;

  const state3Opacity =
    scrollProgress < 0.68
      ? 0
      : scrollProgress < 0.76
      ? (scrollProgress - 0.68) / (0.76 - 0.68)
      : 1;

  return (
    <section ref={containerRef} className="relative h-[380vh] w-full bg-black">
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Canvas Frame Renderer (Preserved 100%) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Ambient Top Vignette for Navbar Integration */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

        {/* Ambient Bottom Vignette for Grounding */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none z-10" />

        {/* ========================================================================= */}
        {/* STATE 1: EXTERIOR VIEW — "READY TO RIDE?" (1:1 REFERENCE IMAGE 1)         */}
        {/* ========================================================================= */}
        <div
          className="absolute inset-0 z-20 pointer-events-none select-none transition-opacity duration-300 ease-out"
          style={{
            opacity: state1Opacity,
            display: state1Opacity <= 0.005 ? 'none' : 'block',
          }}
        >
          {/* Main Title Block — Upper Screen Placement in Dark Sky */}
          <div
            className="absolute left-1/2 top-[20%] sm:top-[22%] md:top-[24%] -translate-x-1/2 text-center w-full max-w-4xl px-4"
            style={{ transform: `translate(-50%, ${(1 - state1Opacity) * -15}px)` }}
          >
            {/* Small Eyebrow Label */}
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/80 mb-2 sm:mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              WELCOME TO HIRA AUTO AGENCY
            </p>

            {/* Giant Slanted Headline */}
            <h1 className="font-hero-headline text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-[-0.015em] leading-[0.95] mb-3 sm:mb-4">
              <span className="hero-text-metallic-white">READY TO </span>
              <span className="hero-text-electric-blue hero-text-glow-blue">RIDE?</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm md:text-base font-normal text-white/75 max-w-lg mx-auto leading-relaxed mb-4 sm:mb-5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              Discover Yamaha&apos;s world of performance, innovation<br className="hidden sm:block" />
              {' '}and limitless adventure.
            </p>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <span className="w-12 sm:w-20 h-[1.5px] bg-gradient-to-r from-transparent to-[#00A3FF]" />
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-sky-400 drop-shadow-[0_0_8px_rgba(0,163,255,0.7)]">
                RIDE THE NEXT LEVEL
              </span>
              <span className="w-12 sm:w-20 h-[1.5px] bg-gradient-to-l from-transparent to-[#00A3FF]" />
            </div>
          </div>

          {/* Bottom Control — Centered Down Arrow & Scroll Prompt */}
          <div className="absolute left-1/2 bottom-8 sm:bottom-10 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
            <button
              onClick={() => handleScrollToStage(2)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/40 hover:border-white bg-black/25 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.6)] cursor-pointer"
              aria-label="Scroll to explore showroom"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2 animate-bounce">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </button>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/70 mt-2.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              SCROLL TO EXPLORE
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATE 2: INSIDE SHOWROOM — "FEEL THE RIDE" (1:1 REFERENCE IMAGE 2)        */}
        {/* ========================================================================= */}
        <div
          className="absolute inset-0 z-20 pointer-events-none select-none transition-opacity duration-300 ease-out"
          style={{
            opacity: state2Opacity,
            display: state2Opacity <= 0.005 ? 'none' : 'block',
          }}
        >
          {/* Main Title Block — Lower Screen Placement over Floor Reflection */}
          <div
            className="absolute left-1/2 top-[64%] sm:top-[66%] md:top-[68%] -translate-x-1/2 text-center w-full max-w-4xl px-4"
            style={{ transform: `translate(-50%, ${(1 - state2Opacity) * 15}px)` }}
          >
            {/* Small Eyebrow Label */}
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/80 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              WELCOME TO HIRA AUTO AGENCY
            </p>

            {/* Giant Slanted Headline with Speed-Streak Blur on "RIDE" */}
            <h2 className="font-hero-headline text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-[-0.015em] leading-[0.95] mb-3">
              <span className="hero-text-metallic-white">FEEL THE </span>
              <span className="relative inline-block">
                <span className="hero-text-electric-blue hero-text-glow-blue relative z-10">RIDE</span>
                {/* Speed-Streak Motion Blur Trail (1:1 Reference Match) */}
                <span className="absolute -inset-y-1 left-2 sm:left-4 -right-8 sm:-right-14 bg-gradient-to-r from-[#00A3FF]/75 via-[#0080FF]/40 to-transparent blur-md pointer-events-none" />
              </span>
            </h2>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm md:text-base font-normal text-white/80 max-w-xl mx-auto leading-relaxed mb-3 sm:mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              Experience Yamaha up close. Explore. Touch. Imagine your next ride.
            </p>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <span className="w-12 sm:w-20 h-[1.5px] bg-gradient-to-r from-transparent to-[#00A3FF]" />
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-sky-400 drop-shadow-[0_0_8px_rgba(0,163,255,0.7)]">
                RIDE THE NEXT LEVEL
              </span>
              <span className="w-12 sm:w-20 h-[1.5px] bg-gradient-to-l from-transparent to-[#00A3FF]" />
            </div>
          </div>

          {/* Bottom Bar: "03 | Inside Showroom" + Glowing Segment 3 + Arrows */}
          <div className="absolute inset-x-4 sm:inset-x-8 md:inset-x-12 bottom-6 sm:bottom-8 flex items-center justify-between pointer-events-auto">
            {/* Left Tag: 03 | Inside Showroom */}
            <div className="flex items-center gap-2 sm:gap-2.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              <span className="text-lg sm:text-2xl font-black text-white leading-none">03</span>
              <span className="h-4 w-[1.5px] bg-white/40" />
              <span className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide">Inside Showroom</span>
            </div>

            {/* Center Multi-Segment Progress Indicator (Pill 3 Active) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-6 sm:w-10 h-1 rounded-full bg-white/25" />
              <span className="w-6 sm:w-10 h-1 rounded-full bg-white/25" />
              <span className="w-9 sm:w-14 h-1.5 rounded-full bg-[#0099FF] shadow-[0_0_12px_#0099FF]" />
              <span className="w-6 sm:w-10 h-1 rounded-full bg-white/25" />
            </div>

            {/* Right Arrow Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                onClick={() => handleScrollToStage(1)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/30 hover:border-white bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md"
                aria-label="Previous scene"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => handleScrollToStage(3)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/30 hover:border-white bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md"
                aria-label="Next scene"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATE 3: RECEPTION — "YOUR RIDE STARTS HERE" (1:1 REFERENCE IMAGE 3)      */}
        {/* ========================================================================= */}
        <div
          className="absolute inset-0 z-20 pointer-events-none select-none transition-opacity duration-300 ease-out"
          style={{
            opacity: state3Opacity,
            display: state3Opacity <= 0.005 ? 'none' : 'block',
          }}
        >
          {/* Main Title Block — Lower Screen Placement over Reflection */}
          <div
            className="absolute left-1/2 top-[64%] sm:top-[66%] md:top-[68%] -translate-x-1/2 text-center w-full max-w-4xl px-4"
            style={{ transform: `translate(-50%, ${(1 - state3Opacity) * 15}px)` }}
          >
            {/* Small Eyebrow Label */}
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/80 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              WELCOME TO HIRA AUTO AGENCY
            </p>

            {/* Giant Slanted Headline: Two Lines */}
            <h2 className="font-hero-headline text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-[-0.015em] leading-[0.92] mb-3 sm:mb-4">
              <span className="block hero-text-metallic-white">YOUR RIDE</span>
              <span className="block">
                <span className="hero-text-metallic-white">STARTS </span>
                <span className="hero-text-electric-blue hero-text-glow-blue">HERE</span>
              </span>
            </h2>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm md:text-base font-normal text-white/80 max-w-xl mx-auto leading-relaxed mb-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              Explore. Experience. Belong to the Yamaha Family.
            </p>

            {/* Decorative Glowing Accent Bar */}
            <div className="w-16 sm:w-20 h-[2px] bg-gradient-to-r from-transparent via-[#00A3FF] to-transparent mx-auto mt-2" />
          </div>

          {/* Bottom Bar: "04 | At Reception (Final)" + Glowing Segment 4 + Arrows */}
          <div className="absolute inset-x-4 sm:inset-x-8 md:inset-x-12 bottom-6 sm:bottom-8 flex items-center justify-between pointer-events-auto">
            {/* Left Tag: 04 | At Reception (Final) */}
            <div className="flex items-center gap-2 sm:gap-2.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              <span className="text-lg sm:text-2xl font-black text-white leading-none">04</span>
              <span className="h-4 w-[1.5px] bg-white/40" />
              <span className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide">At Reception (Final)</span>
            </div>

            {/* Center Multi-Segment Progress Indicator (Pill 4 Active) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-6 sm:w-10 h-1 rounded-full bg-white/25" />
              <span className="w-6 sm:w-10 h-1 rounded-full bg-white/25" />
              <span className="w-6 sm:w-10 h-1 rounded-full bg-white/25" />
              <span className="w-9 sm:w-14 h-1.5 rounded-full bg-[#0099FF] shadow-[0_0_12px_#0099FF]" />
            </div>

            {/* Right Arrow Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                onClick={() => handleScrollToStage(2)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/30 hover:border-white bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md"
                aria-label="Previous scene"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={onExploreBikes}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/30 hover:border-white bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md"
                aria-label="Explore bikes catalog"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

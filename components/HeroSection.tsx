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

  // Calculate smooth cinematic opacity curves for the visual stages:
  // Stage 1 (0.00 - 0.26): Exterior View (Start) -> "Ready to Ride"
  // Stage 2 (0.26 - 0.52): Moving Towards Entrance -> "Ready to Ride"
  // Stage 3 (0.52 - 0.78): Inside Showroom -> "Feel the Ride"
  // Stage 4 (0.78 - 1.00): At Reception (Final) -> "Your Ride\nStarts Here"

  let currentStage = 1;
  let stageName = 'External View (Start)';
  if (scrollProgress >= 0.78) {
    currentStage = 4;
    stageName = 'At Reception (Final)';
  } else if (scrollProgress >= 0.52) {
    currentStage = 3;
    stageName = 'Inside Showroom';
  } else if (scrollProgress >= 0.26) {
    currentStage = 2;
    stageName = 'Moving Towards Entrance';
  }

  // Text 1: "Ready to Ride" (Active across Stage 1 and Stage 2)
  const text1Opacity =
    scrollProgress < 0.48
      ? 1
      : scrollProgress > 0.54
      ? 0
      : 1 - (scrollProgress - 0.48) / (0.54 - 0.48);

  // Text 2: "Feel the Ride" (Active in Stage 3)
  const text2Opacity =
    scrollProgress < 0.50 || scrollProgress > 0.78
      ? 0
      : scrollProgress < 0.55
      ? (scrollProgress - 0.50) / (0.55 - 0.50)
      : scrollProgress > 0.73
      ? 1 - (scrollProgress - 0.73) / (0.78 - 0.73)
      : 1;

  // Text 3: "Your Ride\nStarts Here" (Active in Stage 4)
  const text3Opacity =
    scrollProgress < 0.75
      ? 0
      : scrollProgress < 0.81
      ? (scrollProgress - 0.75) / (0.81 - 0.75)
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
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />

        {/* ========================================================================= */}
        {/* CENTER CINEMATIC HERO TITLE OVERLAY (1:1 MATCHING REFERENCE COMPOSITION) */}
        {/* ========================================================================= */}
        <div className="absolute left-1/2 top-[53.5%] sm:top-[54%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none text-center w-full max-w-3xl px-4">
          {/* STAGE 1 & 2: Ready to Ride */}
          <div
            className="transition-opacity duration-300 ease-out"
            style={{
              opacity: text1Opacity,
              transform: `translateY(${(1 - text1Opacity) * 5}px)`,
              display: text1Opacity <= 0.005 ? 'none' : 'block',
            }}
          >
            <h1
              className="font-hero-title text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold md:font-extrabold text-white tracking-[-0.02em] leading-none"
              style={{ textShadow: '0 4px 18px rgba(0,0,0,0.65), 0 0 24px rgba(0,100,255,0.20)' }}
            >
              Ready to Ride
            </h1>
          </div>

          {/* STAGE 3: Feel the Ride */}
          <div
            className="transition-opacity duration-300 ease-out"
            style={{
              opacity: text2Opacity,
              transform: `translateY(${(1 - text2Opacity) * 5}px)`,
              display: text2Opacity <= 0.005 ? 'none' : 'block',
            }}
          >
            <h2
              className="font-hero-title text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold md:font-extrabold text-white tracking-[-0.02em] leading-none"
              style={{ textShadow: '0 4px 18px rgba(0,0,0,0.65), 0 0 24px rgba(0,100,255,0.20)' }}
            >
              Feel the Ride
            </h2>
          </div>

          {/* STAGE 4: Your Ride / Starts Here */}
          <div
            className="transition-opacity duration-300 ease-out"
            style={{
              opacity: text3Opacity,
              transform: `translateY(${(1 - text3Opacity) * 5}px)`,
              display: text3Opacity <= 0.005 ? 'none' : 'block',
            }}
          >
            <h2
              className="font-hero-title text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold md:font-extrabold text-white tracking-[-0.02em] leading-[1.04]"
              style={{ textShadow: '0 4px 18px rgba(0,0,0,0.65), 0 0 24px rgba(0,100,255,0.20)' }}
            >
              Your Ride<br />
              Starts Here
            </h2>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM-LEFT JOURNEY STAGE INDICATOR (1:1 MATCHING REFERENCE STORYBOARD)  */}
        {/* ========================================================================= */}
        <div className="absolute left-6 sm:left-10 md:left-12 bottom-6 sm:bottom-8 z-20 flex items-center gap-3 pointer-events-none select-none">
          <span className="text-[11px] sm:text-xs font-semibold text-white/85 tracking-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            <span className="text-white/50 mr-1.5">{String(currentStage).padStart(2, '0')}</span>
            {stageName}
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1 rounded-full transition-all duration-300 ${
                  step <= currentStage
                    ? 'w-6 sm:w-8 bg-[#0050d8] shadow-[0_0_8px_rgba(0,80,216,0.6)]'
                    : 'w-4 sm:w-6 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

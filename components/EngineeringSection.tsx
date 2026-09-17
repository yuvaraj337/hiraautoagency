'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Cpu, Gauge, Wrench, Shield, ChevronDown, ArrowRight } from 'lucide-react';

interface EngineeringSectionProps {
  onExploreR15: () => void;
}

const TOTAL_ENGINEERING_FRAMES = 180;

export default function EngineeringSection({ onExploreR15 }: EngineeringSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [framesLoaded, setFramesLoaded] = useState(0);
  const framesCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef<number>(0);
  const isRenderingRef = useRef(false);

  const getFramePath = useCallback((index: number) => {
    const num = String(index + 1).padStart(6, '0');
    return `/frames/engineering/frame_${num}.jpg`;
  }, []);

  // Progressive Preloading
  useEffect(() => {
    let isMounted = true;
    const cache = framesCache.current;

    // 1. First frame immediate load
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    firstImg.onload = () => {
      if (!isMounted) return;
      cache.set(0, firstImg);
      renderFrame(0);
    };

    // 2. Load keyframes (every 4th)
    const loadKeyframes = async () => {
      for (let i = 4; i < TOTAL_ENGINEERING_FRAMES; i += 4) {
        if (!isMounted) return;
        if (!cache.has(i)) {
          const img = new Image();
          img.src = getFramePath(i);
          img.onload = () => {
            if (isMounted) {
              cache.set(i, img);
              setFramesLoaded((prev) => prev + 1);
            }
          };
        }
      }
    };

    // 3. Fill in intermediate frames
    const loadRemaining = async () => {
      for (let i = 1; i < TOTAL_ENGINEERING_FRAMES; i++) {
        if (!isMounted) return;
        if (!cache.has(i)) {
          const img = new Image();
          img.src = getFramePath(i);
          img.onload = () => {
            if (isMounted) {
              cache.set(i, img);
              setFramesLoaded((prev) => prev + 1);
            }
          };
          if (i % 15 === 0) {
            await new Promise((r) => setTimeout(r, 20));
          }
        }
      }
    };

    loadKeyframes().then(loadRemaining);

    return () => {
      isMounted = false;
    };
  }, [getFramePath]);

  // Render Frame onto Canvas
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = framesCache.current.get(frameIndex);
    if (!img || !img.complete) {
      for (let offset = 1; offset < 20; offset++) {
        const lower = framesCache.current.get(Math.max(0, frameIndex - offset));
        if (lower && lower.complete) {
          img = lower;
          break;
        }
        const higher = framesCache.current.get(Math.min(TOTAL_ENGINEERING_FRAMES - 1, frameIndex + offset));
        if (higher && higher.complete) {
          img = higher;
          break;
        }
      }
    }

    if (!img || !img.complete) return;

    const width = canvas.width;
    const height = canvas.height;
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
    currentFrameRef.current = frameIndex;
  }, []);

  // Resize Listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(currentFrameRef.current);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame]);

  // Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = containerRef.current.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScroll));
      setScrollProgress(progress);

      const targetFrame = Math.min(
        TOTAL_ENGINEERING_FRAMES - 1,
        Math.max(0, Math.floor(progress * (TOTAL_ENGINEERING_FRAMES - 1)))
      );

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
    <section id="engineering" ref={containerRef} className="relative h-[320vh] w-full bg-[#05070B]">
      {/* Pinned Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Disassembly Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Ambient Top Vignette */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

        {/* Ambient Bottom Vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Section Header (Compact & positioned matching reference) */}
        <div className="relative z-20 pt-20 px-6 sm:px-12 lg:px-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-2.5 text-yamaha-cyan text-xs font-bold uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5" />
            Yamaha Racing Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight leading-none">
            ENGINEERED <br />
            <span className="text-gradient-yamaha">TO PERFORM</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-gray-300 font-medium max-w-lg leading-relaxed">
            Explore the engineering behind every ride. Scroll to witness the anatomical breakdown of Yamaha racing pedigree.
          </p>
        </div>

        {/* Interactive Engineering Spec Hotspots (Fade in as disassembly progresses) */}
        <div
          className={`relative z-20 px-6 sm:px-12 lg:px-16 pb-12 transition-all duration-700 ${
            scrollProgress > 0.45 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-5xl">
            <div className="glass-panel p-3.5 rounded-xl border border-white/10 text-left">
              <div className="flex items-center gap-2 text-yamaha-cyan mb-1">
                <Gauge className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">VVA Engine</span>
              </div>
              <p className="text-xs font-bold text-white">155cc Liquid-Cooled 4V</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Variable Valve Actuation</p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-white/10 text-left">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Wrench className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">USD Forks</span>
              </div>
              <p className="text-xs font-bold text-white">Inverted Front Suspension</p>
              <p className="text-[10px] text-gray-400 mt-0.5">High Rigidity Damping</p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-white/10 text-left">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Traction Control</span>
              </div>
              <p className="text-xs font-bold text-white">Electronic Wheel Supervision</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Dual Channel ABS</p>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border border-white/10 flex flex-col justify-between text-left">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Model Focus</span>
                <p className="text-xs font-bold text-white">Yamaha R15M</p>
              </div>
              <button
                onClick={onExploreR15}
                className="mt-2 text-[11px] font-bold text-yamaha-cyan hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View Full Specs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll hint when at beginning */}
        {scrollProgress < 0.3 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400 animate-pulse pointer-events-none">
            <span>Scroll to Disassemble</span>
            <ChevronDown className="w-3.5 h-3.5 text-yamaha-cyan" />
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import React, { useState, useEffect } from 'react';

interface InitialLoaderProps {
  onLoaded: () => void;
}

export default function InitialLoader({ onLoaded }: InitialLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Showroom Experience...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Critical Priority Assets to preload before revealing Hero
    const criticalAssets = [
      '/bikes/r15-v4.png',
      '/bikes/mt-15-v2.png',
      '/bikes/fz-s-v4-hybrid.png',
      '/bikes/xsr.png',
      '/frames/hero/frame_000001.jpg',
    ];

    let loadedCount = 0;
    const total = criticalAssets.length;

    const updateProgress = () => {
      loadedCount++;
      const pct = Math.round((loadedCount / total) * 100);
      setProgress(pct);

      if (pct < 40) {
        setStatusText('Loading Yamaha MotoGP Engineering...');
      } else if (pct < 80) {
        setStatusText('Preparing Cinematic 4-Bike Showcase...');
      } else {
        setStatusText('Showroom Ready');
      }

      if (loadedCount >= total) {
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onLoaded();
          }, 600);
        }, 300);
      }
    };

    criticalAssets.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = updateProgress;
      img.onerror = updateProgress; // Don't block if one asset errors
    });

    // Fallback safety timeout so user is never stuck
    const safetyTimeout = setTimeout(() => {
      setProgress(100);
      setIsFadingOut(true);
      setTimeout(() => {
        onLoaded();
      }, 600);
    }, 4500);

    return () => clearTimeout(safetyTimeout);
  }, [onLoaded]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#06080C] flex flex-col items-center justify-center transition-opacity duration-600 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Radial Atmosphere */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Yamaha Emblem & Branding */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glowing Tuning Fork Emblem */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0066FF]/30 rounded-full blur-xl animate-ping" style={{ animationDuration: '3s' }} />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#0033aa] to-[#0088ff] flex items-center justify-center shadow-[0_0_30px_rgba(0,102,255,0.6)] border border-[#00A3FF]/40">
            <svg viewBox="0 0 100 100" className="w-9 h-9 fill-white filter drop-shadow-md">
              <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="6" />
              <path d="M50 16 L50 84 M16 50 L84 50 M26 26 L74 74 M74 26 L26 74" stroke="white" strokeWidth="4" />
            </svg>
          </div>
        </div>

        {/* Yamaha Typography */}
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.3em] text-white font-display mb-1">
          YAMAHA
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00E5FF] mb-8">
          HIRA AUTO AGENCY • MOHANPUR
        </p>

        {/* Sleek Progress Bar */}
        <div className="w-56 sm:w-64 h-[3px] bg-white/10 rounded-full overflow-hidden mb-3 relative">
          <div
            className="h-full bg-gradient-to-r from-[#0066FF] to-[#00E5FF] rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_#00E5FF]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage & Status Text */}
        <div className="flex items-center justify-between w-56 sm:w-64 text-[10px] uppercase font-bold tracking-wider text-gray-400">
          <span>{statusText}</span>
          <span className="text-white font-display">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Calendar, ChevronRight, Phone, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenVisitModal: () => void;
  onOpenBookingModal?: () => void;
}

export default function Navbar({ onOpenVisitModal, onOpenBookingModal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Bikes', href: '#catalog' },
    { name: 'Showroom Visit', href: '#visit', onClick: onOpenVisitModal },
    { name: 'Engineering', href: '#engineering' },
    { name: 'Location', href: '#location' },
  ];

  const mobileBikeShowcase = [
    { name: 'Yamaha R15 V4', category: 'Supersport', image: '/assets/bikes/hero_r15_v4.jpg', price: 'From ₹1,75,650' },
    { name: 'Yamaha MT-15 V2', category: 'Hyper Naked', image: '/assets/bikes/hero_mt15_v2.jpg', price: 'From ₹1,66,710' },
    { name: 'Yamaha FZ-S V4', category: 'Street Fighter', image: '/assets/bikes/hero_fzs_v4.jpg', price: 'From ₹1,17,560' },
    { name: 'Yamaha Aerox S', category: 'Maxi Sports', image: '/bikes/aerox-s.png', price: '₹1,50,350' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav py-3 bg-black/80'
            : 'bg-gradient-to-b from-black/75 via-black/30 to-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT: Yamaha Brand Logo + Dealership Tag (1:1 Reference Match) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
              {/* Yamaha Tuning Forks Circular Crest */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/30 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 100 100" className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-white">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="6" />
                  <path d="M50 16 L50 84 M16 50 L84 50 M26 26 L74 74 M74 26 L26 74" stroke="white" strokeWidth="4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase leading-none font-display">
                  YAMAHA
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium tracking-wider text-white/90 italic leading-tight">
                  Revs Your Heart
                </span>
              </div>
            </Link>

            {/* Dealership Identifier (Reference Images 2 & 3) */}
            <div className="hidden sm:flex items-center gap-2 pl-3 sm:pl-4 border-l border-white/20">
              <span className="w-2 h-2 rounded-full bg-yamaha-cyan animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider leading-none">
                  HIRA AUTO AGENCY
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium text-gray-300 leading-tight">
                  Mohanpur, Godda
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Blue Pill Action Button "VISIT" + Hamburger Menu (1:1 Reference Match) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenVisitModal}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#0057FF] hover:bg-[#0047DB] text-white text-xs sm:text-sm font-black tracking-wider uppercase transition-all shadow-[0_0_16px_rgba(0,87,255,0.45)] transform hover:scale-105 active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span>VISIT</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full flex flex-col items-center justify-center gap-1.5 hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <span className={`w-5 h-[2px] bg-white rounded-full transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`w-5 h-[2px] bg-white rounded-full transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-[2px] bg-white rounded-full transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN NAVIGATION OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col pt-20 px-6 pb-8 overflow-y-auto animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-yamaha-cyan font-bold">Yamaha Dealership</p>
              <h3 className="text-lg font-black text-white">Hira Auto Agency</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mohanpur</span>
            </div>
          </div>

          {/* Quick Model Carousel */}
          <div className="mb-6">
            <p className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">Featured Lineup</p>
            <div className="grid grid-cols-2 gap-3">
              {mobileBikeShowcase.map((bike) => (
                <a
                  key={bike.name}
                  href="#catalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group relative rounded-xl overflow-hidden glass-card p-2.5 flex flex-col border border-white/10 hover:border-yamaha-cyan/40 transition-colors"
                >
                  <div className="relative h-24 w-full rounded-lg overflow-hidden bg-black/40 mb-2">
                    <img
                      src={bike.image}
                      alt={bike.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-yamaha-cyan">{bike.category}</span>
                  <span className="text-xs font-bold text-white truncate">{bike.name}</span>
                  <span className="text-[10px] text-gray-400">{bike.price}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col space-y-4 mb-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                className="flex items-center justify-between py-2 text-base font-bold text-gray-200 hover:text-yamaha-cyan border-b border-white/5"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </a>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="mt-auto space-y-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVisitModal();
              }}
              className="w-full py-3 rounded-xl bg-yamaha-racing text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yamaha-blue/40"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Showroom Visit</span>
            </button>

            <a
              href="tel:+916201238401"
              className="w-full py-3 rounded-xl glass-panel text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Dealership: +91 62012 38401</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

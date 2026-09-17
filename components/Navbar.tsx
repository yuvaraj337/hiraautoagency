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
    { name: 'Finance & Exchange', href: '#finance' },
    { name: 'Service', href: '#service' },
    { name: 'Location', href: '#location' },
  ];

  const mobileBikeShowcase = [
    { name: 'Yamaha R15 V4', category: 'Supersport', image: '/assets/bikes/hero_r15_v4.jpg', price: 'From ₹1,75,650' },
    { name: 'Yamaha MT-15 V2', category: 'Hyper Naked', image: '/assets/bikes/hero_mt15_v2.jpg', price: 'From ₹1,66,710' },
    { name: 'Yamaha FZ-S V4', category: 'Street Fighter', image: '/assets/bikes/hero_fzs_v4.jpg', price: 'From ₹1,17,560' },
    { name: 'Yamaha Aerox S', category: 'Maxi Sports', image: '/assets/bikes/hero_aerox_s.jpg', price: '₹1,50,350' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav py-3'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT: Yamaha Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="flex items-center gap-2">
              {/* Yamaha Tuning Forks Crest Symbol */}
              <div className="w-8 h-8 rounded-full bg-yamaha-racing flex items-center justify-center shadow-lg shadow-yamaha-blue/50 group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 100 100" className="w-5 h-5 fill-white">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="6" />
                  <path d="M50 16 L50 84 M16 50 L84 50 M26 26 L74 74 M74 26 L26 74" stroke="white" strokeWidth="4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-widest text-white uppercase leading-none font-display">
                  YAMAHA
                </span>
                <span className="text-[9px] font-bold tracking-wider text-yamaha-cyan uppercase leading-tight">
                  Revs Your Heart
                </span>
              </div>
            </div>
          </Link>

          {/* CENTER: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                className="text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-yamaha-cyan hover:after:w-full after:transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* RIGHT: Hira Auto Agency & Action Button */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex flex-col items-end pr-2 border-r border-white/10">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                HIRA AUTO AGENCY
              </span>
              <span className="text-[9px] font-medium text-gray-400">
                Mahagama, Godda
              </span>
            </div>

            <button
              onClick={onOpenVisitModal}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-yamaha-racing hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all transform hover:scale-105 shadow-md shadow-yamaha-blue/30 focus:outline-none active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-yamaha-cyan" />
              <span>Book Showroom Visit</span>
            </button>
          </div>

          {/* MOBILE: Hamburger & Quick Action */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenVisitModal}
              className="px-3 py-1.5 rounded-full bg-yamaha-racing text-white text-[11px] font-bold uppercase tracking-wide"
            >
              Visit
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              <span>Mahagama</span>
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
              href="tel:8210582308"
              className="w-full py-3 rounded-xl glass-panel text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Dealership: 8210582308</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Phone, Mail, MapPin, ShieldCheck, Award } from 'lucide-react';

interface FooterProps {
  onOpenVisitModal: () => void;
  onExploreBikes: () => void;
}

export default function Footer({ onOpenVisitModal, onExploreBikes }: FooterProps) {
  return (
    <footer className="relative bg-black text-white border-t border-white/10 overflow-hidden">
      {/* FINAL CINEMATIC CTA SECTION (Matching Reference Video Rhythm) */}
      <div className="relative py-28 px-4 sm:px-6 lg:px-8 text-center border-b border-white/10">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-yamaha-blue/30 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-4 text-yamaha-cyan text-xs font-bold uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" />
            Yamaha Motor India Official Network
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase text-white font-display tracking-tight leading-none mb-6">
            YOUR RIDE <br />
            <span className="text-gradient-yamaha">STARTS HERE</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-8 font-medium">
            Visit Hira Auto Agency in Mahagama to feel the authentic throttle response, precision handling, and Japanese engineering.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreBikes}
              className="px-8 py-3.5 rounded-full bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-yamaha-blue/40 transition-transform transform active:scale-95"
            >
              <span>Explore Bikes</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenVisitModal}
              className="px-8 py-3.5 rounded-full glass-panel hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4 text-yamaha-cyan" />
              <span>Book a Showroom Visit</span>
            </button>

            <a
              href="tel:8210582308"
              className="px-8 py-3.5 rounded-full glass-card hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Contact Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER NAVIGATION & INFORMATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-left">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-yamaha-racing flex items-center justify-center shadow-lg shadow-yamaha-blue/50">
                <svg viewBox="0 0 100 100" className="w-5 h-5 fill-white">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="6" />
                  <path d="M50 16 L50 84 M16 50 L84 50 M26 26 L74 74 M74 26 L26 74" stroke="white" strokeWidth="4" />
                </svg>
              </div>
              <span className="text-xl font-black uppercase tracking-widest text-white font-display">
                YAMAHA
              </span>
            </div>

            <p className="text-xs font-bold text-white uppercase tracking-wider">
              HIRA AUTO AGENCY (Hira Motors – Mahagama)
            </p>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Authorized Yamaha Dealer serving Mahagama, Godda and Santhal Pargana, Jharkhand. Offering the full lineup of high-performance motorcycles, scooters, genuine Yamalube spare parts, and certified service care.
            </p>

            <div className="pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-[11px] font-bold text-gray-400 hover:text-yamaha-cyan transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-yamaha-cyan" />
                <span>Dealership Staff CRM Login</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-display">
              Motorcycles
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#catalog" className="hover:text-yamaha-cyan transition-colors">Yamaha R15 V4</a></li>
              <li><a href="#catalog" className="hover:text-yamaha-cyan transition-colors">Yamaha MT-15 V2</a></li>
              <li><a href="#catalog" className="hover:text-yamaha-cyan transition-colors">Yamaha FZ-S V4 Hybrid</a></li>
              <li><a href="#catalog" className="hover:text-yamaha-cyan transition-colors">Yamaha XSR 155</a></li>
              <li><a href="#catalog" className="hover:text-yamaha-cyan transition-colors">Yamaha Aerox S</a></li>
              <li><a href="#catalog" className="hover:text-yamaha-cyan transition-colors">Ray ZR & Fascino</a></li>
            </ul>
          </div>

          {/* Dealership Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-display">
              Dealership
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={onOpenVisitModal} className="hover:text-yamaha-cyan transition-colors text-left">
                  Book Showroom Visit
                </button>
              </li>
              <li><a href="#finance" className="hover:text-yamaha-cyan transition-colors">Finance Assistance</a></li>
              <li><a href="#finance" className="hover:text-yamaha-cyan transition-colors">Bike Exchange Offer</a></li>
              <li><a href="#service" className="hover:text-yamaha-cyan transition-colors">Authorized Service</a></li>
              <li><a href="#location" className="hover:text-yamaha-cyan transition-colors">Showroom Location</a></li>
              <li><a href="#location" className="hover:text-yamaha-cyan transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Verified Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-display">
              Showroom Contact
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-yamaha-cyan shrink-0 mt-0.5" />
                <span>Opp. Honda Showroom, Kechua Chowk, Mahagama Main Road, Godda 814154</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:8210582308" className="hover:text-white font-bold text-white">8210582308</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:hiramotors007@gmail.com" className="hover:text-white">hiramotors007@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Hira Auto Agency. All Rights Reserved. Authorized Yamaha Dealership.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-gray-400 cursor-pointer">Mahagama, Jharkhand</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

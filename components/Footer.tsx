'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenVisitModal: () => void;
  onExploreBikes?: () => void;
}

export default function Footer({ onOpenVisitModal }: FooterProps) {
  return (
    <footer className="relative bg-[#04060A] text-white border-t border-white/10 overflow-hidden">
      {/* FOOTER NAVIGATION & DEALERSHIP DISPATCHING INFORMATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-left">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0066FF] flex items-center justify-center shadow-lg shadow-blue-600/50">
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
              HIRA AUTO AGENCY (Hira Motors – Mohanpur)
            </p>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm font-normal">
              Official Authorized Yamaha Dealership serving Mohanpur, Godda, and Santhal Pargana, Jharkhand. Offering the complete lineup of genuine Yamaha motorcycles, scooters, Yamalube spare parts, and certified technician care.
            </p>

            <div className="pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-gray-400 hover:text-[#00E5FF] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
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
              <li><a href="#catalog" className="hover:text-[#00E5FF] transition-colors">Yamaha R15 V4</a></li>
              <li><a href="#catalog" className="hover:text-[#00E5FF] transition-colors">Yamaha MT-15 V2</a></li>
              <li><a href="#catalog" className="hover:text-[#00E5FF] transition-colors">Yamaha FZ-S V4 Hybrid</a></li>
              <li><a href="#catalog" className="hover:text-[#00E5FF] transition-colors">Yamaha XSR 155</a></li>
              <li><a href="#catalog" className="hover:text-[#00E5FF] transition-colors">Yamaha Aerox S</a></li>
              <li><a href="#catalog" className="hover:text-[#00E5FF] transition-colors">Ray ZR & Fascino (Drum)</a></li>
            </ul>
          </div>

          {/* Dealership Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-display">
              Dealership
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={onOpenVisitModal} className="hover:text-[#00E5FF] transition-colors text-left">
                  Book Showroom Visit
                </button>
              </li>
              <li><a href="#location" className="hover:text-[#00E5FF] transition-colors">Showroom Location</a></li>
              <li><a href="#location" className="hover:text-[#00E5FF] transition-colors">Contact Us</a></li>
              <li><a href="#engineering" className="hover:text-[#00E5FF] transition-colors">Engineering & Tech</a></li>
            </ul>
          </div>

          {/* Verified Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-display">
              Showroom Contact
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                <span>Opp. Honda Showroom, Kechua Chowk, Mohanpur, Godda 814154</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+916201238401" className="hover:text-white font-bold text-white">+91 62012 38401</a>
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
          <p>© {new Date().getFullYear()} Hira Auto Agency. All Rights Reserved. Authorized Yamaha Dealership Mohanpur.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-gray-400 cursor-pointer">Mohanpur, Jharkhand</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

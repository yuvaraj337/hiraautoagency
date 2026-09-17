'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock, Navigation, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface LocationSectionProps {
  onOpenVisitModal: () => void;
}

export default function LocationSection({ onOpenVisitModal }: LocationSectionProps) {
  return (
    <section id="location" className="relative py-24 bg-[#080B10] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Location Details Card */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-3 text-yamaha-cyan text-xs font-bold uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5" />
              Verified Dealership Location
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-display tracking-tight leading-tight">
              VISIT OUR <br />
              <span className="text-gradient-yamaha">MAHAGAMA SHOWROOM</span>
            </h2>

            <p className="mt-4 text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
              We welcome you to test ride the complete Yamaha range and consult our product experts at our flagship Mahagama facility.
            </p>

            <div className="mt-8 space-y-4">
              {/* Address */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yamaha-racing/30 border border-yamaha-cyan/40 flex items-center justify-center text-yamaha-cyan shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                    Hira Motors – Mahagama (Hira Auto Agency)
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Opp. Honda Showroom, Mahagama Main Road, <br />
                    Kechua Chowk, Mahagama, Godda, Jharkhand 814154
                  </p>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Direct Contacts</span>
                    <a href="tel:8210582308" className="block text-xs font-bold text-white hover:text-yamaha-cyan">
                      8210582308
                    </a>
                    <a href="tel:8340408847" className="block text-xs font-bold text-white hover:text-yamaha-cyan">
                      8340408847
                    </a>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Official Email</span>
                    <a href="mailto:hiramotors007@gmail.com" className="block text-xs font-bold text-white hover:text-yamaha-cyan truncate max-w-[150px]">
                      hiramotors007@gmail.com
                    </a>
                    <span className="text-[10px] text-gray-400">Response within 24h</span>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
                <span className="text-xs text-gray-300 font-medium">
                  <strong>Showroom Hours:</strong> Monday – Sunday: 9:00 AM – 7:30 PM (All 7 Days Open)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Hira+Motors+Mahagama+Main+Road+Kechua+Chowk+Godda+Jharkhand"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-white hover:bg-gray-100 text-yamaha-blue font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </a>

              <a
                href="tel:8210582308"
                className="px-6 py-3 rounded-full bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-yamaha-blue/30 transition-transform active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>

              <button
                onClick={onOpenVisitModal}
                className="px-6 py-3 rounded-full glass-panel hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4 text-yamaha-cyan" />
                <span>Book Showroom Visit</span>
              </button>
            </div>
          </div>

          {/* Interactive Map Visual */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative h-[420px] flex flex-col justify-between p-6">
              {/* Map simulated backdrop with glowing pins */}
              <div className="absolute inset-0 bg-[#0A0E18] bg-[radial-gradient(#1A2234_1px,transparent_1px)] [background-size:16px_16px] opacity-80" />

              {/* Pin indicator */}
              <div className="relative z-10 m-auto text-center flex flex-col items-center">
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-full bg-yamaha-racing/30 animate-ping absolute inset-0" />
                  <div className="w-16 h-16 rounded-full bg-yamaha-racing border-2 border-yamaha-cyan shadow-xl shadow-yamaha-blue/60 flex items-center justify-center text-white relative z-10">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="glass-panel px-5 py-3 rounded-2xl border border-white/15 max-w-xs shadow-2xl">
                  <span className="text-[10px] uppercase font-bold text-yamaha-cyan tracking-wider block">
                    Hira Auto Agency
                  </span>
                  <h4 className="text-sm font-black text-white uppercase font-display">
                    Yamaha Showroom Mahagama
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-1">
                    Opp. Honda Showroom, Kechua Chowk
                  </p>
                </div>
              </div>

              {/* Bottom directions CTA */}
              <div className="relative z-10 w-full pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Mahagama, Godda (814154)</span>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Hira+Motors+Mahagama+Main+Road+Kechua+Chowk+Godda+Jharkhand"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-yamaha-cyan hover:underline"
                >
                  <span>Open in Google Maps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

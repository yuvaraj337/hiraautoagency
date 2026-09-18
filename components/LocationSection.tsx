'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock, Navigation, Calendar, ExternalLink } from 'lucide-react';

interface LocationSectionProps {
  onOpenVisitModal: () => void;
}

export default function LocationSection({ onOpenVisitModal }: LocationSectionProps) {
  const mapUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.342442436151!2d87.2789123!3d25.0210214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f0464f89d98949%3A0x2a9a7a6bbd924610!2sHira%20Motors%20Mahagama!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';

  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=25.0210214,87.2789123&destination_place_id=ChIJSYnZik9G8DkREUaSvWp6mio';

  return (
    <section id="location" className="relative py-24 bg-[#06080C] text-white border-t border-white/5 overflow-hidden">
      {/* Soft Blue Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#0066FF]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00E5FF] mb-2">
            LOCATION
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight leading-none mb-3">
            HIRA AUTO AGENCY
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            Mahagama, Godda, Jharkhand • Official Authorized Yamaha Dealership
          </p>
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#0066FF] to-transparent mx-auto mt-4" />
        </div>

        {/* Two-Column Grid: LEFT (Map Visual) | RIGHT (Dealership Info & CTAs) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: Premium Dark Map Visual */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0a1020]/80 border border-[#0055ff]/30 p-2 overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.7)] flex flex-col justify-between min-h-[380px] sm:min-h-[440px]">
            <div className="relative w-full h-full min-h-[340px] rounded-xl overflow-hidden">
              <iframe
                title="Hira Auto Agency Mahagama Map"
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[340px] rounded-xl"
              />
              {/* Floating Showroom Badge */}
              <div className="absolute top-3 left-3 bg-[#06080C]/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Showroom Open Today
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Dealership Information & Clean Action Buttons */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0a1020]/80 border border-[#0055ff]/30 p-6 sm:p-8 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.7)]">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase font-display tracking-wide mb-1">
                  Mahagama Showroom & Service
                </h3>
                <p className="text-xs text-gray-400">
                  Flagship Yamaha 3S facility serving Godda and Santhal Pargana.
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-[#00E5FF] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Address
                  </span>
                  <p className="text-xs text-white leading-relaxed font-medium">
                    Opp. Honda Showroom, Kechua Chowk,<br />
                    Mahagama Main Road, Godda, Jharkhand 814154
                  </p>
                </div>
              </div>

              {/* Phones */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Direct Phone Lines
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <a href="tel:8210582308" className="text-xs font-bold text-white hover:text-[#00E5FF] transition-colors">
                      8210582308
                    </a>
                    <span className="text-gray-500">•</span>
                    <a href="tel:8340408847" className="text-xs font-bold text-white hover:text-[#00E5FF] transition-colors">
                      8340408847
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Official Email
                  </span>
                  <a href="mailto:hiramotors007@gmail.com" className="text-xs font-bold text-white hover:text-[#00E5FF] transition-colors">
                    hiramotors007@gmail.com
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Working Hours
                  </span>
                  <p className="text-xs text-white font-medium">
                    Monday – Sunday: 9:00 AM – 8:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Clean Action Buttons: GET DIRECTIONS, CALL, BOOK SHOWROOM VISIT */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl border border-[#0066FF]/60 bg-[#0c1427]/60 hover:bg-[#0066FF]/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Navigation className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Get Directions</span>
              </a>

              <a
                href="tel:8210582308"
                className="flex-1 py-2.5 px-3 rounded-xl border border-emerald-500/60 bg-emerald-950/40 hover:bg-emerald-500/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Now</span>
              </a>

              <button
                onClick={onOpenVisitModal}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span>Book Visit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { ShieldCheck, Wrench, Sparkles, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface WhyChooseUsProps {
  onOpenVisitModal: () => void;
}

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Authorized Yamaha Dealership',
    description:
      'Official Yamaha franchise serving Mahagama, Godda, and surrounding Jharkhand regions with authentic factory warranties and direct manufacturer support.',
    color: '#00E5FF'
  },
  {
    icon: Sparkles,
    title: '100% Genuine Yamaha Parts',
    description:
      'Every replacement part, consumable, and performance accessory sold or fitted is genuine Yamaha Yamalube and OEM factory certified.',
    color: '#0020B2'
  },
  {
    icon: Wrench,
    title: 'Certified Service Support',
    description:
      'Factory-trained Yamaha technicians utilizing specialized computer diagnostic tools (YDT) and standardized service bays.',
    color: '#10B981'
  },
  {
    icon: UserCheck,
    title: 'Expert Consultation & Guidance',
    description:
      'Transparent on-road pricing, clear documentation assistance, and dedicated advisors to match you with your ideal motorcycle.',
    color: '#F59E0B'
  }
];

export default function WhyChooseUs({ onOpenVisitModal }: WhyChooseUsProps) {
  return (
    <section className="relative py-24 bg-[#080B10] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading and Brand Ethos (Matching Reference Frame 30) */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-3 text-yamaha-cyan text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Dealership Credentials
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-display tracking-tight leading-tight">
              RIDDEN BY PASSION. <br />
              <span className="text-gradient-yamaha">POWERED BY TRUST.</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
              At Hira Auto Agency, Mahagama, we are committed to delivering the pure thrill of Yamaha engineering with complete transparency and certified customer support.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onOpenVisitModal}
                className="px-6 py-3 rounded-full bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yamaha-blue/40 transition-transform active:scale-95"
              >
                <span>Visit Showroom</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href="tel:+916201238401"
                className="px-6 py-3 rounded-full glass-panel hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider text-center transition-colors"
              >
                Call: +91 62012 38401
              </a>
            </div>
          </div>

          {/* Right Column: 4 Supported Credential Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-yamaha-cyan/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${pillar.color}20`, border: `1px solid ${pillar.color}40` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: pillar.color }} />
                    </div>
                    <h3 className="text-base font-bold text-white uppercase font-display mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified at Mahagama Branch</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

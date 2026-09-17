'use client';

import React, { useState } from 'react';
import { Calculator, RefreshCw, PhoneCall, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

interface FinanceExchangeProps {
  onOpenVisitModal: () => void;
}

export default function FinanceExchange({ onOpenVisitModal }: FinanceExchangeProps) {
  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState<number>(150000);
  const [downPayment, setDownPayment] = useState<number>(25000);
  const [tenureMonths, setTenureMonths] = useState<number>(36);
  const interestRate = 9.99; // Standard reference APR

  // Compute EMI: P * r * (1+r)^n / ((1+r)^n - 1)
  const principal = Math.max(0, loanAmount - downPayment);
  const monthlyRate = interestRate / 12 / 100;
  const emi =
    principal > 0
      ? Math.round(
          (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1)
        )
      : 0;

  // Exchange Enquiry State
  const [currentTwoWheeler, setCurrentTwoWheeler] = useState('');
  const [exchangeYear, setExchangeYear] = useState('');
  const [exchangePhone, setExchangePhone] = useState('');
  const [exchangeSubmitted, setExchangeSubmitted] = useState(false);

  const handleExchangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExchangeSubmitted(true);
  };

  return (
    <section id="finance" className="relative py-24 bg-[#06080D] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-3 text-yamaha-cyan text-xs font-bold uppercase tracking-widest">
            <Calculator className="w-3.5 h-3.5" />
            Flexible Ownership Programs
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight leading-tight">
            FINANCE ASSISTANCE & <br />
            <span className="text-gradient-yamaha">BIKE EXCHANGE PORTAL</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-gray-400">
            Hira Auto Agency partners with leading verified financial institutions to offer seamless loan approvals and maximum valuation for your pre-owned two-wheeler.
          </p>
        </div>

        {/* Two Pillars Grid: Matching Reference Frame 28 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PILLAR 1: Interactive Finance & EMI Calculator */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-yamaha-cyan">
                  <Calculator className="w-5 h-5" />
                  <h3 className="text-lg font-black text-white uppercase font-display">
                    Finance Assistance & EMI Estimator
                  </h3>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-bold uppercase">
                  From 9.99% APR*
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Calculate estimated monthly installments tailored to your down payment preference.
              </p>

              {/* Sliders */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-2">
                    <span className="text-gray-400">Motorcycle Ex-Showroom Value</span>
                    <span className="text-yamaha-cyan font-display text-sm">
                      ₹{loanAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="80000"
                    max="210000"
                    step="5000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yamaha-cyan"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>₹80,000 (Fascino)</span>
                    <span>₹2,01,340 (R15M)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-2">
                    <span className="text-gray-400">Your Down Payment</span>
                    <span className="text-emerald-400 font-display text-sm">
                      ₹{downPayment.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max={loanAmount * 0.7}
                    step="2000"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-2">
                    <span className="text-gray-400">Loan Tenure</span>
                    <span className="text-white font-display text-sm">{tenureMonths} Months ({tenureMonths / 12} Yrs)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[12, 24, 36, 48].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTenureMonths(t)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          tenureMonths === t
                            ? 'bg-yamaha-racing text-white shadow-md shadow-yamaha-blue/30'
                            : 'glass-card text-gray-400 hover:text-white'
                        }`}
                      >
                        {t}M
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated EMI Display */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Estimated Monthly EMI</p>
                  <p className="text-2xl sm:text-3xl font-black text-white font-display">
                    ₹{emi.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-400">/month</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Loan Amount</p>
                  <p className="text-sm font-bold text-gray-200 font-display">
                    ₹{principal.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenVisitModal}
                className="w-full py-3 rounded-xl bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yamaha-blue/30"
              >
                <span>Apply for Finance at Showroom</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                *Interest rates and eligibility depend on lender terms and customer credit profile. Configurable via dealership.
              </p>
            </div>
          </div>

          {/* PILLAR 2: Exchange Your Bike */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <RefreshCw className="w-5 h-5" />
                  <h3 className="text-lg font-black text-white uppercase font-display">
                    Exchange Your Existing Two-Wheeler
                  </h3>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  Best Market Value
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Upgrade any existing two-wheeler to a brand-new Yamaha motorcycle or scooter. We offer instant on-spot evaluation and attractive exchange bonuses.
              </p>

              {exchangeSubmitted ? (
                <div className="py-12 text-center bg-black/40 rounded-2xl border border-white/5 p-6 animate-fadeIn">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-white uppercase">Valuation Request Received!</h4>
                  <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
                    Our exchange specialist at Hira Auto Agency Mahagama will inspect your vehicle and provide maximum trade-in valuation.
                  </p>
                  <button
                    onClick={() => setExchangeSubmitted(false)}
                    className="mt-4 px-4 py-2 rounded-xl glass-panel text-xs text-yamaha-cyan font-bold"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleExchangeSubmit} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">
                      Current Two-Wheeler (Make & Model)
                    </label>
                    <input
                      type="text"
                      value={currentTwoWheeler}
                      onChange={(e) => setCurrentTwoWheeler(e.target.value)}
                      placeholder="e.g. Hero Splendor 2019 or Honda Activa"
                      className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">
                        Year of Registration
                      </label>
                      <input
                        type="text"
                        value={exchangeYear}
                        onChange={(e) => setExchangeYear(e.target.value)}
                        placeholder="e.g. 2020"
                        className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={exchangePhone}
                        onChange={(e) => setExchangePhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-gray-300">
                    <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Hira Auto Agency Exchange Advantages:</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      • Instant paperless inspection at Kechua Chowk showroom.
                      <br />• Additional festive exchange bonus up to ₹5,000 applicable on R15 and MT-15.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
                  >
                    <span>Request Free Vehicle Valuation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Need immediate assistance?</span>
              <a
                href="tel:8210582308"
                className="text-yamaha-cyan font-bold flex items-center gap-1 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Talk to Exchange Desk: 8210582308</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

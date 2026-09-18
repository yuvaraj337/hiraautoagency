'use client';

import React, { useState } from 'react';
import { Wrench, CheckCircle2, Phone, Calendar, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ServiceSection() {
  const [serviceName, setServiceName] = useState('');
  const [servicePhone, setServicePhone] = useState('');
  const [serviceBike, setServiceBike] = useState('Yamaha R15');
  const [serviceType, setServiceType] = useState('Periodic Maintenance');
  const [serviceDate, setServiceDate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="service" className="relative py-24 bg-[#06080D] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Service Information */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-3 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Wrench className="w-3.5 h-3.5" />
              Yamaha Authorized Service Center
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-display tracking-tight leading-tight">
              PRECISION CARE <br />
              <span className="text-gradient-yamaha">FOR YOUR MACHINE</span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
              Keep your Yamaha operating at peak performance. Our specialized Mohanpur workshop features authorized diagnostic tools, automated oil dispensers, and genuine Yamalube lubricants.
            </p>

            <div className="mt-8 space-y-3.5">
              <div className="flex items-start gap-3 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Yamaha Diagnostic Tool (YDT):</strong>
                  Computerized ECU scanning and sensor diagnostics for all FI models.
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Authentic Yamalube Lubricants:</strong>
                  Full-synthetic race-grade engine oil designed specifically for high-RPM Yamaha engines.
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Express Maintenance Bay:</strong>
                  Fast periodic lube and brake inspection service with zero waiting time.
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <a
                href="tel:+916201238401"
                className="inline-flex items-center gap-2 text-xs font-bold text-yamaha-cyan hover:underline"
              >
                <Phone className="w-4 h-4" />
                <span>Service Helpdesk: +91 62012 38401</span>
              </a>
            </div>
          </div>

          {/* Service Booking Card */}
          <div className="lg:col-span-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 text-left">
              <h3 className="text-lg font-black text-white uppercase font-display mb-1">
                Schedule Service Appointment
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Book in advance to ensure dedicated technician and bay allocation.
              </p>

              {submitted ? (
                <div className="py-10 text-center bg-black/40 rounded-2xl border border-white/5 p-6 animate-fadeIn">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-white uppercase">Service Slot Requested!</h4>
                  <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
                    Our service supervisor will call your mobile number to confirm bay availability and estimated service duration.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 rounded-xl glass-panel text-xs text-yamaha-cyan font-bold"
                  >
                    Schedule Another Vehicle
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Rider Name *</label>
                    <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="e.g. Vikramaditya"
                      className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        value={servicePhone}
                        onChange={(e) => setServicePhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Vehicle Model *</label>
                      <input
                        type="text"
                        value={serviceBike}
                        onChange={(e) => setServiceBike(e.target.value)}
                        placeholder="e.g. R15 V4 or MT-15"
                        className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Service Type</label>
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none bg-yamaha-card"
                      >
                        <option value="Periodic Maintenance">Free / Paid Periodic Service</option>
                        <option value="Running Repair">Running Repair / Brake Inspection</option>
                        <option value="Electrical Diagnosis">FI / Electrical Diagnostic Check</option>
                        <option value="Accidental Repair">Accidental Insurance Claim</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yamaha-blue/40 transition-transform active:scale-95"
                  >
                    <span>Confirm Service Reservation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

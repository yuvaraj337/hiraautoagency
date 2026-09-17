'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, ShieldCheck, AlertCircle, Loader2, Phone } from 'lucide-react';
import { Bike } from './BikeConfiguratorModal';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  bikes: Bike[];
  preselectedBikeId?: string;
  onVisitComplete?: (visit: any) => void;
}

export default function VisitModal({
  isOpen,
  onClose,
  bikes,
  preselectedBikeId,
  onVisitComplete
}: VisitModalProps) {
  const [selectedBikeId, setSelectedBikeId] = useState(preselectedBikeId || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00 AM');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successVisit, setSuccessVisit] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          bikeId: selectedBikeId || null,
          visitDate,
          visitTime,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to book showroom appointment');
      }

      setSuccessVisit(data.visit);
      if (onVisitComplete) onVisitComplete(data.visit);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessVisit(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setVisitDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl glass-panel border border-white/15 p-6 sm:p-8 shadow-2xl my-auto text-left">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successVisit ? (
          /* SUCCESS VIEW */
          <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full bg-yamaha-racing/30 text-yamaha-cyan text-xs font-bold uppercase tracking-wider">
              Visit Appointment Scheduled
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display mt-2">
              WE ARE READY FOR YOU!
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto mt-1">
              Your showroom visit at Hira Auto Agency, Mahagama has been reserved.
            </p>

            <div className="mt-6 p-5 rounded-2xl bg-black/40 border border-white/10 text-left space-y-2 max-w-md mx-auto text-xs">
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-gray-400">Appointment Code:</span>
                <span className="font-bold text-yamaha-cyan font-mono text-sm">{successVisit.visitCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Visitor:</span>
                <span className="font-bold text-white">{successVisit.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scheduled Date:</span>
                <span className="font-bold text-white">{successVisit.visitDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Slot:</span>
                <span className="font-bold text-white">{successVisit.visitTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vehicle of Interest:</span>
                <span className="font-bold text-yamaha-cyan">{successVisit.bikeName}</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-200 max-w-md mx-auto flex items-center gap-2 text-left">
              <ShieldCheck className="w-4 h-4 text-yamaha-cyan shrink-0" />
              <span>We have scheduled an automated 24-hour and 2-hour WhatsApp reminder before your visit.</span>
            </div>

            <button
              onClick={handleReset}
              className="mt-6 px-8 py-3 rounded-xl bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-yamaha-cyan text-xs font-bold uppercase tracking-widest mb-1">
                <Calendar className="w-4 h-4" />
                <span>Showroom Experience</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">
                BOOK A SHOWROOM VISIT
              </h2>
              <p className="text-xs text-gray-400">
                Experience test rides and personalized consultations at Kechua Chowk, Mahagama.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amitesh Dubey"
                  className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="optional"
                    className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Preferred Time *</label>
                  <select
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none bg-yamaha-card"
                    required
                  >
                    <option value="10:00 AM">10:00 AM - Morning Slot</option>
                    <option value="11:30 AM">11:30 AM - Morning Slot</option>
                    <option value="01:00 PM">01:00 PM - Afternoon</option>
                    <option value="03:30 PM">03:30 PM - Afternoon</option>
                    <option value="05:30 PM">05:30 PM - Evening Slot</option>
                    <option value="06:30 PM">06:30 PM - Evening Slot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Motorcycle of Interest</label>
                <select
                  value={selectedBikeId}
                  onChange={(e) => setSelectedBikeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none bg-yamaha-card"
                >
                  <option value="">Any / General Consultation</option>
                  {bikes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-gray-300 block mb-1">Notes / Requirements</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Want to test ride R15 and discuss exchange of my old bike"
                  className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-yamaha-racing hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yamaha-blue/40 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reserving Showroom Slot...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Confirm Showroom Appointment</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

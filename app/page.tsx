'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturedSection from '@/components/FeaturedSection';
import EngineeringSection from '@/components/EngineeringSection';
import BikeConfiguratorModal, { Bike } from '@/components/BikeConfiguratorModal';
import BookingModal from '@/components/BookingModal';
import VisitModal from '@/components/VisitModal';
import LocationSection from '@/components/LocationSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [configuratorBike, setConfiguratorBike] = useState<Bike | null>(null);

  const [bookingBikeId, setBookingBikeId] = useState<string | undefined>(undefined);
  const [bookingVariantId, setBookingVariantId] = useState<string | undefined>(undefined);

  // Fetch bikes & variants from database
  useEffect(() => {
    async function loadBikes() {
      try {
        const res = await fetch('/api/bikes');
        const data = await res.json();
        if (data.success && data.bikes) {
          setBikes(data.bikes);
        }
      } catch (err) {
        console.error('Failed to load bikes from database:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBikes();
  }, []);

  const handleOpenVisitModal = () => {
    setIsVisitModalOpen(true);
  };

  const handleOpenBookingForBike = (bikeId: string, variantId?: string) => {
    setBookingBikeId(bikeId);
    setBookingVariantId(variantId);
    setIsBookingModalOpen(true);
  };

  const handleSelectBikeForConfigurator = (bikeOrSlug: Bike | string) => {
    if (typeof bikeOrSlug === 'string') {
      const found = bikes.find((b) => b.slug === bikeOrSlug || b.id === bikeOrSlug);
      if (found) setConfiguratorBike(found);
    } else {
      setConfiguratorBike(bikeOrSlug);
    }
  };

  const handleExploreBikes = () => {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#06080C] text-white">
      {/* 1. TOP NAVBAR */}
      <Navbar
        onOpenVisitModal={handleOpenVisitModal}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
      />

      {/* 2. HERO SECTION — Scroll Engine (240 30-FPS Frames) */}
      <HeroSection
        onOpenVisitModal={handleOpenVisitModal}
        onExploreBikes={handleExploreBikes}
      />

      {/* 3. SECTION 2 — Pinned 4-Bike Showcase + XSR Transition + Full Yamaha Catalog */}
      <FeaturedSection
        bikes={bikes}
        onSelectBike={handleSelectBikeForConfigurator}
        onOpenBookingModal={(bikeId, variantId) => handleOpenBookingForBike(bikeId, variantId)}
        onOpenVisitModal={handleOpenVisitModal}
      />

      {/* 4. ENGINEERING SECTION — R15 Disassembly (180 30-FPS Frames) */}
      <EngineeringSection
        onExploreR15={() => {
          const r15 = bikes.find((b) => b.slug.includes('r15'));
          if (r15) handleSelectBikeForConfigurator(r15);
        }}
      />

      {/* 5. VERIFIED MAHAGAMA LOCATION & MAP */}
      <LocationSection onOpenVisitModal={handleOpenVisitModal} />

      {/* 6. FINAL CTA & FOOTER */}
      <Footer
        onOpenVisitModal={handleOpenVisitModal}
        onExploreBikes={handleExploreBikes}
      />

      {/* MODALS */}
      {/* Bike Configurator & Split Details View */}
      <BikeConfiguratorModal
        bike={configuratorBike}
        isOpen={!!configuratorBike}
        onClose={() => setConfiguratorBike(null)}
        onBookBike={(bId, vId) => {
          setConfiguratorBike(null);
          handleOpenBookingForBike(bId, vId);
        }}
        onBookVisit={(bId, vId) => {
          setConfiguratorBike(null);
          handleOpenVisitModal();
        }}
      />

      {/* Bike Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bikes={bikes}
        preselectedBikeId={bookingBikeId}
        preselectedVariantId={bookingVariantId}
      />

      {/* Showroom Visit Modal */}
      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        bikes={bikes}
      />
    </main>
  );
}

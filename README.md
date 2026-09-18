# Hira Auto Agency — Yamaha Dealership & CRM Platform

> **Official Digital Dealership Website, Online Reservation System & Full Relational CRM Suite**  
> **Client**: Hira Auto Agency — Authorised Yamaha Two-Wheeler Dealership  
> **Location**: Ekchari Road, Mohanpur, Godda, Jharkhand 814154  
> **Contact**: +91 62012 38401  

---

## Overview

A modern, cinematic web application and enterprise-grade CRM engineered specifically for **Hira Auto Agency Yamaha** in Mohanpur, Jharkhand. The platform features a deterministic scroll-driven 30-FPS frame engine, progressive motorcycle disassembly, authentic 23-variant catalog pricing, split-view 3D configurator modal, test ride booking, and a comprehensive relational CRM dashboard.

---

## Visual & Motion Engine

- **Desktop Hero Canvas Engine**: 240 high-definition frames (`1920x1080`, 30-FPS) with smooth preloading and 3 progressive kinetic typography states.
- **Mobile Hero Canvas Engine**: 240 portrait frames (`1080x1920`, 30-FPS) responsive to device viewport and touch-scroll.
- **Pinned 4-Bike Showcase**: Cinematic presentation of the primary Yamaha lineup:
  - **Yamaha R15 V4** (Supersport flagship)
  - **Yamaha MT-15 V2** (The Dark Side of Japan)
  - **Yamaha FZ-S V4 Hybrid** (Street naked commuter)
  - **Yamaha Aerox 155 S** (Maxi-sports scooter with Smart Key)
- **Engineering Disassembly Engine**: 180 frames (`1280x720`, 30-FPS) scroll-controlled progressive breakdown of the Yamaha R15 moving to the left, complete with interactive technical hotspots (VVA, USD Forks, Assist & Slipper Clutch, Aluminium Swingarm).
- **Aesthetic**: Yamaha Racing Blue, Electric Cyan, and Deep Graphite showroom ambient theme. Strictly no competitor branding.

---

## Authentic 23-Variant Catalog & Verified Pricing

All 23 variants and ex-showroom Mohanpur prices are strictly derived from the official dealership price list:

### 1. R15 Series
- **R-15 V4 (M) Carbon**: ₹2,01,340
- **R-15 (M) Silver**: ₹1,91,130
- **R-15 V4 Quick Shifter**: ₹1,80,300
- **R-15 V4**: ₹1,75,650
- **R-15 V3 (S)**: ₹1,59,970
- **R-15 V4 Monster Energy**: ₹1,76,850

### 2. MT-15 Series
- **MT-15 V2 DLX TFT**: ₹1,76,930
- **MT-15 STD Black**: ₹1,66,710
- **MT-15 Monster Energy**: ₹1,69,110
- **MT-15 STD Cyan Blue**: ₹1,67,610

### 3. FZ Series
- **F-Z V3**: ₹1,17,560
- **F-Z Rave**: ₹1,25,880
- **FZ-S V3 STD**: ₹1,31,680
- **FZ-S V4 Hybrid**: ₹1,42,000

### 4. XSR Heritage Series
- **XSR Black**: ₹1,63,900
- **XSR Silver**: ₹1,61,900
- **XSR Red**: ₹1,57,900
- **XSR Blue**: ₹1,57,090
- **XSR Green**: ₹1,63,900

### 5. Scooters & Maxi-Scooter
- **Ray ZR (Drum)**: ₹82,880
- **Ray ZR (Street Rally)**: ₹96,930
- **Fascino (Drum)**: ₹80,980
- **Aerox S (Smart Key)**: ₹1,50,350

---

## Relational CRM Dashboard (`/admin`)

- **Secure JWT Authentication & RBAC**: Dedicated roles for Super Admin, Sales Manager, and Service Lead.
- **KPI Metrics & Financials**: Live booking statistics, revenue collected, pending collections, and 7-day volume trends.
- **360° Customer Profiles**: Chronological order history and per-customer WhatsApp reminder toggle (`ON` / `OFF`).
- **Showroom Visits & Calendar**: Dual table view and interactive Monthly/Weekly calendar scheduler with slot conflict prevention.
- **Bookings & Offline Payments**: Record counter cash / UPI payments, calculate balance due, update delivery stages, and print official dealership vouchers.
- **Payments Ledger**: Immutable financial transaction receipts with printable single tax vouchers.
- **WhatsApp Notification Engine**: Automated 24h and 2h pre-visit notification queues with dynamic template editor.
- **Live Catalog & Price Sync**: Real-time database price modification that immediately updates the live public catalog.
- **Promotions & Offers**: Manage festival schemes, exchange bonuses, and discount banners.
- **Dealership Settings & Audit Trail**: Operating hours, capacity limits, and chronological security audit trail.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend & Database**: Next.js Server Components, SQLite with WAL mode (`better-sqlite3`), `bcryptjs`, `jsonwebtoken`
- **Animations**: HTML5 2D Canvas Frame Engine, CSS Keyframes & Smooth Scroll Snap
- **Verification**: 10/10 Automated Integration Test Suite (`scripts/verify_all_endpoints.js`)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm run start
```

---

## Default Admin Credentials

- **URL**: `/admin/login`
- **Super Admin**: `admin@hiraauto.com` / `admin123`
- **Sales Manager**: `sales@hiraauto.com` / `admin123`
- **Service Head**: `service@hiraauto.com` / `admin123`

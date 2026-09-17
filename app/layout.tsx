import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hira Auto Agency | Authorized Yamaha Dealership Mahagama, Godda",
  description: "Experience Yamaha motorcycles & scooters at Hira Auto Agency, Mahagama, Godda. Official dealer for R15 V4, MT-15 V2, FZ-S V4 Hybrid, Aerox S, XSR 155, Ray ZR & Fascino. Book showroom test rides and genuine service.",
  keywords: [
    "Yamaha showroom Mahagama",
    "Yamaha bikes Mahagama",
    "Yamaha dealer Godda",
    "Yamaha R15 Mahagama",
    "Yamaha MT-15 Mahagama",
    "Hira Auto Agency",
    "Hira Motors Mahagama",
    "Yamaha Jharkhand",
    "Yamaha Aerox Mahagama"
  ],
  openGraph: {
    title: "Hira Auto Agency | Authorized Yamaha Dealership Mahagama",
    description: "Discover genuine Yamaha performance, racing technology and book test rides at Hira Auto Agency, Mahagama, Godda.",
    siteName: "Hira Auto Agency Yamaha",
    images: [
      {
        url: "/assets/bikes/hero_r15_v4.jpg",
        width: 1200,
        height: 630,
        alt: "Hira Auto Agency Yamaha Dealership Showroom",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-yamaha-black text-white antialiased selection:bg-yamaha-racing selection:text-white">
        {children}
      </body>
    </html>
  );
}

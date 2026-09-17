import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-yamaha-cyan tracking-tight font-display mb-2">404</h1>
      <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">Page Not Found</h2>
      <p className="text-white/50 text-sm max-w-md mb-6">
        The requested page does not exist or has been relocated at Hira Auto Agency Yamaha.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-yamaha-racing text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-600 transition-all shadow-lg shadow-yamaha-blue/30"
      >
        Return to Showroom
      </Link>
    </div>
  );
}

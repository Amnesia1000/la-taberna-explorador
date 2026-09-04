import Link from "next/link";
import { Compass, Shield, ArrowUpRight, Flame } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full wood-beam border-b-4 border-[#8c5828] text-[#fef3c7] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Banner */}
        <Link href="/" className="flex items-center gap-3.5 group">
          {/* Wooden / Brass Tavern Shield Signet */}
          <div className="w-11 h-11 border-2 border-[#ca8a04] bg-gradient-to-b from-[#4a2614] via-[#2d160b] to-[#1a0c06] text-[#fef3c7] flex items-center justify-center rounded-sm shadow-lg group-hover:border-[#fde047] transition-all relative">
            <Compass className="w-6 h-6 text-[#f59e0b] group-hover:rotate-45 transition-transform duration-500" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#f59e0b] border border-[#78350f]"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[#f59e0b] border border-[#78350f]"></div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[#f59e0b] text-xs">✦</span>
              <span className="font-tavern text-base sm:text-xl tracking-wider font-bold text-[#fffdfa] group-hover:text-[#fde047] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                LA TABERNA DEL EXPLORADOR
              </span>
              <span className="text-[#f59e0b] text-xs">✦</span>
            </div>
            <span className="text-[11px] text-[#e2b17b] font-serif tracking-widest uppercase flex items-center gap-1.5 opacity-90">
              <Flame className="w-3 h-3 text-[#d97706]" />
              <span>Gremio de Juegos & Alquiler de Campaña</span>
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs font-tavern tracking-wider uppercase text-[#fde047] hover:text-[#ffffff] border border-transparent hover:border-[#a16207] transition rounded-sm"
          >
            [Catálogo de Juegos]
          </Link>
          <Link
            href="/admin"
            className="tavern-btn-medieval flex items-center gap-2 rounded-sm"
          >
            <Shield className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Gremio / Admin</span>
            <ArrowUpRight className="w-3 h-3 text-[#fde047] opacity-80" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

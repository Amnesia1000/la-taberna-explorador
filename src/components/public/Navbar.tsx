import Link from "next/link";
import Image from "next/image";
import { Flame } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full wood-beam border-b-4 border-[#8c5828] text-[#fef3c7] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-0 sm:h-20 flex items-center justify-between">
        {/* Brand Banner */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo image */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/Logo.png"
              alt="Logo La Taberna del Explorador"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex flex-col">
            <span className="font-tavern text-sm sm:text-xl tracking-wider font-bold text-[#fffdfa] group-hover:text-[#fde047] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
              LA TABERNA DEL EXPLORADOR
            </span>
            <span className="hidden sm:flex text-[11px] text-[#e2b17b] font-serif tracking-widest uppercase items-center gap-1.5 opacity-90">
              <Flame className="w-3 h-3 text-[#d97706]" />
              <span>Gremio de Juegos &amp; Alquiler de Campaña</span>
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}

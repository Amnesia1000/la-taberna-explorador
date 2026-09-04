import Link from "next/link";
import { Dices, ShieldAlert, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 border border-zinc-900 bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-sm">
            <Dices className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm tracking-widest uppercase font-bold text-zinc-900 group-hover:text-zinc-600 transition">
              TABERNA // JUEGOS
            </span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider">
              CATÁLOGO & ALQUILER
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 text-xs font-mono tracking-wider uppercase text-zinc-600 hover:text-zinc-950 border border-transparent hover:border-zinc-300 transition"
          >
            [Catálogo]
          </Link>
          <Link
            href="/admin"
            className="px-3 py-1.5 text-xs font-mono tracking-wider uppercase bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 flex items-center gap-1.5 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-700" />
            <span>Panel Admin</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-400" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

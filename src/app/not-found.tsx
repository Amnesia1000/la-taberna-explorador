import Link from "next/link";
import Navbar from "@/components/public/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
        <div className="parchment-folio border-4 border-[#733d18] px-8 py-12 max-w-lg w-full text-center shadow-2xl rounded-sm">
          <p className="font-tavern text-6xl font-extrabold text-[#b45309]" aria-hidden="true">
            404
          </p>
          <h1 className="font-tavern text-xl md:text-2xl font-extrabold uppercase tracking-wide text-[#2c1409] mt-2">
            Te perdiste en la mazmorra
          </h1>
          <p className="text-sm font-serif text-[#6b4c33] mt-2 max-w-sm mx-auto">
            La crónica que buscás no existe o fue archivada en otro grimorio.
          </p>
          <Link
            href="/"
            className="tavern-btn-gold inline-flex items-center gap-2 rounded-sm mt-6 px-6 py-3"
          >
            Volver al catálogo
          </Link>
        </div>
      </main>
    </div>
  );
}

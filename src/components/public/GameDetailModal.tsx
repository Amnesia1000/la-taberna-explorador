"use client";

import { X, Users, Clock, Flame, MessageSquare, Compass, Shield } from "lucide-react";
import { GameWithComponents } from "@/types";

interface GameDetailModalProps {
  game: GameWithComponents | null;
  onClose: () => void;
}

export default function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  if (!game) return null;

  const isAvailable = game.stock > 0;

  // Formato del mensaje de WhatsApp para la Taberna
  const phone = "5491144556677";
  const message = `¡Saludos Tabernero! Deseo alquilar el juego "${game.name}" (${game.category}) en La Taberna del Explorador. ¿Hay ejemplares disponibles en el inventario?`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140a05]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl parchment-folio border-4 border-[#783e18] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-sm">
        {/* Brass Corner Accents */}
        <div className="brass-corner-tl" />
        <div className="brass-corner-tr" />
        <div className="brass-corner-bl" />
        <div className="brass-corner-br" />

        {/* Modal Header - Heavy Timber Header */}
        <div className="px-6 py-4 wood-beam border-b-2 border-[#8c5828] flex items-center justify-between text-[#fef3c7]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-[#ca8a04] to-[#78350f] text-[#2c1409] flex items-center justify-center font-bold text-xs shadow-md">
              <Compass className="w-4 h-4 text-[#1a0a03]" />
            </div>
            <span className="font-tavern text-xs uppercase bg-[#4a2612] text-[#fef08a] border border-[#a16207] px-2.5 py-0.5 font-bold tracking-wider rounded-sm">
              {game.category}
            </span>
            <span className="font-serif text-xs text-[#e2b17b]">
              Folio #{game.id.substring(0, 8)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#e2b17b] hover:text-[#ffffff] hover:bg-[#4a2612] rounded transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Parchment Folio */}
        <div className="p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-[#fffefc] via-[#fbf7ee] to-[#f4ecd8]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Container with Wooden Frame */}
            <div className="border-3 border-[#783e18] aspect-[4/3] bg-[#291307] overflow-hidden relative shadow-md rounded-sm">
              {game.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-tavern text-xs text-[#d6b080]">
                  [RETRATO NO DISPONIBLE]
                </div>
              )}

              {/* Wax Seal Stamp in Image */}
              <div className="absolute bottom-2.5 left-2.5">
                {isAvailable ? (
                  <span className="wax-seal-green font-tavern text-[10px] uppercase px-2.5 py-1 flex items-center gap-1.5 font-bold tracking-wider rounded-sm">
                    <span className="w-2 h-2 rounded-full bg-[#a7f3d0] inline-block animate-ping"></span>
                    DISPONIBLE: {game.stock} UNID.
                  </span>
                ) : (
                  <span className="wax-seal-red font-tavern text-[10px] uppercase px-2.5 py-1 flex items-center gap-1.5 font-bold tracking-wider rounded-sm">
                    <span className="w-2 h-2 rounded-full bg-red-300 inline-block"></span>
                    AGOTADO EN TABERNA
                  </span>
                )}
              </div>
            </div>

            {/* Core Info */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-[#b45309] mb-1">
                  <span className="text-xs">✦</span>
                  <span className="text-[11px] font-tavern uppercase tracking-widest font-bold">
                    Crónica del Grimorio
                  </span>
                  <span className="text-xs">✦</span>
                </div>

                <h2 className="font-tavern text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#2c1409] leading-tight">
                  {game.name}
                </h2>

                {/* Golden Coin Price */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fef08a] via-[#eab308] to-[#a16207] border border-[#713f12] flex items-center justify-center font-tavern font-bold text-sm text-[#451a03] shadow-md">
                    $
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-tavern text-[#78593f] block leading-none font-bold">
                      Tarifa de Préstamo
                    </span>
                    <span className="font-tavern text-2xl font-bold text-[#2b170c]">
                      ${game.price.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t-2 border-dotted border-[#c8a774]">
                  <h4 className="text-[10px] font-tavern uppercase text-[#82674e] tracking-wider mb-1 font-bold">
                    Reseña de Campaña
                  </h4>
                  <p className="text-sm font-serif text-[#4a2e19] leading-relaxed">
                    {game.description}
                  </p>
                </div>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-1 border-2 border-[#ad8551] bg-[#f5ecd8] p-3 text-center rounded-sm shadow-inner">
                <div className="border-r border-[#d4be95] last:border-0 pr-1">
                  <Users className="w-4 h-4 mx-auto text-[#854d0e] mb-1" />
                  <span className="text-[10px] text-[#78593f] font-tavern block uppercase font-bold">Mesa</span>
                  <span className="font-bold text-[#2d1409] text-xs font-serif">{game.minPlayers} a {game.maxPlayers} p.</span>
                </div>
                <div className="border-r border-[#d4be95] last:border-0 pr-1">
                  <Flame className="w-4 h-4 mx-auto text-[#854d0e] mb-1" />
                  <span className="text-[10px] text-[#78593f] font-tavern block uppercase font-bold">Nivel</span>
                  <span className="font-bold text-[#2d1409] text-xs font-serif">+{game.minAge} años</span>
                </div>
                <div>
                  <Clock className="w-4 h-4 mx-auto text-[#854d0e] mb-1" />
                  <span className="text-[10px] text-[#78593f] font-tavern block uppercase font-bold">Tiempo</span>
                  <span className="font-bold text-[#2d1409] text-xs font-serif">{game.playtime} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / WhatsApp CTA */}
        <div className="px-6 py-4 wood-beam border-t-2 border-[#8c5828] flex items-center justify-end gap-3 text-[#fef3c7]">
          <button
            type="button"
            onClick={onClose}
            className="tavern-btn-medieval rounded-sm"
          >
            Cerrar Ficha
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tavern-btn-gold flex items-center gap-2 rounded-sm"
          >
            <MessageSquare className="w-4 h-4 text-[#fef08a]" />
            <span>Alquilar por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

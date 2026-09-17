"use client";

import { useState, useEffect } from "react";
import { X, Users, Clock, Baby, MessageSquare, Check } from "lucide-react";
import { GameWithComponents } from "@/types";

interface GameDetailModalProps {
  game: GameWithComponents | null;
  onClose: () => void;
}

export default function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>([]);

  useEffect(() => {
    setSelectedExpansions([]);
  }, [game?.id]);

  if (!game) return null;

  const isAvailable = game.stock > 0;

  // Cálculo de precio con expansiones seleccionadas
  const selectedExpList = (game.expansions || []).filter((exp) =>
    selectedExpansions.includes(exp.id)
  );
  const expansionsTotalPrice = selectedExpList.reduce(
    (sum, exp) => sum + exp.price,
    0
  );
  const totalPrice = game.price + expansionsTotalPrice;

  // Formato del mensaje de WhatsApp para la Taberna (Argentina: +54 9 261 248-0816)
  const phone = "5492612480816";
  const expText =
    selectedExpList.length > 0
      ? ` junto con la(s) expansión(es): ${selectedExpList.map((e) => e.name).join(", ")}`
      : "";
  const message = `¡Saludos Tabernero! Deseo alquilar el juego "${game.name}" (${game.category})${expText} por un valor total de $${totalPrice.toLocaleString(
    "es-AR"
  )} en La Taberna del Explorador. ¿Hay ejemplares disponibles en el inventario?`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  // Formato dinámico de duración (ej: 20-30m o 30m)
  const formattedPlaytime =
    game.maxPlaytime && game.maxPlaytime !== game.playtime
      ? `${game.playtime}-${game.maxPlaytime}m`
      : `${game.playtime}m`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#140a05]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-2xl parchment-folio border-t-4 sm:border-4 border-[#783e18] shadow-2xl max-h-[95vh] sm:max-h-[92vh] flex flex-col overflow-hidden sm:rounded-sm rounded-t-xl">
        {/* Brass Corner Accents */}
        <div className="brass-corner-tl" />
        <div className="brass-corner-tr" />
        <div className="brass-corner-bl" />
        <div className="brass-corner-br" />

        {/* Modal Header - Heavy Timber Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 wood-beam border-b-2 border-[#8c5828] flex items-center justify-between text-[#fef3c7] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center p-0.5">
              <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-tavern text-xs uppercase bg-[#4a2612] text-[#fef08a] border border-[#a16207] px-2.5 py-0.5 font-bold tracking-wider rounded-sm">
              {game.category}
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-gradient-to-b from-[#fffefc] via-[#fbf7ee] to-[#f4ecd8] flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
            {/* Columna Izquierda: Imagen y Expansiones */}
            <div className="space-y-4">
              {/* Image Container with Wooden Frame */}
              <div className="border-3 border-[#783e18] aspect-[16/9] sm:aspect-[4/3] bg-[#291307] overflow-hidden relative shadow-md rounded-sm">
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
                      DISPONIBLE
                    </span>
                  ) : (
                    <span className="wax-seal-red font-tavern text-[10px] uppercase px-2.5 py-1 flex items-center gap-1.5 font-bold tracking-wider rounded-sm">
                      <span className="w-2 h-2 rounded-full bg-red-300 inline-block"></span>
                      AGOTADO EN TABERNA
                    </span>
                  )}
                </div>
              </div>

              {/* ── SECCIÓN EXPANSIONES (Debajo de la imagen) ── */}
              {game.expansions && game.expansions.length > 0 && (
                <div className="pt-3 border-t-2 border-dashed border-[#c8a774]">
                  <div className="flex justify-center mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/amplia.png" alt="Amplía tu experiencia" className="h-16 sm:h-20 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]" />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {game.expansions.map((exp) => {
                      const isSelected = selectedExpansions.includes(exp.id);
                      return (
                        <button
                          type="button"
                          key={exp.id}
                          onClick={() => {
                            setSelectedExpansions((prev) =>
                              prev.includes(exp.id)
                                ? prev.filter((id) => id !== exp.id)
                                : [...prev, exp.id]
                            );
                          }}
                          className={`w-full flex gap-3 items-center p-2.5 rounded-sm border-2 shadow-sm transition-all text-left cursor-pointer ${isSelected
                            ? "bg-[#fef3c7] border-[#b45309] ring-1 ring-[#b45309] shadow-md"
                            : "bg-[#fdfaf3] border-[#d4be95] hover:border-[#b45309]"
                            }`}
                        >
                          {/* Tilde / Checkbox visual */}
                          <div
                            className={`w-5 h-5 rounded-sm border shrink-0 flex items-center justify-center transition-colors ${isSelected
                              ? "bg-[#b45309] border-[#78350f] text-[#fef08a]"
                              : "border-[#8c5828] bg-[#fffdf9]"
                              }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          {exp.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <div className="w-12 h-12 shrink-0 border border-[#8c5828] rounded-sm overflow-hidden bg-[#291307]">
                              <img src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 shrink-0 border border-[#8c5828] rounded-sm overflow-hidden bg-[#3d2011] flex items-center justify-center text-[#d6b080] font-tavern text-[8px] text-center p-1 leading-tight">
                              SIN IMAGEN
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-tavern text-xs font-bold text-[#2c1409] uppercase tracking-wide truncate" title={exp.name}>
                              {exp.name}
                            </h5>
                            <div className="mt-0.5 flex items-baseline gap-1">
                              <span className="text-xs leading-none">🪙</span>
                              <span className="font-tavern text-xs font-bold text-[#b45309]">
                                +${exp.price.toLocaleString("es-AR")}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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

                {/* Gold coin price dinámico */}
                <div className="mt-3 flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl leading-none" title="Precio total de alquiler">🪙</span>
                    <span className="font-tavern text-3xl font-bold text-[#2b170c]">
                      ${totalPrice.toLocaleString("es-AR")}
                    </span>
                  </div>
                  {expansionsTotalPrice > 0 && (
                    <span className="text-[11px] font-serif text-[#b45309] font-semibold">
                      (Base ${game.price.toLocaleString("es-AR")} + Exp. ${expansionsTotalPrice.toLocaleString("es-AR")})
                    </span>
                  )}
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

              {/* Stats Box - Iconos sin texto e icono Baby */}
              <div className="grid grid-cols-3 gap-2 border-2 border-[#ad8551] bg-[#f5ecd8] p-3 text-center rounded-sm shadow-inner items-center">
                <div className="border-r border-[#d4be95] flex flex-col items-center justify-center gap-1">
                  <Users className="w-6 h-6 text-[#3b1a08]" />
                  <span className="font-extrabold text-[#2d1409] text-base leading-none">
                    {game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}-${game.maxPlayers}`}
                  </span>
                </div>
                <div className="border-r border-[#d4be95] flex flex-col items-center justify-center gap-1">
                  <Baby className="w-6 h-6 text-[#3b1a08]" />
                  <span className="font-extrabold text-[#2d1409] text-base leading-none">
                    +{game.minAge}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <Clock className="w-6 h-6 text-[#3b1a08]" />
                  <span className="font-extrabold text-[#2d1409] text-base leading-none">
                    {formattedPlaytime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / WhatsApp CTA */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 wood-beam border-t-2 border-[#8c5828] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 text-[#fef3c7] shrink-0">
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
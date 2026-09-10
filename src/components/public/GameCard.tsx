"use client";

import { useState, useEffect } from "react";
import { Users, Clock, Flame } from "lucide-react";
import { GameWithComponents } from "@/types";

interface GameCardProps {
  game: GameWithComponents & { image2?: string | null };
  onSelect: (game: GameWithComponents) => void;
}

export default function GameCard({ game, onSelect }: GameCardProps) {
  // Lista de imágenes disponibles
  const images = [game.image, game.image2].filter((img): img is string => Boolean(img));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotación automática cada 3.5 segundos si hay más de una imagen
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length]);

  // Formato dinámico de duración (ej: 20-30m o 30m)
  const formattedPlaytime =
    game.maxPlaytime && game.maxPlaytime !== game.playtime
      ? `${game.playtime}-${game.maxPlaytime}m`
      : `${game.playtime}m`;

  return (
    <button
      type="button"
      onClick={() => onSelect(game)}
      className="group relative w-full text-left focus:outline-none focus:ring-2 focus:ring-[#b45309] rounded-sm"
      aria-label={`Ver ficha de ${game.name}`}
    >
      {/* Ficha frame — aspect ratio ~4:5 matching the PNG */}
      <div className="relative w-full" style={{ aspectRatio: "4/5" }}>

        {/* The ficha PNG frame on top (z-10) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ficha.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-10"
        />

        {/* ── ZONA IMAGEN ── */}
        <div
          className="absolute z-0 overflow-hidden"
          style={{ top: "5%", left: "13%", right: "9%", height: "50%" }}
        >
          {images.length > 0 ? (
            images.map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`${game.name} - ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-in-out ${idx === currentImageIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
                  }`}
              />
            ))
          ) : (
            <div className="w-full h-full bg-[#3d2011] flex items-center justify-center text-[#d6b080] font-tavern text-xs">
              [SIN RETRATO]
            </div>
          )}

          {/* Puntos de indicación sutiles si hay 2 imágenes */}
          {images.length > 1 && (
            <div className="absolute bottom-1.5 right-2 flex gap-1 z-20">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex
                      ? "bg-[#fde047] w-2.5"
                      : "bg-black/60"
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── CATEGORÍA — esquina superior izquierda de la imagen ── */}
        <div
          className="absolute z-20"
          style={{ top: "9.5%", left: "14.5%" }}
        >
          <span className="font-tavern text-[11px] uppercase text-[#fff8ee] tracking-wider font-bold bg-[#1a0a03]/65 backdrop-blur-[2px] px-2.5 py-1 rounded-sm shadow-md">
            {game.category}
          </span>
        </div>

        {/* ── ZONA PERGAMINO — nombre, stats y precio ── */}
        <div
          className="absolute z-20 flex flex-col justify-between"
          style={{ top: "58%", left: "14%", right: "10%", bottom: "8%" }}
        >
          {/* Title + Description */}
          <div>
            <h3 className="font-tavern text-sm sm:text-base font-extrabold text-[#1a0903] uppercase tracking-wide line-clamp-1 max-w-[93%] mx-auto leading-tight group-hover:text-[#7a2e00] transition-colors text-center">
              {game.name}
            </h3>
            <p className="text-[13px] font-serif text-[#2e1508] line-clamp-3 leading-tight mt-0.5 font-semibold max-w-[75%] mx-auto text-center">
              {game.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 text-center items-center">
            <div className="flex flex-col items-center gap-1">
              <Users className="w-5 h-5 text-[#3b1a08]" />
              <span className="font-extrabold text-[#1a0903] text-[15px] leading-none">
                {game.minPlayers}-{game.maxPlayers}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Flame className="w-5 h-5 text-[#3b1a08]" />
              <span className="font-extrabold text-[#1a0903] text-[15px] leading-none">
                +{game.minAge}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Clock className="w-5 h-5 text-[#3b1a08]" />
              <span className="font-extrabold text-[#1a0903] text-[15px] leading-none">
                {formattedPlaytime}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 ml-10 relative translate-y-1.5">
            <span className="text-2xl leading-none">🪙</span>
            <span className="font-tavern text-2xl font-extrabold text-[#1a0903]">
              ${game.price.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Clock, Baby } from "lucide-react";
import { GameWithComponents } from "@/types";
import { ASSETS } from "@/lib/assets";

interface GameCardProps {
  game: GameWithComponents & { image2?: string | null };
  onSelect: (game: GameWithComponents) => void;
  /** Muestra sello de disponibilidad sobre la imagen */
  showAvailability?: boolean;
  /** Muestra mini-etiquetas bajo jugadores/edad/duración */
  labeledStats?: boolean;
}

export default function GameCard({ game, onSelect, showAvailability = false, labeledStats = false }: GameCardProps) {
  // Lista de imágenes disponibles
  const images = [game.image, game.image2].filter((img): img is string => Boolean(img));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotación automática cada 3.5 segundos si hay más de una imagen
  // (desactivada si el usuario prefiere movimiento reducido)
  useEffect(() => {
    if (images.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
      className="group relative w-full max-w-sm sm:max-w-none mx-auto text-left focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b45309] rounded-sm transition-[transform] duration-300 hover:-translate-y-1.5"
      aria-label={`Ver ficha de ${game.name}`}
    >
      {/* Ficha frame — aspect ratio matching the PNG (657x912) */}
      <div
        className="relative w-full [container-type:inline-size] transition-[filter] duration-300 drop-shadow-[0_10px_16px_rgba(0,0,0,0.90)] group-hover:drop-shadow-[0_18px_24px_rgba(0,0,0,0.90)]"
        style={{ aspectRatio: "657/912" }}
      >

        {/* The ficha PNG frame on top (z-10) */}
        <Image
          src={ASSETS.ficha.split("?")[0]}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-10"
        />

        {/* ── EXPANSIONES DISPONIBLES ── */}
        {((game.expansions && game.expansions.length > 0) || game.hasExpansions || (game._count?.expansions ?? 0) > 0) && (
          <div className="seal-glow absolute z-30 pointer-events-none" style={{ top: "-1%", right: "30%", width: "35%" }}>
            <Image
              src={ASSETS.disponible.split("?")[0]}
              alt="Expansiones disponibles"
              width={174}
              height={76}
              className="w-full h-auto drop-shadow-[0_8px_12px_rgba(0,0,0,0.7)] group-hover:drop-shadow-[0_10px_16px_rgba(0,0,0,0.85)] transition-[filter,transform] duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* ── ZONA IMAGEN ── */}
        <div
          className="absolute z-0 overflow-hidden"
          style={{ top: "5%", left: "13%", right: "9%", height: "50%" }}
        >
          {images.length > 0 ? (
            images.map((src, idx) => (
              <Image
                key={src}
                src={src}
                alt={`${game.name} - ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`absolute inset-0 w-full h-full object-cover contrast-110 group-hover:scale-105 transition-[opacity,transform,filter] duration-1000 ease-in-out motion-reduce:transition-none motion-reduce:transform-none md:grayscale md:group-hover:grayscale-0 ${idx === currentImageIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
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
                  className={`w-1.5 h-1.5 rounded-full transition-[width,background-color] duration-300 ${idx === currentImageIndex
                    ? "bg-[#fde047] w-2.5"
                    : "bg-black/60"
                    }`}
                />
              ))}
            </div>
          )}

        </div>

        {/* Sello de disponibilidad (opt-in): misma columna que la categoría, zona baja de la foto */}
        {showAvailability && (
          <div
            className="absolute z-20"
            style={{ top: "calc(46% - 3px)", left: "14.5%" }}
          >
            <span className={`font-tavern text-[3cqw] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm shadow-md backdrop-blur-[2px] ${game.stock > 0 ? "bg-[#14532d]/70 text-[#d1fae5]" : "bg-[#7f1d1d]/70 text-[#fecaca]"}`}>
              {game.stock > 0 ? "● Disponible" : "● Agotado"}
            </span>
          </div>
        )}

        {/* ── CATEGORÍA — esquina superior izquierda de la imagen ── */}
        <div
          className="absolute z-20"
          style={{ top: "calc(9.5% - 3px)", left: "14.5%" }}
        >
          <span className="font-tavern text-[3cqw] uppercase text-[#fff8ee] tracking-wider font-bold bg-[#1a0a03]/65 backdrop-blur-[2px] px-2 py-0.5 rounded-sm shadow-md">
            {game.category}
          </span>
        </div>

        {/* ── ZONA PERGAMINO — nombre, stats y precio ── */}
        <div
          className="absolute z-20 flex flex-col justify-between pt-1"
          style={{ top: "58%", left: "14%", right: "10%", bottom: "8%" }}
        >
          {/* Title + Description */}
          <div>
            <h3 className="font-tavern text-[4.3cqw] font-extrabold text-[#1a0903] uppercase tracking-wide line-clamp-1 max-w-[93%] mx-auto leading-tight group-hover:text-[#7a2e00] transition-colors text-center">
              {game.name}
            </h3>
            <p className="text-[3.7cqw] font-serif text-[#2e1508] line-clamp-3 leading-tight mt-0.5 font-semibold max-w-[77%] mx-auto text-justify -translate-x-[3px]">
              {game.description}
            </p>
          </div>

          {/* Stats: icono al lado del valor */}
          <div className="flex justify-center gap-3 text-center items-center">
            <div className="flex items-center gap-0.5">
              <Users className="w-[5.3cqw] h-[5.3cqw] text-[#3b1a08] shrink-0" />
              <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="font-extrabold text-[#1a0903] text-[4cqw] leading-none">
                  {game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}-${game.maxPlayers}`}
                </span>
                {labeledStats && <span className="text-[2.7cqw] font-bold uppercase tracking-wide text-[#5a3a22] leading-none">jug.</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Baby className="w-[5.3cqw] h-[5.3cqw] text-[#3b1a08] shrink-0" />
              <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="font-extrabold text-[#1a0903] text-[4cqw] leading-none">
                  +{game.minAge}
                </span>
                {labeledStats && <span className="text-[2.7cqw] font-bold uppercase tracking-wide text-[#5a3a22] leading-none">años</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-[5.3cqw] h-[5.3cqw] text-[#3b1a08] shrink-0" />
              <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="font-extrabold text-[#1a0903] text-[4cqw] leading-none">
                  {formattedPlaytime}
                </span>
                {labeledStats && <span className="text-[2.7cqw] font-bold uppercase tracking-wide text-[#5a3a22] leading-none">duración</span>}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 ml-[13cqw] relative translate-y-1.5">
            <span className="text-[6.7cqw] leading-none" aria-hidden="true">🪙</span>
            <span className="font-tavern text-[6.7cqw] font-extrabold text-[#1a0903]">
              ${game.price.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
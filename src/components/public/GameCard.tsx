import { Users, Clock, Flame } from "lucide-react";
import { GameWithComponents } from "@/types";

interface GameCardProps {
  game: GameWithComponents;
  onSelect: (game: GameWithComponents) => void;
}

export default function GameCard({ game, onSelect }: GameCardProps) {
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
          {game.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-[#3d2011] flex items-center justify-center text-[#d6b080] font-tavern text-xs">
              [SIN RETRATO]
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
            <h3 className="font-tavern text-sm sm:text-base font-extrabold text-[#1a0903] uppercase tracking-wide line-clamp-1 leading-tight group-hover:text-[#7a2e00] transition-colors text-center">
              {game.name}
            </h3>
            <p className="text-[13px] font-serif text-[#2e1508] line-clamp-3 leading-snug mt-0.5 font-semibold max-w-[75%] mx-auto text-center">
              {game.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 text-center">
            <div className="flex flex-col items-center gap-0">
              <div className="flex items-center gap-0.5 text-[#3b1a08] leading-none">
                <Users className="w-3 h-3" />
                <span className="text-[10px] font-tavern uppercase font-bold text-[#3b1a08] leading-none">Jugadores</span>
              </div>
              <span className="font-extrabold text-[#1a0903] text-[15px] leading-none -mt-0.5">{game.minPlayers}-{game.maxPlayers}</span>
            </div>
            <div className="flex flex-col items-center gap-0">
              <div className="flex items-center gap-0.5 text-[#3b1a08] leading-none">
                <Flame className="w-3 h-3" />
                <span className="text-[10px] font-tavern uppercase font-bold text-[#3b1a08] leading-none">Edad</span>
              </div>
              <span className="font-extrabold text-[#1a0903] text-[15px] leading-none -mt-0.5">+{game.minAge}a</span>
            </div>
            <div className="flex flex-col items-center gap-0">
              <div className="flex items-center gap-0.5 text-[#3b1a08] leading-none">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-tavern uppercase font-bold text-[#3b1a08] leading-none">Duración</span>
              </div>
              <span className="font-extrabold text-[#1a0903] text-[15px] leading-none -mt-0.5">{game.playtime}m</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 ml-6">
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

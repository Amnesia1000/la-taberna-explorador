import { Users, Clock, Flame, Sparkles } from "lucide-react";
import { GameWithComponents } from "@/types";

interface GameCardProps {
  game: GameWithComponents;
  onSelect: (game: GameWithComponents) => void;
}

export default function GameCard({ game, onSelect }: GameCardProps) {
  const isAvailable = game.stock > 0;

  return (
    <div className="group parchment-folio flex flex-col transition-all duration-300 rounded-sm hover:-translate-y-1">
      {/* Decorative Brass Corner Brackets */}
      <div className="brass-corner-tl" />
      <div className="brass-corner-tr" />
      <div className="brass-corner-bl" />
      <div className="brass-corner-br" />

      {/* Medieval Portrait Frame with Wooden Bezel */}
      <div className="p-2.5 pb-0">
        <div className="relative aspect-[4/3] w-full bg-[#3d2011] border-2 border-[#733d18] overflow-hidden shadow-inner rounded-sm">
          {game.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#d6b080] font-tavern text-xs">
              [RETRATO NO DISPONIBLE]
            </div>
          )}

          {/* Stamped Guild Tag */}
          <div className="absolute top-2.5 left-2.5">
            <span className="font-tavern text-[10px] uppercase bg-[#fdfaf2]/95 text-[#4a260f] border-2 border-[#8c5828] px-2.5 py-0.5 tracking-wider font-bold shadow-md rounded-sm">
              {game.category}
            </span>
          </div>

          {/* Authentic Medieval Wax Seal Stamp */}
          <div className="absolute top-2.5 right-2.5">
            {isAvailable ? (
              <span className="wax-seal-green font-tavern text-[10px] uppercase px-2.5 py-0.5 flex items-center gap-1.5 font-bold tracking-wider rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a7f3d0] inline-block animate-ping"></span>
                {game.stock} DISP.
              </span>
            ) : (
              <span className="wax-seal-red font-tavern text-[10px] uppercase px-2.5 py-0.5 flex items-center gap-1.5 font-bold tracking-wider rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-200 inline-block"></span>
                AGOTADO
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Ornate Tavern Title */}
          <div className="flex items-center gap-1.5 mb-1 text-[#b45309]">
            <span className="text-xs">⚔</span>
            <h3 className="font-tavern text-lg font-bold text-[#2d180d] uppercase tracking-wide group-hover:text-[#b45309] transition-colors line-clamp-1">
              {game.name}
            </h3>
          </div>

          <p className="text-xs sm:text-sm font-serif text-[#543b27] line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-dotted border-[#c8a774] space-y-3.5">
          {/* Adventurer Stats Box */}
          <div className="grid grid-cols-3 gap-1 text-center font-serif text-xs border border-[#cfb58a] bg-[#f5ecda] p-2 rounded-sm shadow-inner">
            <div className="border-r border-[#d4be95] last:border-0 pr-1" title="Aventureros Requeridos">
              <div className="flex items-center justify-center gap-1 text-[#854d0e] mb-0.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-tavern uppercase tracking-wider font-bold">Mesa</span>
              </div>
              <span className="font-bold text-[#2d180d]">{game.minPlayers}-{game.maxPlayers} p.</span>
            </div>

            <div className="border-r border-[#d4be95] last:border-0 pr-1" title="Nivel de Experiencia / Edad">
              <div className="flex items-center justify-center gap-1 text-[#854d0e] mb-0.5">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-[10px] font-tavern uppercase tracking-wider font-bold">Nivel</span>
              </div>
              <span className="font-bold text-[#2d180d]">+{game.minAge} años</span>
            </div>

            <div title="Tiempo de Partida">
              <div className="flex items-center justify-center gap-1 text-[#854d0e] mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-tavern uppercase tracking-wider font-bold">Tiempo</span>
              </div>
              <span className="font-bold text-[#2d180d]">{game.playtime}m</span>
            </div>
          </div>

          {/* Pricing & Button */}
          <div className="flex items-center justify-between pt-1">
            {/* Golden Coin Price Emblem */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fef08a] via-[#eab308] to-[#a16207] border border-[#713f12] flex items-center justify-center font-tavern font-bold text-xs text-[#451a03] shadow-md">
                $
              </div>
              <div>
                <span className="text-[9px] uppercase font-tavern text-[#78593f] block leading-none font-bold">
                  Precio Alquiler
                </span>
                <span className="font-tavern text-lg font-bold text-[#2b170c]">
                  ${game.price.toLocaleString("es-AR")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelect(game)}
              className="tavern-btn-medieval rounded-sm"
            >
              Ficha →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

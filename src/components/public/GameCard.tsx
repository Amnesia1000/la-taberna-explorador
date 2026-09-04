import { Users, Clock, Flame } from "lucide-react";
import { GameWithComponents } from "@/types";

interface GameCardProps {
  game: GameWithComponents;
  onSelect: (game: GameWithComponents) => void;
}

export default function GameCard({ game, onSelect }: GameCardProps) {
  const isAvailable = game.stock > 0;

  return (
    <div className="group border border-zinc-200 hover:border-zinc-900 bg-white flex flex-col transition-all duration-150">
      {/* Visual Image container with wireframe border */}
      <div className="relative aspect-[4/3] w-full bg-zinc-100 border-b border-zinc-200 overflow-hidden">
        {game.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 font-mono text-xs">
            [SIN IMAGEN]
          </div>
        )}

        {/* Category tag */}
        <div className="absolute top-2 left-2">
          <span className="font-mono text-[11px] uppercase bg-white/95 text-zinc-900 border border-zinc-900 px-2 py-0.5 tracking-wider">
            {game.category}
          </span>
        </div>

        {/* Stock tag */}
        <div className="absolute top-2 right-2">
          {isAvailable ? (
            <span className="font-mono text-[11px] uppercase bg-white/95 text-zinc-900 border border-zinc-300 px-2 py-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              {game.stock} DISP.
            </span>
          ) : (
            <span className="font-mono text-[11px] uppercase bg-zinc-900 text-white px-2 py-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>
              AGOTADO
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-mono text-base font-bold text-zinc-900 uppercase tracking-tight group-hover:underline">
            {game.name}
          </h3>

          <p className="text-xs text-zinc-600 line-clamp-2 mt-1 leading-relaxed">
            {game.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 space-y-3">
          {/* Metadata badges */}
          <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-zinc-600">
            <div className="border border-zinc-100 bg-zinc-50 p-1 flex items-center justify-center gap-1" title="Jugadores">
              <Users className="w-3 h-3 text-zinc-400" />
              <span>{game.minPlayers}-{game.maxPlayers}</span>
            </div>
            <div className="border border-zinc-100 bg-zinc-50 p-1 flex items-center justify-center gap-1" title="Edad mínima">
              <Flame className="w-3 h-3 text-zinc-400" />
              <span>+{game.minAge} años</span>
            </div>
            <div className="border border-zinc-100 bg-zinc-50 p-1 flex items-center justify-center gap-1" title="Duración estimada">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>{game.playtime}m</span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block leading-none">Precio</span>
              <span className="font-mono text-base font-bold text-zinc-900">
                ${game.price.toLocaleString("es-AR")}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSelect(game)}
              className="px-3 py-1.5 text-xs font-mono uppercase bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900 tracking-wider transition"
            >
              Ver Detalle →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

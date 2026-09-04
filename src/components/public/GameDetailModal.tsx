"use client";

import { X, Users, Clock, Flame, MessageSquare } from "lucide-react";
import { GameWithComponents } from "@/types";

interface GameDetailModalProps {
  game: GameWithComponents | null;
  onClose: () => void;
}

export default function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  if (!game) return null;

  const isAvailable = game.stock > 0;

  // Formato del mensaje de WhatsApp
  const phone = "5491144556677"; // Número de la tienda
  const message = `¡Hola! Me interesa alquilar el juego de mesa "${game.name}" (${game.category}). ¿Tienen disponibilidad para los próximos días?`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-2 border-zinc-900 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase bg-zinc-900 text-white px-2 py-0.5">
              {game.category}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              ID: {game.id.substring(0, 8)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-950 border border-transparent hover:border-zinc-300 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image Preview */}
            <div className="border border-zinc-200 aspect-[4/3] bg-zinc-100 overflow-hidden relative">
              {game.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-xs text-zinc-400">
                  [SIN IMAGEN DISPONIBLE]
                </div>
              )}
              <div className="absolute bottom-2 left-2">
                <span
                  className={`font-mono text-xs px-2.5 py-1 border font-medium ${
                    isAvailable
                      ? "bg-white text-zinc-900 border-zinc-900"
                      : "bg-zinc-900 text-white border-zinc-900"
                  }`}
                >
                  {isAvailable ? `DISPONIBLE: ${game.stock} UNID.` : "SIN STOCK ACTUAL"}
                </span>
              </div>
            </div>

            {/* Core Info */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                  Categoría: {game.category}
                </span>
                <h2 className="font-mono text-2xl font-bold uppercase tracking-tight text-zinc-900">
                  {game.name}
                </h2>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold text-zinc-900">
                    ${game.price.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-200">
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {game.description}
                  </p>
                </div>
              </div>

              {/* Quick specs grid */}
              <div className="grid grid-cols-3 gap-2 border border-zinc-200 bg-zinc-50/70 p-3 text-center font-mono text-xs">
                <div>
                  <Users className="w-4 h-4 mx-auto text-zinc-600 mb-1" />
                  <span className="text-[10px] text-zinc-400 block uppercase">Jugadores</span>
                  <span className="font-bold text-zinc-800">{game.minPlayers} a {game.maxPlayers}</span>
                </div>
                <div>
                  <Flame className="w-4 h-4 mx-auto text-zinc-600 mb-1" />
                  <span className="text-[10px] text-zinc-400 block uppercase">Edad</span>
                  <span className="font-bold text-zinc-800">+{game.minAge} años</span>
                </div>
                <div>
                  <Clock className="w-4 h-4 mx-auto text-zinc-600 mb-1" />
                  <span className="text-[10px] text-zinc-400 block uppercase">Tiempo</span>
                  <span className="font-bold text-zinc-800">{game.playtime} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / WhatsApp CTA */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 font-mono text-xs uppercase tracking-wider transition"
          >
            Cerrar
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Alquilar por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

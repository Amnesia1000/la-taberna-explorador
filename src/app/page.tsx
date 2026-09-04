"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/public/Navbar";
import GameCard from "@/components/public/GameCard";
import GameDetailModal from "@/components/public/GameDetailModal";
import { GameWithComponents } from "@/types";
import { getGames, getCategories } from "@/lib/actions/games";
import { Search, Filter, RefreshCw, Dices, Users, Clock, ShieldCheck } from "lucide-react";

export default function CatalogPage() {
  const [games, setGames] = useState<GameWithComponents[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [playerFilter, setPlayerFilter] = useState<string>("ALL");
  const [selectedGame, setSelectedGame] = useState<GameWithComponents | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    const [gamesRes, catRes] = await Promise.all([
      getGames(),
      getCategories(),
    ]);

    if (gamesRes.success && gamesRes.data) {
      setGames(gamesRes.data as unknown as GameWithComponents[]);
    }
    if (catRes.success && catRes.data) {
      setCategories(catRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Category filter
      if (selectedCategory !== "TODOS" && game.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchesName = game.name.toLowerCase().includes(term);
        const matchesDesc = game.description.toLowerCase().includes(term);
        if (!matchesName && !matchesDesc) return false;
      }
      // Player filter
      if (playerFilter === "SOLO" && game.minPlayers > 1) return false;
      if (playerFilter === "2P" && (game.minPlayers > 2 || game.maxPlayers < 2)) return false;
      if (playerFilter === "PARTY" && game.maxPlayers < 5) return false;

      return true;
    });
  }, [games, selectedCategory, searchTerm, playerFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Wireframe Hero Header */}
        <section className="border border-zinc-900 bg-zinc-50 p-6 md:p-8 mb-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-2.5 py-1 text-xs font-mono tracking-widest uppercase mb-3">
                <Dices className="w-3.5 h-3.5 text-zinc-700" />
                <span>SERVICIO DE ALQUILER DE JUEGOS DE MESA</span>
              </div>
              <h1 className="font-mono text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-zinc-950">
                CATÁLOGO DE JUEGOS DISPONIBLES
              </h1>
              <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
                Alquila los mejores juegos de mesa por fin de semana o semana completa. Cada unidad incluye remito digital de piezas verificado antes y después del préstamo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 self-start md:self-auto font-mono text-xs">
              <div className="border border-zinc-200 bg-white p-3 min-w-[120px]">
                <span className="text-zinc-400 block text-[10px]">TÍTULOS</span>
                <span className="text-xl font-bold text-zinc-900">{games.length}</span>
              </div>
              <div className="border border-zinc-200 bg-white p-3 min-w-[120px]">
                <span className="text-zinc-400 block text-[10px]">DISPONIBLES</span>
                <span className="text-xl font-bold text-zinc-900">
                  {games.reduce((acc, g) => acc + (g.stock > 0 ? g.stock : 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Search Toolbar */}
        <section className="border border-zinc-200 bg-zinc-50/70 p-4 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título o descripción..."
                className="wire-input pl-9 text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 hover:text-zinc-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Player Filter */}
            <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-mono text-zinc-500 uppercase mr-1 whitespace-nowrap">
                Jugadores:
              </span>
              {[
                { id: "ALL", label: "Cualquiera" },
                { id: "SOLO", label: "1 Jugador" },
                { id: "2P", label: "2 Jugadores" },
                { id: "PARTY", label: "5+ Party" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPlayerFilter(f.id)}
                  className={`px-2.5 py-1 text-xs font-mono uppercase whitespace-nowrap border transition ${
                    playerFilter === f.id
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="pt-3 border-t border-zinc-200 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-mono text-zinc-500 uppercase whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Categoría:
            </span>

            <button
              onClick={() => setSelectedCategory("TODOS")}
              className={`px-3 py-1 text-xs font-mono uppercase whitespace-nowrap border transition ${
                selectedCategory === "TODOS"
                  ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
              }`}
            >
              TODOS ({games.length})
            </button>

            {categories.map((cat) => {
              const count = games.filter((g) => g.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-mono uppercase whitespace-nowrap border transition ${
                    selectedCategory === cat
                      ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Catalog Grid */}
        {loading ? (
          <div className="border border-zinc-200 p-16 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
            <p className="font-mono text-xs text-zinc-500 uppercase">Cargando catálogo...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="border border-zinc-200 p-16 text-center bg-zinc-50">
            <Dices className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <h3 className="font-mono text-sm uppercase font-bold text-zinc-800">
              No se encontraron juegos
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Intenta cambiar los filtros de categoría o el término de búsqueda.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("TODOS");
                setSearchTerm("");
                setPlayerFilter("ALL");
              }}
              className="mt-4 px-4 py-1.5 text-xs font-mono uppercase bg-zinc-900 text-white border border-zinc-900"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={(g) => setSelectedGame(g)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <GameDetailModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />

      {/* Wireframe Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 mt-16 py-6 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TABERNA // SISTEMA DE ALQUILER DE JUEGOS DE MESA</span>
          <span className="text-zinc-400">ESTRUCTURA WIREFRAME NEUTRA LISTA PARA ESTILOS</span>
        </div>
      </footer>
    </div>
  );
}

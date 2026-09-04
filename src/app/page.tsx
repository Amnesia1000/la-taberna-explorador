"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/public/Navbar";
import GameCard from "@/components/public/GameCard";
import GameDetailModal from "@/components/public/GameDetailModal";
import { GameWithComponents } from "@/types";
import { getGames, getCategories } from "@/lib/actions/games";
import { Search, Filter, RefreshCw, Compass, Scroll, Shield, Sparkles } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Tavern Quest Board (Tablón de Anuncios de la Taberna) */}
        <section className="parchment-folio border-4 border-[#733d18] p-6 md:p-8 mb-8 shadow-2xl rounded-sm relative overflow-hidden">
          {/* Iron Rivets in 4 corners */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-[#ca8a04] to-[#451a03] border border-[#1c0d06] shadow-sm"></div>
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-[#ca8a04] to-[#451a03] border border-[#1c0d06] shadow-sm"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-[#ca8a04] to-[#451a03] border border-[#1c0d06] shadow-sm"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-[#ca8a04] to-[#451a03] border border-[#1c0d06] shadow-sm"></div>

          {/* Watermark Compass */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Compass className="w-72 h-72 text-[#3d2011]" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* Medieval Crest Badge */}
              <div className="inline-flex items-center gap-2 border-2 border-[#b45309] bg-[#fffdf9] px-3.5 py-1 text-xs font-tavern tracking-widest uppercase mb-3 text-[#78350f] rounded-sm shadow-md">
                <span className="text-amber-600 font-bold">⚜</span>
                <span>TABLÓN OFICIAL DE MISIONES Y AVENTURAS</span>
                <span className="text-amber-600 font-bold">⚜</span>
              </div>

              <h1 className="font-tavern text-2xl sm:text-4xl font-extrabold uppercase tracking-wide text-[#2c1409] drop-shadow-sm">
                CATÁLOGO DE JUEGOS & EXPEDICIONES
              </h1>

              <div className="flex items-center gap-2 my-2 text-[#b45309] opacity-70">
                <span>✦</span>
                <div className="h-[1px] w-24 bg-[#b45309]"></div>
                <span>⚔</span>
                <div className="h-[1px] w-24 bg-[#b45309]"></div>
                <span>✦</span>
              </div>

              <p className="text-base font-serif text-[#4a2e19] max-w-2xl leading-relaxed">
                Toma asiento junto al fuego. Alquila un juego de mesa para tu posada o castillo por fin de semana o semana completa con todas sus piezas protegidas por el gremio.
              </p>
            </div>

            {/* Hanging Wooden Plaques */}
            <div className="flex flex-col sm:flex-row gap-3 self-start md:self-auto font-tavern text-xs">
              <div className="wood-beam p-4 min-w-[130px] rounded-sm text-center text-[#fef3c7] shadow-lg border-2 border-[#8c5828]">
                <span className="text-[#e2b17b] block text-[10px] uppercase tracking-wider font-bold">
                  TÍTULOS
                </span>
                <span className="text-3xl font-bold text-[#fde047] drop-shadow">
                  {games.length}
                </span>
                <span className="text-[9px] text-[#b48a66] block uppercase mt-0.5">En la Biblioteca</span>
              </div>

              <div className="wood-beam p-4 min-w-[130px] rounded-sm text-center text-[#fef3c7] shadow-lg border-2 border-[#8c5828]">
                <span className="text-[#a7f3d0] block text-[10px] uppercase tracking-wider font-bold">
                  DISPONIBLES
                </span>
                <span className="text-3xl font-bold text-[#4ade80] drop-shadow">
                  {games.reduce((acc, g) => acc + (g.stock > 0 ? g.stock : 0), 0)}
                </span>
                <span className="text-[9px] text-[#86efac]/70 block uppercase mt-0.5">Listos para jugar</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tavern Keeper's Slate Bar (Filtros y Búsqueda) */}
        <section className="wood-beam p-4 sm:p-5 mb-8 space-y-4 rounded-sm shadow-xl text-[#fef3c7] border-2 border-[#8c5828]">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#ca8a04] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar juego o crónica..."
                className="tavern-input !pl-9 pr-8 py-2 text-xs font-serif rounded-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-tavern text-[#82674e] hover:text-[#2c1a11]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Player Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-tavern text-[#e2b17b] uppercase mr-1 whitespace-nowrap font-bold flex items-center gap-1">
                <span>⚔</span> Jugadores:
              </span>
              {[
                { id: "ALL", label: "Todos" },
                { id: "SOLO", label: "1 Jugador" },
                { id: "2P", label: "2 Jugadores" },
                { id: "PARTY", label: "5+ Fiesta" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPlayerFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-tavern uppercase whitespace-nowrap border transition rounded-sm ${
                    playerFilter === f.id
                      ? "bg-gradient-to-r from-[#b45309] to-[#92400e] text-white border-[#fde047] font-bold shadow-md"
                      : "bg-[#29170e] text-[#d6b080] border-[#5a3219] hover:border-[#b45309] hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="pt-3 border-t border-[#4d2814] flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-tavern text-[#e2b17b] uppercase whitespace-nowrap flex items-center gap-1.5 font-bold">
              <Filter className="w-3.5 h-3.5 text-[#f59e0b]" />
              Categoría:
            </span>

            <button
              onClick={() => setSelectedCategory("TODOS")}
              className={`px-3.5 py-1 text-xs font-tavern uppercase whitespace-nowrap border transition rounded-sm ${
                selectedCategory === "TODOS"
                  ? "bg-[#b45309] text-white border-[#fde047] font-bold shadow-md"
                  : "bg-[#29170e] text-[#d6b080] border-[#5a3219] hover:border-[#b45309] hover:text-white"
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
                  className={`px-3.5 py-1 text-xs font-tavern uppercase whitespace-nowrap border transition rounded-sm ${
                    selectedCategory === cat
                      ? "bg-[#b45309] text-white border-[#fde047] font-bold shadow-md"
                      : "bg-[#29170e] text-[#d6b080] border-[#5a3219] hover:border-[#b45309] hover:text-white"
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
          <div className="parchment-folio p-16 text-center rounded-sm border-2 border-[#8c5828]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#b45309] mb-2" />
            <p className="font-tavern text-xs text-[#78593f] uppercase">Cargando crónicas del grimorio...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="parchment-folio p-16 text-center rounded-sm border-2 border-[#8c5828]">
            <Scroll className="w-12 h-12 text-[#b45309] mx-auto mb-3" />
            <h3 className="font-tavern text-base uppercase font-bold text-[#3b2314]">
              No se encontraron juegos en este rincón de la Taberna
            </h3>
            <p className="text-sm font-serif text-[#6b4c33] mt-1 max-w-sm mx-auto">
              Intenta cambiar los filtros de categoría o el término de búsqueda para encontrar tu aventura.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("TODOS");
                setSearchTerm("");
                setPlayerFilter("ALL");
              }}
              className="mt-4 tavern-btn-medieval rounded-sm"
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

      {/* Medieval Tavern Hearth Footer */}
      <footer className="wood-beam border-t-4 border-[#8c5828] mt-16 py-8 text-center text-xs font-serif text-[#d6b080]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-tavern text-sm text-[#fffdfa] font-bold">
            <Compass className="w-4 h-4 text-[#f59e0b]" />
            <span>LA TABERNA DEL EXPLORADOR</span>
          </div>
          <span className="text-xs text-[#e2b17b] font-serif">
            ⚔ Taberna de Juegos de Mesa • Alquiler de Campañas y Aventuras Analógicas ⚔
          </span>
        </div>
      </footer>
    </div>
  );
}

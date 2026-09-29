"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/public/Navbar";
import GameCard from "@/components/public/GameCard";
import GameDetailModal from "@/components/public/GameDetailModal";
import { GameWithComponents } from "@/types";
import { getCatalog, getCategories, getGameById } from "@/lib/actions/games";
import { Search, Filter, Scroll, ChevronLeft, ChevronRight } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import Image from "next/image";

const PAGE_SIZE = 12;

// Lee el estado inicial desde la URL (?cat=&q=&jug=&edad=&precio=&orden=&pag=&juego=)
function readUrlState() {
  const p = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  return {
    cat: p.get("cat") ?? "TODOS",
    q: p.get("q") ?? "",
    jug: p.get("jug") ?? "ALL",
    edad: p.get("edad") ?? "TODAS",
    precio: p.get("precio") ?? "TODOS",
    orden: p.get("orden") ?? "AZ",
    pag: Math.max(1, parseInt(p.get("pag") ?? "1", 10) || 1),
    juego: p.get("juego") ?? "",
  };
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="relative w-full animate-pulse"
          style={{ aspectRatio: "657/912" }}
        >
          <div className="absolute inset-0 bg-[#e9dcc3]/60 border-2 border-[#c8a774] rounded-sm" />
          <div className="absolute left-[13%] right-[9%] top-[5%] h-[50%] bg-[#3d2011]/30 rounded-sm" />
          <div className="absolute left-[14%] right-[10%] top-[62%] h-4 bg-[#8c5828]/30 rounded-sm" />
          <div className="absolute left-[25%] right-[25%] top-[70%] h-3 bg-[#8c5828]/20 rounded-sm" />
          <div className="absolute left-[14%] bottom-[8%] h-7 w-24 bg-[#8c5828]/30 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export default function CatalogPage() {
  const [games, setGames] = useState<GameWithComponents[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => readUrlState().cat);
  const [searchTerm, setSearchTerm] = useState<string>(() => readUrlState().q);
  const [debouncedQ, setDebouncedQ] = useState<string>(() => readUrlState().q);
  const [playerFilter, setPlayerFilter] = useState<string>(() => readUrlState().jug);
  const [ageFilter, setAgeFilter] = useState<string>(() => readUrlState().edad);
  const [priceFilter, setPriceFilter] = useState<string>(() => readUrlState().precio);
  const [sortKey, setSortKey] = useState<string>(() => readUrlState().orden);
  const [page, setPage] = useState<number>(() => readUrlState().pag);
  const [totalPages, setTotalPages] = useState(1);
  const [grandTotal, setGrandTotal] = useState(0);
  const [selectedGame, setSelectedGame] = useState<GameWithComponents | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Debounce de búsqueda para no golpear la DB en cada tecla
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Categorías (una vez)
  useEffect(() => {
    (async () => {
      const catRes = await getCategories();
      if (catRes.success && catRes.data) setCategories(catRes.data);
    })();
  }, []);

  // Catálogo paginado desde el servidor
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await getCatalog({
          category: selectedCategory,
          q: debouncedQ,
          players: playerFilter,
          age: ageFilter,
          price: priceFilter,
          sort: sortKey,
          page,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        if (res.success) {
          setGames(res.data as unknown as GameWithComponents[]);
          setTotalPages(res.totalPages ?? 1);
          setGrandTotal(res.grandTotal ?? 0);
        } else {
          setLoadError(res.error || "No se pudo cargar el catálogo.");
        }
      } catch {
        if (!cancelled) {
          setLoadError("No se pudo conectar con la taberna. Revisá tu conexión.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, debouncedQ, playerFilter, ageFilter, priceFilter, sortKey, page, retryKey]);

  // Deep link ?juego=<id>: abre la ficha aunque no esté en la página actual
  useEffect(() => {
    const juegoId = readUrlState().juego;
    if (!juegoId) return;
    if (games.some((g) => g.id === juegoId)) {
      const found = games.find((g) => g.id === juegoId) ?? null;
      setSelectedGame(found);
      return;
    }
    (async () => {
      const res = await getGameById(juegoId);
      if (res.success && res.data) setSelectedGame(res.data as unknown as GameWithComponents);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refleja filtros, orden, página y ficha abierta en la URL (compartibles)
  useEffect(() => {
    if (loading) return;
    const p = new URLSearchParams();
    if (selectedCategory !== "TODOS") p.set("cat", selectedCategory);
    if (debouncedQ.trim() !== "") p.set("q", debouncedQ.trim());
    if (playerFilter !== "ALL") p.set("jug", playerFilter);
    if (ageFilter !== "TODAS") p.set("edad", ageFilter);
    if (priceFilter !== "TODOS") p.set("precio", priceFilter);
    if (sortKey !== "AZ") p.set("orden", sortKey);
    if (page > 1) p.set("pag", String(page));
    if (selectedGame) p.set("juego", selectedGame.id);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/?${qs}` : "/");
  }, [loading, selectedCategory, debouncedQ, playerFilter, ageFilter, priceFilter, sortKey, page, selectedGame]);

  const resetFilters = () => {
    setSelectedCategory("TODOS");
    setSearchTerm("");
    setDebouncedQ("");
    setPlayerFilter("ALL");
    setAgeFilter("TODAS");
    setPriceFilter("TODOS");
    setSortKey("AZ");
    setPage(1);
  };

  const pageNumbers = (() => {
    const nums: number[] = [];
    const from = Math.max(1, Math.min(page - 2, totalPages - 4));
    const to = Math.min(totalPages, from + 4);
    for (let n = from; n <= to; n++) nums.push(n);
    return nums;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <a
        href="#catalogo"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-[#fef3c7] focus:text-[#2c1409] focus:px-4 focus:py-2 focus:rounded-sm focus:font-tavern focus:text-sm"
      >
        Saltar al contenido
      </a>
      <Navbar />

      <main id="catalogo" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Hero compacto: una fila, insignia a la derecha, stats con datos reales */}
        <section className="parchment-folio border-4 border-[#733d18] px-5 py-4 md:px-6 mb-6 shadow-2xl rounded-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="font-tavern text-xl md:text-2xl font-extrabold uppercase tracking-wide text-[#2c1409] leading-tight">
                Catálogo de juegos &amp; expediciones
              </h1>
              <p className="text-xs font-serif text-[#6b4c33] mt-1">
                {grandTotal} crónicas · {categories.length} categorías
              </p>
            </div>
            <div className="inline-flex items-center gap-2 border-2 border-[#b45309] bg-[#fffdf9] px-2 py-0.5 text-[9px] md:px-2.5 md:py-1 md:text-[10px] font-tavern tracking-widest uppercase text-[#78350f] rounded-sm shadow-md shrink-0">
              <span className="text-amber-600 font-bold" aria-hidden="true">⚜</span>
              <span>Tablón oficial de misiones</span>
              <span className="text-amber-600 font-bold" aria-hidden="true">⚜</span>
            </div>
          </div>
        </section>

        {/* Tavern Keeper's Slate Bar (Filtros y Búsqueda) */}
        <section className="wood-beam p-3 sm:p-5 mb-6 sm:mb-8 space-y-3 sm:space-y-4 rounded-sm shadow-xl text-[#fef3c7] border-2 border-[#8c5828]">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-56 shrink-0">
              <Search className="w-4 h-4 text-[#ca8a04] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" aria-hidden="true" />
              <label htmlFor="catalog-search" className="sr-only">
                ¿Qué crónica buscás?
              </label>
              <input
                id="catalog-search"
                name="search"
                autoComplete="off"
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="¿Qué crónica buscás…?"
                className="tavern-input !pl-9 pr-8 py-2 text-xs font-serif rounded-sm w-full"
              />
              {searchTerm && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => {
                    setSearchTerm("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-tavern text-[#82674e] hover:text-[#2c1a11]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Select Filters Group */}
            <div className="flex flex-wrap items-center gap-1.5 flex-1 lg:justify-end">
              {/* Category */}
              <div className="flex items-center gap-1 bg-[#29170e] border border-[#5a3219] rounded-sm pr-1">
                <label htmlFor="filter-category" className="text-[10px] sm:text-xs font-tavern text-[#e2b17b] uppercase pl-2 flex items-center gap-1 font-bold shrink-0 cursor-pointer">
                  <Filter className="w-3 h-3 text-[#f59e0b]" aria-hidden="true" /> Categoría:
                </label>
                <select
                  id="filter-category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[#29170e] text-white font-tavern uppercase text-xs py-1.5 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#f59e0b] rounded-sm [&>option]:bg-[#29170e]"
                >
                  <option value="TODOS">TODOS ({grandTotal})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Players */}
              <div className="flex items-center gap-1 bg-[#29170e] border border-[#5a3219] rounded-sm pr-1">
                <label htmlFor="filter-players" className="text-[10px] sm:text-xs font-tavern text-[#e2b17b] uppercase pl-2 flex items-center gap-1 font-bold shrink-0 cursor-pointer">
                  <span aria-hidden="true">⚔</span> Jugadores:
                </label>
                <select
                  id="filter-players"
                  value={playerFilter}
                  onChange={(e) => {
                    setPlayerFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[#29170e] text-white font-tavern uppercase text-xs py-1.5 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#f59e0b] rounded-sm [&>option]:bg-[#29170e]"
                >
                  <option value="ALL">Todos</option>
                  <option value="SOLO">1 Jugador</option>
                  <option value="2P">2 Jugadores</option>
                  <option value="PARTY">5+ Fiesta</option>
                </select>
              </div>

              {/* Age */}
              <div className="flex items-center gap-1 bg-[#29170e] border border-[#5a3219] rounded-sm pr-1">
                <label htmlFor="filter-age" className="text-[10px] sm:text-xs font-tavern text-[#e2b17b] uppercase pl-2 font-bold shrink-0 cursor-pointer">
                  Edad:
                </label>
                <select
                  id="filter-age"
                  value={ageFilter}
                  onChange={(e) => {
                    setAgeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[#29170e] text-white font-tavern uppercase text-xs py-1.5 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#f59e0b] rounded-sm [&>option]:bg-[#29170e]"
                >
                  <option value="TODAS">Todas</option>
                  <option value="+6">+6 Años</option>
                  <option value="+10">+10 Años</option>
                  <option value="+14">+14 Años</option>
                </select>
              </div>

              {/* Price */}
              <div className="flex items-center gap-1 bg-[#29170e] border border-[#5a3219] rounded-sm pr-1">
                <label htmlFor="filter-price" className="text-[10px] sm:text-xs font-tavern text-[#e2b17b] uppercase pl-2 font-bold shrink-0 cursor-pointer">
                  Precio:
                </label>
                <select
                  id="filter-price"
                  value={priceFilter}
                  onChange={(e) => {
                    setPriceFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[#29170e] text-white font-tavern uppercase text-xs py-1.5 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#f59e0b] rounded-sm [&>option]:bg-[#29170e]"
                >
                  <option value="TODOS">Todos</option>
                  <option value="$">$ (hasta 6k)</option>
                  <option value="$$">$$ (7k a 15k)</option>
                  <option value="$$$">$$$ (+15k)</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1 bg-[#29170e] border border-[#5a3219] rounded-sm pr-1">
                <label htmlFor="filter-sort" className="text-[10px] sm:text-xs font-tavern text-[#e2b17b] uppercase pl-2 font-bold shrink-0 cursor-pointer">
                  Orden:
                </label>
                <select
                  id="filter-sort"
                  value={sortKey}
                  onChange={(e) => {
                    setSortKey(e.target.value);
                    setPage(1);
                  }}
                  className="bg-[#29170e] text-white font-tavern uppercase text-xs py-1.5 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#f59e0b] rounded-sm [&>option]:bg-[#29170e]"
                >
                  <option value="AZ">A–Z</option>
                  <option value="PUP">Precio ↑</option>
                  <option value="PDOWN">Precio ↓</option>
                  <option value="DUR">Duración</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Grid */}
        {loading ? (
          <>
            <p className="sr-only" role="status">Cargando crónicas del grimorio…</p>
            <CatalogSkeleton />
          </>
        ) : loadError ? (
          <div className="parchment-folio p-16 text-center rounded-sm border-2 border-[#8c5828]" role="alert">
            <h3 className="font-tavern text-base uppercase font-bold text-[#3b2314]">
              La taberna no responde
            </h3>
            <p className="text-sm font-serif text-[#6b4c33] mt-1 max-w-sm mx-auto">
              {loadError}
            </p>
            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="mt-4 tavern-btn-medieval rounded-sm"
            >
              Reintentar
            </button>
          </div>
        ) : games.length === 0 ? (
          <div className="parchment-folio p-16 text-center rounded-sm border-2 border-[#8c5828]">
            <Scroll className="w-12 h-12 text-[#b45309] mx-auto mb-3" />
            <h3 className="font-tavern text-base uppercase font-bold text-[#3b2314]">
              No se encontraron juegos en este rincón de la Taberna
            </h3>
            <p className="text-sm font-serif text-[#6b4c33] mt-1 max-w-sm mx-auto">
              Intenta cambiar los filtros de categoría o el término de búsqueda para encontrar tu aventura.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 tavern-btn-medieval rounded-sm"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <>
            <h2 className="sr-only">Juegos disponibles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  showAvailability
                  labeledStats
                  onSelect={(g) => setSelectedGame(g)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Paginación del catálogo" className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                  className="p-2 rounded-sm border-2 border-[#8c5828] bg-[#29170e] text-[#fef3c7] disabled:opacity-40 hover:bg-[#4a2612] focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-label={`Ir a la página ${n}`}
                    aria-current={n === page ? "page" : undefined}
                    className={`min-w-9 px-2 py-1.5 rounded-sm border-2 font-tavern text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#f59e0b] ${n === page
                      ? "border-[#f59e0b] bg-[#f59e0b] text-[#29170e]"
                      : "border-[#8c5828] bg-[#29170e] text-[#fef3c7] hover:bg-[#4a2612]"
                      }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Página siguiente"
                  className="p-2 rounded-sm border-2 border-[#8c5828] bg-[#29170e] text-[#fef3c7] disabled:opacity-40 hover:bg-[#4a2612] focus-visible:ring-2 focus-visible:ring-[#f59e0b]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      <GameDetailModal
        game={selectedGame}
        dismissable
        showAvailabilitySeal={false}
        onClose={() => setSelectedGame(null)}
      />

      {/* Medieval Tavern Hearth Footer */}
      <footer className="wood-beam border-t-4 border-[#8c5828] mt-16 py-8 text-center text-xs font-serif text-[#d6b080]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-tavern text-sm text-[#fffdfa] font-bold">
            <span className="relative inline-block w-5 h-5 opacity-90">
              <Image src={ASSETS.logo.split("?")[0]} alt="Logo" fill sizes="20px" className="object-contain" />
            </span>
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

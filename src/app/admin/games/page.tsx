"use client";

import { useState, useEffect } from "react";
import {
  getGames,
  saveGame,
  deleteGame,
  getCategories,
} from "@/lib/actions/games";
import { GameWithComponents } from "@/types";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Upload,
  Link as LinkIcon,
  X,
  Dices,
  AlertTriangle,
} from "lucide-react";

export default function AdminGamesPage() {
  const [games, setGames] = useState<GameWithComponents[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGame, setEditingGame] = useState<GameWithComponents | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [imageMode1, setImageMode1] = useState<"URL" | "FILE">("URL");
  const [imageMode2, setImageMode2] = useState<"URL" | "FILE">("URL");

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Estrategia",
    price: 3000,
    stock: 2,
    imageUrl: "",
    imageUrl2: "",
    minPlayers: 2,
    maxPlayers: 4,
    minAge: 8,
    playtime: 45,
    maxPlaytime: 60,
    // Componentes
    cards: 0,
    tokens: 0,
    dice: 0,
    tiles: 0,
    others: 0,
    othersDescription: "",
  });
  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);

  const loadData = async () => {
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
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingGame(null);
    setFormData({
      name: "",
      description: "",
      category: "Estrategia",
      price: 3000,
      stock: 2,
      imageUrl: "",
      imageUrl2: "",
      minPlayers: 2,
      maxPlayers: 4,
      minAge: 8,
      playtime: 45,
      maxPlaytime: 60,
      cards: 0,
      tokens: 0,
      dice: 0,
      tiles: 0,
      others: 0,
      othersDescription: "",
    });
    setSelectedFile1(null);
    setSelectedFile2(null);
    setImageMode1("URL");
    setImageMode2("URL");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (game: any) => {
    setEditingGame(game);
    setFormData({
      name: game.name || "",
      description: game.description || "",
      category: game.category || "",
      price: game.price || 0,
      stock: game.stock || 0,
      imageUrl: game.image || "",
      imageUrl2: game.image2 || "",
      minPlayers: game.minPlayers || 1,
      maxPlayers: game.maxPlayers || 4,
      minAge: game.minAge || 8,
      playtime: game.playtime || 30,
      maxPlaytime: game.maxPlaytime || game.playtime || 30,
      cards: game.components?.cards || 0,
      tokens: game.components?.tokens || 0,
      dice: game.components?.dice || 0,
      tiles: game.components?.tiles || 0,
      others: game.components?.others || 0,
      othersDescription: game.components?.othersDescription || "",
    });
    setSelectedFile1(null);
    setSelectedFile2(null);
    setImageMode1("URL");
    setImageMode2("URL");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Confirmas la eliminación del juego "${name}"?`)) return;

    const res = await deleteGame(id);
    if (!res.success) {
      alert(res.error || "No se pudo eliminar el juego.");
    } else {
      await loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("price", formData.price.toString());
    data.append("stock", formData.stock.toString());
    data.append("minPlayers", formData.minPlayers.toString());
    data.append("maxPlayers", formData.maxPlayers.toString());
    data.append("minAge", formData.minAge.toString());
    data.append("playtime", formData.playtime.toString());
    data.append("maxPlaytime", formData.maxPlaytime.toString());

    data.append("cards", formData.cards.toString());
    data.append("tokens", formData.tokens.toString());
    data.append("dice", formData.dice.toString());
    data.append("tiles", formData.tiles.toString());
    data.append("others", formData.others.toString());
    data.append("othersDescription", formData.othersDescription);

    // Imagen 1
    if (imageMode1 === "FILE" && selectedFile1) {
      data.append("imageFile", selectedFile1);
    } else {
      data.append("imageUrl", formData.imageUrl || "");
    }

    // Imagen 2
    if (imageMode2 === "FILE" && selectedFile2) {
      data.append("imageFile2", selectedFile2);
    } else {
      data.append("imageUrl2", formData.imageUrl2 || "");
    }

    const res = await saveGame(data, editingGame?.id);
    if (res.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      setErrorMessage(res.error || "Error al procesar el formulario.");
    }
    setSaving(false);
  };

  const filteredGames = games
    .filter((g) => {
      if (selectedCategory !== "TODOS" && g.category !== selectedCategory) return false;
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        return (
          g.name.toLowerCase().includes(term) ||
          g.description.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

  return (
    <div className="space-y-6">
      {/* Top Title & Actions */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            CATÁLOGO & INVENTARIO // CRUD
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            GESTIÓN DE JUEGOS DE MESA
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Juego</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-zinc-200 bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wire-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-mono text-xs uppercase text-zinc-500 whitespace-nowrap">
            Categoría:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="wire-input text-xs w-full sm:w-48"
          >
            <option value="TODOS">TODAS ({games.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-200 bg-white overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
            <p className="font-mono text-xs text-zinc-500 uppercase">Cargando juegos...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="p-12 text-center">
            <Dices className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="font-mono text-xs text-zinc-600 uppercase">
              No se encontraron juegos con los criterios seleccionados.
            </p>
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 uppercase text-zinc-500">
                <th className="p-3 w-16 text-center">Img</th>
                <th className="p-3">Título / Categoría</th>
                <th className="p-3 text-center">Jugadores</th>
                <th className="p-3 text-center">Duración</th>
                <th className="p-3 text-right">Tarifa</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-center">Componentes</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredGames.map((game) => (
                <tr key={game.id} className="hover:bg-zinc-50/80 transition">
                  <td className="p-3 text-center">
                    <div className="w-10 h-10 border border-zinc-300 bg-zinc-100 overflow-hidden mx-auto">
                      {game.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={game.image}
                          alt={game.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-400">
                          S/I
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-zinc-900 block uppercase">
                      {game.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 border border-zinc-200 px-1.5 py-0.2 bg-zinc-100 uppercase inline-block mt-0.5">
                      {game.category}
                    </span>
                  </td>
                  <td className="p-3 text-center text-zinc-700">
                    {game.minPlayers}-{game.maxPlayers} p.
                  </td>
                  <td className="p-3 text-center text-zinc-700">
                    {game.maxPlaytime && game.maxPlaytime !== game.playtime
                      ? `${game.playtime}-${game.maxPlaytime} min`
                      : `${game.playtime} min`}
                  </td>
                  <td className="p-3 text-right font-bold text-zinc-900">
                    ${game.price.toLocaleString("es-AR")}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 border text-[11px] ${game.stock > 0
                        ? "bg-zinc-50 text-zinc-900 border-zinc-300"
                        : "bg-red-50 text-red-700 border-red-200 font-bold"
                        }`}
                    >
                      {game.stock} unid.
                    </span>
                  </td>
                  <td className="p-3 text-center text-[10px] text-zinc-500">
                    {game.components ? (
                      <span>
                        C:{game.components.cards} | F:{game.components.tokens} | D:{game.components.dice}
                      </span>
                    ) : (
                      <span className="italic text-zinc-400">Sin registrar</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(game)}
                        className="p-1.5 border border-zinc-200 hover:border-zinc-900 text-zinc-700 hover:text-zinc-900 transition"
                        title="Editar juego"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(game.id, game.name)}
                        className="p-1.5 border border-zinc-200 hover:border-red-600 text-zinc-700 hover:text-red-600 transition"
                        title="Eliminar juego"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal CRUD: Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white border-2 border-zinc-900 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <h3 className="font-mono text-sm uppercase font-bold text-zinc-900">
                {editingGame ? `Editar Juego: ${editingGame.name}` : "Nuevo Juego en Catálogo"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              {errorMessage && (
                <div className="border border-red-300 bg-red-50 p-3 text-xs text-red-800 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Informacion Principal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Nombre del Juego *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="wire-input text-xs"
                    placeholder="Ej: Catan, Carcassonne..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Descripción Breve *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="wire-input text-xs"
                    placeholder="Resumen del juego, mecánica principal y dinámica..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="wire-input text-xs"
                    placeholder="Estrategia, Party, Cooperativo..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Tarifa de Alquiler ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price ?? 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="wire-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock ?? 0}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="wire-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Tiempo de Juego (Mín - Máx Minutos) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="5"
                      placeholder="Mín"
                      required
                      value={formData.playtime ?? 30}
                      onChange={(e) => setFormData({ ...formData, playtime: parseInt(e.target.value) || 30 })}
                      className="wire-input text-xs"
                    />
                    <input
                      type="number"
                      min="5"
                      placeholder="Máx"
                      value={formData.maxPlaytime ?? 60}
                      onChange={(e) => setFormData({ ...formData, maxPlaytime: parseInt(e.target.value) || 0 })}
                      className="wire-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Jugadores (Mín - Máx) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Mín"
                      value={formData.minPlayers ?? 1}
                      onChange={(e) => setFormData({ ...formData, minPlayers: parseInt(e.target.value) || 1 })}
                      className="wire-input text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Máx"
                      value={formData.maxPlayers ?? 4}
                      onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 4 })}
                      className="wire-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Edad Mínima Recomendada *
                  </label>
                  <input
                    type="number"
                    min="3"
                    value={formData.minAge ?? 8}
                    onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) || 8 })}
                    className="wire-input text-xs"
                  />
                </div>
              </div>

              {/* Manejo de Imagen 1 e Imagen 2 */}
              <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-4">
                {/* Imagen Principal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-zinc-700">
                      Imagen Principal
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageMode1("URL")}
                        className={`px-2 py-0.5 border ${imageMode1 === "URL"
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-600 border-zinc-300"
                          }`}
                      >
                        <LinkIcon className="w-3 h-3 inline mr-1" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode1("FILE")}
                        className={`px-2 py-0.5 border ${imageMode1 === "FILE"
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-600 border-zinc-300"
                          }`}
                      >
                        <Upload className="w-3 h-3 inline mr-1" />
                        Archivo
                      </button>
                    </div>
                  </div>

                  {imageMode1 === "URL" ? (
                    <input
                      key="input-img1-url"
                      type="url"
                      placeholder="https://..."
                      value={formData.imageUrl || ""}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="wire-input text-xs"
                    />
                  ) : (
                    <input
                      key="input-img1-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile1(e.target.files?.[0] || null)}
                      className="wire-input text-xs file:mr-3 file:py-1 file:px-2 file:border file:border-zinc-300 file:text-xs file:font-mono file:bg-zinc-100"
                    />
                  )}
                </div>

                {/* Imagen Secundaria / Extra */}
                <div className="space-y-2 pt-3 border-t border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-zinc-700">
                      Imagen Secundaria (Carrusel)
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageMode2("URL")}
                        className={`px-2 py-0.5 border ${imageMode2 === "URL"
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-600 border-zinc-300"
                          }`}
                      >
                        <LinkIcon className="w-3 h-3 inline mr-1" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode2("FILE")}
                        className={`px-2 py-0.5 border ${imageMode2 === "FILE"
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-600 border-zinc-300"
                          }`}
                      >
                        <Upload className="w-3 h-3 inline mr-1" />
                        Archivo
                      </button>
                    </div>
                  </div>

                  {imageMode2 === "URL" ? (
                    <input
                      key="input-img2-url"
                      type="url"
                      placeholder="https://..."
                      value={formData.imageUrl2 || ""}
                      onChange={(e) => setFormData({ ...formData, imageUrl2: e.target.value })}
                      className="wire-input text-xs"
                    />
                  ) : (
                    <input
                      key="input-img2-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile2(e.target.files?.[0] || null)}
                      className="wire-input text-xs file:mr-3 file:py-1 file:px-2 file:border file:border-zinc-300 file:text-xs file:font-mono file:bg-zinc-100"
                    />
                  )}
                </div>
              </div>

              {/* Desglose de Componentes Iniciales */}
              <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-3">
                <span className="font-mono text-xs uppercase font-bold text-zinc-700 block">
                  Inventario Inicial de Componentes (para Remito Digital)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Cartas</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cards ?? 0}
                      onChange={(e) => setFormData({ ...formData, cards: parseInt(e.target.value) || 0 })}
                      className="wire-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Fichas</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tokens ?? 0}
                      onChange={(e) => setFormData({ ...formData, tokens: parseInt(e.target.value) || 0 })}
                      className="wire-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Dados</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.dice ?? 0}
                      onChange={(e) => setFormData({ ...formData, dice: parseInt(e.target.value) || 0 })}
                      className="wire-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Losetas</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tiles ?? 0}
                      onChange={(e) => setFormData({ ...formData, tiles: parseInt(e.target.value) || 0 })}
                      className="wire-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Otros</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.others ?? 0}
                      onChange={(e) => setFormData({ ...formData, others: parseInt(e.target.value) || 0 })}
                      className="wire-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                    Descripción de otras piezas especiales:
                  </label>
                  <input
                    type="text"
                    value={formData.othersDescription || ""}
                    onChange={(e) => setFormData({ ...formData, othersDescription: e.target.value })}
                    placeholder="Ej: Reloj de arena, meeples de colores, torre de dados..."
                    className="wire-input text-xs"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 font-mono text-xs uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingGame ? "Guardar Cambios" : "Crear Juego"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
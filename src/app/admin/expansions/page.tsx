"use client";

import { useState, useEffect } from "react";
import {
  getExpansions,
  getEligibleGames,
  saveExpansion,
  deleteExpansion,
} from "@/lib/actions/expansions";
import { ExpansionWithComponents } from "@/types";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Upload,
  Link as LinkIcon,
  X,
  Puzzle,
  AlertTriangle,
  Layers,
  Dices,
  ExternalLink,
  Info,
} from "lucide-react";
import Link from "next/link";

interface EligibleGame {
  id: string;
  name: string;
  category: string;
  image: string;
  hasExpansions: boolean;
}

export default function AdminExpansionsPage() {
  const [expansions, setExpansions] = useState<ExpansionWithComponents[]>([]);
  const [eligibleGames, setEligibleGames] = useState<EligibleGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("TODOS");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExpansion, setEditingExpansion] = useState<ExpansionWithComponents | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [imageMode1, setImageMode1] = useState<"URL" | "FILE">("URL");
  const [imageMode2, setImageMode2] = useState<"URL" | "FILE">("URL");
  const [qrManualMode, setQrManualMode] = useState<"URL" | "FILE">("URL");
  const [qrVideoMode, setQrVideoMode] = useState<"URL" | "FILE">("URL");

  // Form Fields State
  const [formData, setFormData] = useState({
    gameId: "",
    name: "",
    description: "",
    price: 2000,
    imageUrl: "",
    imageUrl2: "",
    qrManualUrl: "",
    qrVideoUrl: "",
    minPlayers: 2,
    maxPlayers: 4,
    minAge: 8,
    playtime: 30,
    maxPlaytime: 45,
    // Componentes
    cards: 0,
    tokens: 0,
    dice: 0,
    tiles: 0,
  });

  const [otherComponents, setOtherComponents] = useState<{ quantity: number; name: string }[]>([]);
  const [newOtherQty, setNewOtherQty] = useState(1);
  const [newOtherName, setNewOtherName] = useState("");

  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
  const [selectedQrManualFile, setSelectedQrManualFile] = useState<File | null>(null);
  const [selectedQrVideoFile, setSelectedQrVideoFile] = useState<File | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [expRes, gamesRes] = await Promise.all([
      getExpansions(),
      getEligibleGames(),
    ]);

    if (expRes.success && expRes.data) {
      setExpansions(expRes.data as unknown as ExpansionWithComponents[]);
    }
    if (gamesRes.success && gamesRes.data) {
      setEligibleGames(gamesRes.data as unknown as EligibleGame[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingExpansion(null);
    setFormData({
      gameId: eligibleGames.length > 0 ? eligibleGames[0].id : "",
      name: "",
      description: "",
      price: 2000,
      imageUrl: "",
      imageUrl2: "",
      qrManualUrl: "",
      qrVideoUrl: "",
      minPlayers: 2,
      maxPlayers: 4,
      minAge: 8,
      playtime: 30,
      maxPlaytime: 45,
      cards: 0,
      tokens: 0,
      dice: 0,
      tiles: 0,
    });
    setOtherComponents([]);
    setSelectedFile1(null);
    setSelectedFile2(null);
    setSelectedQrManualFile(null);
    setSelectedQrVideoFile(null);
    setImageMode1("URL");
    setImageMode2("URL");
    setQrManualMode("URL");
    setQrVideoMode("URL");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expansion: ExpansionWithComponents) => {
    setEditingExpansion(expansion);

    // Parse others
    let parsedOthers: { quantity: number; name: string }[] = [];
    if (expansion.components?.othersDescription) {
      try {
        parsedOthers = JSON.parse(expansion.components.othersDescription);
      } catch (e) {
        if (expansion.components.othersDescription.trim() !== "") {
          parsedOthers = [
            {
              quantity: expansion.components.others || 1,
              name: expansion.components.othersDescription,
            },
          ];
        }
      }
    } else if (expansion.components?.others && expansion.components.others > 0) {
      parsedOthers = [{ quantity: expansion.components.others, name: "Otros" }];
    }

    setFormData({
      gameId: expansion.gameId || "",
      name: expansion.name || "",
      description: expansion.description || "",
      price: expansion.price || 0,
      imageUrl: expansion.image || "",
      imageUrl2: expansion.image2 || "",
      qrManualUrl: expansion.qrManual || "",
      qrVideoUrl: expansion.qrVideo || "",
      minPlayers: expansion.minPlayers || 1,
      maxPlayers: expansion.maxPlayers || 4,
      minAge: expansion.minAge || 8,
      playtime: expansion.playtime || 30,
      maxPlaytime: expansion.maxPlaytime || expansion.playtime || 30,
      cards: expansion.components?.cards || 0,
      tokens: expansion.components?.tokens || 0,
      dice: expansion.components?.dice || 0,
      tiles: expansion.components?.tiles || 0,
    });
    setOtherComponents(parsedOthers);
    setSelectedFile1(null);
    setSelectedFile2(null);
    setSelectedQrManualFile(null);
    setSelectedQrVideoFile(null);
    setImageMode1("URL");
    setImageMode2("URL");
    setQrManualMode("URL");
    setQrVideoMode("URL");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Confirmas la eliminación de la expansión "${name}"?`)) return;

    const res = await deleteExpansion(id);
    if (!res.success) {
      alert(res.error || "No se pudo eliminar la expansión.");
    } else {
      await loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    if (!formData.gameId) {
      setErrorMessage("Debes seleccionar un juego principal para la expansión.");
      setSaving(false);
      return;
    }

    const data = new FormData();
    data.append("gameId", formData.gameId);
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price.toString());
    data.append("minPlayers", formData.minPlayers.toString());
    data.append("maxPlayers", formData.maxPlayers.toString());
    data.append("minAge", formData.minAge.toString());
    data.append("playtime", formData.playtime.toString());
    data.append("maxPlaytime", formData.maxPlaytime.toString());

    data.append("cards", formData.cards.toString());
    data.append("tokens", formData.tokens.toString());
    data.append("dice", formData.dice.toString());
    data.append("tiles", formData.tiles.toString());

    const totalOthers = otherComponents.reduce((acc, curr) => acc + curr.quantity, 0);
    data.append("others", totalOthers.toString());
    data.append("othersDescription", JSON.stringify(otherComponents));

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

    // QR Manual
    if (qrManualMode === "FILE" && selectedQrManualFile) {
      data.append("qrManualFile", selectedQrManualFile);
    } else {
      data.append("qrManualUrl", formData.qrManualUrl || "");
    }

    // QR Video
    if (qrVideoMode === "FILE" && selectedQrVideoFile) {
      data.append("qrVideoFile", selectedQrVideoFile);
    } else {
      data.append("qrVideoUrl", formData.qrVideoUrl || "");
    }

    const res = await saveExpansion(data, editingExpansion?.id);
    if (res.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      setErrorMessage(res.error || "Error al procesar el formulario.");
    }
    setSaving(false);
  };

  const filteredExpansions = expansions
    .filter((exp) => {
      if (selectedGameFilter !== "TODOS" && exp.gameId !== selectedGameFilter) return false;
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const expName = exp.name.toLowerCase();
        const expDesc = exp.description.toLowerCase();
        const gameName = exp.game?.name ? exp.game.name.toLowerCase() : "";
        return (
          expName.includes(term) ||
          expDesc.includes(term) ||
          gameName.includes(term)
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
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1.5">
            <Puzzle className="w-3.5 h-3.5 text-amber-700" />
            <span>CATÁLOGO & INVENTARIO // EXPANSIONES</span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            GESTIÓN DE EXPANSIONES
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Administra las expansiones oficiales vinculadas a tus juegos de mesa base.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition rounded-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Expansión</span>
        </button>
      </div>

      {/* Info Notice if no games have hasExpansions = true */}
      {eligibleGames.length === 0 && !loading && (
        <div className="border border-amber-300 bg-amber-50 p-4 font-mono text-xs text-amber-900 flex items-start gap-3 rounded-sm">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold uppercase">
              No hay juegos habilitados con expansiones
            </p>
            <p className="text-amber-800">
              Para agregar una expansión, primero debes editar un juego en la sección{" "}
              <Link href="/admin/games" className="underline font-bold hover:text-amber-950 inline-flex items-center gap-1">
                Juegos <ExternalLink className="w-3 h-3" />
              </Link>{" "}
              y activar la casilla <strong>&quot;Tiene expansiones&quot;</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="border border-zinc-200 bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, detalle o juego base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wire-input pl-9 text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-mono text-xs uppercase text-zinc-500 whitespace-nowrap flex items-center gap-1">
            <Dices className="w-3.5 h-3.5" /> Juego Base:
          </span>
          <select
            value={selectedGameFilter}
            onChange={(e) => setSelectedGameFilter(e.target.value)}
            className="wire-input text-xs w-full sm:w-56"
          >
            <option value="TODOS">TODOS LOS JUEGOS ({expansions.length})</option>
            {eligibleGames.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-200 bg-white overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
            <p className="font-mono text-xs text-zinc-500 uppercase">Cargando expansiones...</p>
          </div>
        ) : filteredExpansions.length === 0 ? (
          <div className="p-12 text-center">
            <Puzzle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="font-mono text-xs text-zinc-600 uppercase">
              No se encontraron expansiones registradas.
            </p>
            {eligibleGames.length > 0 && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white font-mono text-xs uppercase hover:bg-zinc-800 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Crear primera expansión
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 uppercase text-zinc-500">
                <th className="p-3 w-16 text-center">Img</th>
                <th className="p-3">Expansión / Juego Base</th>
                <th className="p-3 text-center">Jugadores</th>
                <th className="p-3 text-center">Duración</th>
                <th className="p-3 text-right">Tarifa</th>
                <th className="p-3 text-center">Componentes</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredExpansions.map((exp) => (
                <tr key={exp.id} className="hover:bg-zinc-50/80 transition">
                  <td className="p-3 text-center">
                    <div className="w-10 h-10 border border-zinc-300 bg-zinc-100 overflow-hidden mx-auto">
                      {exp.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={exp.image}
                          alt={exp.name}
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
                      {exp.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] text-amber-900 border border-amber-300 px-1.5 py-0.5 bg-amber-50 uppercase inline-flex items-center gap-1 font-semibold">
                        <Dices className="w-2.5 h-2.5 text-amber-700" />
                        Juego Base: {exp.game?.name || "Desconocido"}
                      </span>
                      {exp.game?.category && (
                        <span className="text-[10px] text-zinc-500 border border-zinc-200 px-1.5 py-0.5 bg-zinc-100 uppercase inline-block">
                          {exp.game.category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center text-zinc-700">
                    {exp.minPlayers}-{exp.maxPlayers} p.
                  </td>
                  <td className="p-3 text-center text-zinc-700">
                    {exp.maxPlaytime && exp.maxPlaytime !== exp.playtime
                      ? `${exp.playtime}-${exp.maxPlaytime} min`
                      : `${exp.playtime} min`}
                  </td>
                  <td className="p-3 text-right font-bold text-zinc-900">
                    ${exp.price.toLocaleString("es-AR")}
                  </td>
                  <td className="p-3 text-center text-[10px] text-zinc-500">
                    {exp.components ? (
                      <span>
                        C:{exp.components.cards} | F:{exp.components.tokens} | D:{exp.components.dice} | L:{exp.components.tiles}
                      </span>
                    ) : (
                      <span className="italic text-zinc-400">Sin registrar</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 border border-zinc-200 hover:border-zinc-900 text-zinc-700 hover:text-zinc-900 transition"
                        title="Editar expansión"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(exp.id, exp.name)}
                        className="p-1.5 border border-zinc-200 hover:border-red-600 text-zinc-700 hover:text-red-600 transition"
                        title="Eliminar expansión"
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
              <div className="flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-amber-700" />
                <h3 className="font-mono text-sm uppercase font-bold text-zinc-900">
                  {editingExpansion
                    ? `Editar Expansión: ${editingExpansion.name}`
                    : "Nueva Expansión"}
                </h3>
              </div>
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

              {/* Selector de Juego Base Obligatorio */}
              <div className="border-2 border-amber-400 bg-amber-50/70 p-4 space-y-2 rounded-sm">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase font-bold text-amber-950 flex items-center gap-1.5">
                    <Dices className="w-4 h-4 text-amber-800" />
                    Juego Principal Asociado *
                  </label>
                  <span className="text-[10px] font-mono text-amber-800 uppercase bg-amber-100 px-2 py-0.5 border border-amber-300">
                    Solo juegos con &quot;Tiene expansiones&quot;
                  </span>
                </div>

                {eligibleGames.length === 0 ? (
                  <div className="text-xs font-mono text-red-700 bg-white border border-red-200 p-2.5">
                    No hay ningún juego con la casilla &quot;Tiene expansiones&quot; activada.{" "}
                    <Link
                      href="/admin/games"
                      className="underline font-bold text-red-900 hover:text-red-950"
                    >
                      Ve a la gestión de Juegos para activar al menos uno.
                    </Link>
                  </div>
                ) : (
                  <select
                    required
                    value={formData.gameId}
                    onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                    className="wire-input text-xs w-full bg-white font-bold text-zinc-900 border-amber-400 focus:border-amber-600"
                  >
                    <option value="" disabled>
                      -- Selecciona el juego base --
                    </option>
                    {eligibleGames.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.category})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] font-mono text-amber-900/80">
                  Esta expansión quedará vinculada al juego seleccionado y compartirá su relación jerárquica.
                </p>
              </div>

              {/* Informacion Principal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Nombre de la Expansión *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="wire-input text-xs w-full"
                    placeholder="Ej: Navegantes, Posadas y Catedrales..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Detalle / Descripción *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="wire-input text-xs w-full"
                    placeholder="Qué agrega la expansión, nuevas mecánicas, cartas o dinámicas..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Tarifa de Alquiler de la Expansión ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="wire-input text-xs w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-600 mb-1">
                    Edad Mínima Recomendada *
                  </label>
                  <input
                    type="number"
                    min="3"
                    value={formData.minAge ?? 8}
                    onChange={(e) =>
                      setFormData({ ...formData, minAge: parseInt(e.target.value) || 8 })
                    }
                    className="wire-input text-xs w-full"
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
                      onChange={(e) =>
                        setFormData({ ...formData, playtime: parseInt(e.target.value) || 30 })
                      }
                      className="wire-input text-xs"
                    />
                    <input
                      type="number"
                      min="5"
                      placeholder="Máx"
                      value={formData.maxPlaytime ?? 45}
                      onChange={(e) =>
                        setFormData({ ...formData, maxPlaytime: parseInt(e.target.value) || 0 })
                      }
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
                      value={formData.minPlayers ?? 2}
                      onChange={(e) =>
                        setFormData({ ...formData, minPlayers: parseInt(e.target.value) || 1 })
                      }
                      className="wire-input text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Máx"
                      value={formData.maxPlayers ?? 4}
                      onChange={(e) =>
                        setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 4 })
                      }
                      className="wire-input text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Manejo de Imagen 1 e Imagen 2 */}
              <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-4">
                {/* Imagen Principal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-zinc-700">
                      Imagen Principal de la Expansión
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageMode1("URL")}
                        className={`px-2 py-0.5 border ${
                          imageMode1 === "URL"
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
                        className={`px-2 py-0.5 border ${
                          imageMode1 === "FILE"
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
                      type="url"
                      placeholder="https://..."
                      value={formData.imageUrl || ""}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="wire-input text-xs w-full"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile1(e.target.files?.[0] || null)}
                      className="wire-input text-xs file:mr-3 file:py-1 file:px-2 file:border file:border-zinc-300 file:text-xs file:font-mono file:bg-zinc-100 w-full"
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
                        className={`px-2 py-0.5 border ${
                          imageMode2 === "URL"
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
                        className={`px-2 py-0.5 border ${
                          imageMode2 === "FILE"
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
                      type="url"
                      placeholder="https://..."
                      value={formData.imageUrl2 || ""}
                      onChange={(e) => setFormData({ ...formData, imageUrl2: e.target.value })}
                      className="wire-input text-xs w-full"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile2(e.target.files?.[0] || null)}
                      className="wire-input text-xs file:mr-3 file:py-1 file:px-2 file:border file:border-zinc-300 file:text-xs file:font-mono file:bg-zinc-100 w-full"
                    />
                  )}
                </div>

                {/* QR Manual */}
                <div className="space-y-2 pt-3 border-t border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-zinc-700">
                      QR Manual de la Expansión (Opcional)
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => setQrManualMode("URL")}
                        className={`px-2 py-0.5 border ${
                          qrManualMode === "URL"
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-600 border-zinc-300"
                        }`}
                      >
                        <LinkIcon className="w-3 h-3 inline mr-1" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrManualMode("FILE")}
                        className={`px-2 py-0.5 border ${
                          qrManualMode === "FILE"
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-600 border-zinc-300"
                        }`}
                      >
                        <Upload className="w-3 h-3 inline mr-1" />
                        Archivo
                      </button>
                    </div>
                  </div>

                  {qrManualMode === "URL" ? (
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.qrManualUrl || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, qrManualUrl: e.target.value })
                      }
                      className="wire-input text-xs w-full"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedQrManualFile(e.target.files?.[0] || null)}
                      className="wire-input text-xs file:mr-3 file:py-1 file:px-2 file:border file:border-zinc-300 file:text-xs file:font-mono file:bg-zinc-100 w-full"
                    />
                  )}
                </div>

                {/* QR Video */}
                <div className="space-y-2 pt-3 border-t border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-zinc-700">
                      QR Video de la Expansión (Opcional)
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => setQrVideoMode("URL")}
                        className={`px-2 py-0.5 border ${
                          qrVideoMode === "URL"
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-600 border-zinc-300"
                        }`}
                      >
                        <LinkIcon className="w-3 h-3 inline mr-1" />
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrVideoMode("FILE")}
                        className={`px-2 py-0.5 border ${
                          qrVideoMode === "FILE"
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-600 border-zinc-300"
                        }`}
                      >
                        <Upload className="w-3 h-3 inline mr-1" />
                        Archivo
                      </button>
                    </div>
                  </div>

                  {qrVideoMode === "URL" ? (
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.qrVideoUrl || ""}
                      onChange={(e) => setFormData({ ...formData, qrVideoUrl: e.target.value })}
                      className="wire-input text-xs w-full"
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedQrVideoFile(e.target.files?.[0] || null)}
                      className="wire-input text-xs file:mr-3 file:py-1 file:px-2 file:border file:border-zinc-300 file:text-xs file:font-mono file:bg-zinc-100 w-full"
                    />
                  )}
                </div>
              </div>

              {/* Desglose de Componentes Iniciales */}
              <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-3">
                <span className="font-mono text-xs uppercase font-bold text-zinc-700 block flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  Inventario Inicial de Componentes de la Expansión
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Cartas</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cards ?? 0}
                      onChange={(e) =>
                        setFormData({ ...formData, cards: parseInt(e.target.value) || 0 })
                      }
                      className="wire-input text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Fichas</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tokens ?? 0}
                      onChange={(e) =>
                        setFormData({ ...formData, tokens: parseInt(e.target.value) || 0 })
                      }
                      className="wire-input text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Dados</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.dice ?? 0}
                      onChange={(e) =>
                        setFormData({ ...formData, dice: parseInt(e.target.value) || 0 })
                      }
                      className="wire-input text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Losetas</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tiles ?? 0}
                      onChange={(e) =>
                        setFormData({ ...formData, tiles: parseInt(e.target.value) || 0 })
                      }
                      className="wire-input text-xs w-full"
                    />
                  </div>
                </div>

                {/* Dynamic Others Section */}
                <div className="pt-3 border-t border-zinc-200">
                  <label className="text-[10px] font-mono text-zinc-700 font-bold uppercase block mb-2">
                    Otros Componentes de la Expansión
                  </label>

                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      min="1"
                      value={newOtherQty}
                      onChange={(e) => setNewOtherQty(parseInt(e.target.value) || 1)}
                      className="wire-input text-xs w-20"
                      placeholder="Cant."
                    />
                    <input
                      type="text"
                      value={newOtherName}
                      onChange={(e) => setNewOtherName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newOtherName.trim()) {
                          e.preventDefault();
                          setOtherComponents([
                            ...otherComponents,
                            { quantity: newOtherQty, name: newOtherName.trim() },
                          ]);
                          setNewOtherName("");
                          setNewOtherQty(1);
                        }
                      }}
                      className="wire-input text-xs flex-1"
                      placeholder="Descripción (ej. Barcos, Miniaturas, Tablero de mar...)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newOtherName.trim()) {
                          setOtherComponents([
                            ...otherComponents,
                            { quantity: newOtherQty, name: newOtherName.trim() },
                          ]);
                          setNewOtherName("");
                          setNewOtherQty(1);
                        }
                      }}
                      className="px-3 py-2 bg-zinc-900 text-white font-mono hover:bg-zinc-800 transition rounded-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {otherComponents.length > 0 && (
                    <div className="space-y-1.5">
                      {otherComponents.map((comp, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white border border-zinc-200 px-3 py-1.5 text-xs font-mono"
                        >
                          <span>
                            <span className="font-bold text-zinc-900">{comp.quantity}</span> x{" "}
                            {comp.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setOtherComponents(otherComponents.filter((_, i) => i !== idx))
                            }
                            className="text-zinc-400 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  disabled={saving || eligibleGames.length === 0}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingExpansion ? "Guardar Cambios" : "Crear Expansión"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

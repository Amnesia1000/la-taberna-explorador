"use client";

import React, { useState, useEffect } from "react";
import { getGamesWithComponents, updateComponents, updateExpansionComponents } from "@/lib/actions/components";
import { GameWithComponents, ExpansionWithComponents, GameComponentsData } from "@/types";
import { formatOthersDescription } from "@/lib/utils";
import RemitoModal from "@/components/admin/RemitoModal";
import {
  Layers,
  FileSignature,
  Edit2,
  X,
  RefreshCw,
  Search,
  FolderOpen,
  CornerDownRight,
  Puzzle,
} from "lucide-react";

export default function AdminComponentsPage() {
  const [games, setGames] = useState<GameWithComponents[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Remito Modal
  const [isRemitoOpen, setIsRemitoOpen] = useState<boolean>(false);
  const [selectedGameForRemito, setSelectedGameForRemito] = useState<string | undefined>(undefined);

  // Editing Component Modal (Game or Expansion)
  const [editingItem, setEditingItem] = useState<{
    type: "GAME" | "EXPANSION";
    id: string;
    name: string;
    components?: GameComponentsData | null;
  } | null>(null);

  const [componentForm, setComponentForm] = useState<GameComponentsData>({
    cards: 0,
    tokens: 0,
    dice: 0,
    tiles: 0,
    others: 0,
    othersDescription: "",
  });
  const [saving, setSaving] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const res = await getGamesWithComponents();
    if (res.success && res.data) {
      setGames(res.data as unknown as GameWithComponents[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditGame = (game: GameWithComponents) => {
    setEditingItem({
      type: "GAME",
      id: game.id,
      name: game.name,
      components: game.components,
    });
    setComponentForm({
      cards: game.components?.cards || 0,
      tokens: game.components?.tokens || 0,
      dice: game.components?.dice || 0,
      tiles: game.components?.tiles || 0,
      others: game.components?.others || 0,
      othersDescription: game.components?.othersDescription || "",
    });
  };

  const handleOpenEditExpansion = (exp: ExpansionWithComponents) => {
    setEditingItem({
      type: "EXPANSION",
      id: exp.id,
      name: exp.name,
      components: exp.components,
    });
    setComponentForm({
      cards: exp.components?.cards || 0,
      tokens: exp.components?.tokens || 0,
      dice: exp.components?.dice || 0,
      tiles: exp.components?.tiles || 0,
      others: exp.components?.others || 0,
      othersDescription: exp.components?.othersDescription || "",
    });
  };

  const handleSaveComponents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    let res;
    if (editingItem.type === "GAME") {
      res = await updateComponents(editingItem.id, {
        cards: componentForm.cards,
        tokens: componentForm.tokens,
        dice: componentForm.dice,
        tiles: componentForm.tiles,
        others: componentForm.others,
        othersDescription: componentForm.othersDescription || undefined,
      });
    } else {
      res = await updateExpansionComponents(editingItem.id, {
        cards: componentForm.cards,
        tokens: componentForm.tokens,
        dice: componentForm.dice,
        tiles: componentForm.tiles,
        others: componentForm.others,
        othersDescription: componentForm.othersDescription || undefined,
      });
    }

    if (res.success) {
      setEditingItem(null);
      await loadData();
    } else {
      alert("Error al actualizar componentes: " + res.error);
    }
    setSaving(false);
  };

  const handleOpenRemito = (gameId?: string) => {
    setSelectedGameForRemito(gameId);
    setIsRemitoOpen(true);
  };

  const filteredGames = games.filter((g) => {
    if (searchTerm.trim() === "") return true;
    const term = searchTerm.toLowerCase();
    const gameMatch =
      g.name.toLowerCase().includes(term) ||
      g.category.toLowerCase().includes(term);
    const expMatch = g.expansions?.some((e) => e.name.toLowerCase().includes(term));
    return gameMatch || expMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Title & Actions */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            CONTROL DE STOCK & DISPATCH // REMITO DIGITAL
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            INVENTARIO DE PIEZAS Y COMPONENTES
          </h1>
        </div>

        <button
          type="button"
          onClick={() => handleOpenRemito()}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition"
        >
          <FileSignature className="w-4 h-4 text-emerald-400" />
          <span>Generar Remito Digital</span>
        </button>
      </div>

      {/* Search toolbar */}
      <div className="border border-zinc-200 bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por juego o expansión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wire-input pl-9 text-xs"
          />
        </div>

        <div className="text-xs font-mono text-zinc-500">
          Total de juegos inventariados: <strong className="text-zinc-900">{games.length}</strong>
        </div>
      </div>

      {/* Directory Tree Table of components */}
      <div className="border border-zinc-200 bg-white overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
            <p className="font-mono text-xs text-zinc-500 uppercase">Cargando inventario de componentes...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="font-mono text-xs text-zinc-600 uppercase">
              No se encontraron juegos.
            </p>
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-100 uppercase text-zinc-600">
                <th className="p-3">Estructura / Elemento</th>
                <th className="p-3 text-center">Cartas</th>
                <th className="p-3 text-center">Fichas</th>
                <th className="p-3 text-center">Dados</th>
                <th className="p-3 text-center">Losetas</th>
                <th className="p-3 text-center">Otros</th>
                <th className="p-3">Detalle Especial</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredGames.map((game) => (
                <React.Fragment key={game.id}>
                  {/* Fila Padre (Carpeta de Juego Principal) */}
                  <tr className="hover:bg-zinc-50 transition bg-white">
                    <td className="p-3 font-bold text-zinc-900 uppercase">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{game.name}</span>
                        {game.expansions && game.expansions.length > 0 && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 font-semibold rounded-sm">
                            {game.expansions.length} exp.
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-normal uppercase block pl-6">
                        {game.category} • Stock: {game.stock}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="wire-badge">{game.components?.cards ?? 0}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="wire-badge">{game.components?.tokens ?? 0}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="wire-badge">{game.components?.dice ?? 0}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="wire-badge">{game.components?.tiles ?? 0}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="wire-badge">{game.components?.others ?? 0}</span>
                    </td>
                    <td className="p-3 text-zinc-600 text-[11px] max-w-xs truncate">
                      {formatOthersDescription(game.components?.othersDescription) || "-"}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditGame(game)}
                          className="px-2 py-1 border border-zinc-300 hover:border-zinc-900 bg-white text-zinc-700 hover:text-zinc-900 flex items-center gap-1 transition"
                          title="Modificar inventario de piezas del juego"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span className="text-[10px] uppercase">Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenRemito(game.id)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1 transition"
                          title="Generar remito para este juego"
                        >
                          <FileSignature className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] uppercase">Remito</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Filas Hojas (Subcarpetas de Expansiones) */}
                  {game.expansions && game.expansions.length > 0 &&
                    game.expansions.map((exp) => (
                      <tr key={exp.id} className="bg-amber-50/40 hover:bg-amber-100/40 transition">
                        <td className="p-2.5 pl-8 font-semibold text-zinc-800 uppercase">
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-amber-700 shrink-0 ml-1" />
                            <Puzzle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="text-xs text-zinc-900">{exp.name}</span>
                          </div>
                          <span className="text-[10px] text-amber-800/70 font-normal uppercase block pl-7">
                            Expansión Oficial
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="wire-badge bg-white border-amber-300 text-amber-900">{exp.components?.cards ?? 0}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="wire-badge bg-white border-amber-300 text-amber-900">{exp.components?.tokens ?? 0}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="wire-badge bg-white border-amber-300 text-amber-900">{exp.components?.dice ?? 0}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="wire-badge bg-white border-amber-300 text-amber-900">{exp.components?.tiles ?? 0}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="wire-badge bg-white border-amber-300 text-amber-900">{exp.components?.others ?? 0}</span>
                        </td>
                        <td className="p-2.5 text-zinc-600 text-[11px] max-w-xs truncate">
                          {formatOthersDescription(exp.components?.othersDescription) || "-"}
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditExpansion(exp)}
                              className="px-2 py-0.5 border border-amber-300 hover:border-amber-700 bg-white text-amber-900 flex items-center gap-1 transition text-[10px]"
                              title="Modificar inventario de la expansión"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span className="uppercase">Editar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Components Modal (Supports Game & Expansion) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border-2 border-zinc-900 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="font-mono text-sm uppercase font-bold text-zinc-900">
                Editar Inventario ({editingItem.type === "GAME" ? "Juego" : "Expansión"}): {editingItem.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-zinc-500 hover:text-zinc-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveComponents} className="mt-4 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Cartas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={componentForm.cards}
                    onChange={(e) =>
                      setComponentForm({
                        ...componentForm,
                        cards: parseInt(e.target.value) || 0,
                      })
                    }
                    className="wire-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Fichas / Tokens
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={componentForm.tokens}
                    onChange={(e) =>
                      setComponentForm({
                        ...componentForm,
                        tokens: parseInt(e.target.value) || 0,
                      })
                    }
                    className="wire-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Dados
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={componentForm.dice}
                    onChange={(e) =>
                      setComponentForm({
                        ...componentForm,
                        dice: parseInt(e.target.value) || 0,
                      })
                    }
                    className="wire-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Losetas / Tableros
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={componentForm.tiles}
                    onChange={(e) =>
                      setComponentForm({
                        ...componentForm,
                        tiles: parseInt(e.target.value) || 0,
                      })
                    }
                    className="wire-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Otras Piezas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={componentForm.others}
                    onChange={(e) =>
                      setComponentForm({
                        ...componentForm,
                        others: parseInt(e.target.value) || 0,
                      })
                    }
                    className="wire-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                  Descripción de otras piezas / Observaciones:
                </label>
                <textarea
                  rows={2}
                  value={componentForm.othersDescription || ""}
                  onChange={(e) =>
                    setComponentForm({
                      ...componentForm,
                      othersDescription: e.target.value,
                    })
                  }
                  placeholder="Ej: Manual, reloj de arena, meeples de madera..."
                  className="wire-input text-xs"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white uppercase flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Inventario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remito Digital Modal */}
      {isRemitoOpen && (
        <RemitoModal
          games={games}
          initialGameId={selectedGameForRemito}
          onClose={() => setIsRemitoOpen(false)}
        />
      )}
    </div>
  );
}

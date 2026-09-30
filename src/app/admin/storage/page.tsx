"use client";

import { useState, useEffect } from "react";
import { getOrphanBlobs, deleteBlobs, OrphanBlob } from "@/lib/actions/storage";
import {
  FolderX,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminStoragePage() {
  const [orphans, setOrphans] = useState<OrphanBlob[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setLoading(true);
    setError("");
    const res = await getOrphanBlobs();
    setLoading(false);
    if (res.success && res.data) {
      setOrphans(res.data);
      setTotalSize(res.totalSize ?? 0);
      setSelected(new Set());
    } else {
      setError(res.error || "Error al cargar.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggle = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`¿Borrar ${selected.size} archivo(s) huérfano(s)? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    const res = await deleteBlobs([...selected]);
    setDeleting(false);
    if (res.success) {
      await loadData();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            ALMACENAMIENTO // ARCHIVOS HUÉRFANOS
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            LIMPIEZA DE IMÁGENES
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelected(new Set(orphans.map((o) => o.url)))}
            className="px-4 h-8 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-900 font-mono text-xs uppercase tracking-wider transition"
          >
            Todos
          </button>
          <button
            type="button"
            disabled={deleting || selected.size === 0}
            onClick={handleDelete}
            className="px-4 h-8 bg-red-700 hover:bg-red-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? "Borrando…" : `Borrar (${selected.size})`}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center border border-zinc-200 bg-white">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
          <p className="font-mono text-xs text-zinc-500 uppercase">Comparando con la base...</p>
        </div>
      ) : error ? (
        <div className="border border-red-300 bg-red-50 p-4 text-xs text-red-800 font-mono flex items-center gap-2" role="alert">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      ) : orphans.length === 0 ? (
        <div className="p-12 text-center border border-zinc-200 bg-white">
          <FolderX className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="font-mono text-xs text-zinc-600 uppercase">Sin archivos huérfanos. Todo en uso.</p>
        </div>
      ) : (
        <>
          <p className="font-mono text-xs uppercase text-zinc-500">
            {orphans.length} archivo(s) sin uso · {fmtSize(totalSize)} recuperables · Backups excluidos
          </p>
          <div className="border border-zinc-200 bg-white overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#24130a] text-[#e2b17b] uppercase border-b-2 border-[#8c5828]">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selected.size === orphans.length && orphans.length > 0}
                      onChange={(e) => setSelected(e.target.checked ? new Set(orphans.map((o) => o.url)) : new Set())}
                      className="h-4 w-4 accent-amber-700 cursor-pointer"
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  <th className="p-3">Archivo</th>
                  <th className="p-3 text-right">Tamaño</th>
                  <th className="p-3 text-right">Subido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {orphans.map((o) => (
                  <tr key={o.url} className="hover:bg-amber-50/70 transition">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selected.has(o.url)}
                        onChange={() => toggle(o.url)}
                        className="h-4 w-4 accent-amber-700 cursor-pointer"
                        aria-label={`Seleccionar ${o.pathname}`}
                      />
                    </td>
                    <td className="p-3">
                      <a href={o.url} target="_blank" rel="noopener noreferrer" className="text-zinc-900 underline break-all">
                        {o.pathname}
                      </a>
                    </td>
                    <td className="p-3 text-right text-zinc-700 whitespace-nowrap">{fmtSize(o.size)}</td>
                    <td className="p-3 text-right text-zinc-500 whitespace-nowrap">
                      {o.uploadedAt ? new Date(o.uploadedAt).toLocaleDateString("es-AR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

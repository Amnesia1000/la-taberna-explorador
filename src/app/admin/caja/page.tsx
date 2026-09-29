"use client";

import { useState, useEffect } from "react";
import { getMovements, saveMovement, deleteMovement, CashType } from "@/lib/actions/cash";
import { exportExcel } from "@/lib/actions/export-excel";
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Scale,
  Download,
} from "lucide-react";

interface Movement {
  id: string;
  date: string;
  type: string;
  concept: string;
  amount: number;
  notes?: string | null;
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminCajaPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(currentMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Movement | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({ date: todayInput(), type: "EXPENSE" as CashType, concept: "", amount: 0, notes: "" });

  const loadData = async (m: string) => {
    setLoading(true);
    const res = await getMovements(m);
    if (res.success) {
      setMovements(res.data as unknown as Movement[]);
      setIncome(res.income ?? 0);
      setExpense(res.expense ?? 0);
      setBalance(res.balance ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const openCreate = () => {
    setEditing(null);
    setForm({ date: todayInput(), type: "EXPENSE", concept: "", amount: 0, notes: "" });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEdit = (m: Movement) => {
    setEditing(m);
    setForm({
      date: new Date(m.date).toISOString().slice(0, 10),
      type: m.type as CashType,
      concept: m.concept,
      amount: m.amount,
      notes: m.notes ?? "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este movimiento?")) return;
    const res = await deleteMovement(id);
    if (res.success) loadData(month);
    else alert(res.error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    const res = await saveMovement({ ...form, id: editing?.id });
    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      loadData(month);
    } else {
      setErrorMessage(res.error || "Error al guardar.");
    }
  };

  const fmt = (n: number) => `$${n.toLocaleString("es-AR")}`;

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            FINANZAS // INGRESOS Y EGRESOS
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            CAJA
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openCreate}
          className="px-4 h-8 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar movimiento</span>
        </button>
        <button
          type="button"
          onClick={async () => {
            const res = await exportExcel();
            if (res.success && res.base64) {
              const a = document.createElement("a");
              a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.base64}`;
              a.download = res.filename || "taberna.xlsx";
              a.click();
            } else {
              alert(res.error || "No se pudo exportar.");
            }
          }}
          className="px-4 h-8 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-900 font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Excel</span>
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-mono uppercase font-bold text-zinc-600 mb-1">Mes</label>
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="wire-input text-xs w-full"
          />
        </div>
        <div className="border border-zinc-200 border-t-4 border-t-emerald-600 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span className="font-mono text-xs uppercase text-zinc-500">Ingresos</span>
          </div>
          <span className="font-mono text-2xl font-bold text-emerald-700 block mt-1">{fmt(income)}</span>
        </div>
        <div className="border border-zinc-200 border-t-4 border-t-red-500 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="font-mono text-xs uppercase text-zinc-500">Egresos</span>
          </div>
          <span className="font-mono text-2xl font-bold text-red-700 block mt-1">{fmt(expense)}</span>
        </div>
        <div className="border border-zinc-200 border-t-4 border-t-amber-600 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-700" />
            <span className="font-mono text-xs uppercase text-zinc-500">Balance</span>
          </div>
          <span className={`font-mono text-2xl font-bold block mt-1 ${balance >= 0 ? "text-zinc-900" : "text-red-700"}`}>{fmt(balance)}</span>
        </div>
      </div>

      <div className="border border-zinc-200 bg-white overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
            <p className="font-mono text-xs text-zinc-500 uppercase">Cargando caja...</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="font-mono text-xs text-zinc-600 uppercase">Sin movimientos este mes.</p>
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#24130a] text-[#e2b17b] uppercase border-b-2 border-[#8c5828]">
                <th className="p-3">Fecha</th>
                <th className="p-3">Concepto</th>
                <th className="p-3 text-right">Monto</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-amber-50/70 transition">
                  <td className="p-3 text-zinc-700 whitespace-nowrap">
                    {new Date(m.date).toLocaleDateString("es-AR")}
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-1.5 py-px text-[10px] font-bold uppercase rounded-sm border mr-2 ${m.type === "INCOME" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-red-100 text-red-800 border-red-300"}`}>
                      {m.type === "INCOME" ? "Ingreso" : "Egreso"}
                    </span>
                    <span className="font-bold text-zinc-900 uppercase">{m.concept}</span>
                    {m.notes && <span className="block text-[11px] text-zinc-500 mt-0.5">{m.notes}</span>}
                  </td>
                  <td className={`p-3 text-right font-bold whitespace-nowrap ${m.type === "INCOME" ? "text-emerald-700" : "text-red-700"}`}>
                    {m.type === "INCOME" ? "+" : "-"}{fmt(m.amount)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        className="p-1.5 border border-zinc-200 hover:border-zinc-900 text-zinc-700 hover:text-zinc-900 transition"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 border border-zinc-200 hover:border-red-600 text-zinc-700 hover:text-red-600 transition"
                        title="Eliminar"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border-2 border-zinc-900 border-t-4 border-t-[#b45309] shadow-2xl font-mono text-xs">
            <div className="px-4 py-3 border-b-2 border-[#8c5828] flex items-center justify-between wood-beam">
              <h3 className="font-tavern text-sm uppercase font-bold text-[#fef3c7] tracking-wider">
                {editing ? "Editar movimiento" : "Nuevo movimiento"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#e2b17b] hover:text-white hover:bg-[#4a2612] rounded-sm transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {errorMessage && (
                <div className="border border-red-300 bg-red-50 p-3 text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-zinc-600 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="wire-input text-xs w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-zinc-600 mb-1">Tipo *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as CashType })}
                    className="wire-input text-xs w-full"
                  >
                    <option value="EXPENSE">Egreso</option>
                    <option value="INCOME">Ingreso</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-zinc-600 mb-1">Concepto *</label>
                <input
                  type="text"
                  required
                  value={form.concept}
                  onChange={(e) => setForm({ ...form, concept: e.target.value })}
                  placeholder="Ej: Alquiler Catan, compra de dados..."
                  className="wire-input text-xs w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-zinc-600 mb-1">Monto ($) *</label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  required
                  value={form.amount || ""}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="wire-input text-xs w-32"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-zinc-600 mb-1">Notas</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="wire-input text-xs w-full"
                />
              </div>
              <div className="pt-2 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-8 border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 font-mono text-xs uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 h-8 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {saving ? "Guardando…" : editing ? "Guardar" : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

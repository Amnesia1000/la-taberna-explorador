"use client";

import { useState, useEffect } from "react";
import {
  getReservations,
  cancelReservation,
  confirmReservationToRental,
  createReservation,
} from "@/lib/actions/reservations";
import { getGames } from "@/lib/actions/games";
import { getUsers } from "@/lib/actions/users";
import { ReservationWithDetails, GameWithComponents, UserData } from "@/types";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  ArrowRight,
  X,
} from "lucide-react";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [games, setGames] = useState<GameWithComponents[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [clientData, setClientData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [expectedEndDate, setExpectedEndDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    const [resRes, gamesRes, usersRes] = await Promise.all([
      getReservations(),
      getGames(),
      getUsers(),
    ]);

    if (resRes.success && resRes.data) {
      setReservations(resRes.data as unknown as ReservationWithDetails[]);
    }
    if (gamesRes.success && gamesRes.data) {
      setGames(gamesRes.data as unknown as GameWithComponents[]);
    }
    if (usersRes.success && usersRes.data) {
      setUsers(usersRes.data as unknown as UserData[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenNewModal = () => {
    setSelectedGameId(games[0]?.id || "");
    setClientData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
    });
    setActionError("");
    setIsModalOpen(true);
  };

  const handleConfirmToRental = async (id: string, gameName: string, clientName: string) => {
    if (
      !confirm(
        `¿Confirmar la reserva de "${gameName}" para ${clientName}? Esto convertirá la reserva en un alquiler activo y descontará 1 unidad del stock mediante una transacción atómica.`
      )
    ) {
      return;
    }

    const res = await confirmReservationToRental(id);
    if (res.success) {
      alert("¡Reserva confirmada y convertida a alquiler con éxito!");
      await loadData();
    } else {
      alert(res.error || "No se pudo confirmar la reserva.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("¿Deseas cancelar esta reserva?")) return;

    const res = await cancelReservation(id);
    if (res.success) {
      await loadData();
    } else {
      alert("Error al cancelar la reserva: " + res.error);
    }
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId) {
      setActionError("Selecciona un juego para la reserva");
      return;
    }

    setSubmitting(true);
    setActionError("");

    const res = await createReservation({
      gameId: selectedGameId,
      clientName: clientData.firstName,
      clientLastName: clientData.lastName,
      clientPhone: clientData.phone,
      clientEmail: clientData.email,
      clientAddress: clientData.address,
      expectedEndDate,
    });

    if (res.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      setActionError(res.error || "Error al crear la reserva");
    }
    setSubmitting(false);
  };

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const matchGame = r.game.name.toLowerCase().includes(term);
      const matchClient = `${r.clientName} ${r.clientLastName}`.toLowerCase().includes(term);
      const matchEmail = r.clientEmail.toLowerCase().includes(term);
      if (!matchGame && !matchClient && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            CONTROL DE DEMANDA // COLA DE ESPERA
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            GESTIÓN DE RESERVAS
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenNewModal}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Reserva</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="border border-zinc-200 bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por juego o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wire-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          <span className="text-zinc-500 uppercase mr-1">Estado:</span>
          {[
            { id: "ALL", label: "TODAS" },
            { id: "PENDING", label: "PENDIENTES" },
            { id: "CONFIRMED", label: "CONFIRMADAS" },
            { id: "CANCELLED", label: "CANCELADAS" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1 uppercase border transition ${
                statusFilter === st.id
                  ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-200 bg-white overflow-x-auto font-mono text-xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
            <p className="text-zinc-500 uppercase">Cargando reservas...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-zinc-600 uppercase">No se encontraron reservas registradas.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 uppercase text-zinc-500">
                <th className="p-3">Juego Solicitado</th>
                <th className="p-3">Stock Actual</th>
                <th className="p-3">Cliente Solicitante</th>
                <th className="p-3">Fecha de Solicitud</th>
                <th className="p-3">Fecha Pactada</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredReservations.map((res) => {
                const canConfirm = res.status === "PENDING" && res.game.stock > 0;

                return (
                  <tr key={res.id} className="hover:bg-zinc-50/80 transition">
                    <td className="p-3">
                      <span className="font-bold text-zinc-900 uppercase block">
                        {res.game.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        ${res.game.price.toLocaleString("es-AR")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 border text-[10px] ${
                          res.game.stock > 0
                            ? "bg-zinc-50 text-zinc-900 border-zinc-300"
                            : "bg-red-50 text-red-700 border-red-200 font-bold"
                        }`}
                      >
                        {res.game.stock} unid.
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-zinc-900 font-bold block">
                        {res.clientName} {res.clientLastName}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {res.clientPhone} • {res.clientEmail}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-600">
                      {new Date(res.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="p-3 text-zinc-800">
                      {new Date(res.expectedEndDate).toLocaleDateString("es-AR")}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 border text-[10px] uppercase font-bold ${
                          res.status === "PENDING"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : res.status === "CONFIRMED"
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-zinc-100 text-zinc-400 border-zinc-200 line-through"
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleConfirmToRental(
                                  res.id,
                                  res.game.name,
                                  `${res.clientName} ${res.clientLastName}`
                                )
                              }
                              disabled={res.game.stock <= 0}
                              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] uppercase tracking-wider flex items-center gap-1 transition disabled:opacity-40 disabled:cursor-not-allowed"
                              title={
                                res.game.stock > 0
                                  ? "Convertir a alquiler activo en transacción de DB"
                                  : "Sin stock disponible para confirmar"
                              }
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Confirmar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancel(res.id)}
                              className="px-2 py-1 border border-zinc-300 hover:border-red-500 text-zinc-600 hover:text-red-600 text-[10px] uppercase flex items-center gap-1 transition"
                              title="Cancelar reserva"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Cancelar</span>
                            </button>
                          </>
                        )}
                        {res.status !== "PENDING" && (
                          <span className="text-[10px] text-zinc-400 uppercase italic">
                            Procesada
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nueva Reserva */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border-2 border-zinc-900 shadow-2xl p-6 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm uppercase font-bold text-zinc-900">
                Registrar Nueva Reserva
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReservation} className="mt-4 space-y-4">
              {actionError && (
                <div className="border border-red-300 bg-red-50 p-2 text-red-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div>
                <label className="block uppercase text-zinc-600 mb-1 font-bold">
                  Juego a Reservar *
                </label>
                <select
                  required
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="wire-input text-xs"
                >
                  <option value="">Selecciona un juego...</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Stock: {g.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientData.firstName}
                    onChange={(e) => setClientData({ ...clientData, firstName: e.target.value })}
                    className="wire-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientData.lastName}
                    onChange={(e) => setClientData({ ...clientData, lastName: e.target.value })}
                    className="wire-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientData.phone}
                    onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                    className="wire-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    className="wire-input text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Domicilio *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientData.address}
                    onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                    className="wire-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                  Fecha Estimada de Alquiler / Retiro *
                </label>
                <input
                  type="date"
                  required
                  value={expectedEndDate}
                  onChange={(e) => setExpectedEndDate(e.target.value)}
                  className="wire-input text-xs"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white uppercase flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Crear Reserva</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

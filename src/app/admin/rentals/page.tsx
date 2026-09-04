"use client";

import { useState, useEffect } from "react";
import { getRentals, createRental, returnRental } from "@/lib/actions/rentals";
import { getGames } from "@/lib/actions/games";
import { getUsers } from "@/lib/actions/users";
import { RentalWithDetails, GameWithComponents, UserData, RentalStatus } from "@/types";
import {
  Plus,
  Repeat,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
  const [games, setGames] = useState<GameWithComponents[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customerMode, setCustomerMode] = useState<"EXISTING" | "NEW">("EXISTING");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [clientData, setClientData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [saveUserIfNew, setSaveUserIfNew] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [expectedEndDate, setExpectedEndDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    const [rentRes, gamesRes, usersRes] = await Promise.all([
      getRentals(),
      getGames(),
      getUsers(),
    ]);

    if (rentRes.success && rentRes.data) {
      setRentals(rentRes.data as unknown as RentalWithDetails[]);
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

  const handleOpenNewRental = () => {
    const availableGames = games.filter((g) => g.stock > 0);
    setSelectedGameId(availableGames[0]?.id || "");
    if (users.length > 0) {
      setCustomerMode("EXISTING");
      setSelectedUserId(users[0].id);
      setClientData({
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        phone: users[0].phone,
        email: users[0].email,
        address: users[0].address,
      });
    } else {
      setCustomerMode("NEW");
      setSelectedUserId("");
      setClientData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
      });
    }
    setActionError("");
    setIsModalOpen(true);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const u = users.find((user) => user.id === userId);
    if (u) {
      setClientData({
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        email: u.email,
        address: u.address,
      });
    }
  };

  const handleSubmitRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId) {
      setActionError("Debes seleccionar un juego disponible");
      return;
    }

    setSubmitting(true);
    setActionError("");

    const res = await createRental({
      gameId: selectedGameId,
      userId: customerMode === "EXISTING" ? selectedUserId : null,
      clientName: clientData.firstName,
      clientLastName: clientData.lastName,
      clientPhone: clientData.phone,
      clientEmail: clientData.email,
      clientAddress: clientData.address,
      startDate,
      expectedEndDate,
      saveUserIfNew: customerMode === "NEW" ? saveUserIfNew : false,
    });

    if (res.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      setActionError(res.error || "No se pudo registrar el alquiler.");
    }
    setSubmitting(false);
  };

  const handleReturn = async (rentalId: string, gameName: string) => {
    if (!confirm(`¿Confirmas la devolución del juego "${gameName}"? Esto reintegrará 1 unidad al stock.`)) {
      return;
    }

    const res = await returnRental(rentalId);
    if (res.success) {
      await loadData();
    } else {
      alert("Error al devolver el alquiler: " + res.error);
    }
  };

  const filteredRentals = rentals.filter((r) => {
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
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            CONTROL OPERATIVO // PRÉSTAMOS
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            GESTIÓN DE ALQUILERES
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenNewRental}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Alquiler</span>
        </button>
      </div>

      {/* Filter and search bar */}
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
            { id: "ALL", label: "TODOS" },
            { id: "ACTIVE", label: "ACTIVOS" },
            { id: "RETURNED", label: "DEVUELTOS" },
            { id: "LATE", label: "ATRASADOS" },
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

      {/* Rentals Table */}
      <div className="border border-zinc-200 bg-white overflow-x-auto font-mono text-xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
            <p className="text-zinc-500 uppercase">Cargando registros de alquiler...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-12 text-center">
            <Repeat className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-zinc-600 uppercase">No hay alquileres para mostrar.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 uppercase text-zinc-500">
                <th className="p-3">Juego</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Inicio</th>
                <th className="p-3">Devolución Pactada</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredRentals.map((rental) => {
                const isOverdue =
                  rental.status === "ACTIVE" &&
                  new Date(rental.expectedEndDate) < new Date();

                return (
                  <tr key={rental.id} className="hover:bg-zinc-50/80 transition">
                    <td className="p-3">
                      <span className="font-bold text-zinc-900 uppercase block">
                        {rental.game.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        ${rental.game.price.toLocaleString("es-AR")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-zinc-900 font-bold block">
                        {rental.clientName} {rental.clientLastName}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {rental.clientPhone} • {rental.clientEmail}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-700">
                      {new Date(rental.startDate).toLocaleDateString("es-AR")}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          isOverdue ? "text-red-600 font-bold" : "text-zinc-700"
                        }
                      >
                        {new Date(rental.expectedEndDate).toLocaleDateString("es-AR")}
                      </span>
                      {rental.returnDate && (
                        <span className="text-[10px] text-zinc-400 block">
                          Devuelto: {new Date(rental.returnDate).toLocaleDateString("es-AR")}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 border text-[10px] uppercase font-bold ${
                          rental.status === "ACTIVE"
                            ? isOverdue
                              ? "bg-red-50 text-red-700 border-red-300"
                              : "bg-zinc-900 text-white border-zinc-900"
                            : rental.status === "RETURNED"
                            ? "bg-white text-zinc-500 border-zinc-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {isOverdue ? "VENCIDO / ATRASADO" : rental.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {rental.status === "ACTIVE" || rental.status === "LATE" ? (
                        <button
                          type="button"
                          onClick={() => handleReturn(rental.id, rental.game.name)}
                          className="px-3 py-1 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5 ml-auto transition"
                          title="Marcar como devuelto y sumar al stock"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Devolver</span>
                        </button>
                      ) : (
                        <span className="text-zinc-400 text-[10px] uppercase italic">
                          Completado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nuevo Alquiler */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white border-2 border-zinc-900 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <h3 className="font-mono text-sm uppercase font-bold text-zinc-900">
                Registrar Nuevo Alquiler
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRental} className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
              {actionError && (
                <div className="border border-red-300 bg-red-50 p-3 text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Game Selector */}
              <div>
                <label className="block uppercase text-zinc-600 mb-1 font-bold">
                  Juego a Alquilar *
                </label>
                <select
                  required
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="wire-input text-xs"
                >
                  <option value="">Selecciona un juego disponible...</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id} disabled={g.stock <= 0}>
                      {g.name} — Stock: {g.stock} {g.stock <= 0 ? "(AGOTADO)" : ""}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  * El stock del juego se reducirá automáticamente en 1 unidad.
                </span>
              </div>

              {/* Customer Mode Switcher */}
              <div className="border border-zinc-200 p-4 bg-zinc-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-zinc-800">
                    Datos del Cliente
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomerMode("EXISTING")}
                      className={`px-2.5 py-1 border text-[11px] ${
                        customerMode === "EXISTING"
                          ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                          : "bg-white text-zinc-600 border-zinc-300"
                      }`}
                    >
                      <UserCheck className="w-3 h-3 inline mr-1" />
                      Registrado
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode("NEW");
                        setSelectedUserId("");
                      }}
                      className={`px-2.5 py-1 border text-[11px] ${
                        customerMode === "NEW"
                          ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                          : "bg-white text-zinc-600 border-zinc-300"
                      }`}
                    >
                      <UserPlus className="w-3 h-3 inline mr-1" />
                      Nuevo Cliente
                    </button>
                  </div>
                </div>

                {customerMode === "EXISTING" ? (
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                      Seleccionar Cliente Frecuente:
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => handleUserSelect(e.target.value)}
                      className="wire-input text-xs"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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
                  <div className="sm:col-span-2">
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

                {customerMode === "NEW" && (
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-700 text-[11px]">
                      <input
                        type="checkbox"
                        checked={saveUserIfNew}
                        onChange={(e) => setSaveUserIfNew(e.target.checked)}
                        className="rounded-none border-zinc-400 text-zinc-900 focus:ring-0"
                      />
                      <span>Guardar como cliente registrado para futuros alquileres</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="wire-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                    Fecha Pactada de Devolución *
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                    className="wire-input text-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white uppercase flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirmar Alquiler</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

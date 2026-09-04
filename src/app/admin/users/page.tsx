"use client";

import { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/actions/users";
import { UserData } from "@/types";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Phone,
  Mail,
  MapPin,
  X,
  AlertTriangle,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    const res = await getUsers();
    if (res.success && res.data) {
      setUsers(res.data as unknown as UserData[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      address: user.address,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Confirmas la eliminación del cliente "${name}"?`)) return;

    const res = await deleteUser(id);
    if (!res.success) {
      alert(res.error || "No se pudo eliminar el cliente.");
    } else {
      await loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    let res;
    if (editingUser) {
      res = await updateUser(editingUser.id, formData);
    } else {
      res = await createUser(formData);
    }

    if (res.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      setErrorMessage(res.error || "Error al procesar el formulario.");
    }
    setSaving(false);
  };

  const filteredUsers = users.filter((u) => {
    if (searchTerm.trim() === "") return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return (
      fullName.includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.phone.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            BASE DE CLIENTES // HISTORIAL
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            GESTIÓN DE USUARIOS FRECUENTES
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="border border-zinc-200 bg-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wire-input pl-9 text-xs"
          />
        </div>

        <div className="text-xs font-mono text-zinc-500">
          Clientes registrados: <strong className="text-zinc-900">{users.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-200 bg-white overflow-x-auto font-mono text-xs">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
            <p className="text-zinc-500 uppercase">Cargando base de clientes...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-zinc-600 uppercase">No se encontraron clientes.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 uppercase text-zinc-500">
                <th className="p-3">Nombre Completo</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Domicilio</th>
                <th className="p-3 text-center">Alquileres</th>
                <th className="p-3 text-center">Reservas</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/80 transition">
                  <td className="p-3 font-bold text-zinc-900 uppercase">
                    {u.lastName}, {u.firstName}
                  </td>
                  <td className="p-3 text-zinc-600 space-y-0.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-zinc-400" />
                      <span>{u.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      <span>{u.phone}</span>
                    </div>
                  </td>
                  <td className="p-3 text-zinc-700 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span>{u.address}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="wire-badge">
                      {u._count?.rentals ?? 0}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="wire-badge">
                      {u._count?.reservations ?? 0}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 border border-zinc-200 hover:border-zinc-900 text-zinc-700 hover:text-zinc-900 transition"
                        title="Editar cliente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(u.id, `${u.firstName} ${u.lastName}`)
                        }
                        className="p-1.5 border border-zinc-200 hover:border-red-600 text-zinc-700 hover:text-red-600 transition"
                        title="Eliminar cliente"
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

      {/* Modal CRUD: Create / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border-2 border-zinc-900 shadow-2xl p-6 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm uppercase font-bold text-zinc-900">
                {editingUser ? "Editar Cliente Frecuente" : "Nuevo Cliente"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {errorMessage && (
                <div className="border border-red-300 bg-red-50 p-2 text-red-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Lucas"
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
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Benítez"
                  className="wire-input text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 9 11 4455-6677"
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="lucas@example.com"
                  className="wire-input text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-500 block mb-1">
                  Domicilio *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Av. Corrientes 1234, CABA"
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
                  disabled={saving}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white uppercase flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>{editingUser ? "Guardar Cambios" : "Crear Cliente"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

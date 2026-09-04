"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dices,
  Layers,
  FileSignature,
  Repeat,
  CalendarCheck,
  Users,
  ExternalLink,
  Menu,
  X,
  Store,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/games", label: "Juegos (CRUD)", icon: Dices },
  { href: "/admin/components", label: "Componentes & Remito", icon: Layers },
  { href: "/admin/rentals", label: "Alquileres", icon: Repeat },
  { href: "/admin/reservations", label: "Reservas", icon: CalendarCheck },
  { href: "/admin/users", label: "Clientes", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden border-b border-zinc-300 bg-white px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-zinc-900 text-white flex items-center justify-center font-mono text-xs font-bold">
            ADM
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
            PANEL DE GESTIÓN
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
          aria-label="Abrir menú"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-300 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-zinc-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                T/E
              </div>
              <div>
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-950">
                  ADMINISTRACIÓN
                </h2>
                <span className="text-[10px] text-zinc-400 font-mono tracking-widest block uppercase">
                  TABERNA EXPLORADOR
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <span className="px-3 py-1 text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
              Módulos del Sistema
            </span>

            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider border transition-all ${
                    isActive
                      ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                      : "text-zinc-600 border-transparent hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Link */}
        <div className="p-4 border-t border-zinc-200 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-zinc-300 hover:border-zinc-900 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-mono uppercase tracking-wider transition"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Ver Catálogo Público</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Link>
          <div className="text-[10px] font-mono text-zinc-400 text-center uppercase tracking-widest pt-1">
            Versión 1.0.0 // Wireframe
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </div>
    </div>
  );
}

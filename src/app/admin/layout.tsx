"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dices,
  Layers,
  Repeat,
  CalendarCheck,
  Users,
  ExternalLink,
  Menu,
  X,
  Compass,
  Scroll,
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
    <div className="min-h-screen bg-[#f7f2e7] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden border-b border-[#dfcfb2] bg-[#24130a] px-4 h-14 flex items-center justify-between text-[#fef3c7]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#b45309] text-white flex items-center justify-center font-tavern text-xs font-bold rounded-sm">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-tavern text-xs font-bold uppercase tracking-wider text-[#fef3c7]">
            GREMIO // PANEL DE GESTIÓN
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 border border-[#54321d] text-[#fef3c7] hover:bg-[#381e11] rounded"
          aria-label="Abrir menú"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation - Dark Oak Guild Style */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#20120a] border-r border-[#3d2215] flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen text-[#fef3c7] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#3d2215] bg-[#180d07]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-b from-[#b45309] to-[#78350f] text-white flex items-center justify-center font-tavern text-sm font-bold rounded-sm shadow-md">
                <Compass className="w-5 h-5 text-[#fef3c7]" />
              </div>
              <div>
                <h2 className="font-tavern text-xs font-bold uppercase tracking-wider text-[#fef3c7]">
                  LIBRO DEL GREMIO
                </h2>
                <span className="text-[10px] text-[#b45309] font-serif tracking-widest block uppercase font-bold">
                  TABERNA DEL EXPLORADOR
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <span className="px-3 py-1.5 text-[10px] font-tavern text-[#8a6b52] uppercase tracking-widest block font-bold">
              Registros & Operaciones
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-tavern uppercase tracking-wider border transition-all rounded-sm ${
                    isActive
                      ? "bg-gradient-to-r from-[#b45309] to-[#92400e] text-white border-[#d97706] font-bold shadow-sm"
                      : "text-[#d1baa5] border-transparent hover:bg-[#2e1a0f] hover:text-[#ffffff]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#fef08a]" : "text-[#b45309]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Link */}
        <div className="p-4 border-t border-[#3d2215] bg-[#180d07] space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-[#54321d] hover:border-[#b45309] bg-[#29170e] hover:bg-[#381e11] text-[#fef3c7] text-xs font-tavern uppercase tracking-wider transition rounded-sm"
          >
            <Scroll className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Ver Catálogo Público</span>
            <ExternalLink className="w-3 h-3 text-[#b45309]" />
          </Link>
          <div className="text-[10px] font-serif text-[#8a6b52] text-center uppercase tracking-widest pt-1">
            Gremio de Taberneros • v1.0
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

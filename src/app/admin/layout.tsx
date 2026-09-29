"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Dices,
  Puzzle,
  Layers,
  Repeat,
  CalendarCheck,
  Users,
  ExternalLink,
  Menu,
  X,
  Scroll,
  LogOut,
  Wallet,
  ChevronDown,
  Library,
  ClipboardList,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";
import { ASSETS } from "@/lib/assets";
import { logoutAdmin } from "@/lib/admin-auth";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
}

interface NavGroup {
  label: string | null;
  icon?: any;
  collapsible?: boolean;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Catálogo",
    icon: Library,
    collapsible: true,
    items: [
      { href: "/admin/games", label: "Juegos", icon: Dices },
      { href: "/admin/expansions", label: "Expansiones", icon: Puzzle },
      { href: "/admin/components", label: "Componentes & Remito", icon: Layers },
    ],
  },
  {
    label: "Operación",
    icon: ClipboardList,
    collapsible: true,
    items: [
      { href: "/admin/rentals", label: "Alquileres", icon: Repeat },
      { href: "/admin/reservations", label: "Reservas", icon: CalendarCheck },
      { href: "/admin/users", label: "Clientes", icon: Users },
      { href: "/admin/caja", label: "Caja", icon: Wallet },
      { href: "/admin/calendario", label: "Calendario", icon: CalendarDays },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of NAV_GROUPS) {
      if (g.collapsible && g.label) init[g.label] = true;
    }
    return init;
  });

  const renderItem = (item: NavItem, nested = false) => {
    const isActive = item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center justify-start gap-3 px-3.5 py-2.5 text-xs font-tavern uppercase tracking-wider border transition-all rounded-sm ${nested ? "ml-4 border-l-2 border-l-[#5a3219] pl-3" : ""} ${isActive
            ? "bg-gradient-to-r from-[#b45309] to-[#92400e] text-white border-[#d97706] font-bold shadow-sm"
            : "text-[#d1baa5] border-transparent hover:bg-[#2e1a0f] hover:text-[#ffffff]"
          }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? "text-[#fef08a]" : "text-[#b45309]"}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  if (pathname === "/admin/login") {
    return (
      <div className="min-h-screen bg-[#20120a] text-[#fef3c7] flex flex-col">
        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f2e7] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden border-b border-[#dfcfb2] bg-[#24130a] px-4 h-14 flex items-center justify-between text-[#fef3c7]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-sm">
            <Image src={ASSETS.logo.split("?")[0]} alt="Logo" width={24} height={24} className="object-contain" />
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#20120a] border-r border-[#3d2215] flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen text-[#fef3c7] ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#3d2215] bg-[#180d07]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center rounded-sm">
                <Image src={ASSETS.logo.split("?")[0]} alt="Logo" width={32} height={32} className="object-contain opacity-90" />
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
            {NAV_GROUPS.map((group) => (
              <div key={group.label ?? "top"}>
                {group.label && (
                  group.collapsible ? (
                    <button
                      type="button"
                      onClick={() => setOpenGroups((p) => ({ ...p, [group.label as string]: !p[group.label as string] }))}
                      aria-expanded={!!openGroups[group.label]}
                      className="w-full flex items-center gap-3 px-3.5 py-2 text-[10px] font-tavern text-[#8a6b52] uppercase tracking-widest font-bold hover:text-[#e2b17b] transition"
                    >
                      {group.icon && <group.icon className="w-4 h-4 shrink-0" />}
                      <span className="flex-1 text-left">{group.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${openGroups[group.label] ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 text-[10px] font-tavern text-[#8a6b52] uppercase tracking-widest block font-bold">
                      {group.label}
                    </span>
                  )
                )}
                {(!group.collapsible || openGroups[group.label as string]) &&
                  group.items.map((item) => renderItem(item, !!group.collapsible))}
              </div>
            ))}
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
          <button
            type="button"
            onClick={async () => {
              await logoutAdmin();
              setSidebarOpen(false);
              router.push("/admin/login");
              router.refresh();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-[#54321d] hover:border-red-400 bg-[#29170e] text-[#d1baa5] hover:text-red-300 text-xs font-tavern uppercase tracking-wider transition rounded-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </div>
    </div>
  );
}

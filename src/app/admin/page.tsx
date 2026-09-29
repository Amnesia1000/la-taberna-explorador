import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Dices,
  Repeat,
  CalendarCheck,
  Users,
  ArrowRight,
  PlusCircle,
  FileSignature,
  Banknote,
  TriangleAlert,
  Undo2,
  Trophy,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const now = new Date();

  const [
    totalGames,
    gamesList,
    activeRentals,
    pendingReservations,
    totalUsers,
    recentRentals,
    recentReservations,
    outOfStockCount,
    outOfStockGames,
    overdueCount,
    upcomingReturns,
    monthRentals,
    topGroups,
  ] = await Promise.all([
    prisma.game.count(),
    prisma.game.findMany({ select: { stock: true } }),
    prisma.rental.count({ where: { status: "ACTIVE" } }),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.rental.findMany({
      take: 5,
      orderBy: { startDate: "desc" },
      include: { game: true },
    }),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { game: true },
    }),
    prisma.game.count({ where: { stock: { lte: 0 } } }),
    prisma.game.findMany({
      where: { stock: { lte: 0 } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 5,
    }),
    prisma.rental.count({ where: { status: "ACTIVE", expectedEndDate: { lt: now } } }),
    prisma.rental.findMany({
      where: { status: "ACTIVE" },
      take: 5,
      orderBy: { expectedEndDate: "asc" },
      include: { game: true },
    }),
    prisma.rental.findMany({
      where: { startDate: { gte: monthStart } },
      select: { game: { select: { price: true } } },
    }),
    prisma.rental.groupBy({
      by: ["gameId"],
      _count: { _all: true },
      orderBy: { _count: { gameId: "desc" } },
      take: 100,
    }),
  ]);

  const totalStock = gamesList.reduce((acc, g) => acc + g.stock, 0);
  const monthRevenue = monthRentals.reduce((acc, r) => acc + (r.game?.price ?? 0), 0);

  const topIds = topGroups.map((g) => g.gameId);
  const topNames = await prisma.game.findMany({
    where: { id: { in: topIds } },
    select: { id: true, name: true },
  });
  const topGames = topGroups
    .map((g) => ({
      name: topNames.find((n) => n.id === g.gameId)?.name ?? "Desconocido",
      count: g._count._all,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            PANEL DE CONTROL // RESUMEN GENERAL
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            DASHBOARD ADMINISTRATIVO
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/rentals"
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nuevo Alquiler</span>
          </Link>
          <Link
            href="/admin/components"
            className="px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>Generar Remito</span>
          </Link>
        </div>
      </div>

      {/* Alertas accionables */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/games"
          className={`border bg-white p-4 shadow-sm flex items-center gap-3 transition hover:shadow ${outOfStockCount > 0 ? "border-l-4 border-l-red-500 border-zinc-200" : "border-zinc-200"}`}
        >
          <TriangleAlert className={`w-5 h-5 shrink-0 ${outOfStockCount > 0 ? "text-red-600" : "text-zinc-300"}`} />
          <div>
            <span className="font-mono text-2xl font-bold text-zinc-900 block leading-none">{outOfStockCount}</span>
            <span className="font-mono text-[11px] uppercase text-zinc-500">
              {outOfStockGames.length > 0 ? `Agotados: ${outOfStockGames.map((g) => g.name).join(", ")}` : "Sin agotados"}
            </span>
          </div>
        </Link>
        <Link
          href="/admin/rentals"
          className={`border bg-white p-4 shadow-sm flex items-center gap-3 transition hover:shadow ${overdueCount > 0 ? "border-l-4 border-l-red-500 border-zinc-200" : "border-zinc-200"}`}
        >
          <Undo2 className={`w-5 h-5 shrink-0 ${overdueCount > 0 ? "text-red-600" : "text-zinc-300"}`} />
          <div>
            <span className="font-mono text-2xl font-bold text-zinc-900 block leading-none">{overdueCount}</span>
            <span className="font-mono text-[11px] uppercase text-zinc-500">Alquileres vencidos</span>
          </div>
        </Link>
        <Link
          href="/admin/reservations"
          className={`border bg-white p-4 shadow-sm flex items-center gap-3 transition hover:shadow ${pendingReservations > 0 ? "border-l-4 border-l-amber-500 border-zinc-200" : "border-zinc-200"}`}
        >
          <CalendarCheck className={`w-5 h-5 shrink-0 ${pendingReservations > 0 ? "text-amber-600" : "text-zinc-300"}`} />
          <div>
            <span className="font-mono text-2xl font-bold text-zinc-900 block leading-none">{pendingReservations}</span>
            <span className="font-mono text-[11px] uppercase text-zinc-500">Reservas por confirmar</span>
          </div>
        </Link>
      </div>

      {/* Metrics Wireframe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="border border-zinc-200 border-t-4 border-t-amber-600 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-zinc-500">Títulos en Catálogo</span>
            <Dices className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-zinc-900">{totalGames}</span>
            <span className="font-mono text-xs text-zinc-500">{totalStock} unidades en stock</span>
          </div>
        </div>

        <div className="border border-zinc-200 border-t-4 border-t-amber-600 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-zinc-500">Alquileres Activos</span>
            <Repeat className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-zinc-900">{activeRentals}</span>
            <span className="font-mono text-xs text-zinc-500">en préstamo actual</span>
          </div>
        </div>

        <div className="border border-zinc-200 border-t-4 border-t-amber-600 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-zinc-500">Reservas Pendientes</span>
            <CalendarCheck className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-zinc-900">{pendingReservations}</span>
            <span className="font-mono text-xs text-amber-600 font-medium">por confirmar</span>
          </div>
        </div>

        <div className="border border-zinc-200 border-t-4 border-t-amber-600 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-zinc-500">Clientes Registrados</span>
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-zinc-900">{totalUsers}</span>
            <span className="font-mono text-xs text-zinc-500">frecuentes</span>
          </div>
        </div>

        <div className="border border-zinc-200 border-t-4 border-t-amber-600 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-zinc-500">Ingresos del Mes</span>
            <Banknote className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-bold text-zinc-900">${monthRevenue.toLocaleString("es-AR")}</span>
            <span className="font-mono text-xs text-zinc-500">alquileres iniciados</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Rentals & Pending Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Rentals */}
        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
            <div>
              <h3 className="font-mono text-sm uppercase font-bold text-zinc-900">
                Últimos Alquileres
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Historial reciente de préstamos
              </span>
            </div>
            <Link
              href="/admin/rentals"
              className="text-xs font-mono uppercase text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentRentals.length === 0 ? (
              <p className="text-xs font-mono text-zinc-400 py-4 text-center">
                No hay alquileres registrados aún.
              </p>
            ) : (
              recentRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="border border-zinc-100 p-3 flex items-center justify-between bg-zinc-50/50 text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-zinc-900 uppercase block">
                      {rental.game.name}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Cliente: {rental.clientName} {rental.clientLastName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] border uppercase ${
                        rental.status === "ACTIVE"
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : rental.status === "RETURNED"
                          ? "bg-white text-zinc-600 border-zinc-300"
                          : "bg-red-100 text-red-800 border-red-300"
                      }`}
                    >
                      {rental.status}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {new Date(rental.startDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Reservations */}
        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
            <div>
              <h3 className="font-mono text-sm uppercase font-bold text-zinc-900">
                Reservas Solicitadas
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Requieren confirmación a alquiler
              </span>
            </div>
            <Link
              href="/admin/reservations"
              className="text-xs font-mono uppercase text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentReservations.length === 0 ? (
              <p className="text-xs font-mono text-zinc-400 py-4 text-center">
                No hay reservas registradas aún.
              </p>
            ) : (
              recentReservations.map((res) => (
                <div
                  key={res.id}
                  className="border border-zinc-100 p-3 flex items-center justify-between bg-zinc-50/50 text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-zinc-900 uppercase block">
                      {res.game.name}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Solicita: {res.clientName} {res.clientLastName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] border uppercase ${
                        res.status === "PENDING"
                          ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                          : res.status === "CONFIRMED"
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-zinc-100 text-zinc-500 border-zinc-200 line-through"
                      }`}
                    >
                      {res.status}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      Para: {new Date(res.expectedEndDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Próximas devoluciones */}
        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
            <div>
              <h3 className="font-mono text-sm uppercase font-bold text-zinc-900">
                Próximas Devoluciones
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Alquileres activos por fecha
              </span>
            </div>
            <Link
              href="/admin/rentals"
              className="text-xs font-mono uppercase text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingReturns.length === 0 ? (
              <p className="text-xs font-mono text-zinc-400 py-4 text-center">
                No hay alquileres activos.
              </p>
            ) : (
              upcomingReturns.map((rental) => {
                const vencida = new Date(rental.expectedEndDate) < new Date();
                return (
                  <div
                    key={rental.id}
                    className="border border-zinc-100 p-3 flex items-center justify-between bg-zinc-50/50 text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-zinc-900 uppercase block">
                        {rental.game.name}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Cliente: {rental.clientName} {rental.clientLastName}
                      </span>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] border uppercase font-bold ${vencida
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-white text-zinc-600 border-zinc-300"
                        }`}
                    >
                      {vencida ? "Vencida" : new Date(rental.expectedEndDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top juegos */}
        <div className="border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
            <div>
              <h3 className="font-mono text-sm uppercase font-bold text-zinc-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-700" />
                Más Alquilados
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Por cantidad de alquileres
              </span>
            </div>
            <Link
              href="/admin/games"
              className="text-xs font-mono uppercase text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
            >
              <span>Ver juegos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {topGames.length === 0 ? (
              <p className="text-xs font-mono text-zinc-400 py-4 text-center">
                Todavía no hay alquileres.
              </p>
            ) : (
              topGames.map((g, i) => (
                <div
                  key={g.name}
                  className="border border-zinc-100 p-3 flex items-center gap-3 bg-zinc-50/50 text-xs font-mono"
                >
                  <span className={`font-mono text-lg font-bold w-6 text-center ${i === 0 ? "text-amber-600" : "text-zinc-400"}`}>
                    {i + 1}
                  </span>
                  <span className="font-bold text-zinc-900 uppercase flex-1 truncate">
                    {g.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap">
                    {g.count} alq.
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

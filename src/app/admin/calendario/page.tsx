"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRentals } from "@/lib/actions/rentals";
import { getReservations } from "@/lib/actions/reservations";
import { RentalWithDetails, ReservationWithDetails } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function AdminCalendarioPage() {
  const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [rRes, sRes] = await Promise.all([getRentals(), getReservations()]);
      if (rRes.success && rRes.data) setRentals(rRes.data as unknown as RentalWithDetails[]);
      if (sRes.success && sRes.data) setReservations(sRes.data as unknown as ReservationWithDetails[]);
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const monthBase = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthStart = new Date(monthBase.getFullYear(), monthBase.getMonth(), 1);
  const leadBlanks = (monthStart.getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(monthBase.getFullYear(), monthBase.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i));
  const todayStr = now.toDateString();

  const covers = (day: Date, start: Date, end: Date) => {
    const d = new Date(day); d.setHours(0, 0, 0, 0);
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end); e.setHours(23, 59, 59, 999);
    return d >= s && d <= e;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-1">
            DISPONIBILIDAD // PRÉSTAMOS POR DÍA
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-900">
            CALENDARIO
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthOffset((o) => o - 1)}
            aria-label="Mes anterior"
            className="p-2 border border-zinc-300 bg-white hover:bg-zinc-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-sm uppercase font-bold text-zinc-900 min-w-36 text-center">
            {MESES[monthBase.getMonth()]} {monthBase.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() => setMonthOffset(0)}
            className="px-3 h-9 border border-zinc-300 bg-white hover:bg-zinc-100 font-mono text-xs uppercase transition"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setMonthOffset((o) => o + 1)}
            aria-label="Mes siguiente"
            className="p-2 border border-zinc-300 bg-white hover:bg-zinc-100 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center border border-zinc-200 bg-white">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400 mb-2" />
          <p className="font-mono text-xs text-zinc-500 uppercase">Cargando semana...</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DIAS.map((d) => (
              <div key={d} className="font-mono text-[11px] uppercase text-zinc-500 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: leadBlanks }).map((_, i) => (
              <div key={`b-${i}`} />
            ))}
            {days.map((day) => {
              const dayRentals = rentals.filter(
                (r) => (r.status === "ACTIVE" || r.status === "LATE") &&
                  covers(day, new Date(r.startDate), new Date(r.expectedEndDate))
              );
              const dayRes = reservations.filter(
                (r) => r.status === "PENDING" &&
                  covers(day, new Date(r.createdAt), new Date(r.expectedEndDate))
              );
              const isToday = day.toDateString() === todayStr;
              const shown = [...dayRentals.map((r) => ({ id: r.id, label: r.game.name, res: false, title: `${r.game.name} - ${r.clientName} ${r.clientLastName}` })),
                ...dayRes.map((r) => ({ id: r.id, label: `${r.game.name} (R)`, res: true, title: `Reserva: ${r.game.name} - ${r.clientName} ${r.clientLastName}` }))];
              return (
                <div
                  key={day.toISOString()}
                  className={`border bg-white p-1.5 shadow-sm min-h-20 ${isToday ? "border-2 border-amber-600" : "border-zinc-200"}`}
                >
                  <span className={`font-mono text-sm font-bold block leading-none mb-1 ${isToday ? "text-amber-700" : "text-zinc-900"}`}>
                    {day.getDate()}
                  </span>
                  <div className="space-y-1">
                    {shown.length === 0 ? (
                      <p className="text-[10px] font-mono text-zinc-300 italic">·</p>
                    ) : (
                      <>
                        {shown.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            title={s.title}
                            className={`text-[10px] font-mono px-1 py-px rounded-sm truncate ${s.res ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-zinc-900 text-white"}`}
                          >
                            {s.label}
                          </div>
                        ))}
                        {shown.length > 3 && (
                          <p className="text-[10px] font-mono text-zinc-500">+{shown.length - 3} más</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="font-mono text-[11px] text-zinc-500 uppercase flex items-center gap-2">
        <CalendarDays className="w-3.5 h-3.5" />
        Negro = afuera · Ámbar (R) = reservado ·{" "}
        <Link href="/admin/rentals" className="underline">Ver alquileres</Link>
      </p>
    </div>
  );
}

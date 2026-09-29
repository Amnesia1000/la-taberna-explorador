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

function startOfWeek(base: Date): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - day);
  return d;
}

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
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [rRes, sRes] = await Promise.all([getRentals(), getReservations()]);
      if (rRes.success && rRes.data) setRentals(rRes.data as unknown as RentalWithDetails[]);
      if (sRes.success && sRes.data) setReservations(sRes.data as unknown as ReservationWithDetails[]);
      setLoading(false);
    })();
  }, []);

  const weekStart = addDays(startOfWeek(new Date()), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayStr = new Date().toDateString();

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
            onClick={() => setWeekOffset((o) => o - 1)}
            aria-label="Semana anterior"
            className="p-2 border border-zinc-300 bg-white hover:bg-zinc-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="px-3 h-9 border border-zinc-300 bg-white hover:bg-zinc-100 font-mono text-xs uppercase transition"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((o) => o + 1)}
            aria-label="Semana siguiente"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-3">
          {days.map((day, i) => {
            const dayRentals = rentals.filter(
              (r) => (r.status === "ACTIVE" || r.status === "LATE") &&
                covers(day, new Date(r.startDate), new Date(r.expectedEndDate))
            );
            const dayRes = reservations.filter(
              (r) => r.status === "PENDING" &&
                covers(day, new Date(r.createdAt), new Date(r.expectedEndDate))
            );
            const isToday = day.toDateString() === todayStr;
            return (
              <div
                key={i}
                className={`border bg-white p-3 shadow-sm ${isToday ? "border-2 border-amber-600" : "border-zinc-200"}`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-mono text-[11px] uppercase text-zinc-500">{DIAS[i]}</span>
                  <span className={`font-mono text-lg font-bold ${isToday ? "text-amber-700" : "text-zinc-900"}`}>
                    {day.getDate()}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {dayRentals.length === 0 && dayRes.length === 0 && (
                    <p className="text-[11px] font-mono text-zinc-300 italic">Libre</p>
                  )}
                  {dayRentals.map((r) => (
                    <div key={r.id} className="text-[11px] font-mono bg-zinc-900 text-white px-1.5 py-1 rounded-sm truncate" title={`${r.game.name} - ${r.clientName} ${r.clientLastName}`}>
                      {r.game.name}
                    </div>
                  ))}
                  {dayRes.map((r) => (
                    <div key={r.id} className="text-[11px] font-mono bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-1 rounded-sm truncate" title={`Reserva: ${r.game.name} - ${r.clientName} ${r.clientLastName}`}>
                      {r.game.name} (R)
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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

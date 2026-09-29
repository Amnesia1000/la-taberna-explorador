"use server";

import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

const fmtDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

/** Exporta todo a Excel: caja separada por año + resto en pestañas propias. */
export async function exportExcel(): Promise<{ success: boolean; base64?: string; filename?: string; error?: string }> {
  try {
    const [movements, games, expansions, rentals, reservations, users] = await Promise.all([
      prisma.cashMovement.findMany({ orderBy: { date: "asc" } }),
      prisma.game.findMany({ orderBy: { name: "asc" } }),
      (prisma as any).expansion.findMany({
        include: { game: { select: { name: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.rental.findMany({
        include: { game: { select: { name: true, price: true } } },
        orderBy: { startDate: "desc" },
      }),
      prisma.reservation.findMany({
        include: { game: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({ orderBy: { lastName: "asc" } }),
    ]);

    const wb = XLSX.utils.book_new();

    // Caja por año
    const years = [...new Set(movements.map((m) => new Date(m.date).getFullYear()))].sort();
    for (const year of years) {
      const rows = movements
        .filter((m) => new Date(m.date).getFullYear() === year)
        .map((m) => ({
          Fecha: fmtDate(m.date),
          Tipo: m.type === "INCOME" ? "Ingreso" : "Egreso",
          Concepto: m.concept,
          Monto: m.amount,
          Notas: m.notes ?? "",
        }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), `Caja ${year}`);
    }
    if (years.length === 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([]), "Caja");
    }

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        games.map((g) => ({
          Nombre: g.name,
          Categoria: g.category,
          Precio: g.price,
          Stock: g.stock,
          Jugadores: `${g.minPlayers}-${g.maxPlayers}`,
          Edad: `+${g.minAge}`,
          Duracion: g.playtime,
        }))
      ),
      "Juegos"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        expansions.map((e: any) => ({
          Nombre: e.name,
          JuegoBase: e.game?.name ?? "",
          Precio: e.price,
          Stock: e.stock,
        }))
      ),
      "Expansiones"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        rentals.map((r) => ({
          Juego: r.game?.name ?? "",
          Cliente: `${r.clientName} ${r.clientLastName}`,
          Telefono: r.clientPhone,
          Inicio: fmtDate(r.startDate),
          Fin: fmtDate(r.expectedEndDate),
          Estado: r.status,
          Devuelto: r.returnDate ? fmtDate(r.returnDate) : "",
          Notas: (r as any).returnNotes ?? "",
        }))
      ),
      "Alquileres"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        reservations.map((r) => ({
          Juego: r.game?.name ?? "",
          Cliente: `${r.clientName} ${r.clientLastName}`,
          Telefono: r.clientPhone,
          Fecha: fmtDate(r.createdAt),
          Fin: fmtDate(r.expectedEndDate),
          Estado: r.status,
        }))
      ),
      "Reservas"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        users.map((u) => ({
          Nombre: `${u.firstName} ${u.lastName}`,
          Telefono: u.phone,
          Email: u.email,
          Direccion: u.address,
        }))
      ),
      "Clientes"
    );

    const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return {
      success: true,
      base64: buf.toString("base64"),
      filename: `taberna-${new Date().toISOString().slice(0, 10)}.xlsx`,
    };
  } catch (error) {
    console.error("Error exportando Excel:", error);
    return { success: false, error: "Error al generar el Excel" };
  }
}

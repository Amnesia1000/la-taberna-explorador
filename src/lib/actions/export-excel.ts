"use server";

import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const fmtDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

interface Mov {
  date: Date;
  type: string;
  concept: string;
  amount: number;
  notes?: string | null;
}

/** Excel de un año: 12 tabs mensuales + resumen anual con totales. */
export async function exportYearExcel(year: number): Promise<{ success: boolean; base64?: string; filename?: string; error?: string }> {
  try {
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return { success: false, error: "Año inválido." };
    }
    const movements = (await prisma.cashMovement.findMany({
      where: { date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } },
      orderBy: { date: "asc" },
    })) as unknown as Mov[];

    const wb = XLSX.utils.book_new();
    const widths = [{ wch: 12 }, { wch: 10 }, { wch: 45 }, { wch: 14 }, { wch: 40 }];

    const monthly: { ingresos: number; egresos: number }[] = [];

    for (let m = 0; m < 12; m++) {
      const rows = movements.filter((x) => new Date(x.date).getMonth() === m);
      const ingresos = rows.filter((x) => x.type === "INCOME").reduce((a, x) => a + x.amount, 0);
      const egresos = rows.filter((x) => x.type !== "INCOME").reduce((a, x) => a + x.amount, 0);
      monthly.push({ ingresos, egresos });

      const aoa: (string | number)[][] = [
        [`La Taberna del Explorador — Caja ${MESES[m]} ${year}`],
        [],
        ["Fecha", "Tipo", "Concepto", "Monto", "Notas"],
        ...rows.map((x) => [
          fmtDate(x.date),
          x.type === "INCOME" ? "Ingreso" : "Egreso",
          x.concept,
          x.amount,
          x.notes ?? "",
        ]),
        [],
        ["Total ingresos", "", "", ingresos],
        ["Total egresos", "", "", egresos],
        ["Balance del mes", "", "", ingresos - egresos],
      ];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = widths;
      XLSX.utils.book_append_sheet(wb, ws, MESES[m].slice(0, 10));
    }

    const totIng = monthly.reduce((a, x) => a + x.ingresos, 0);
    const totEgr = monthly.reduce((a, x) => a + x.egresos, 0);
    const resumen: (string | number)[][] = [
      [`La Taberna del Explorador — Resumen anual ${year}`],
      [],
      ["Mes", "Ingresos", "Egresos", "Balance"],
      ...MESES.map((mes, i) => [
        mes,
        monthly[i].ingresos,
        monthly[i].egresos,
        monthly[i].ingresos - monthly[i].egresos,
      ]),
      [],
      ["TOTAL AÑO", totIng, totEgr, totIng - totEgr],
    ];
    // Mover resumen al principio
    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    wsResumen["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    const wbFinal = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbFinal, wsResumen, `Resumen ${year}`);
    for (const name of wb.SheetNames) {
      XLSX.utils.book_append_sheet(wbFinal, wb.Sheets[name], name);
    }

    const buf: Buffer = XLSX.write(wbFinal, { type: "buffer", bookType: "xlsx" });
    return { success: true, base64: buf.toString("base64"), filename: `taberna-caja-${year}.xlsx` };
  } catch (error) {
    console.error("Error exportando Excel:", error);
    return { success: false, error: "Error al generar el Excel" };
  }
}

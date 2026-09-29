"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CashType = "INCOME" | "EXPENSE";

export async function getMovements(month?: string) {
  try {
    let where: any = {};
    if (month) {
      const [y, m] = month.split("-").map(Number);
      const from = new Date(y, m - 1, 1);
      const to = new Date(y, m, 1);
      where.date = { gte: from, lt: to };
    }
    const movements = await prisma.cashMovement.findMany({
      where,
      orderBy: { date: "desc" },
    });
    const income = movements.filter((x) => x.type === "INCOME").reduce((a, x) => a + x.amount, 0);
    const expense = movements.filter((x) => x.type === "EXPENSE").reduce((a, x) => a + x.amount, 0);
    return { success: true, data: movements, income, expense, balance: income - expense };
  } catch (error) {
    console.error("Error obteniendo movimientos:", error);
    return { success: false, error: "Error al cargar la caja", data: [], income: 0, expense: 0, balance: 0 };
  }
}

export async function saveMovement(data: {
  id?: string;
  date: string;
  type: CashType;
  concept: string;
  amount: number;
  notes?: string;
}) {
  try {
    if (!data.concept.trim()) return { success: false, error: "Falta el concepto" };
    if (!(data.amount > 0)) return { success: false, error: "El monto debe ser mayor a 0" };
    const payload = {
      date: new Date(data.date),
      type: data.type,
      concept: data.concept.trim(),
      amount: data.amount,
      notes: data.notes?.trim() || null,
    };
    if (data.id) {
      await prisma.cashMovement.update({ where: { id: data.id }, data: payload });
    } else {
      await prisma.cashMovement.create({ data: payload });
    }
    revalidatePath("/admin/caja");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error guardando movimiento:", error);
    return { success: false, error: "Error al guardar" };
  }
}

export async function deleteMovement(id: string) {
  try {
    await prisma.cashMovement.delete({ where: { id } });
    revalidatePath("/admin/caja");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error eliminando movimiento:", error);
    return { success: false, error: "Error al eliminar" };
  }
}

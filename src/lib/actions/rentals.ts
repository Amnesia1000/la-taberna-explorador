"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RentalStatus } from "@/types";

/** Detecta si un juego está comprometido en un rango de fechas.
 *  Devuelve descripción del conflicto o null si está libre. */
export async function findDateConflict(
  db: any,
  gameId: string,
  start: Date,
  end: Date,
  excludeRentalId?: string,
  excludeReservationId?: string
): Promise<string | null> {
  const rentals = await db.rental.findMany({
    where: {
      gameId,
      status: { in: ["ACTIVE", "LATE"] },
      ...(excludeRentalId ? { id: { not: excludeRentalId } } : {}),
    },
    select: { id: true, clientName: true, clientLastName: true, startDate: true, expectedEndDate: true },
  });
  for (const r of rentals) {
    if (r.startDate <= end && r.expectedEndDate >= start) {
      return `Alquilado a ${r.clientName} ${r.clientLastName} hasta el ${r.expectedEndDate.toLocaleDateString("es-AR")}`;
    }
  }
  const reservations = await db.reservation.findMany({
    where: {
      gameId,
      status: "PENDING",
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    select: { id: true, clientName: true, clientLastName: true, createdAt: true, expectedEndDate: true },
  });
  for (const r of reservations) {
    if (r.createdAt <= end && r.expectedEndDate >= start) {
      return `Reservado por ${r.clientName} ${r.clientLastName} hasta el ${r.expectedEndDate.toLocaleDateString("es-AR")}`;
    }
  }
  return null;
}

export async function getRentals(statusFilter?: RentalStatus) {  try {
    const where: any = {};
    if (statusFilter) {
      where.status = statusFilter;
    }

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        game: {
          include: {
            components: true,
          },
        },
        user: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return { success: true, data: rentals };
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return { success: false, error: "Error al obtener alquileres" };
  }
}

export async function createRental(data: {
  gameId: string;
  userId?: string | null;
  clientName: string;
  clientLastName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  startDate?: string;
  expectedEndDate: string;
  saveUserIfNew?: boolean;
}) {
  try {
    // Verificar stock del juego
    const game = await prisma.game.findUnique({
      where: { id: data.gameId },
    });

    if (!game) {
      return { success: false, error: "Juego no encontrado" };
    }

    if (game.stock <= 0) {
      return { success: false, error: "No hay stock disponible para este juego" };
    }

    // Choque de fechas con otros préstamos/reservas del mismo juego
    const start = data.startDate ? new Date(data.startDate) : new Date();
    const end = new Date(data.expectedEndDate);
    const conflict = await findDateConflict(prisma, data.gameId, start, end);
    if (conflict) {
      return { success: false, error: `Choque de fechas: ${conflict}` };
    }

    let resolvedUserId = data.userId || null;

    // Si marcó guardar cliente si es nuevo y no tiene userId
    if (!resolvedUserId && data.saveUserIfNew && data.clientEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.clientEmail },
      });

      if (existingUser) {
        resolvedUserId = existingUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            firstName: data.clientName,
            lastName: data.clientLastName,
            email: data.clientEmail,
            phone: data.clientPhone,
            address: data.clientAddress,
          },
        });
        resolvedUserId = newUser.id;
      }
    }

    // Transacción atómica: Crear alquiler y decrementar stock
    const result = await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.create({
        data: {
          gameId: data.gameId,
          userId: resolvedUserId,
          clientName: data.clientName,
          clientLastName: data.clientLastName,
          clientPhone: data.clientPhone,
          clientEmail: data.clientEmail,
          clientAddress: data.clientAddress,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          expectedEndDate: new Date(data.expectedEndDate),
          status: "ACTIVE",
        },
      });

      await tx.game.update({
        where: { id: data.gameId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      await tx.cashMovement.create({
        data: {
          date: rental.startDate,
          type: "INCOME",
          concept: `Alquiler: ${game.name} - ${data.clientName} ${data.clientLastName}`,
          amount: game.price,
          rentalId: rental.id,
        },
      });

      return rental;
    });

    revalidatePath("/admin/rentals");
    revalidatePath("/admin/games");
    revalidatePath("/admin");
    revalidatePath("/admin/caja");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating rental:", error);
    return { success: false, error: "Error al registrar el alquiler" };
  }
}

export async function returnRental(rentalId: string, notes?: string) {
  try {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
    });

    if (!rental) {
      return { success: false, error: "Alquiler no encontrado" };
    }

    if (rental.status === "RETURNED") {
      return { success: false, error: "Este alquiler ya fue devuelto" };
    }

    // Transacción atómica: Marcar devolución e incrementar stock
    const updatedRental = await prisma.$transaction(async (tx) => {
      const r = await tx.rental.update({
        where: { id: rentalId },
        data: {
          status: "RETURNED",
          returnDate: new Date(),
          returnNotes: notes?.trim() ? notes.trim() : null,
        },
      });

      await tx.game.update({
        where: { id: rental.gameId },
        data: {
          stock: {
            increment: 1,
          },
        },
      });

      return r;
    });

    revalidatePath("/admin/rentals");
    revalidatePath("/admin/games");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, data: updatedRental };
  } catch (error) {
    console.error("Error returning rental:", error);
    return { success: false, error: "Error al registrar la devolución" };
  }
}

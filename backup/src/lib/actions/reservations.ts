"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ReservationStatus } from "@/types";

export async function getReservations(statusFilter?: ReservationStatus) {
  try {
    const where: any = {};
    if (statusFilter) {
      where.status = statusFilter;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        game: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: reservations };
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return { success: false, error: "Error al obtener reservas" };
  }
}

export async function createReservation(data: {
  gameId: string;
  userId?: string | null;
  clientName: string;
  clientLastName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  expectedEndDate: string;
}) {
  try {
    const reservation = await prisma.reservation.create({
      data: {
        gameId: data.gameId,
        userId: data.userId || null,
        clientName: data.clientName,
        clientLastName: data.clientLastName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail,
        clientAddress: data.clientAddress,
        expectedEndDate: new Date(data.expectedEndDate),
        status: "PENDING",
      },
    });

    revalidatePath("/admin/reservations");
    revalidatePath("/admin");
    return { success: true, data: reservation };
  } catch (error) {
    console.error("Error creating reservation:", error);
    return { success: false, error: "Error al crear la reserva" };
  }
}

export async function cancelReservation(reservationId: string) {
  try {
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED",
      },
    });

    revalidatePath("/admin/reservations");
    revalidatePath("/admin");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return { success: false, error: "Error al cancelar la reserva" };
  }
}

export async function confirmReservationToRental(reservationId: string) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        game: true,
      },
    });

    if (!reservation) {
      return { success: false, error: "Reserva no encontrada" };
    }

    if (reservation.status !== "PENDING") {
      return {
        success: false,
        error: `La reserva no está pendiente (estado actual: ${reservation.status})`,
      };
    }

    if (reservation.game.stock <= 0) {
      return {
        success: false,
        error: "No hay stock disponible para confirmar este alquiler",
      };
    }

    // Transacción atómica: Crear Alquiler + Actualizar Reserva a CONFIRMED + Descontar Stock
    const result = await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.create({
        data: {
          gameId: reservation.gameId,
          userId: reservation.userId,
          clientName: reservation.clientName,
          clientLastName: reservation.clientLastName,
          clientPhone: reservation.clientPhone,
          clientEmail: reservation.clientEmail,
          clientAddress: reservation.clientAddress,
          startDate: new Date(),
          expectedEndDate: reservation.expectedEndDate,
          status: "ACTIVE",
        },
      });

      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CONFIRMED",
        },
      });

      await tx.game.update({
        where: { id: reservation.gameId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      return rental;
    });

    revalidatePath("/admin/reservations");
    revalidatePath("/admin/rentals");
    revalidatePath("/admin/games");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error converting reservation to rental:", error);
    return { success: false, error: "Error al convertir la reserva en alquiler" };
  }
}

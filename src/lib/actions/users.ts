"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            rentals: true,
            reservations: true,
          },
        },
      },
      orderBy: {
        lastName: "asc",
      },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Error al obtener usuarios" };
  }
}

export async function createUser(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: "Ya existe un usuario con este correo electrónico" };
    }

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        address: data.address,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Error al crear el cliente" };
  }
}

export async function updateUser(
  id: string,
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
  }
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        address: data.address,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Error al actualizar el cliente" };
  }
}

export async function deleteUser(id: string) {  try {
    // Verificar si tiene alquileres activos
    const activeRentals = await prisma.rental.findFirst({
      where: {
        userId: id,
        status: "ACTIVE",
      },
    });

    if (activeRentals) {
      return {
        success: false,
        error: "No se puede eliminar el cliente porque tiene un alquiler activo actualmente.",
      };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Error al eliminar el cliente" };
  }
}

/** Ficha de cliente: datos + historial + totales para decidir alquileres. */
export async function getUserDetails(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { success: false, error: "Cliente no encontrado" };

    const [rentals, reservations] = await Promise.all([
      prisma.rental.findMany({
        where: { userId: id },
        include: { game: { select: { id: true, name: true, price: true } } },
        orderBy: { startDate: "desc" },
      }),
      prisma.reservation.findMany({
        where: { userId: id },
        include: { game: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const now = new Date();
    const summary = {
      totalRentals: rentals.length,
      activeRentals: rentals.filter((r) => r.status === "ACTIVE").length,
      lateRentals: rentals.filter(
        (r) => r.status === "LATE" || (r.status === "ACTIVE" && new Date(r.expectedEndDate) < now)
      ).length,
      pendingReservations: reservations.filter((r) => r.status === "PENDING").length,
      totalSpent: rentals.reduce((acc, r) => acc + (r.game?.price ?? 0), 0),
    };

    return { success: true, data: { user, rentals, reservations, summary } };
  } catch (error) {
    console.error("Error obteniendo ficha de cliente:", error);
    return { success: false, error: "Error al cargar la ficha" };
  }
}

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

export async function deleteUser(id: string) {
  try {
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

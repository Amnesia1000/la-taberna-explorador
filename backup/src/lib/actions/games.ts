"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export async function getGames(search?: string, category?: string) {
  try {
    const where: any = {};

    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category && category !== "TODOS") {
      where.category = category;
    }

    const games = await prisma.game.findMany({
      where,
      include: {
        components: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: games };
  } catch (error) {
    console.error("Error fetching games:", error);
    return { success: false, error: "Error al obtener los juegos" };
  }
}

export async function getCategories() {
  try {
    const games = await prisma.game.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    return { success: true, data: games.map((g) => g.category) };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, data: [] };
  }
}

export async function getGameById(id: string) {
  try {
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        components: true,
      },
    });
    return { success: true, data: game };
  } catch (error) {
    console.error("Error fetching game:", error);
    return { success: false, error: "Juego no encontrado" };
  }
}

export async function saveGame(formData: FormData, gameId?: string) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const stock = parseInt(formData.get("stock") as string, 10) || 0;
    const minPlayers = parseInt(formData.get("minPlayers") as string, 10) || 1;
    const maxPlayers = parseInt(formData.get("maxPlayers") as string, 10) || 4;
    const minAge = parseInt(formData.get("minAge") as string, 10) || 8;
    const playtime = parseInt(formData.get("playtime") as string, 10) || 30;

    // Componentes
    const cards = parseInt(formData.get("cards") as string, 10) || 0;
    const tokens = parseInt(formData.get("tokens") as string, 10) || 0;
    const dice = parseInt(formData.get("dice") as string, 10) || 0;
    const tiles = parseInt(formData.get("tiles") as string, 10) || 0;
    const others = parseInt(formData.get("others") as string, 10) || 0;
    const othersDescription = (formData.get("othersDescription") as string) || "";

    // Manejo de imagen: archivo local o URL
    let imageUrl = (formData.get("imageUrl") as string) || "";
    const imageFile = formData.get("imageFile") as File | null;

    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const extension = path.extname(imageFile.name) || ".jpg";
      const fileName = `game-${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    if (!imageUrl) {
      imageUrl = "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80";
    }

    if (gameId) {
      // Actualizar juego existente
      const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: {
          name,
          description,
          category,
          price,
          stock,
          image: imageUrl,
          minPlayers,
          maxPlayers,
          minAge,
          playtime,
          components: {
            upsert: {
              create: {
                cards,
                tokens,
                dice,
                tiles,
                others,
                othersDescription,
              },
              update: {
                cards,
                tokens,
                dice,
                tiles,
                others,
                othersDescription,
              },
            },
          },
        },
      });

      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/admin/games");
      revalidatePath("/admin/components");
      return { success: true, data: updatedGame };
    } else {
      // Crear nuevo juego
      const newGame = await prisma.game.create({
        data: {
          name,
          description,
          category,
          price,
          stock,
          image: imageUrl,
          minPlayers,
          maxPlayers,
          minAge,
          playtime,
          components: {
            create: {
              cards,
              tokens,
              dice,
              tiles,
              others,
              othersDescription,
            },
          },
        },
      });

      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/admin/games");
      revalidatePath("/admin/components");
      return { success: true, data: newGame };
    }
  } catch (error) {
    console.error("Error saving game:", error);
    return { success: false, error: "No se pudo guardar el juego" };
  }
}

export async function deleteGame(id: string) {
  try {
    // Comprobar si tiene alquileres activos
    const activeRentals = await prisma.rental.findFirst({
      where: {
        gameId: id,
        status: "ACTIVE",
      },
    });

    if (activeRentals) {
      return {
        success: false,
        error: "No se puede eliminar el juego porque tiene alquileres activos en curso.",
      };
    }

    await prisma.gameComponents.deleteMany({ where: { gameId: id } });
    await prisma.rental.deleteMany({ where: { gameId: id } });
    await prisma.reservation.deleteMany({ where: { gameId: id } });
    await prisma.game.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/games");
    revalidatePath("/admin/components");
    return { success: true };
  } catch (error) {
    console.error("Error deleting game:", error);
    return { success: false, error: "Error al eliminar el juego" };
  }
}

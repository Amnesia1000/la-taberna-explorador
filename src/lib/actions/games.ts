"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

export async function getGames() {
  try {
    const games = await prisma.game.findMany({
      include: {
        components: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: games };
  } catch (error: any) {
    console.error("Error fetching games:", error);
    return { success: false, error: "No se pudieron cargar los juegos." };
  }
}

export async function getCategories() {
  try {
    const games = await prisma.game.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });
    const categories = games.map((g) => g.category);
    return { success: true, data: categories };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "No se pudieron cargar las categorías." };
  }
}

export async function saveGame(formData: FormData, gameId?: string) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const minPlayers = parseInt(formData.get("minPlayers") as string) || 1;
    const maxPlayers = parseInt(formData.get("maxPlayers") as string) || 4;
    const minAge = parseInt(formData.get("minAge") as string) || 8;
    const playtime = parseInt(formData.get("playtime") as string) || 30;

    // Componentes
    const cards = parseInt(formData.get("cards") as string) || 0;
    const tokens = parseInt(formData.get("tokens") as string) || 0;
    const dice = parseInt(formData.get("dice") as string) || 0;
    const tiles = parseInt(formData.get("tiles") as string) || 0;
    const others = parseInt(formData.get("others") as string) || 0;
    const othersDescription = (formData.get("othersDescription") as string) || "";

    // Manejo de la Imagen
    let finalImageUrl = (formData.get("imageUrl") as string) || "";
    const imageFile = formData.get("imageFile") as File | null;

    if (imageFile && imageFile.size > 0) {
      const blob = await put(`games/${Date.now()}-${imageFile.name}`, imageFile, {
        access: "public",
      });
      finalImageUrl = blob.url;
    }

    const gameData = {
      name,
      description,
      category,
      price,
      stock,
      minPlayers,
      maxPlayers,
      minAge,
      playtime,
      image: finalImageUrl,
    };

    let game;
    if (gameId) {
      game = await prisma.game.update({
        where: { id: gameId },
        data: {
          ...gameData,
          components: {
            upsert: {
              create: { cards, tokens, dice, tiles, others, othersDescription },
              update: { cards, tokens, dice, tiles, others, othersDescription },
            },
          },
        },
      });
    } else {
      game = await prisma.game.create({
        data: {
          ...gameData,
          components: {
            create: { cards, tokens, dice, tiles, others, othersDescription },
          },
        },
      });
    }

    revalidatePath("/admin/games");
    revalidatePath("/");

    return { success: true, data: game };
  } catch (error: any) {
    console.error("Error saving game:", error);
    return {
      success: false,
      error: error?.message || "No se pudo guardar el juego.",
    };
  }
}

export async function deleteGame(id: string) {
  try {
    await prisma.game.delete({
      where: { id },
    });

    revalidatePath("/admin/games");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting game:", error);
    return { success: false, error: "No se pudo eliminar el juego." };
  }
}
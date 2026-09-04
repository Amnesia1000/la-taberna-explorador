"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGamesWithComponents() {
  try {
    const games = await prisma.game.findMany({
      include: {
        components: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, data: games };
  } catch (error) {
    console.error("Error fetching games with components:", error);
    return { success: false, error: "Error al cargar componentes" };
  }
}

export async function updateComponents(
  gameId: string,
  data: {
    cards: number;
    tokens: number;
    dice: number;
    tiles: number;
    others: number;
    othersDescription?: string;
  }
) {
  try {
    const updated = await prisma.gameComponents.upsert({
      where: { gameId },
      create: {
        gameId,
        cards: data.cards,
        tokens: data.tokens,
        dice: data.dice,
        tiles: data.tiles,
        others: data.others,
        othersDescription: data.othersDescription || null,
      },
      update: {
        cards: data.cards,
        tokens: data.tokens,
        dice: data.dice,
        tiles: data.tiles,
        others: data.others,
        othersDescription: data.othersDescription || null,
      },
    });

    revalidatePath("/admin/components");
    revalidatePath("/admin/games");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating components:", error);
    return { success: false, error: "Error al actualizar piezas del juego" };
  }
}

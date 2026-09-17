"use server";

import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

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

    let expansionCounts: Record<string, number> = {};
    try {
      if ((prisma as any).expansion) {
        const counts = await (prisma as any).expansion.groupBy({
          by: ["gameId"],
          _count: { _all: true },
        });
        counts.forEach((c: any) => {
          expansionCounts[c.gameId] = c._count._all;
        });
      }
    } catch (e) {
      console.warn("No se pudieron agrupar expansiones aún:", e);
    }

    const gamesWithCounts = games.map((game) => ({
      ...game,
      _count: {
        expansions: expansionCounts[game.id] || 0,
      },
    }));

    return { success: true, data: gamesWithCounts };
  } catch (error) {
    console.error("Error obteniendo juegos:", error);
    return { success: false, error: "Error al cargar los juegos" };
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.game.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    const categoryList = categories
      .map((c) => c.category)
      .filter((c): c is string => Boolean(c));

    return { success: true, data: categoryList };
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    return { success: false, error: "Error al cargar categorías" };
  }
}

export async function saveGame(formData: FormData, id?: string) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = 1; // Default stock to 1 as per requirements
    const minPlayers = parseInt(formData.get("minPlayers") as string);
    const maxPlayers = parseInt(formData.get("maxPlayers") as string);
    const minAge = parseInt(formData.get("minAge") as string);
    const playtime = parseInt(formData.get("playtime") as string);

    // TIEMPO MÁXIMO
    const maxPlaytimeRaw = formData.get("maxPlaytime") as string;
    const maxPlaytime = maxPlaytimeRaw ? parseInt(maxPlaytimeRaw) : playtime;

    // Componentes
    const cards = parseInt(formData.get("cards") as string) || 0;
    const tokens = parseInt(formData.get("tokens") as string) || 0;
    const dice = parseInt(formData.get("dice") as string) || 0;
    const tiles = parseInt(formData.get("tiles") as string) || 0;
    const others = parseInt(formData.get("others") as string) || 0;
    const othersDescription = (formData.get("othersDescription") as string) || "";

    // PROCESAR IMAGEN 1
    let finalImageUrl = (formData.get("imageUrl") as string) || "";
    const imageFile = formData.get("imageFile") as File | null;

    if (imageFile && imageFile.size > 0) {
      const blob = await put(`games/${Date.now()}-${imageFile.name}`, imageFile, {
        access: "public",
      });
      finalImageUrl = blob.url;
    }

    // PROCESAR IMAGEN 2 (CARRUSEL)
    let finalImageUrl2 = (formData.get("imageUrl2") as string) || "";
    const imageFile2 = formData.get("imageFile2") as File | null;

    if (imageFile2 && imageFile2.size > 0) {
      const blob2 = await put(`games/${Date.now()}-2-${imageFile2.name}`, imageFile2, {
        access: "public",
      });
      finalImageUrl2 = blob2.url;
    }

    // PROCESAR QR MANUAL
    let finalQrManualUrl = (formData.get("qrManualUrl") as string) || "";
    const qrManualFile = formData.get("qrManualFile") as File | null;

    if (qrManualFile && qrManualFile.size > 0) {
      const blob = await put(`games/${Date.now()}-qrm-${qrManualFile.name}`, qrManualFile, {
        access: "public",
      });
      finalQrManualUrl = blob.url;
    }

    // PROCESAR QR VIDEO
    let finalQrVideoUrl = (formData.get("qrVideoUrl") as string) || "";
    const qrVideoFile = formData.get("qrVideoFile") as File | null;

    if (qrVideoFile && qrVideoFile.size > 0) {
      const blob = await put(`games/${Date.now()}-qrv-${qrVideoFile.name}`, qrVideoFile, {
        access: "public",
      });
      finalQrVideoUrl = blob.url;
    }

    const hasExpansions = formData.get("hasExpansions") === "true";

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
      maxPlaytime,
      image: finalImageUrl,
      image2: finalImageUrl2,
      qrManual: finalQrManualUrl,
      qrVideo: finalQrVideoUrl,
    };

    const componentsData = {
      cards,
      tokens,
      dice,
      tiles,
      others,
      othersDescription,
    };

    if (id) {
      // ACTUALIZAR JUEGO EXISTENTE
      await prisma.game.update({
        where: { id },
        data: {
          ...gameData,
          components: {
            upsert: {
              create: componentsData,
              update: componentsData,
            },
          },
        },
      });

      // Actualizar columna hasExpansions vía SQL directo (resistente a caché de servidor en caliente)
      await prisma.$executeRaw`UPDATE "Game" SET "hasExpansions" = ${hasExpansions} WHERE "id" = ${id}`;
    } else {
      // CREAR JUEGO NUEVO
      const created = await prisma.game.create({
        data: {
          ...gameData,
          components: {
            create: componentsData,
          },
        },
      });

      if (hasExpansions) {
        await prisma.$executeRaw`UPDATE "Game" SET "hasExpansions" = true WHERE "id" = ${created.id}`;
      }
    }

    try {
      revalidatePath("/admin/games");
      revalidatePath("/admin/expansions");
      revalidatePath("/");
    } catch {
      // Ignorar si revalidatePath se ejecuta fuera del contexto de una petición HTTP Next
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error guardando juego:", error);
    return { success: false, error: error?.message || "Error al guardar el juego en la base de datos" };
  }
}

export async function deleteGame(id: string) {
  try {
    await prisma.game.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin/games");
      revalidatePath("/");
    } catch {
      // Ignorar fuera de contexto Next
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error eliminando juego:", error);
    return { success: false, error: error?.message || "Error al eliminar el juego" };
  }
}
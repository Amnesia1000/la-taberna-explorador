"use server";

import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function getExpansions(gameId?: string) {
  try {
    if ((prisma as any).expansion) {
      const expansions = await (prisma as any).expansion.findMany({
        where: gameId ? { gameId } : undefined,
        include: {
          components: true,
          game: {
            select: {
              id: true,
              name: true,
              category: true,
              image: true,
              hasExpansions: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return { success: true, data: expansions };
    }

    // Fallback SQL directo si la instancia en memoria del cliente no tiene cargado el modelo todavía
    let expansions: any[];
    if (gameId) {
      expansions = await prisma.$queryRaw`
        SELECT 
          e.*,
          json_build_object(
            'id', g.id,
            'name', g.name,
            'category', g.category,
            'image', g.image,
            'hasExpansions', g."hasExpansions"
          ) AS game,
          (
            SELECT json_build_object(
              'id', ec.id,
              'expansionId', ec."expansionId",
              'cards', ec.cards,
              'tokens', ec.tokens,
              'dice', ec.dice,
              'tiles', ec.tiles,
              'others', ec.others,
              'othersDescription', ec."othersDescription"
            )
            FROM "ExpansionComponents" ec
            WHERE ec."expansionId" = e.id
          ) AS components
        FROM "Expansion" e
        JOIN "Game" g ON e."gameId" = g.id
        WHERE e."gameId" = ${gameId}
        ORDER BY e."createdAt" DESC
      `;
    } else {
      expansions = await prisma.$queryRaw`
        SELECT 
          e.*,
          json_build_object(
            'id', g.id,
            'name', g.name,
            'category', g.category,
            'image', g.image,
            'hasExpansions', g."hasExpansions"
          ) AS game,
          (
            SELECT json_build_object(
              'id', ec.id,
              'expansionId', ec."expansionId",
              'cards', ec.cards,
              'tokens', ec.tokens,
              'dice', ec.dice,
              'tiles', ec.tiles,
              'others', ec.others,
              'othersDescription', ec."othersDescription"
            )
            FROM "ExpansionComponents" ec
            WHERE ec."expansionId" = e.id
          ) AS components
        FROM "Expansion" e
        JOIN "Game" g ON e."gameId" = g.id
        ORDER BY e."createdAt" DESC
      `;
    }

    return { success: true, data: expansions };
  } catch (error: any) {
    console.error("Error obteniendo expansiones:", error);
    return { success: false, error: "Error al cargar las expansiones" };
  }
}

export async function getEligibleGames() {
  try {
    const games: any[] = await prisma.$queryRaw`
      SELECT "id", "name", "category", "image", "hasExpansions"
      FROM "Game"
      WHERE "hasExpansions" = true
      ORDER BY "name" ASC
    `;

    return { success: true, data: games };
  } catch (error) {
    console.error("Error obteniendo juegos elegibles para expansiones:", error);
    return { success: false, error: "Error al cargar los juegos con expansiones habilitadas" };
  }
}

export async function saveExpansion(formData: FormData, id?: string) {
  try {
    const gameId = formData.get("gameId") as string;
    if (!gameId) {
      return { success: false, error: "Debes seleccionar un juego principal válido." };
    }

    // Verify parent game has hasExpansions = true
    const parentGames: any[] = await prisma.$queryRaw`
      SELECT "id", "name", "hasExpansions"
      FROM "Game"
      WHERE "id" = ${gameId}
    `;

    if (!parentGames || parentGames.length === 0) {
      return { success: false, error: "El juego principal seleccionado no existe." };
    }

    const parentGame = parentGames[0];

    if (!parentGame.hasExpansions) {
      return {
        success: false,
        error: `El juego "${parentGame.name}" no tiene activada la casilla "Tiene expansiones".`,
      };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const stock = 1;
    const minPlayers = parseInt(formData.get("minPlayers") as string) || 1;
    const maxPlayers = parseInt(formData.get("maxPlayers") as string) || 4;
    const minAge = parseInt(formData.get("minAge") as string) || 8;
    const playtime = parseInt(formData.get("playtime") as string) || 30;

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
      const blob = await put(`expansions/${Date.now()}-${imageFile.name}`, imageFile, {
        access: "public",
      });
      finalImageUrl = blob.url;
    }

    // PROCESAR IMAGEN 2 (CARRUSEL)
    let finalImageUrl2 = (formData.get("imageUrl2") as string) || "";
    const imageFile2 = formData.get("imageFile2") as File | null;

    if (imageFile2 && imageFile2.size > 0) {
      const blob2 = await put(`expansions/${Date.now()}-2-${imageFile2.name}`, imageFile2, {
        access: "public",
      });
      finalImageUrl2 = blob2.url;
    }

    // PROCESAR QR MANUAL
    let finalQrManualUrl = (formData.get("qrManualUrl") as string) || "";
    const qrManualFile = formData.get("qrManualFile") as File | null;

    if (qrManualFile && qrManualFile.size > 0) {
      const blob = await put(`expansions/${Date.now()}-qrm-${qrManualFile.name}`, qrManualFile, {
        access: "public",
      });
      finalQrManualUrl = blob.url;
    }

    // PROCESAR QR VIDEO
    let finalQrVideoUrl = (formData.get("qrVideoUrl") as string) || "";
    const qrVideoFile = formData.get("qrVideoFile") as File | null;

    if (qrVideoFile && qrVideoFile.size > 0) {
      const blob = await put(`expansions/${Date.now()}-qrv-${qrVideoFile.name}`, qrVideoFile, {
        access: "public",
      });
      finalQrVideoUrl = blob.url;
    }

    const expansionId = id || `cmu${Date.now()}${Math.random().toString(36).substring(2, 7)}`;

    if (id) {
      await prisma.$executeRaw`
        UPDATE "Expansion"
        SET "gameId" = ${gameId},
            "name" = ${name},
            "description" = ${description},
            "price" = ${price},
            "stock" = ${stock},
            "minPlayers" = ${minPlayers},
            "maxPlayers" = ${maxPlayers},
            "minAge" = ${minAge},
            "playtime" = ${playtime},
            "maxPlaytime" = ${maxPlaytime},
            "image" = ${finalImageUrl},
            "image2" = ${finalImageUrl2},
            "qrManual" = ${finalQrManualUrl},
            "qrVideo" = ${finalQrVideoUrl},
            "updatedAt" = NOW()
        WHERE "id" = ${id}
      `;

      await prisma.$executeRaw`
        INSERT INTO "ExpansionComponents" ("id", "expansionId", "cards", "tokens", "dice", "tiles", "others", "othersDescription", "createdAt", "updatedAt")
        VALUES (${`cmucomp_${Date.now()}`}, ${id}, ${cards}, ${tokens}, ${dice}, ${tiles}, ${others}, ${othersDescription}, NOW(), NOW())
        ON CONFLICT ("expansionId") DO UPDATE SET
          "cards" = EXCLUDED."cards",
          "tokens" = EXCLUDED."tokens",
          "dice" = EXCLUDED."dice",
          "tiles" = EXCLUDED."tiles",
          "others" = EXCLUDED."others",
          "othersDescription" = EXCLUDED."othersDescription",
          "updatedAt" = NOW()
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO "Expansion" ("id", "gameId", "name", "description", "price", "stock", "minPlayers", "maxPlayers", "minAge", "playtime", "maxPlaytime", "image", "image2", "qrManual", "qrVideo", "createdAt", "updatedAt")
        VALUES (${expansionId}, ${gameId}, ${name}, ${description}, ${price}, ${stock}, ${minPlayers}, ${maxPlayers}, ${minAge}, ${playtime}, ${maxPlaytime}, ${finalImageUrl}, ${finalImageUrl2}, ${finalQrManualUrl}, ${finalQrVideoUrl}, NOW(), NOW())
      `;

      await prisma.$executeRaw`
        INSERT INTO "ExpansionComponents" ("id", "expansionId", "cards", "tokens", "dice", "tiles", "others", "othersDescription", "createdAt", "updatedAt")
        VALUES (${`cmucomp_${Date.now()}`}, ${expansionId}, ${cards}, ${tokens}, ${dice}, ${tiles}, ${others}, ${othersDescription}, NOW(), NOW())
      `;
    }

    try {
      revalidatePath("/admin/expansions");
      revalidatePath("/admin/games");
      revalidatePath("/");
    } catch {
      // Ignorar fuera de contexto Next
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error guardando expansión:", error);
    return { success: false, error: error?.message || "Error al guardar la expansión en la base de datos" };
  }
}

export async function deleteExpansion(id: string) {
  try {
    await prisma.$executeRaw`DELETE FROM "Expansion" WHERE "id" = ${id}`;

    try {
      revalidatePath("/admin/expansions");
      revalidatePath("/admin/games");
      revalidatePath("/");
    } catch {
      // Ignorar fuera de contexto Next
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error eliminando expansión:", error);
    return { success: false, error: error?.message || "Error al eliminar la expansión" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { normalizeSortName } from "@/lib/sort-name";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function getGames() {
  try {
    const games = await prisma.game.findMany({
      include: {
        components: true,
        expansions: true,
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

export interface CatalogFilters {
  category?: string;
  q?: string;
  players?: string;
  age?: string;
  price?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

function buildCatalogWhere(f: Omit<CatalogFilters, "sort" | "page" | "pageSize">) {
  const and: any[] = [];
  if (f.category && f.category !== "TODOS") {
    and.push({ category: f.category });
  }
  const q = (f.q ?? "").trim();
  if (q !== "") {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (f.players === "SOLO") and.push({ minPlayers: { lte: 1 } });
  else if (f.players === "2P") and.push({ minPlayers: { lte: 2 }, maxPlayers: { gte: 2 } });
  else if (f.players === "PARTY") and.push({ maxPlayers: { gte: 5 } });
  if (f.age === "+6") and.push({ minAge: { gte: 6 } });
  else if (f.age === "+10") and.push({ minAge: { gte: 10 } });
  else if (f.age === "+14") and.push({ minAge: { gte: 14 } });
  if (f.price === "$") and.push({ price: { lte: 6000 } });
  else if (f.price === "$$") and.push({ price: { gte: 7000, lte: 15000 } });
  else if (f.price === "$$$") and.push({ price: { gt: 15000 } });
  return and.length > 0 ? { AND: and } : {};
}

function catalogOrderBy(sort?: string): any {
  switch (sort) {
    case "PUP": return { price: "asc" };
    case "PDOWN": return { price: "desc" };
    case "DUR": return { playtime: "asc" };
    default: return { sortName: "asc" };
  }
}

/** Catálogo paginado y filtrado en el servidor (escala a cientos de juegos). */
export async function getCatalog(filters: CatalogFilters = {}) {
  try {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 12));
    const where = buildCatalogWhere(filters);

    const [games, total, grandTotal] = await Promise.all([
      prisma.game.findMany({
        where,
        include: { components: true, expansions: true },
        orderBy: catalogOrderBy(filters.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.game.count({ where }),
      prisma.game.count(),
    ]);

    let expansionCounts: Record<string, number> = {};
    try {
      if ((prisma as any).expansion && games.length > 0) {
        const counts = await (prisma as any).expansion.groupBy({
          by: ["gameId"],
          where: { gameId: { in: games.map((g) => g.id) } },
          _count: { _all: true },
        });
        counts.forEach((c: any) => {
          expansionCounts[c.gameId] = c._count._all;
        });
      }
    } catch (e) {
      console.warn("No se pudieron agrupar expansiones aún:", e);
    }

    const data = games.map((game) => ({
      ...game,
      _count: { expansions: expansionCounts[game.id] || 0 },
    }));

    return {
      success: true,
      data,
      total,
      grandTotal,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (error) {
    console.error("Error obteniendo catálogo:", error);
    return { success: false, error: "Error al cargar el catálogo", data: [], total: 0, grandTotal: 0, page: 1, pageSize: 9, totalPages: 1 };
  }
}

/** Un juego por id (deep link ?juego= aunque no esté en la página actual). */
export async function getGameById(id: string) {
  try {
    const game = await prisma.game.findUnique({
      where: { id },
      include: { components: true, expansions: true },
    });
    if (!game) return { success: false, error: "Juego no encontrado" };
    return { success: true, data: game };
  } catch (error) {
    console.error("Error obteniendo juego:", error);
    return { success: false, error: "Error al cargar el juego" };
  }
}
export async function saveGame(formData: FormData, id?: string) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string);
    const stockRaw = formData.get("stock");
    const stock = stockRaw === null ? 1 : Math.max(0, parseInt(stockRaw as string) || 0);
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
      sortName: normalizeSortName(name),
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
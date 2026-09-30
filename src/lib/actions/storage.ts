"use server";

import { list, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface OrphanBlob {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

/** Blobs de juegos/expansiones que ninguna fila de la DB referencia. */
export async function getOrphanBlobs(): Promise<{ success: boolean; data?: OrphanBlob[]; totalSize?: number; error?: string }> {
  try {
    const used = new Set<string>();
    const [games, expansions] = await Promise.all([
      prisma.game.findMany({ select: { image: true, image2: true, qrManual: true, qrVideo: true } }),
      (prisma as any).expansion.findMany({ select: { image: true, image2: true, qrManual: true, qrVideo: true } }),
    ]);
    for (const g of [...games, ...expansions]) {
      for (const u of [g.image, g.image2, g.qrManual, g.qrVideo]) {
        if (u) used.add(u);
      }
    }

    const orphans: OrphanBlob[] = [];
    let cursor: string | undefined;
    do {
      const res: any = await list({ cursor, limit: 1000 });
      for (const b of res.blobs ?? []) {
        // Nunca tocar backups automáticos
        if (b.pathname.startsWith("backups/")) continue;
        if (!used.has(b.url)) {
          orphans.push({ url: b.url, pathname: b.pathname, size: b.size ?? 0, uploadedAt: b.uploadedAt ?? "" });
        }
      }
      cursor = res.cursor;
    } while (cursor);

    return { success: true, data: orphans, totalSize: orphans.reduce((a, b) => a + b.size, 0) };
  } catch (error) {
    console.error("Error listando blobs:", error);
    return { success: false, error: "No se pudo listar el almacenamiento. Revisá el Blob store." };
  }
}

export async function deleteBlobs(urls: string[]): Promise<{ success: boolean; deleted?: number; error?: string }> {
  try {
    if (urls.length === 0) return { success: true, deleted: 0 };
    // Re-verificar que siguen huérfanos antes de borrar
    const check = await getOrphanBlobs();
    if (!check.success || !check.data) return { success: false, error: check.error || "Error al verificar." };
    const safe = new Set(check.data.map((b) => b.url));
    const toDelete = urls.filter((u) => safe.has(u) && !u.includes("backups/"));
    await del(toDelete);
    revalidatePath("/admin/storage");
    return { success: true, deleted: toDelete.length };
  } catch (error) {
    console.error("Error borrando blobs:", error);
    return { success: false, error: "Error al borrar." };
  }
}

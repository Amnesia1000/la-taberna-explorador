import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
  ];
  try {
    const games = await prisma.game.findMany({
      select: { id: true, updatedAt: true },
      take: 500,
    });
    return [
      ...base,
      ...games.map((g) => ({
        url: `${siteUrl}/juego/${g.id}`,
        lastModified: g.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return base;
  }
}

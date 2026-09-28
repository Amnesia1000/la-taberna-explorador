import type { PrismaClient } from "@prisma/client";

export interface BackupData {
  exportDate: string;
  users: unknown[];
  games: unknown[];
  expansions: unknown[];
  rentals: unknown[];
  reservations: unknown[];
}

export async function collectBackup(db: PrismaClient): Promise<BackupData> {
  const [users, games, expansions, rentals, reservations] = await Promise.all([
    db.user.findMany(),
    db.game.findMany({ include: { components: true } }),
    (db as any).expansion
      ? (db as any).expansion.findMany({ include: { components: true } })
      : Promise.resolve([]),
    db.rental.findMany(),
    db.reservation.findMany(),
  ]);
  return {
    exportDate: new Date().toISOString(),
    users,
    games,
    expansions,
    rentals,
    reservations,
  };
}

export function backupFilename(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
  return `backup-${stamp}.json`;
}

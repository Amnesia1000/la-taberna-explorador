import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { collectBackup, backupFilename } from "@/../prisma/lib/backup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "Backup no configurado (falta CRON_SECRET)." }, { status: 503 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const data = await collectBackup(prisma);
    const name = `backups/${backupFilename()}`;
    const blob = await put(name, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
    });
    return Response.json({
      success: true,
      url: blob.url,
      exportDate: data.exportDate,
      counts: {
        users: (data.users as unknown[]).length,
        games: (data.games as unknown[]).length,
        expansions: (data.expansions as unknown[]).length,
        rentals: (data.rentals as unknown[]).length,
        reservations: (data.reservations as unknown[]).length,
      },
    });
  } catch (e) {
    console.error("Error en backup automático:", e);
    return Response.json({ error: "Falló el backup." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

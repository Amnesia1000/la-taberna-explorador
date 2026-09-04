import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function exportData() {
  console.log("Iniciando exportación de base de datos...");

  const users = await prisma.user.findMany();
  const games = await prisma.game.findMany({
    include: {
      components: true,
    },
  });
  const rentals = await prisma.rental.findMany();
  const reservations = await prisma.reservation.findMany();

  const backupData = {
    exportDate: new Date().toISOString(),
    users,
    games,
    rentals,
    reservations,
  };

  const outputPath = path.join(process.cwd(), "exported_data.json");
  fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2), "utf-8");

  console.log(`¡Exportación exitosa! Datos guardados en: ${outputPath}`);
  console.log(`- Juegos exportados: ${games.length}`);
  console.log(`- Clientes exportados: ${users.length}`);
  console.log(`- Alquileres exportados: ${rentals.length}`);
  console.log(`- Reservas exportadas: ${reservations.length}`);
}

exportData()
  .catch((e) => {
    console.error("Error al exportar:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

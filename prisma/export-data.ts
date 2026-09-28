import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { collectBackup } from "./lib/backup";

const prisma = new PrismaClient();

async function exportData() {
  console.log("Iniciando exportación de base de datos...");

  const backupData = await collectBackup(prisma);

  const outputPath = path.join(process.cwd(), "exported_data.json");
  fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2), "utf-8");

  console.log(`¡Exportación exitosa! Datos guardados en: ${outputPath}`);
  console.log(`- Juegos exportados: ${(backupData.games as unknown[]).length}`);
  console.log(`- Expansiones exportadas: ${(backupData.expansions as unknown[]).length}`);
  console.log(`- Clientes exportados: ${(backupData.users as unknown[]).length}`);
  console.log(`- Alquileres exportados: ${(backupData.rentals as unknown[]).length}`);
  console.log(`- Reservas exportadas: ${(backupData.reservations as unknown[]).length}`);
}

exportData()
  .catch((e) => {
    console.error("Error al exportar:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

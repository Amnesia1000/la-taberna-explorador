import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { collectBackup, backupFilename } from "./lib/backup";

const prisma = new PrismaClient();

async function backup() {
  const backupData = await collectBackup(prisma);
  const dir = path.join(process.cwd(), "backups");
  fs.mkdirSync(dir, { recursive: true });
  const outputPath = path.join(dir, backupFilename());
  fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2), "utf-8");
  console.log(`¡Backup exitoso! Guardado en: ${outputPath}`);
}

backup()
  .catch((e) => {
    console.error("Error en backup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

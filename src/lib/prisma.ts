import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  process.env.NODE_ENV === "production"
    ? globalForPrisma.prisma || new PrismaClient()
    : new PrismaClient({
        log: ["warn", "error"],
      });

if (process.env.NODE_ENV === "production") {
  globalForPrisma.prisma = prisma;
}

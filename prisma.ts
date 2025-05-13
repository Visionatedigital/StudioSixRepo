import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("[PRISMA] Initializing Prisma client with database URL:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"));

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["query", "error", "warn"],
});

prisma.$connect()
  .then(() => {
    console.log("[PRISMA] Successfully connected to database");
  })
  .catch((error) => {
    console.error("[PRISMA] Failed to connect to database:", error);
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

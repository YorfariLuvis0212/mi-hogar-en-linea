import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma compartido por las aplicaciones del monorepo.
 *
 * En producción la base de datos vive en Neon y se usa su driver serverless.
 * En desarrollo local (PostgreSQL tradicional) se usa el driver de node-postgres.
 * El adaptador se elige según el host de `DATABASE_URL`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("La variable de entorno DATABASE_URL no está definida.");
  }
  return url;
}

function createAdapter() {
  const url = connectionString();
  const isNeon = /neon\.(tech|build)/.test(url);
  return isNeon
    ? new PrismaNeon({ connectionString: url })
    : new PrismaPg({ connectionString: url });
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({ adapter: createAdapter() });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

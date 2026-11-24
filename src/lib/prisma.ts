import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

/**
 * Cliente Prisma único por proceso.
 *
 * En producción la base de datos vive en Neon y se usa su driver serverless.
 * En desarrollo local (PostgreSQL tradicional) se usa el driver de node-postgres.
 * El adaptador se elige según el host de `DATABASE_URL`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createAdapter() {
  const isNeon = /neon\.(tech|build)/.test(env.DATABASE_URL);
  return isNeon
    ? new PrismaNeon({ connectionString: env.DATABASE_URL })
    : new PrismaPg({ connectionString: env.DATABASE_URL });
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({ adapter: createAdapter() });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

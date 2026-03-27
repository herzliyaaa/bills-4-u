import "dotenv/config"; // make sure this is at the top
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, // Must exist
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Only assign to global in development to prevent multiple connections
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

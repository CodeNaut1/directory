import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton instance
 * Prevents multiple instances in development (hot reload)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper function to disconnect (useful for testing)
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Helper function to connect (useful for testing)
export async function connectPrisma() {
  await prisma.$connect();
}


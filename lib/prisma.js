import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis;

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn(
      'DATABASE_URL is not set. Database features will fallback gracefully.'
    );
    return new PrismaClient();
  }

  // Normalize legacy sslmode values to avoid pg-connection-string deprecation warnings
  connectionString = connectionString.replace(/sslmode=(require|prefer|verify-ca)/g, 'sslmode=verify-full');

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}


let prisma = globalForPrisma.prisma;

// Re-instantiate if global prisma client is cached without newly generated models
if (!prisma || !prisma.userCodingStats || !prisma.problem) {
  prisma = createPrismaClient();
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };

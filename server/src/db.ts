import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectDb(retries = 5, delayMs = 1500): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log('[db] connected via Prisma');
      return;
    } catch (err) {
      console.warn(`[db] connect attempt ${attempt}/${retries} failed:`, (err as Error).message);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}

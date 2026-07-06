import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const envPath = path.join(__dirname, '../.env');
const envContents = fs.readFileSync(envPath, 'utf-8');
const databaseUrl = envContents
  .split('\n')
  .find((line) => line.startsWith('DATABASE_URL='))
  ?.replace(/^DATABASE_URL="?/, '')
  .replace(/"$/, '');

if (!databaseUrl) {
  throw new Error('DATABASE_URL not found in .env');
}

process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.project.update({
    where: { slug: 'mulastack' },
    data: { status: 'unpublished' },
    select: { id: true, slug: true, name: true, status: true },
  });

  console.log('Updated MulaStack:', updated);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

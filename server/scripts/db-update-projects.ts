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

async function inspect() {
  const mulastacks = await prisma.project.findMany({
    where: {
      OR: [
        { slug: { contains: 'mulastack', mode: 'insensitive' } },
        { name: { contains: 'mulastack', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      countryCode: true,
      countryName: true,
      city: true,
      location: true,
      published: true,
      status: true,
      active: true,
    },
  });
  console.log('MULASTACK:', JSON.stringify(mulastacks, null, 2));

  const payWithFlash = await prisma.project.findMany({
    where: {
      OR: [
        { slug: { contains: 'pay-with-flash', mode: 'insensitive' } },
        { name: { contains: 'pay with flash', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      countryId: true,
      countryCode: true,
      countryName: true,
      city: true,
      location: true,
      published: true,
      status: true,
    },
  });
  console.log('PAY WITH FLASH:', JSON.stringify(payWithFlash, null, 2));

  const globalCountry = await prisma.country.findMany({
    where: {
      OR: [
        { code: { equals: 'xx', mode: 'insensitive' } },
        { name: { contains: 'Global', mode: 'insensitive' } },
        { name: { contains: 'Africa Wide', mode: 'insensitive' } },
      ],
    },
  });
  console.log('GLOBAL COUNTRY:', JSON.stringify(globalCountry, null, 2));

  const africaWideSample = await prisma.project.findFirst({
    where: { countryName: { contains: 'Africa Wide', mode: 'insensitive' } },
    select: {
      id: true,
      slug: true,
      name: true,
      countryId: true,
      countryCode: true,
      countryName: true,
      city: true,
      location: true,
    },
  });
  console.log('AFRICA WIDE SAMPLE:', JSON.stringify(africaWideSample, null, 2));
}

async function update() {
  const kenyaMulastack = await prisma.project.findFirst({
    where: {
      slug: 'mulastack',
      countryCode: 'ke',
    },
  });

  if (!kenyaMulastack) {
    throw new Error('Kenya MulaStack project not found');
  }

  const unpublished = await prisma.project.update({
    where: { id: kenyaMulastack.id },
    data: {
      published: false,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      countryCode: true,
      countryName: true,
      published: true,
      status: true,
    },
  });
  console.log('UNPUBLISHED MULASTACK:', JSON.stringify(unpublished, null, 2));

  const globalCountry = await prisma.country.findFirst({
    where: { code: { equals: 'xx', mode: 'insensitive' } },
  });

  const payWithFlash = await prisma.project.findFirst({
    where: { slug: 'pay-with-flash' },
  });

  if (!payWithFlash) {
    throw new Error('Pay With Flash project not found');
  }

  const updatedPayWithFlash = await prisma.project.update({
    where: { id: payWithFlash.id },
    data: {
      countryId: globalCountry?.id ?? null,
      countryCode: 'xx',
      countryName: 'Global/Africa Wide',
      city: 'Africa Wide',
      location: 'Africa Wide',
    },
    select: {
      id: true,
      slug: true,
      name: true,
      countryId: true,
      countryCode: true,
      countryName: true,
      city: true,
      location: true,
      published: true,
      status: true,
    },
  });
  console.log('UPDATED PAY WITH FLASH:', JSON.stringify(updatedPayWithFlash, null, 2));
}

const mode = process.argv[2] ?? 'inspect';

async function main() {
  if (mode === 'inspect') {
    await inspect();
  } else if (mode === 'update') {
    await update();
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

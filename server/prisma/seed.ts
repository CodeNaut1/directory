import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed Categories
  console.log('📁 Seeding categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'exchange' },
      update: {},
      create: {
        name: 'Exchange',
        slug: 'exchange',
        description: 'Bitcoin exchanges and trading platforms',
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'wallet' },
      update: {},
      create: {
        name: 'Wallet',
        slug: 'wallet',
        description: 'Bitcoin wallets and custody solutions',
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'merchant' },
      update: {},
      create: {
        name: 'Merchant Services',
        slug: 'merchant',
        description: 'Payment processors and merchant solutions',
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'education' },
      update: {},
      create: {
        name: 'Education',
        slug: 'education',
        description: 'Educational platforms and resources',
        order: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'community' },
      update: {},
      create: {
        name: 'Community',
        slug: 'community',
        description: 'Community organizations and meetups',
        order: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'developer' },
      update: {},
      create: {
        name: 'Developer Tools',
        slug: 'developer',
        description: 'Development tools and infrastructure',
        order: 6,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Seed Countries (All African countries)
  console.log('🌍 Seeding countries...');
  const countriesData = [
    { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
    { code: 'AO', name: 'Angola', flag: '🇦🇴' },
    { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
    { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
    { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
    { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
    { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
    { code: 'TD', name: 'Chad', flag: '🇹🇩' },
    { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
    { code: 'CG', name: 'Congo', flag: '🇨🇬' },
    { code: 'CD', name: 'Congo, Democratic Republic', flag: '🇨🇩' },
    { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
    { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
    { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
    { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
    { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
    { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
    { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
    { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
    { code: 'LY', name: 'Libya', flag: '🇱🇾' },
    { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
    { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
    { code: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
    { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
    { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
    { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
    { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
    { code: 'NE', name: 'Niger', flag: '🇳🇪' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
    { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
    { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
    { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
    { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
    { code: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
    { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
    { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
  ];

  const countries = await Promise.all(
    countriesData.map((country) =>
      prisma.country.upsert({
        where: { code: country.code },
        update: {},
        create: country,
      })
    )
  );

  console.log(`✅ Created ${countries.length} countries`);

  // Seed Tags
  console.log('🏷️  Seeding tags...');
  const tagsData = [
    'Lightning Network',
    'Bitcoin Only',
    'Non-Custodial',
    'Open Source',
    'Mobile App',
    'Web App',
    'Desktop',
    'Hardware Wallet',
    'Custodial',
    'P2P',
    'Payment Gateway',
    'Remittance',
    'Education',
    'Trading',
    'Mining',
  ];

  const tags = await Promise.all(
    tagsData.map((tagName) => {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');
      return prisma.tag.upsert({
        where: { slug },
        update: {},
        create: {
          name: tagName,
          slug,
        },
      });
    })
  );

  console.log(`✅ Created ${tags.length} tags`);

  // Seed Admin User
  console.log('👤 Seeding admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'megasley@freerouting.africa' },
    update: {},
    create: {
      email: 'megasley@freerouting.africa',
      name: 'Admin User',
      role: 'admin',
      // Note: In production, use a secure password hash
      // For seed, you should set this via environment variable
      passwordHash: '$2a$10$dummy.hash.for.seed.only.change.in.production',
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email}`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed Categories
  console.log('📁 Seeding categories...');
  const categoriesData = [
    { name: 'Business', slug: 'business', description: 'Bitcoin businesses and enterprises', order: 1 },
    { name: 'Education', slug: 'education', description: 'Educational platforms and resources', order: 2 },
    { name: 'Circular Economy', slug: 'circular-economy', description: 'Circular economy projects', order: 3 },
    { name: 'Mining', slug: 'mining', description: 'Bitcoin mining operations', order: 4 },
    { name: 'Community', slug: 'community', description: 'Community organizations and meetups', order: 5 },
    { name: 'Retail', slug: 'retail', description: 'Retail and e-commerce', order: 6 },
    { name: 'Non Profit', slug: 'non-profit', description: 'Non-profit organizations', order: 7 },
    { name: 'Hodl', slug: 'hodl', description: 'Bitcoin holders and savings', order: 8 },
    { name: 'Funding', slug: 'funding', description: 'Funding and investment', order: 9 },
    { name: 'Conference', slug: 'conference', description: 'Bitcoin conferences and events', order: 10 },
    { name: 'Media', slug: 'media', description: 'Media and content creation', order: 11 },
    { name: 'Tech Meetup', slug: 'tech-meetup', description: 'Technical meetups and workshops', order: 12 },
    { name: 'Regular Meetup', slug: 'regular-meetup', description: 'Regular community meetups', order: 13 },
    { name: 'Developer Community', slug: 'developer-community', description: 'Developer communities and tools', order: 14 },
    { name: 'Tourism', slug: 'tourism', description: 'Tourism and travel services', order: 15 },
    { name: 'Exchange', slug: 'exchange', description: 'Bitcoin exchanges and trading platforms', order: 16 },
    { name: 'Wallet', slug: 'wallet', description: 'Bitcoin wallets and custody solutions', order: 17 },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );

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

  // Mark existing users as admins (don't create new accounts)
  console.log('👤 Updating admin users...');
  const adminEmails = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()).filter(Boolean) || [];

  if (adminEmails.length > 0) {
    let updatedCount = 0;
    for (const email of adminEmails) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        await prisma.user.update({
          where: { email },
          data: { role: 'admin' },
        });
        updatedCount++;
        console.log(`✅ Updated ${email} to admin`);
      } else {
        console.log(`⚠️  User ${email} not found - they need to register first`);
      }
    }
    console.log(`✅ Updated ${updatedCount} users to admin role`);
  } else {
    console.log('⚠️  No admin emails found in ADMIN_EMAIL env variable');
  }

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
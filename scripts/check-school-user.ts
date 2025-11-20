import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for school user: contact@seoul-academy.edu\n');

  const user = await prisma.user.findUnique({
    where: { email: 'contact@seoul-academy.edu' },
    include: {
      schoolProfile: true,
    },
  });

  if (!user) {
    console.log('❌ User not found in database');
    console.log('\nYou need to run the seed script:');
    console.log('  npx tsx scripts/seed-dummy-data.ts');
    return;
  }

  console.log('✓ User found:');
  console.log('  ID:', user.id);
  console.log('  Email:', user.email);
  console.log('  Name:', user.name);
  console.log('  Role:', user.role);
  console.log('  Email Verified:', user.emailVerified);
  console.log('  Has Password:', !!user.password);

  console.log('\n✓ School Profile:');
  if (user.schoolProfile) {
    console.log('  School Name:', user.schoolProfile.schoolName);
    console.log('  Country:', user.schoolProfile.country);
    console.log('  City:', user.schoolProfile.city);
    console.log('  Verified:', user.schoolProfile.isVerified);
  } else {
    console.log('  ❌ No school profile found');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

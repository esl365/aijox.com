import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating school user for testing...\n');

  const email = 'contact@seoul-academy.edu';
  const password = 'School123!@#';
  const schoolName = 'Seoul International Academy';

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('✓ User already exists:', email);
    console.log('  ID:', existing.id);
    console.log('  Role:', existing.role);

    // Check if school profile exists
    const profile = await prisma.schoolProfile.findUnique({
      where: { userId: existing.id },
    });

    if (!profile) {
      console.log('\n  Creating school profile...');
      await prisma.schoolProfile.create({
        data: {
          userId: existing.id,
          schoolName,
          country: 'South Korea',
          city: 'Seoul',
          schoolType: 'International School',
          description: 'Leading international school offering the IB curriculum.',
          website: 'https://seoul-academy.edu',
          isVerified: true,
          verifiedAt: new Date(),
        },
      });
      console.log('  ✓ School profile created');
    } else {
      console.log('  ✓ School profile exists');
    }

    return;
  }

  console.log('Creating new user:', email);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: schoolName,
      role: 'SCHOOL',
      emailVerified: new Date(),
      status: 'ACTIVE',
    },
  });

  console.log('✓ User created:', user.id);

  const profile = await prisma.schoolProfile.create({
    data: {
      userId: user.id,
      schoolName,
      country: 'South Korea',
      city: 'Seoul',
      schoolType: 'International School',
      description: 'Leading international school offering the IB curriculum.',
      website: 'https://seoul-academy.edu',
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  console.log('✓ School profile created');

  console.log('\n✅ School user ready!');
  console.log('  Email:', email);
  console.log('  Password:', password);
  console.log('  Login at: https://aijobx.vercel.app/login');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

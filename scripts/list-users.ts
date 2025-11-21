import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Fetching users by role...\n');

  // Get one user of each role
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const schoolUser = await prisma.user.findFirst({
    where: { role: 'SCHOOL' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const teacherUser = await prisma.user.findFirst({
    where: { role: 'TEACHER' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Get counts
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  const schoolCount = await prisma.user.count({ where: { role: 'SCHOOL' } });
  const teacherCount = await prisma.user.count({ where: { role: 'TEACHER' } });

  console.log('📊 User Statistics:');
  console.log(`Total Admins: ${adminCount}`);
  console.log(`Total Schools: ${schoolCount}`);
  console.log(`Total Teachers: ${teacherCount}\n`);

  console.log('👤 Sample Users by Role:\n');

  if (adminUser) {
    console.log('🔑 ADMIN:');
    console.log(`  ID: ${adminUser.id}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Name: ${adminUser.name || 'N/A'}`);
    console.log(`  Created: ${adminUser.createdAt.toISOString()}\n`);
  } else {
    console.log('🔑 ADMIN: No admin users found\n');
  }

  if (schoolUser) {
    console.log('🏫 SCHOOL:');
    console.log(`  ID: ${schoolUser.id}`);
    console.log(`  Email: ${schoolUser.email}`);
    console.log(`  Name: ${schoolUser.name || 'N/A'}`);
    console.log(`  Created: ${schoolUser.createdAt.toISOString()}\n`);
  } else {
    console.log('🏫 SCHOOL: No school users found\n');
  }

  if (teacherUser) {
    console.log('👨‍🏫 TEACHER:');
    console.log(`  ID: ${teacherUser.id}`);
    console.log(`  Email: ${teacherUser.email}`);
    console.log(`  Name: ${teacherUser.name || 'N/A'}`);
    console.log(`  Created: ${teacherUser.createdAt.toISOString()}\n`);
  } else {
    console.log('👨‍🏫 TEACHER: No teacher users found\n');
  }

  console.log('✅ Done!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

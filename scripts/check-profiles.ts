import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking profiles for Teacher and Admin users...\n');

  // Check Teacher
  const teacher = await prisma.user.findFirst({
    where: { email: 'john.smith@email.com' },
    include: { teacherProfile: { select: { id: true } } }
  });

  // Check Admin
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    include: {
      teacherProfile: { select: { id: true } },
      schoolProfile: { select: { id: true } },
      recruiterProfile: { select: { id: true } }
    }
  });

  console.log('👨‍🏫 TEACHER (john.smith@email.com):');
  console.log(`  User ID: ${teacher?.id}`);
  console.log(`  Teacher Profile ID: ${teacher?.teacherProfile?.id || '❌ NONE - THIS IS THE PROBLEM!'}`);
  console.log('');

  console.log('🔑 ADMIN (admin@aijobx.com):');
  console.log(`  User ID: ${admin?.id}`);
  console.log(`  Email: ${admin?.email}`);
  console.log(`  Role: ${admin?.role}`);
  console.log(`  Teacher Profile: ${admin?.teacherProfile?.id || 'NONE'}`);
  console.log(`  School Profile: ${admin?.schoolProfile?.id || 'NONE'}`);
  console.log(`  Recruiter Profile: ${admin?.recruiterProfile?.id || 'NONE'}`);
  console.log('');

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

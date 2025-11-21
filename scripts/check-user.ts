import { prisma } from '../lib/prisma';

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'contact@seoul-academy.edu' },
      select: {
        id: true,
        email: true,
        role: true,
        password: true,
        schoolProfile: true,
      },
    });

    console.log('User found:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length,
      hasSchoolProfile: !!user?.schoolProfile,
    });

    if (user?.password) {
      console.log('\nPassword hash (first 20 chars):', user.password.substring(0, 20));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

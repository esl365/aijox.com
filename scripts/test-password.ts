import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function testPassword() {
  const email = 'contact@seoul-academy.edu';
  const password = 'School123!@#';

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('User found:', {
    id: user.id,
    email: user.email,
    role: user.role,
    hasPassword: !!user.password,
  });

  if (user.password) {
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);

    // Also test what the hash looks like
    console.log('Stored hash starts with:', user.password.substring(0, 10));
  }

  await prisma.$disconnect();
}

testPassword().catch(console.error);

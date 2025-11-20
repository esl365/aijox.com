/**
 * Test authentication flow
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function testAuth() {
  try {
    const email = 'admin@aijobx.com';
    const password = 'Admin123!@#';

    console.log('Testing authentication for:', email);
    console.log('Password:', password);
    console.log('');

    // Step 1: Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User NOT found');
      return;
    }

    console.log('✅ User found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Has password:', !!user.password);
    console.log('');

    // Step 2: Check password
    if (!user.password) {
      console.log('❌ User has no password set');
      return;
    }

    console.log('Password hash:', user.password);
    console.log('');

    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      console.log('✅ PASSWORD MATCHES!');
      console.log('');
      console.log('Auth would return:');
      console.log({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      });
    } else {
      console.log('❌ PASSWORD DOES NOT MATCH!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();

/**
 * Check admin user in database
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

import { prisma } from '../lib/db';

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@aijobx.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
      }
    });

    if (!admin) {
      console.log('❌ Admin user NOT found in database');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Has password:', !!admin.password);
    console.log('Password hash:', admin.password?.substring(0, 20) + '...');
    console.log('Created:', admin.createdAt);

  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();

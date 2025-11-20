import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Load environment variables
config();

const prisma = new PrismaClient();

async function createAdminUser() {
  const adminEmail = 'admin@aijobx.com';
  const adminPassword = 'Admin123!@#';
  const adminName = 'System Administrator';

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      console.log('Email:', adminEmail);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('\n✓ Admin user created successfully!\n');
    console.log('='.repeat(50));
    console.log('Admin Credentials:');
    console.log('='.repeat(50));
    console.log('Email:    ', adminEmail);
    console.log('Password: ', adminPassword);
    console.log('Role:     ', admin.role);
    console.log('='.repeat(50));
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('⚠️  Change the password after first login.\n');
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .then(() => {
    console.log('✓ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Script failed:', error);
    process.exit(1);
  });

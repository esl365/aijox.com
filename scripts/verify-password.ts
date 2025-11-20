/**
 * Verify password hash
 */

import bcrypt from 'bcryptjs';

const password = 'Admin123!@#';
const hash = '$2a$10$ubgByhB4zXhbeuoshgBiLO1yzE3ZUVb0u6ba8qJ2dz1BTCJhKvF0m';

async function verifyPassword() {
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('Is valid:', isValid);

    if (isValid) {
      console.log('✅ Password matches hash!');
    } else {
      console.log('❌ Password does NOT match hash!');

      // Generate new hash
      console.log('\nGenerating new hash...');
      const newHash = await bcrypt.hash(password, 10);
      console.log('New hash:', newHash);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyPassword();

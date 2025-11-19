/**
 * Job Alerts Test Script
 *
 * Usage:
 *   npx tsx scripts/test-job-alerts.ts [email]
 *
 * Examples:
 *   npx tsx scripts/test-job-alerts.ts                    # Test with default email
 *   npx tsx scripts/test-job-alerts.ts user@example.com  # Test with specific email
 *
 * Requirements:
 *   - RESEND_API_KEY environment variable must be set
 *   - FROM_EMAIL environment variable (optional, uses default)
 */

import { sendTestJobAlert } from '@/lib/email/job-alerts';

async function main() {
  // Get email from command line args or use default
  const testEmail = process.argv[2] || process.env.TEST_EMAIL;

  if (!testEmail) {
    console.error('❌ Error: No email address provided');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/test-job-alerts.ts <email>');
    console.log('\nExample:');
    console.log('  npx tsx scripts/test-job-alerts.ts user@example.com');
    process.exit(1);
  }

  // Check for required environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Error: RESEND_API_KEY environment variable not set');
    console.log('\nPlease add to .env.local:');
    console.log('  RESEND_API_KEY=re_xxxxx');
    process.exit(1);
  }

  console.log('🚀 Testing Job Alerts Email System\n');
  console.log('Configuration:');
  console.log(`  Recipient: ${testEmail}`);
  console.log(
    `  From: ${process.env.FROM_EMAIL || 'jobs@aijobx.com (default)'}`
  );
  console.log(
    `  API Key: ${process.env.RESEND_API_KEY.slice(0, 10)}...${process.env.RESEND_API_KEY.slice(-4)}\n`
  );

  console.log('📧 Sending test email...');

  try {
    const result = await sendTestJobAlert(testEmail);

    if (result.success) {
      console.log('\n✅ Test email sent successfully!\n');
      console.log('Next steps:');
      console.log('  1. Check your inbox for the test email');
      console.log('  2. Verify the email displays correctly');
      console.log('  3. Check spam folder if not in inbox');
      console.log('  4. Review email in Resend Dashboard > Logs\n');
      console.log(
        `Dashboard: https://resend.com/emails (filter by: ${testEmail})\n`
      );
    } else {
      console.error('\n❌ Failed to send test email\n');
      console.error('Error:', result.error);
      console.log('\nTroubleshooting:');
      console.log('  1. Check RESEND_API_KEY is valid');
      console.log('  2. Verify FROM_EMAIL domain is verified in Resend');
      console.log('  3. Check Resend Dashboard > Logs for details');
      console.log('  4. Ensure recipient email is valid\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

main();

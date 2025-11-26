/**
 * Master Baseline Collection Script
 *
 * Runs all baseline collection scripts in sequence and generates
 * a comprehensive baseline report.
 *
 * Usage: npm run baseline:collect
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface BaselineStatus {
  lighthouse: 'pending' | 'running' | 'completed' | 'failed';
  database: 'pending' | 'running' | 'completed' | 'failed';
  userResearch: 'pending' | 'skipped' | 'completed';
}

const status: BaselineStatus = {
  lighthouse: 'pending',
  database: 'pending',
  userResearch: 'pending',
};

function printHeader(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
}

function printStatus(step: string, state: 'running' | 'completed' | 'failed' | 'skipped') {
  const emoji = {
    running: '🔄',
    completed: '✅',
    failed: '❌',
    skipped: '⏭️',
  };

  console.log(`${emoji[state]} ${step}: ${state.toUpperCase()}`);
}

async function checkDevServerRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000', {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}

function runScript(scriptPath: string, label: string): boolean {
  try {
    printStatus(label, 'running');
    execSync(`npx tsx ${scriptPath}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    printStatus(label, 'completed');
    return true;
  } catch (error) {
    console.error(`\n❌ ${label} failed:`, error);
    printStatus(label, 'failed');
    return false;
  }
}

function generateMasterReport() {
  const baselineDir = path.join(process.cwd(), 'docs', 'baseline');

  let report = `# Phase 0: Baseline Collection - Master Report\n\n`;
  report += `**Date**: ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Purpose**: Complete baseline before UI/UX redesign implementation\n\n`;
  report += `---\n\n`;

  // Status Summary
  report += `## Collection Status\n\n`;
  report += `| Component | Status |\n`;
  report += `|-----------|--------|\n`;
  report += `| Lighthouse Performance | ${status.lighthouse === 'completed' ? '✅ Complete' : status.lighthouse === 'failed' ? '❌ Failed' : '⏳ Pending'} |\n`;
  report += `| Database Metrics | ${status.database === 'completed' ? '✅ Complete' : status.database === 'failed' ? '❌ Failed' : '⏳ Pending'} |\n`;
  report += `| User Research | ${status.userResearch === 'completed' ? '✅ Complete' : status.userResearch === 'skipped' ? '⏭️ Manual Process' : '⏳ Pending'} |\n`;
  report += `\n---\n\n`;

  // Link to individual reports
  report += `## Individual Reports\n\n`;

  if (status.lighthouse === 'completed') {
    report += `### 📊 Performance Baseline\n\n`;
    report += `View detailed Lighthouse audit results:\n`;
    report += `- [Lighthouse Baseline Report](./lighthouse-baseline.md)\n`;
    report += `- HTML Reports: \`audits/\` directory\n\n`;
  }

  if (status.database === 'completed') {
    report += `### 📈 Database Metrics\n\n`;
    report += `View conversion funnel and user engagement metrics:\n`;
    report += `- [Database Baseline Report](./database-baseline.md)\n\n`;
  }

  report += `### 👥 User Research (Manual)\n\n`;
  report += `User interviews should be conducted according to:\n`;
  report += `- [User Interview Template](./user-interview-template.md)\n`;
  report += `- Target: 20 participants (10 teachers, 10 recruiters)\n`;
  report += `- Timeline: 1 week\n\n`;

  report += `---\n\n`;

  // Next Steps
  report += `## Next Steps\n\n`;
  report += `### Phase 0 Remaining Tasks\n\n`;
  report += `- [ ] Set up Testing Infrastructure (Vitest, Playwright, axe-core, Percy)\n`;
  report += `- [ ] Define Design System Standards (tokens, components, patterns)\n`;
  report += `- [ ] Conduct user interviews (20 participants)\n`;
  report += `- [ ] Establish monitoring dashboards\n\n`;

  report += `### Phase 1: Specification\n\n`;
  report += `Once Phase 0 is complete:\n`;
  report += `1. Review baseline metrics with stakeholders\n`;
  report += `2. Set improvement targets\n`;
  report += `3. Begin functional requirements specification\n`;
  report += `4. Create user stories and acceptance criteria\n\n`;

  report += `---\n\n`;
  report += `## File Locations\n\n`;
  report += `\`\`\`\n`;
  report += `docs/baseline/\n`;
  report += `├── MASTER_BASELINE.md              (this file)\n`;
  report += `├── lighthouse-baseline.md          (performance metrics)\n`;
  report += `├── lighthouse-baseline.json        (raw data)\n`;
  report += `├── database-baseline.md            (conversion funnel)\n`;
  report += `├── database-baseline.json          (raw data)\n`;
  report += `└── user-interview-template.md      (research guide)\n`;
  report += `\n`;
  report += `audits/\n`;
  report += `├── homepage-baseline.report.html\n`;
  report += `├── jobs-baseline.report.html\n`;
  report += `├── dashboard-baseline.report.html\n`;
  report += `└── profile-baseline.report.html\n`;
  report += `\`\`\`\n\n`;

  const reportPath = path.join(baselineDir, 'MASTER_BASELINE.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Master report saved to: ${reportPath}`);
}

async function main() {
  printHeader('Phase 0: Baseline Metrics Collection');

  console.log('This script will collect baseline metrics in the following order:\n');
  console.log('1. 📊 Lighthouse Performance Audits (requires dev server running)');
  console.log('2. 📈 Database Metrics (conversion funnel, user engagement)');
  console.log('3. 👥 User Research (manual process - template provided)\n');

  // Check if dev server is running for Lighthouse
  console.log('🔍 Checking if development server is running...');
  const serverRunning = await checkDevServerRunning();

  if (!serverRunning) {
    console.log('\n⚠️  Development server is not running on http://localhost:3000');
    console.log('Lighthouse audits will be skipped.');
    console.log('\nTo run Lighthouse audits:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Run: npm run baseline:lighthouse\n');
    status.lighthouse = 'failed';
  } else {
    console.log('✅ Development server detected\n');
  }

  printHeader('1. Lighthouse Performance Audits');

  if (serverRunning) {
    const lighthouseSuccess = runScript(
      'scripts/baseline/collect-lighthouse-baseline.ts',
      'Lighthouse Audits'
    );
    status.lighthouse = lighthouseSuccess ? 'completed' : 'failed';
  } else {
    printStatus('Lighthouse Audits', 'skipped');
  }

  printHeader('2. Database Metrics Collection');

  const dbSuccess = runScript(
    'scripts/baseline/collect-database-metrics.ts',
    'Database Metrics'
  );
  status.database = dbSuccess ? 'completed' : 'failed';

  printHeader('3. User Research');

  console.log('📋 User research is a manual process.');
  console.log('A template has been provided at:');
  console.log('   docs/baseline/user-interview-template.md\n');
  console.log('To conduct user interviews:');
  console.log('  1. Review the interview template');
  console.log('  2. Schedule 20 interviews (10 teachers, 10 recruiters)');
  console.log('  3. Document findings in docs/baseline/user-research-findings.md\n');
  status.userResearch = 'skipped';

  printHeader('Summary');

  generateMasterReport();

  console.log('\n📊 Baseline Collection Results:\n');
  console.log(`   Lighthouse: ${status.lighthouse === 'completed' ? '✅' : status.lighthouse === 'failed' ? '❌' : '⏭️'}`);
  console.log(`   Database: ${status.database === 'completed' ? '✅' : '❌'}`);
  console.log(`   User Research: ⏭️ (manual)\n`);

  if (status.lighthouse !== 'completed' && status.database !== 'completed') {
    console.log('⚠️  Some baseline collections failed. Review errors above.');
    process.exit(1);
  }

  console.log('✅ Baseline collection complete!');
  console.log('\n📂 Review reports in: docs/baseline/');
  console.log('📂 View detailed audits in: audits/\n');

  printHeader('Next Steps');
  console.log('1. Review baseline metrics with team');
  console.log('2. Set improvement targets');
  console.log('3. Set up testing infrastructure');
  console.log('4. Define design system standards');
  console.log('5. Begin Phase 1: Specification\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

/**
 * Lighthouse Baseline Collection Script
 *
 * Collects performance, accessibility, and best practices metrics
 * for all major pages in the application.
 *
 * Usage: npx tsx scripts/baseline/collect-lighthouse-baseline.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface LighthouseResult {
  page: string;
  url: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
}

const PAGES_TO_AUDIT = [
  { name: 'homepage', url: 'http://localhost:3000' },
  { name: 'jobs', url: 'http://localhost:3000/jobs' },
  { name: 'dashboard', url: 'http://localhost:3000/dashboard' },
  { name: 'profile', url: 'http://localhost:3000/profile/sample' },
];

const AUDITS_DIR = path.join(process.cwd(), 'audits');
const BASELINE_DIR = path.join(process.cwd(), 'docs', 'baseline');

async function ensureDirectories() {
  if (!fs.existsSync(AUDITS_DIR)) {
    fs.mkdirSync(AUDITS_DIR, { recursive: true });
  }
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
  }
}

function runLighthouse(url: string, outputPath: string): void {
  console.log(`\n🔍 Running Lighthouse audit for: ${url}`);

  try {
    execSync(
      `npx lighthouse ${url} ` +
      `--output html ` +
      `--output json ` +
      `--output-path "${outputPath}" ` +
      `--chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" ` +
      `--only-categories=performance,accessibility,best-practices,seo ` +
      `--quiet`,
      { stdio: 'inherit' }
    );
    console.log(`✅ Audit completed: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Lighthouse audit failed for ${url}:`, error);
    throw error;
  }
}

function parseResults(jsonPath: string, pageName: string): LighthouseResult {
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const report = JSON.parse(jsonContent);

  return {
    page: pageName,
    url: report.finalUrl,
    timestamp: report.fetchTime,
    scores: {
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      bestPractices: Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
    },
    metrics: {
      firstContentfulPaint: report.audits['first-contentful-paint'].numericValue,
      largestContentfulPaint: report.audits['largest-contentful-paint'].numericValue,
      totalBlockingTime: report.audits['total-blocking-time'].numericValue,
      cumulativeLayoutShift: report.audits['cumulative-layout-shift'].numericValue,
      speedIndex: report.audits['speed-index'].numericValue,
    },
  };
}

function generateMarkdownReport(results: LighthouseResult[]): string {
  const timestamp = new Date().toISOString().split('T')[0];

  let markdown = `# Lighthouse Baseline Report\n\n`;
  markdown += `**Date**: ${timestamp}\n`;
  markdown += `**Purpose**: Establish performance baseline before UI/UX redesign\n\n`;
  markdown += `---\n\n`;

  // Summary Table
  markdown += `## Summary\n\n`;
  markdown += `| Page | Performance | Accessibility | Best Practices | SEO |\n`;
  markdown += `|------|-------------|---------------|----------------|-----|\n`;

  results.forEach(result => {
    markdown += `| ${result.page} | ${result.scores.performance} | ${result.scores.accessibility} | ${result.scores.bestPractices} | ${result.scores.seo} |\n`;
  });

  markdown += `\n---\n\n`;

  // Detailed Metrics
  markdown += `## Core Web Vitals\n\n`;

  results.forEach(result => {
    markdown += `### ${result.page}\n\n`;
    markdown += `**URL**: ${result.url}\n\n`;
    markdown += `| Metric | Value | Status |\n`;
    markdown += `|--------|-------|--------|\n`;

    const fcp = result.metrics.firstContentfulPaint;
    const lcp = result.metrics.largestContentfulPaint;
    const tbt = result.metrics.totalBlockingTime;
    const cls = result.metrics.cumulativeLayoutShift;
    const si = result.metrics.speedIndex;

    markdown += `| First Contentful Paint (FCP) | ${(fcp / 1000).toFixed(2)}s | ${fcp < 1500 ? '✅' : '❌'} |\n`;
    markdown += `| Largest Contentful Paint (LCP) | ${(lcp / 1000).toFixed(2)}s | ${lcp < 2500 ? '✅' : '❌'} |\n`;
    markdown += `| Total Blocking Time (TBT) | ${tbt.toFixed(0)}ms | ${tbt < 200 ? '✅' : '❌'} |\n`;
    markdown += `| Cumulative Layout Shift (CLS) | ${cls.toFixed(3)} | ${cls < 0.1 ? '✅' : '❌'} |\n`;
    markdown += `| Speed Index | ${(si / 1000).toFixed(2)}s | ${si < 3400 ? '✅' : '❌'} |\n`;
    markdown += `\n`;
  });

  markdown += `---\n\n`;

  // Targets
  markdown += `## Target Metrics (Post-Redesign)\n\n`;
  markdown += `| Metric | Current Avg | Target | Improvement Needed |\n`;
  markdown += `|--------|-------------|--------|--------------------|\n`;

  const avgPerf = Math.round(results.reduce((sum, r) => sum + r.scores.performance, 0) / results.length);
  const avgA11y = Math.round(results.reduce((sum, r) => sum + r.scores.accessibility, 0) / results.length);
  const avgFCP = results.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / results.length;
  const avgLCP = results.reduce((sum, r) => sum + r.metrics.largestContentfulPaint, 0) / results.length;

  markdown += `| Performance Score | ${avgPerf} | 90+ | ${90 - avgPerf > 0 ? '+' + (90 - avgPerf) : '✅'} |\n`;
  markdown += `| Accessibility Score | ${avgA11y} | 100 | ${100 - avgA11y > 0 ? '+' + (100 - avgA11y) : '✅'} |\n`;
  markdown += `| FCP | ${(avgFCP / 1000).toFixed(2)}s | <1.5s | ${avgFCP > 1500 ? 'Needs improvement' : '✅'} |\n`;
  markdown += `| LCP | ${(avgLCP / 1000).toFixed(2)}s | <2.5s | ${avgLCP > 2500 ? 'Needs improvement' : '✅'} |\n`;

  markdown += `\n---\n\n`;
  markdown += `## Next Steps\n\n`;
  markdown += `1. Review detailed HTML reports in \`audits/\` directory\n`;
  markdown += `2. Prioritize improvements based on lowest scores\n`;
  markdown += `3. Establish monitoring to track improvements\n`;
  markdown += `4. Re-run audits after each major phase\n\n`;

  return markdown;
}

async function main() {
  console.log('🚀 Starting Lighthouse Baseline Collection\n');
  console.log('=' . repeat(50));

  await ensureDirectories();

  const results: LighthouseResult[] = [];

  for (const page of PAGES_TO_AUDIT) {
    const outputPath = path.join(AUDITS_DIR, `${page.name}-baseline`);

    try {
      runLighthouse(page.url, outputPath);

      const jsonPath = `${outputPath}.report.json`;
      const result = parseResults(jsonPath, page.name);
      results.push(result);

      console.log(`\n📊 Results for ${page.name}:`);
      console.log(`   Performance: ${result.scores.performance}`);
      console.log(`   Accessibility: ${result.scores.accessibility}`);
      console.log(`   Best Practices: ${result.scores.bestPractices}`);
      console.log(`   SEO: ${result.scores.seo}`);
    } catch (error) {
      console.error(`\n⚠️  Skipping ${page.name} due to error`);
    }
  }

  // Generate summary report
  const markdown = generateMarkdownReport(results);
  const reportPath = path.join(BASELINE_DIR, 'lighthouse-baseline.md');
  fs.writeFileSync(reportPath, markdown);

  // Save raw JSON
  const jsonPath = path.join(BASELINE_DIR, 'lighthouse-baseline.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('✅ Baseline collection complete!');
  console.log(`\n📄 Reports saved to:`);
  console.log(`   - ${reportPath}`);
  console.log(`   - ${jsonPath}`);
  console.log(`\n💡 View detailed HTML reports in: ${AUDITS_DIR}`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

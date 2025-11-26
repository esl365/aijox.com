import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Global Educator Nexus/i);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');

    // Check for hero elements
    const heroHeading = page.getByRole('heading', { level: 1 });
    await expect(heroHeading).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for navigation
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    // Check for key links
    const jobsLink = page.getByRole('link', { name: /jobs/i });
    await expect(jobsLink).toBeVisible();
  });

  test('should have no accessibility violations (axe-core)', async ({ page }) => {
    await page.goto('/');

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    // Check that mobile navigation exists
    const mobileMenu = page.getByLabel(/menu/i);
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('should navigate to jobs page', async ({ page }) => {
    await page.goto('/');

    // Click on jobs link
    await page.getByRole('link', { name: /jobs/i }).first().click();

    // Wait for navigation
    await page.waitForURL('**/jobs');

    // Check that we're on jobs page
    await expect(page).toHaveURL(/\/jobs/);
  });
});

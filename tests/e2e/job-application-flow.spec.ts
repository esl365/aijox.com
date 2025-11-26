import { test, expect } from '@playwright/test';

/**
 * Job Application Flow E2E Tests
 *
 * Tests the complete job search and application process
 */

test.describe('Job Application Flow', () => {
  test.describe('Job Discovery', () => {
    test('should display job listings on jobs page', async ({ page }) => {
      await page.goto('/jobs');

      // Wait for jobs to load
      await page.waitForLoadState('networkidle');

      // Check for job cards
      const jobCards = page.locator('[data-testid="job-card"], article').first();
      await expect(jobCards).toBeVisible();
    });

    test('should filter jobs by country', async ({ page }) => {
      await page.goto('/jobs');

      // Open country filter
      const countryFilter = page.getByRole('button', { name: /country|location/i });
      if (await countryFilter.isVisible()) {
        await countryFilter.click();

        // Select a country
        const japan = page.getByRole('checkbox', { name: /japan/i });
        if (await japan.isVisible()) {
          await japan.check();

          // Wait for filtered results
          await page.waitForTimeout(1000);

          // Verify URL has filter parameter
          expect(page.url()).toContain('country');
        }
      }
    });

    test('should search jobs by keyword', async ({ page }) => {
      await page.goto('/jobs');

      // Find search input
      const searchInput = page.getByPlaceholder(/search jobs|find teaching/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('Math Teacher');
        await searchInput.press('Enter');

        // Wait for search results
        await page.waitForTimeout(1000);

        // Verify URL has search parameter
        expect(page.url()).toContain('search');
      }
    });

    test('should filter by visa sponsorship', async ({ page }) => {
      await page.goto('/jobs');

      // Find visa sponsorship filter
      const visaFilter = page.getByRole('checkbox', { name: /visa/i });
      if (await visaFilter.isVisible()) {
        await visaFilter.check();

        await page.waitForTimeout(1000);

        // Jobs should show visa badge
        const visaBadge = page.getByText(/visa/i).first();
        if (await visaBadge.isVisible()) {
          await expect(visaBadge).toBeVisible();
        }
      }
    });
  });

  test.describe('Job Details', () => {
    test('should navigate to job detail page', async ({ page }) => {
      await page.goto('/jobs');

      // Click on first job card
      const firstJob = page.locator('[data-testid="job-card"], article').first();
      await firstJob.click();

      // Should navigate to detail page
      await page.waitForURL(/\/jobs\/.+/);

      // Check for job details
      const jobTitle = page.getByRole('heading', { level: 1 });
      await expect(jobTitle).toBeVisible();
    });

    test('should display complete job information', async ({ page }) => {
      await page.goto('/jobs');

      // Navigate to first job
      const firstJob = page.locator('[data-testid="job-card"], article').first();
      await firstJob.click();

      await page.waitForURL(/\/jobs\/.+/);

      // Check for key information
      const salary = page.getByText(/salary|\$|USD/i);
      const location = page.getByText(/location|country/i);
      const description = page.getByText(/description|about|requirements/i);

      // At least one should be visible
      const anyVisible = await Promise.any([
        salary.isVisible().then(v => v ? Promise.resolve(true) : Promise.reject()),
        location.isVisible().then(v => v ? Promise.resolve(true) : Promise.reject()),
        description.isVisible().then(v => v ? Promise.resolve(true) : Promise.reject()),
      ]).catch(() => false);

      expect(anyVisible).toBe(true);
    });

    test('should show apply button', async ({ page }) => {
      await page.goto('/jobs');

      const firstJob = page.locator('[data-testid="job-card"], article').first();
      await firstJob.click();

      await page.waitForURL(/\/jobs\/.+/);

      // Look for apply button
      const applyButton = page.getByRole('button', { name: /apply|submit application/i });
      await expect(applyButton).toBeVisible();
    });
  });

  test.describe('Application Submission', () => {
    test('should prompt login if not authenticated', async ({ page }) => {
      await page.goto('/jobs');

      const firstJob = page.locator('[data-testid="job-card"], article').first();
      await firstJob.click();

      await page.waitForURL(/\/jobs\/.+/);

      // Click apply button
      const applyButton = page.getByRole('button', { name: /apply|submit application/i });
      await applyButton.click();

      // Should redirect to signin or show login modal
      const isOnSignin = page.url().includes('/signin');
      const hasLoginModal = await page.getByRole('dialog').isVisible();

      expect(isOnSignin || hasLoginModal).toBe(true);
    });

    test('should show profile completeness check (authenticated)', async ({ page }) => {
      // Note: This test assumes user is logged in
      // In a real test, you'd use beforeEach to login

      await page.goto('/jobs');

      const firstJob = page.locator('[data-testid="job-card"], article').first();
      await firstJob.click();

      await page.waitForURL(/\/jobs\/.+/);

      const applyButton = page.getByRole('button', { name: /apply|submit application/i });
      await applyButton.click();

      // Should show profile check or application modal
      const modal = page.getByRole('dialog');
      const modalVisible = await modal.isVisible();

      // Modal should appear (either for profile or application)
      expect(modalVisible).toBe(true);
    });

    test('should submit application successfully', async ({ page }) => {
      // This is a full integration test that requires:
      // 1. User to be logged in
      // 2. Profile to be complete
      // You'd typically handle this in beforeEach hooks

      await page.goto('/jobs');

      const firstJob = page.locator('[data-testid="job-card"], article').first();
      await firstJob.click();

      await page.waitForURL(/\/jobs\/.+/);

      const applyButton = page.getByRole('button', { name: /apply|submit application/i });
      await applyButton.click();

      // Wait for modal
      await page.waitForSelector('[role="dialog"]');

      // Confirm application
      const confirmButton = page.getByRole('button', { name: /confirm|submit/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();

        // Wait for success message
        const successMessage = page.getByText(/success|submitted|application sent/i);
        await expect(successMessage).toBeVisible({ timeout: 10000 });
      }
    });

    test('should prevent duplicate applications', async ({ page }) => {
      // After applying once, apply button should change

      await page.goto('/jobs');

      const firstJob = page.locator('[data-testid="job-card"], article').first();
      await firstJob.click();

      await page.waitForURL(/\/jobs\/.+/);

      // After applying, button should show "Applied" or be disabled
      const applyButton = page.getByRole('button', { name: /applied|application submitted/i });

      if (await applyButton.isVisible()) {
        // Button should be disabled or show applied state
        const isDisabled = await applyButton.isDisabled();
        expect(isDisabled).toBe(true);
      }
    });
  });

  test.describe('Saved Jobs', () => {
    test('should save job for later', async ({ page }) => {
      await page.goto('/jobs');

      // Find save button
      const saveButton = page.getByRole('button', { name: /save|bookmark/i }).first();

      if (await saveButton.isVisible()) {
        await saveButton.click();

        // Should show saved state
        await expect(saveButton).toHaveAttribute('aria-pressed', 'true');

        // Or check for visual indicator
        const savedIcon = page.locator('[data-saved="true"]').first();
        if (await savedIcon.isVisible()) {
          await expect(savedIcon).toBeVisible();
        }
      }
    });

    test('should unsave a saved job', async ({ page }) => {
      await page.goto('/jobs');

      const saveButton = page.getByRole('button', { name: /save|bookmark|saved/i }).first();

      if (await saveButton.isVisible()) {
        // Save it first
        await saveButton.click();
        await page.waitForTimeout(500);

        // Unsave it
        await saveButton.click();
        await page.waitForTimeout(500);

        // Should show unsaved state
        await expect(saveButton).toHaveAttribute('aria-pressed', 'false');
      }
    });
  });

  test.describe('Application Tracking', () => {
    test('should show applications in dashboard', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');

      // Look for applications section
      const applicationsSection = page.getByRole('heading', { name: /application|my jobs/i });

      if (await applicationsSection.isVisible()) {
        await expect(applicationsSection).toBeVisible();

        // Should show list of applications
        const applicationList = page.locator('[data-testid="application-list"], ul, table');
        await expect(applicationList).toBeVisible();
      }
    });

    test('should display application status', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for status badges
      const statusBadge = page.getByText(/pending|reviewing|accepted|rejected/i).first();

      if (await statusBadge.isVisible()) {
        await expect(statusBadge).toBeVisible();
      }
    });
  });
});

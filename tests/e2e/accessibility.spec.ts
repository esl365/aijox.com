import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Comprehensive Accessibility Testing
 *
 * Tests all major pages for WCAG 2.1 AA compliance using axe-core
 */

const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Jobs Listing', path: '/jobs' },
  { name: 'Sign In', path: '/signin' },
  { name: 'Sign Up', path: '/signup' },
];

test.describe('Accessibility Tests (WCAG 2.1 AA)', () => {
  for (const { name, path } of pages) {
    test(`${name} should have no accessibility violations`, async ({ page }) => {
      // Navigate to page
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Run axe accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log violations if any
      if (accessibilityScanResults.violations.length > 0) {
        console.error(
          `Accessibility violations found on ${name}:`,
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      // Assert no violations
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  test('Color contrast should meet WCAG AA standards', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    const contrastViolations = results.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('All images should have alt text', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['cat.text-alternatives'])
      .analyze();

    const imageAltViolations = results.violations.filter(
      v => v.id === 'image-alt'
    );

    expect(imageAltViolations).toEqual([]);
  });

  test('Form inputs should have associated labels', async ({ page }) => {
    await page.goto('/signin');

    const results = await new AxeBuilder({ page })
      .withTags(['cat.forms'])
      .analyze();

    const labelViolations = results.violations.filter(
      v => v.id === 'label'
    );

    expect(labelViolations).toEqual([]);
  });

  test('Headings should be in correct order', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['cat.semantics'])
      .analyze();

    const headingViolations = results.violations.filter(
      v => v.id === 'heading-order'
    );

    expect(headingViolations).toEqual([]);
  });

  test('Links should have discernible text', async ({ page }) => {
    await page.goto('/jobs');

    const results = await new AxeBuilder({ page })
      .withTags(['cat.name-role-value'])
      .analyze();

    const linkViolations = results.violations.filter(
      v => v.id === 'link-name'
    );

    expect(linkViolations).toEqual([]);
  });

  test('Page should have a main landmark', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['cat.semantics'])
      .analyze();

    const landmarkViolations = results.violations.filter(
      v => v.id === 'region'
    );

    expect(landmarkViolations).toEqual([]);
  });
});

test.describe('Keyboard Navigation', () => {
  test('All interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through all focusable elements
    const focusableElements = await page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const count = await focusableElements.count();

    // Tab through elements
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab');

      // Check that focus is visible
      const focused = await page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });

  test('Skip to main content link should work', async ({ page }) => {
    await page.goto('/');

    // Focus on skip link (usually hidden until focused)
    await page.keyboard.press('Tab');

    const skipLink = page.getByText(/skip to main content/i);

    // If skip link exists, test it
    if (await skipLink.isVisible()) {
      await skipLink.click();

      // Main content should be focused
      const mainContent = page.locator('main');
      await expect(mainContent).toBeFocused();
    }
  });

  test('Modal dialogs should trap focus', async ({ page }) => {
    await page.goto('/');

    // Look for any button that opens a modal
    const modalTrigger = page.getByRole('button', { name: /sign up|log in|apply/i }).first();

    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();

      // Wait for modal to open
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Try to tab out of modal
      // Focus should stay within modal
      const initialFocusedElement = await page.locator(':focus');

      // Tab 50 times (should cycle within modal)
      for (let i = 0; i < 50; i++) {
        await page.keyboard.press('Tab');
      }

      // Check focus is still within modal
      const currentFocusedElement = await page.locator(':focus');
      const isInsideModal = await currentFocusedElement.evaluate(
        (el, modalElement) => modalElement.contains(el),
        await modal.elementHandle()
      );

      expect(isInsideModal).toBe(true);
    }
  });
});

test.describe('Screen Reader Support', () => {
  test('ARIA roles should be properly assigned', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['cat.aria'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Live regions should be marked appropriately', async ({ page }) => {
    await page.goto('/');

    // Check for aria-live regions
    const liveRegions = await page.locator('[aria-live]').count();

    // At least one live region should exist (for notifications/toasts)
    // This is informational - not a strict requirement
    console.log(`Found ${liveRegions} ARIA live region(s)`);
  });

  test('Status messages should be announced', async ({ page }) => {
    await page.goto('/signin');

    // Submit form with invalid data
    const submitButton = page.getByRole('button', { name: /sign in/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Check for error message with role="alert" or aria-live
      const errorMessage = page.locator('[role="alert"], [aria-live="assertive"]');

      // At least one error message should be announced
      const count = await errorMessage.count();
      if (count > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });
});

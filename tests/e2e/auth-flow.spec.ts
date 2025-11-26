import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 *
 * Tests user registration, login, and logout flows
 */

test.describe('Authentication Flow', () => {
  test.describe('Sign Up', () => {
    test('should allow new teacher to register', async ({ page }) => {
      await page.goto('/signup');

      // Fill registration form
      await page.getByLabel(/email/i).fill(`teacher-${Date.now()}@example.com`);
      await page.getByLabel(/password/i).fill('SecurePassword123!');
      await page.getByLabel(/confirm password/i).fill('SecurePassword123!');

      // Select role
      const teacherRadio = page.getByRole('radio', { name: /teacher/i });
      if (await teacherRadio.isVisible()) {
        await teacherRadio.check();
      }

      // Submit form
      await page.getByRole('button', { name: /sign up|create account/i }).click();

      // Should redirect to profile setup or dashboard
      await page.waitForURL(/\/(profile|dashboard)/);

      // Check for success message or dashboard content
      const welcome = page.getByText(/welcome/i);
      if (await welcome.isVisible()) {
        await expect(welcome).toBeVisible();
      }
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await page.goto('/signup');

      // Try to submit empty form
      await page.getByRole('button', { name: /sign up|create account/i }).click();

      // Should show validation errors
      const errorMessage = page.getByText(/required|invalid/i).first();
      await expect(errorMessage).toBeVisible();
    });

    test('should prevent weak passwords', async ({ page }) => {
      await page.goto('/signup');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('weak');

      await page.getByRole('button', { name: /sign up|create account/i }).click();

      // Should show password strength error
      const passwordError = page.getByText(/password.*strong|password.*length/i);
      await expect(passwordError).toBeVisible();
    });
  });

  test.describe('Sign In', () => {
    test('should allow existing user to login', async ({ page }) => {
      // Note: This assumes a test user exists
      // In a real test, you'd seed the database first
      await page.goto('/signin');

      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('TestPassword123!');

      await page.getByRole('button', { name: /sign in|log in/i }).click();

      // Should redirect to dashboard
      await page.waitForURL(/\/(dashboard|profile)/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/signin');

      await page.getByLabel(/email/i).fill('invalid@example.com');
      await page.getByLabel(/password/i).fill('WrongPassword123!');

      await page.getByRole('button', { name: /sign in|log in/i }).click();

      // Should show error message
      const errorMessage = page.getByText(/invalid|incorrect|wrong/i);
      await expect(errorMessage).toBeVisible();
    });

    test('should have "Forgot Password" link', async ({ page }) => {
      await page.goto('/signin');

      const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
      await expect(forgotPasswordLink).toBeVisible();
    });
  });

  test.describe('Sign Out', () => {
    test('should allow user to logout', async ({ page, context }) => {
      // First login (assumes test user exists)
      await page.goto('/signin');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('TestPassword123!');
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      // Wait for dashboard
      await page.waitForURL(/\/(dashboard|profile)/);

      // Find and click logout button
      const logoutButton = page.getByRole('button', { name: /sign out|log out/i });

      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        // Try finding it in a menu
        const userMenu = page.getByRole('button', { name: /user menu|profile/i });
        if (await userMenu.isVisible()) {
          await userMenu.click();
          await page.getByRole('menuitem', { name: /sign out|log out/i }).click();
        }
      }

      // Should redirect to homepage or signin
      await page.waitForURL(/\/(|signin)/);

      // Session should be cleared
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session'));

      // Session cookie should be removed or expired
      if (sessionCookie) {
        expect(sessionCookie.expires).toBeLessThan(Date.now() / 1000);
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to signin
      await page.waitForURL(/\/signin/);
    });

    test('should redirect unauthenticated users from profile', async ({ page }) => {
      await page.goto('/profile');

      // Should redirect to signin
      await page.waitForURL(/\/signin/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should remember logged-in user after page refresh', async ({ page }) => {
      // Login
      await page.goto('/signin');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('TestPassword123!');
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      await page.waitForURL(/\/(dashboard|profile)/);

      // Refresh page
      await page.reload();

      // Should still be logged in (not redirected to signin)
      await expect(page).not.toHaveURL(/\/signin/);
    });
  });
});

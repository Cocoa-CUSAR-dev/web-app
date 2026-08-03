import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Login Test', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill('admin');
    await page.getByRole('textbox', { name: 'password' }).fill('Password123!');
    await page.getByRole('checkbox').click();
    await Promise.all([
      page.waitForURL(/\/dashboard$/),
      page.getByRole('button', { name: 'Log In' }).click(),
    ]);
    await expect(page.locator('#desktop-navbar-profile-button')).toBeVisible();
  });

  test('Logout Test', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill('admin');
    await page.getByRole('textbox', { name: 'password' }).fill('Password123!');
    await page.getByRole('checkbox').click();
    await Promise.all([
      page.waitForURL(/\/dashboard$/),
      page.getByRole('button', { name: 'Log In' }).click(),
    ]);
    await page.locator('#desktop-navbar-profile-button').click();
    await page.getByRole('button', { name: 'Log Out' }).click();
    await expect(page.getByText('Researcher Login')).toBeVisible();
  });

});
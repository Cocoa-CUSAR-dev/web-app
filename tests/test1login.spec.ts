import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Login Test', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill('admin');
    await page.getByRole('textbox', { name: 'password' }).fill('Password123!');
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.locator('.mui-53g0n7-MuiButtonBase-root-MuiIconButton-root')).toBeVisible();
  });

  test('Logout Test', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill('admin');
    await page.getByRole('textbox', { name: 'password' }).fill('Password123!');
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.getByRole('navigation').filter({ hasText: 'Reseacher' }).getByRole('button').click();
    await page.getByRole('button', { name: 'Log Out' }).click();
    await expect(page.getByText('Researcher Login')).toBeVisible();
  });

});
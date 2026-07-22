import { test, expect } from '@playwright/test';

test.describe('Map Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill('admin');
    await page.getByRole('textbox', { name: 'password' }).fill('Password123!');
    await page.getByRole('button', { name: 'Log In' }).click();
  });

  test('Map Render Test', async ({ page }) => {
    await page.getByRole('link', { name: 'map' }).click();
    await expect(page.locator('div').filter({ hasText: 'Dashboard/Map' }).nth(4)).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'dashboardmapMonthly DataGroup' }).nth(3)).toBeVisible();
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible();
  });

  test('Province Info Test', async ({ page }) => {
    await page.getByRole('link', { name: 'map' }).click();
    await page.getByRole('region', { name: 'Map' }).click({
      position: {
        x: 543,
        y: 98
      }
    });
    await expect(page.getByRole('heading', { name: 'ปทุมธานี', level: 6 })).toBeVisible();
    await page.getByRole('button').nth(5).click();
    await expect(page.getByRole('heading', { name: 'ปทุมธานี', level: 6 })).toBeVisible();
  });

});
import { test, expect } from '@playwright/test';

test.describe('Map Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill('admin');
    await page.getByRole('textbox', { name: 'password' }).fill('Password123!');
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Log In' }).click();
  });

  test('Map Render Test', async ({ page }) => {
    await page.getByRole('link', { name: 'map' }).click();
    await expect(page.locator('div').filter({ hasText: 'Dashboard/Map' }).nth(4)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Harvest Data' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'User Data' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Map' })).toBeVisible();
  });

  test('Province Info Test', async ({ page }) => {
    await page.getByRole('link', { name: 'map' }).click();
    const mapRegion = page.getByRole('region', { name: 'Map' });
    await mapRegion.waitFor();
    // Give the province geojson layer time to load before it's clickable.
    await page.waitForTimeout(1000);
    const box = await mapRegion.boundingBox();
    // Click near the center of the map, where Pathum Thani sits by default
    // (a fixed pixel offset drifts whenever surrounding layout changes).
    await mapRegion.click({
      position: {
        x: (box?.width ?? 0) * 0.5,
        y: (box?.height ?? 0) * 0.3,
      },
    });
    await expect(page.getByRole('heading', { name: 'ปทุมธานี', level: 6 })).toBeVisible();
    await page.getByRole('button').nth(5).click();
    await expect(page.getByRole('heading', { name: 'ปทุมธานี', level: 6 })).toBeVisible();
  });

});
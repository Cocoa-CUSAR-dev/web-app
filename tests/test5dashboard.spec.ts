import { test, expect } from '@playwright/test';

import { E2E_PASSWORD, E2E_USERNAME } from './testUtils/e2eCredentials';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill(E2E_USERNAME);
    await page.getByRole('textbox', { name: 'password' }).fill(E2E_PASSWORD);
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Log In' }).click();
    // The breadcrumb's current-page item renders as plain text, not a link
    // (see CustomBreadcrumbs.tsx -- the last segment gets no href), so this
    // matches the breadcrumb container itself rather than a link role.
    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toBeVisible();
  });

  test('Dashboard Render Test', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Harvest Data' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'User Data' })).toBeVisible();
    await expect(page.getByText('Harvest DataAllDeltaSumAverageFrequency')).toBeVisible();
    await expect(page.getByText('2023202420252026Harvest Weight per Month in 20262023202420252026Running Total')).toBeVisible();
    await expect(page.getByText('User DataAllDeltaSum')).toBeVisible();
    await expect(page.getByText('2023202420252026New User per Month in 20262023202420252026Running Total User')).toBeVisible();
  });

  test('Harvest Data Render Test', async ({ page }) => {
    await expect(page.getByText('Harvest Weight per Month in 2026', { exact: true })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Delta', checked: true }).first().uncheck();
    await expect(page.getByText('Harvest Weight per Month in 2026', { exact: true })).toBeHidden();

    await expect(page.getByText('Running Total Harvest Weight')).toBeVisible();
    await page.getByRole('checkbox', { name: 'Sum', checked: true }).first().uncheck();
    await expect(page.getByText('Running Total Harvest Weight')).toBeHidden();

    await expect(page.getByText('Average Harvest Weight per Month in 2026')).toBeVisible();
    await page.getByRole('checkbox', { name: 'Average', checked: true }).uncheck();
    await expect(page.getByText('Average Harvest Weight per Month in 2026')).toBeHidden();

    await expect(page.getByText('Number of Harvests per Month in')).toBeVisible();
    await page.getByRole('checkbox', { name: 'Frequency', checked: true }).uncheck();
    await expect(page.getByText('Number of Harvests per Month in')).toBeHidden();

    await page.getByRole('checkbox', { name: 'All', checked: false }).first().check();
    await expect(page.getByText('Number of Harvests per Month in')).toBeVisible();
    await expect(page.getByText('Average Harvest Weight per Month in 2026')).toBeVisible();
    await expect(page.getByText('Running Total Harvest Weight')).toBeVisible();
    await expect(page.getByText('Harvest Weight per Month in 2026', { exact: true })).toBeVisible();
  });

   test('User Data Render Test', async ({ page }) => {
    await expect(page.getByText('New User per Month in 2026', { exact: true })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Number of user registered' }).uncheck();
    await expect(page.getByText('New User per Month in 2026', { exact: true })).toBeHidden();

    await expect(page.getByText('Running Total User per Month in 2026')).toBeVisible();
    await page.getByRole('checkbox', { name: 'Running total of user in the' }).uncheck();
    await expect(page.getByText('Running Total User per Month in 2026')).toBeHidden();


    await page.getByRole('checkbox', { name: 'Select of unselect every' }).check();
    await expect(page.getByText('New User per Month in 2026', { exact: true })).toBeVisible();
    await expect(page.getByText('Running Total User per Month in 2026')).toBeVisible();
  });

   test(' Data Year Change Test', async ({ page }) => {
    await page.getByRole('button', { name: '2024' }).first().click();
    await expect(page.getByText('Harvest Weight per Month in 2024', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '2024' }).nth(1).click();
      await expect(page.getByText('Running Total Harvest Weight per Month in 2024', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '2024' }).nth(2).click();
    await expect(page.getByText('Average Harvest Weight per Month in 2024', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '2024' }).nth(3).click();
    await expect(page.getByText('Number of Harvests per Month in 2024', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '2024' }).nth(4).click();
    await expect(page.getByText('New User per Month in 2024', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '2024' }).nth(5).click();
    await expect(page.getByText('Running Total User per Month in 2024', { exact: true })).toBeVisible();
  });

});
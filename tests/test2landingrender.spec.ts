import { test, expect } from '@playwright/test';

import { E2E_PASSWORD, E2E_USERNAME } from './testUtils/e2eCredentials';

test.describe('Landing Page Tests', () => {
  test.beforeEach(async ({ page }) => {
      await page.goto('/');
  });
  test('Heading Render Test', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Enhance Craft Chocolate', exact: true })).toBeVisible();
    await expect(page.getByText('Market in Thailand', { exact: true })).toBeVisible();
  });

  test('Subtext Render Test', async ({ page }) => {
    await expect(page.getByText(/research platform built with ISTC and Chulalongkorn University/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enhance Craft Chocolate Market' })).toBeVisible();
    await expect(page.getByText(/^Empowering Thailand's craft cocoa market/)).toBeVisible();
  });


  test('Social Media Links Render Test', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Facebook', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'X', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Instagram', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'YouTube', exact: true })).toBeVisible();
  });


    test('Pages Render Test', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Pages' })).toBeVisible();
  });

  test.describe('Footer Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
      await page.getByRole('textbox', { name: 'email' }).fill(E2E_USERNAME);
      await page.getByRole('textbox', { name: 'password' }).fill(E2E_PASSWORD);
      await page.getByRole('checkbox').click();
      await Promise.all([
        page.waitForURL(/\/dashboard$/),
        page.getByRole('button', { name: 'Log In' }).click(),
      ]);
      await page.goto('/');
    });

    test('Dashboard Navigation', async ({ page }) => {
      await Promise.all([
        page.waitForURL(/\/dashboard$/),
        page.getByRole('contentinfo').getByRole('link', { name: 'Dashboard' }).click(),
      ]);
      await expect(page).toHaveURL(/\/dashboard$/);
    });

    test('Form Navigation', async ({ page }) => {
      await Promise.all([
        page.waitForURL(/\/form$/),
        page.getByRole('contentinfo').getByRole('link', { name: 'Form' }).click(),
      ]);
      await expect(page).toHaveURL(/\/form$/);
    });
  });

  test('Other Footer Render Test', async ({ page }) => {
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Log In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms of Use' })).toBeVisible();
  });


  test('Contact Section Render Test', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
    // Plain text for now: the old links pointed at /dashboard, /form and
    // /auth; real partner URLs are still to be provided.
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByText('Chulalongkorn University', { exact: true })).toBeVisible();
    await expect(footer.getByText('ISTC', { exact: true })).toBeVisible();
    await expect(footer.getByText('Chula Engineering', { exact: true })).toBeVisible();
  });

});

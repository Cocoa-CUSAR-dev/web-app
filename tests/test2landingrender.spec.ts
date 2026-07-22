import { test, expect } from '@playwright/test';

test.describe('Landing Page Tests', () => {
  test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/');
  });
  test('Heading Render Test', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Enhance', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Craft Chocolate Market', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'In Thailand' })).toBeVisible();
  });

  test('Subtext Render Test', async ({ page }) => {
    await expect(page.getByText('with ISTC and Chulalongkorn')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enhance Craft Chocolate Market' })).toBeVisible();
    await expect(page.getByText('Empowering and enhancing')).toBeVisible();
  });


  test('Social Media Links Render Test', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'X Logo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Instagram Logo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'YouTube Logo' })).toBeVisible();
  });


    test('Pages Render Test', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Pages' })).toBeVisible();
  });

  test.describe('Footer Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3002/');
      await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
      await page.getByRole('textbox', { name: 'email' }).fill('admin');
      await page.getByRole('textbox', { name: 'password' }).fill('Password123!');
      await page.getByRole('button', { name: 'Log In' }).click();
      await page.goto('http://localhost:3002/');
    });

  

    test('Dashboard Navigation', async ({ page }) => {
      await Promise.all([
        page.waitForURL('http://localhost:3002/dashboard'),
        page.getByRole('contentinfo').getByRole('link', { name: 'Dashboard' }).click(),
      ]);
      await expect(page).toHaveURL('http://localhost:3002/dashboard');
    });

    test('Form Navigation', async ({ page }) => {
      await Promise.all([
        page.waitForURL('http://localhost:3002/form'),
        page.getByRole('link', { name: 'Form' }).click(),
      ]);
      await expect(page).toHaveURL('http://localhost:3002/form');
    });

  
  });

  test('Other Footer Render Test', async ({ page }) => {
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Log In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms of Use' })).toBeVisible();
  });


  test('Contact Section Render Test', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chulalongkorn University' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ISTC' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chula Engineering' })).toBeVisible();
  });

});
import { test, expect } from '@playwright/test';

import { E2E_PASSWORD, E2E_USERNAME } from './testUtils/e2eCredentials';

test.describe('Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'email' }).fill(E2E_USERNAME);
    await page.getByRole('textbox', { name: 'password' }).fill(E2E_PASSWORD);
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Log In' }).click();
  });

  test.describe('Form Page Render', () => {
    test('Form Main Page Render Test', async ({ page }) => {
      await page.getByRole('link', { name: 'Form' }).click();
      await expect(page.locator('div').filter({ hasText: /^Form$/ })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Form' })).toBeVisible();
      await expect(page.getByText('Currently, there are three')).toBeVisible();
      await expect(page.getByText('Links for activies that can')).toBeVisible();
      await expect(page.getByRole('listitem').filter({ hasText: 'Form Create—for creating a new form' })).toBeVisible();
      await expect(page.getByRole('listitem').filter({ hasText: 'Form Edit—for viewing current' })).toBeVisible();
      await expect(page.getByRole('listitem').filter({ hasText: 'Form Viewer—for viewing form' })).toBeVisible();
    });

    test('Form Edit Navigation', async ({ page }) => {
      await page.getByRole('link', { name: 'Form' }).click();
      await page.getByRole('link', { name: 'Form Edit' }).click();
      await expect(page.getByRole('heading', { name: 'Form Edit' })).toBeVisible();
    });

    test('Form Viewer Navigation', async ({ page }) => {
      await page.getByRole('link', { name: 'Form' }).click();
      await page.getByRole('link', { name: 'Form Edit' }).click();
      await page.getByLabel('breadcrumb').getByRole('link', { name: 'Form' }).click();
      await expect(page.getByRole('heading', { name: 'Form' })).toBeVisible();
      await page.getByRole('link', { name: 'Form Viewer' }).click();
      await expect(page.getByRole('heading', { name: 'Form Viewer' })).toBeVisible();
      //await expect(page.getByRole('button', { name: 'Form Response CSV' })).toBeVisible();
    });
  });

  test.describe('Form Edit', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('link', { name: 'Form' }).click();
      await page.getByRole('link', { name: 'Form Edit' }).click();
    });

    test('Form Edit Render Test with no Active Form', async ({ page }) => {
      await expect(page.getByText('Form Edit', { exact: true })).toBeVisible();
      await expect(page.getByText('กรุณาเลือกฟอร์ม', { exact: true })).toBeVisible();
    });

    test('Form Edit Render Test with Active Form', async ({ page }) => {
      await page.getByRole('combobox', { name: 'Form' }).click();
      await page.getByRole('option', { name: 'จดกิจกรรมในสวน' }).click();
      await expect(page.getByText('successfully loaded')).toBeVisible();
      await expect(page.getByText('Section: processing_record')).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Form' }).getByRole('paragraph')).toBeVisible();
      await expect(page.getByText('Field')).toBeVisible();
      await expect(page.getByText('Description')).toBeVisible();
    });

    test('Form Edit Save Test', async ({ page }) => {
      await page.getByRole('combobox', { name: 'Form' }).click();
      await page.getByRole('option', { name: 'จดกิจกรรมในสวน' }).click();

      const inactiveBtn = page.getByRole('button', { name: 'Inactive' }).first();
      const optionalBtn = page.getByRole('button', { name: 'Optional' }).nth(1);

      await inactiveBtn.click();
      await optionalBtn.click();
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText('successfully submitted an edit')).toBeVisible();

      await page.reload();
      await page.getByRole('combobox', { name: 'Form' }).click();
      await page.getByRole('option', { name: 'จดกิจกรรมในสวน' }).click();

      await expect(inactiveBtn).toHaveAttribute('aria-pressed', 'true');
      await expect(optionalBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('Form Edit Save Test 2', async ({ page }) => {
      await page.getByRole('combobox', { name: 'Form' }).click();
      await page.getByRole('option', { name: 'จดกิจกรรมในสวน' }).click();

      const activeBtn = page.getByRole('button', { name: 'Active' }).nth(1);
      const requiredBtn = page.getByRole('button', { name: 'Required' }).nth(1);

      await activeBtn.click();
      await requiredBtn.click();
      await page.getByRole('button', { name: 'Save' }).click();

      await page.reload();
      await page.getByRole('combobox', { name: 'Form' }).click();
      await page.getByRole('option', { name: 'จดกิจกรรมในสวน' }).click();

      await expect(activeBtn).toHaveAttribute('aria-pressed', 'true');
      await expect(requiredBtn).toHaveAttribute('aria-pressed', 'true');
    });

    // test('Page 2 Test', async ({ page }) => {
    //   await page.getByRole('combobox', { name: 'Form' }).click();
    //   await page.getByRole('option', { name: 'จดกิจกรรมในสวน' }).click();

    //   await page.locator('div').filter({ hasText: /^2$/ }).click();
    //   await expect(page.getByText('ผลผลิตต่อปี (กก.)')).toBeVisible();
    // });

    test('Open Full Text Test', async ({ page }) => {
      await page.getByRole('combobox', { name: 'Form' }).click();
      await page.getByRole('option', { name: 'จดกิจกรรมในสวน' }).click();

      await page.locator('div').filter({ hasText: /^2$/ }).click();
      await page.getByRole('row', { name: 'สายพันธุ์หลัก Choices This' }).getByLabel('ดูข้อความเต็ม').click();
      await expect(page.getByRole('paragraph')).toBeVisible();
    });
  });
});
import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kitchen-OS/);
});

test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

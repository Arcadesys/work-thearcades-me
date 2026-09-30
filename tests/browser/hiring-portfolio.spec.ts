import { expect, test } from '@playwright/test';

// Run with the existing browser suite in an environment with local-browser access.
test('hiring proof and next steps are directly discoverable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('AI enablement leader who builds.');
  const hero = page.locator('#top');
  await expect(hero.getByRole('link', { name: 'Technical tour', exact: true })).toHaveAttribute('href', '/engineering');
  await expect(hero.getByRole('link', { name: 'Résumé', exact: true })).toHaveAttribute('href', '/resume');
  await expect(hero.getByRole('link', { name: /Helped raise agentic-coding adoption/ })).toBeVisible();
  await expect(page.locator('#builder-case').getByRole('link', { name: /Try Bunch with fictional data/ })).toHaveAttribute('href', 'https://system.thearcades.me/demo');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('collapsed navigation retains visible hiring shortcuts and Escape closes the menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const shortcuts = page.getByRole('navigation', { name: 'Hiring shortcuts' });
  await expect(shortcuts.getByRole('link', { name: 'Résumé' })).toBeVisible();
  await expect(shortcuts.getByRole('link', { name: 'Technical tour' })).toBeVisible();
  const menu = page.locator('summary');
  await menu.click();
  await expect(page.locator('details')).toHaveAttribute('open', '');
  await menu.press('Escape');
  await expect(page.locator('details')).not.toHaveAttribute('open', '');
  await expect(menu).toBeFocused();
});

test('role, proof and actions fit the audited intermediate desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1165, height: 747 });
  await page.goto('/');
  const resume = page.locator('#top').getByRole('link', { name: 'Résumé', exact: true });
  await expect(resume).toBeInViewport();
  await expect(page.locator('#top .hero-proof')).toBeInViewport();
});

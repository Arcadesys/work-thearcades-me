import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ reducedMotion: 'reduce' });

test('Heinlein leads the homepage and its project page is keyboard accessible', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#work > article').first()).toHaveAttribute('id', 'heinlein-case');
  const explore = page.locator('#top').getByRole('link', { name: 'Explore Heinlein' });
  await expect(explore).toBeVisible();
  await expect(explore).toHaveAttribute('href', '/work/heinlein');
  await page.locator('#heinlein-case img').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('#heinlein-case img').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const menu = page.locator('summary');
  if (await menu.isVisible()) await menu.click();
  for (const theme of ['light', 'dark']) {
    await page.getByRole('button', { name: theme === 'light' ? 'Light' : 'Dark', exact: true }).filter({ visible: true }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.evaluate(() => Promise.all(document.getAnimations().filter(a => a instanceof CSSTransition).map(a => a.finished.catch(() => {}))));
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations).toEqual([]);
  }
  await page.goto('/');
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press('Tab');
    if (await explore.evaluate(el => el === document.activeElement)) break;
  }
  await expect(explore).toBeFocused();
  const target = await explore.boundingBox();
  expect(target!.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work\/heinlein$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Heinlein');
  await expect(page.getByRole('link', { name: 'Explore Heinlein on GitHub' })).toHaveAttribute('href', 'https://github.com/Arcadesys/heinlein');
  await expect(page.locator('.case-page-lede')).toContainText('Suggestions stay advisory');
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(audit.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const runner = '/campaigns/message-in-a-bottle-module/';
const key = 'message-in-a-bottle-run-v1';
const audit = async (page: import('@playwright/test').Page) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
};

test('campaign reading surfaces reflow and expose their downloads', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.goto('/blog/the-work-didnt-disappear?utm_campaign=analytics-verification');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The Work Didn’t Disappear');
    await expect(page.getByRole('link', { name: 'Open the GM guide and campaign runner' })).toBeVisible();
    await page.locator('article img').evaluateAll(images => Promise.all(images.map(img => {
      const image = img as HTMLImageElement;
      return image.complete ? Promise.resolve() : new Promise<void>(resolve => image.addEventListener('load', () => resolve(), { once: true }));
    })));
    await audit(page);
    await page.evaluate(() => document.documentElement.style.fontSize = `${parseFloat(getComputedStyle(document.documentElement).fontSize) * 2}px`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  for (const route of [runner, runner + 'module.html', runner + 'handouts.html', '/campaigns/message-in-a-bottle/']) {
    await page.goto(route);
    if (route === runner) await expect(page.locator('.scene-card')).toHaveCount(3);
    await audit(page);
    await page.evaluate(() => document.documentElement.style.fontSize = `${parseFloat(getComputedStyle(document.documentElement).fontSize) * 2}px`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route + ' at 200%').toBe(true);
  }
  for (const name of ['message-in-a-bottle-module.pdf', 'message-in-a-bottle-player-handouts.pdf', 'message-in-a-bottle-campaign-walkthrough.pdf', 'message-in-a-bottle-free-module.zip']) {
    const response = await page.request.get('/downloads/' + name);
    expect(response.ok()).toBe(true);
    expect((await response.body()).length).toBeGreaterThan(1000);
  }
});

test('read-ahead, pressure, timer, notes and scene marks persist independently', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(runner);
  await expect(page.locator('#active-session')).toContainText('Running Session 0');
  await page.locator('#session-choice').selectOption('6');
  await expect(page.getByRole('heading', { name: 'Viewing Session 6 · Adrift in the Universe' })).toBeVisible();
  await expect(page.locator('#active-session')).toContainText('Running Session 0');
  await expect(page.getByRole('button', { name: 'Fill one box' })).toBeDisabled();
  await page.getByRole('button', { name: 'Run this session', exact: true }).click();
  await expect(page.locator('#active-session')).toContainText('Running Session 6');
  await page.getByRole('button', { name: 'Fill one box' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Fill one box' })).toBeFocused();
  expect(await page.getByRole('button', { name: 'Fill one box' }).evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await expect(page.getByText('1 of 6 boxes filled', { exact: true })).toBeVisible();
  await page.locator('[id="6-vessel"] input').check();
  await page.locator('#notes').fill('Crew kept the lamp.');
  await page.locator('#minutes').fill('20');
  await page.getByRole('button', { name: 'Set paused timer' }).click();
  await page.getByRole('button', { name: 'Start / resume timer' }).click();
  await page.getByRole('button', { name: 'Pause timer' }).click();
  await page.reload();
  await expect(page.locator('[id="6-vessel"] input')).toBeChecked();
  await expect(page.locator('#notes')).toHaveValue('Crew kept the lamp.');
  await expect(page.getByText('1 of 6 boxes filled', { exact: true })).toBeVisible();
  await expect(page.locator('#sound-status')).toHaveText('Sound is stopped.');
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(saved.activeSession).toBe(6);
  expect(saved.deadline).toBeNull();
  expect(saved.remaining).toBeGreaterThan(1190);
  expect(saved.remaining).toBeLessThanOrEqual(1200);
  await page.getByRole('button', { name: 'Portal pulse', exact: true }).click();
  await page.getByRole('button', { name: 'Stop all sounds' }).click();
  await expect(page.locator('#sound-status')).toHaveText('Sound is stopped.');
  await page.getByRole('button', { name: 'Reset saved run…' }).click();
  await page.getByRole('button', { name: 'Keep my run' }).click();
  await expect(page.locator('#notes')).toHaveValue('Crew kept the lamp.');
  await page.getByRole('button', { name: 'Reset saved run…' }).click();
  await page.getByRole('button', { name: 'Clear this run' }).click();
  await page.reload();
  await expect(page.locator('#notes')).toHaveValue('');
  await expect(page.locator('#active-session')).toContainText('Running Session 0');
  expect(errors).toEqual([]);
});

test('blocked storage leaves a usable runner and printable fallback', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage blocked'); }; });
  await page.goto(runner);
  await expect(page.locator('#save-status')).toContainText('cannot save progress');
  await page.locator('#notes').fill('Unsaved note');
  await page.locator('[id="0-plan"] input').check();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download progress backup' }).click();
  expect((await download).suggestedFilename()).toBe('message-in-a-bottle-progress.json');
  await expect(page.getByRole('link', { name: 'Read the complete module' })).toHaveAttribute('href', runner + 'module.html');
});

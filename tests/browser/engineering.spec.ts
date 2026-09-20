import { expect, test, type Page } from '@playwright/test';

const thesis = 'Bunch looks like a continuity app. Underneath, it asks a harder question: how do you let AI act on private, durable state without giving the model god mode?';
const architectureTerms = ['MCP', 'REST', 'typed domain contracts', 'SystemService', 'PostgreSQL', 'private media', 'AI providers'];

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    rootWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.rootWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
}

async function focusByKeyboard(page: Page, target: ReturnType<Page['getByRole']>) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  for (let index = 0; index < 24; index += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => document.activeElement === element)) return;
  }

  throw new Error('The primary demo link was not reachable by keyboard.');
}

test('the engineering tour explains the public architecture without losing keyboard or reflow access', async ({ page }) => {
  await page.goto('/engineering');

  await expect(page).toHaveURL(/\/engineering$/);
  await expect(page).toHaveTitle(/Bunch/i);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(thesis, { exact: true })).toBeVisible();

  const demo = page.getByRole('link', { name: 'Try the interactive demo' });
  await expect(demo).toBeVisible();
  await expect(demo).toHaveAttribute('href', 'https://system.thearcades.me/demo');

  const architecture = page.getByRole('heading', { name: 'Two interfaces. One set of rules.' });
  await expect(architecture).toBeVisible();
  const mainText = await page.locator('main').innerText();
  for (const term of architectureTerms) {
    expect(mainText).toContain(term);
  }

  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: test.info().outputPath('engineering-page.png'), fullPage: true });
  await focusByKeyboard(page, demo);
  await expect(demo).toBeFocused();
  await expect(demo).toHaveCSS('outline-style', /^(?!none$).+/);

  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: test.info().outputPath('engineering-page-200-percent.png'), fullPage: true });
});

test('the Bunch case study exposes the engineering tour as a secondary path', async ({ page }) => {
  await page.goto('/work/bunch');

  const technicalTour = page.getByRole('link', { name: 'Building with Bunch? → Technical tour' });
  await expect(technicalTour).toBeVisible();
  await expect(technicalTour).toHaveAttribute('href', '/engineering');

  const demo = page.getByRole('link', { name: 'Try the interactive demo' });
  await expect(demo).toHaveClass(/case-link-primary/);
  await expect(technicalTour).toHaveClass(/case-link-secondary/);
  await expect(page.locator('.case-links a').nth(0)).toContainText('Try the interactive demo');
  await expect(page.locator('.case-links a').nth(1)).toContainText('Building with Bunch? → Technical tour');
});

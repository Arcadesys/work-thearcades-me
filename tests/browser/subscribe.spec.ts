import { expect, test } from '@playwright/test';

test('newsletter signup has a labelled keyboard flow and pending-confirmation feedback', async ({ page }) => {
  await page.route('**/api/kit/subscribe', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accepted: true }) });
  });
  await page.goto('/');

  const form = page.locator('.subscribe form').first();
  const email = form.getByRole('textbox', { name: 'Email address' });
  const submit = form.getByRole('button', { name: 'Get the build notes' });
  const status = form.getByRole('status');

  await expect(email).toHaveAttribute('type', 'email');
  await expect(email).toHaveAttribute('required', '');
  await expect(status).toContainText('One email a week');

  await email.focus();
  await page.keyboard.press('Tab');
  await expect(submit).toBeFocused();
  await expect(submit).toHaveCSS('min-height', '48px');
  await expect(submit).toHaveCSS('outline-style', 'solid');
  await email.fill('reader@example.test');
  await submit.focus();
  await submit.press('Enter');

  await expect(status).toContainText('Your subscription starts after you confirm.');
  await expect(email).toBeDisabled();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.locator('body').evaluate(node => node.clientWidth));
});

test('newsletter signup explains a failed request and allows retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/kit/subscribe', async route => {
    attempts += 1;
    await route.fulfill({ status: attempts === 1 ? 502 : 200, contentType: 'application/json', body: JSON.stringify({ accepted: attempts > 1 }) });
  });
  await page.goto('/');

  const form = page.locator('.subscribe form').first();
  const email = form.getByRole('textbox', { name: 'Email address' });
  const submit = form.getByRole('button', { name: 'Get the build notes' });
  const status = form.getByRole('status');
  await email.fill('reader@example.test');
  await submit.press('Enter');
  await expect(status).toContainText('We could not submit your request. Please try again.');

  await submit.press('Enter');
  await expect(status).toContainText('Your subscription starts after you confirm.');
  expect(attempts).toBe(2);
});

test('newsletter signup reflows without horizontal overflow at a 200% desktop zoom equivalent', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto('/');

  const form = page.locator('.subscribe form').first();
  await expect(form.getByRole('textbox', { name: 'Email address' })).toBeVisible();
  await expect(form.getByRole('button', { name: 'Get the build notes' })).toBeVisible();
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
});

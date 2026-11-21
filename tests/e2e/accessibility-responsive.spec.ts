import { expect, test } from '@playwright/test';

test('主要流程可透過鍵盤完成且焦點清楚', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  const titleInput = page.getByLabel('漫畫名稱');
  await expect(titleInput).toBeFocused();
  await expect(titleInput).toHaveCSS('outline-style', 'solid');
  await titleInput.fill('鍵盤冒險');
  const createButton = page.getByRole('button', { name: '建立漫畫' });
  await expect(createButton).toBeEnabled();
  await titleInput.press('Enter');

  const chapterInput = page.getByLabel('新章節名稱');
  await expect(chapterInput).toBeFocused();
  await chapterInput.fill('鍵盤章節');
  await page.keyboard.press('Enter');
  await page
    .getByRole('region', { name: '章節：鍵盤章節' })
    .getByRole('button', { name: '新增分鏡' })
    .press('Enter');

  await expect(page.getByLabel('第 1 格畫面描述')).toBeVisible();
  await expect(page.getByLabel('第 1 格對話')).toBeVisible();
});

test('桌面、平板及手機寬度沒有水平溢出', async ({ page }) => {
  await page.goto('/');

  for (const width of [1280, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('heading', { name: '四格漫畫任務' })).toBeVisible();
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(width);
    await expect(page.getByLabel('漫畫名稱')).toBeVisible();
    await expect(page.getByRole('button', { name: '建立漫畫' })).toBeVisible();
  }
});

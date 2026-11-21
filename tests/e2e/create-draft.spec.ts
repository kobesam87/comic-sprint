import { expect, test } from '@playwright/test';

test('學生建立漫畫、章節及分鏡，不需提供個人識別資料', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('漫畫名稱').fill('海邊冒險');
  await page.getByRole('button', { name: '建立漫畫' }).click();
  await expect(
    page.getByRole('heading', { name: '海邊冒險' }),
  ).toBeVisible();

  await page.getByLabel('新章節名稱').fill('遇見海龜');
  await page.getByRole('button', { name: '新增章節' }).click();
  await page.getByLabel('新章節名稱').fill('回到岸上');
  await page.getByRole('button', { name: '新增章節' }).click();

  const firstChapter = page.getByRole('region', { name: '章節：遇見海龜' });
  await firstChapter.getByRole('button', { name: '新增分鏡' }).click();

  await expect(
    page
      .getByRole('region', { name: '章節：遇見海龜' })
      .getByRole('heading', { name: '第 1 格' }),
  ).toBeVisible();
  await expect(page.getByRole('region', { name: '章節：回到岸上' })).toBeVisible();
  await expect(page.getByLabel('姓名')).toHaveCount(0);
  await expect(page.getByLabel('電子郵件')).toHaveCount(0);
});

import { expect, test } from '@playwright/test';

async function createDraft(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel('漫畫名稱').fill('海邊冒險');
  await page.getByRole('button', { name: '建立漫畫' }).click();
  await page.getByLabel('新章節名稱').fill('遇見海龜');
  await page.getByRole('button', { name: '新增章節' }).click();
  await page
    .getByRole('region', { name: '章節：遇見海龜' })
    .getByRole('button', { name: '新增分鏡' })
    .click();
  await page.getByLabel('第 1 格畫面描述').fill('海浪拍上沙灘。');
  await page.getByLabel('第 1 格對話').fill('小安：我們來幫忙吧！');
  await page.getByRole('button', { name: '保存分鏡' }).click();
}

test('匯出文字大綱並保留章節、分鏡順序及內容', async ({ page }) => {
  await createDraft(page);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出漫畫大綱' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('海邊冒險-大綱.txt');

  const stream = await download.createReadStream();
  if (!stream) {
    throw new Error('無法讀取匯出檔案。');
  }
  let contents = '';
  for await (const chunk of stream) {
    contents += chunk.toString();
  }
  expect(contents).toContain('# 海邊冒險');
  expect(contents).toContain('## 第 1 章：遇見海龜');
  expect(contents).toContain('畫面描述：海浪拍上沙灘。');
  expect(contents).toContain('對話：小安：我們來幫忙吧！');
});

test('沒有章節時提示無法匯出且不下載檔案', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('漫畫名稱').fill('空白故事');
  await page.getByRole('button', { name: '建立漫畫' }).click();
  const noDownloadPromise = page
    .waitForEvent('download', { timeout: 1_000 })
    .then(() => true, (error: Error) => {
      if (error.name === 'TimeoutError') {
        return false;
      }
      throw error;
    });

  await page.getByRole('button', { name: '匯出漫畫大綱' }).click();

  await expect(page.getByRole('alert')).toContainText('目前沒有章節');
  expect(await noDownloadPromise).toBe(false);
});

test('匯出操作失敗時顯示錯誤', async ({ page }) => {
  await page.addInitScript(() => {
    URL.createObjectURL = () => {
      throw new Error('download blocked');
    };
  });
  await createDraft(page);
  await page.getByRole('button', { name: '匯出漫畫大綱' }).click();

  await expect(page.getByRole('alert')).toContainText('匯出失敗');
});

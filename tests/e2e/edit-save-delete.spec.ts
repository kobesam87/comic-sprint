import { expect, test } from '@playwright/test';

async function createDraftWithPanel(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel('漫畫名稱').fill('海邊冒險');
  await page.getByRole('button', { name: '建立漫畫' }).click();
  await page.getByLabel('新章節名稱').fill('遇見海龜');
  await page.getByRole('button', { name: '新增章節' }).click();
  await page
    .getByRole('region', { name: '章節：遇見海龜' })
    .getByRole('button', { name: '新增分鏡' })
    .click();
}

test('編輯的分鏡可保存、重新開啟並確認刪除', async ({ page }) => {
  await createDraftWithPanel(page);

  const visualDescription = page.getByLabel('第 1 格畫面描述');
  const dialogue = page.getByLabel('第 1 格對話');
  await visualDescription.fill('海浪拍上沙灘。\n海龜慢慢走來。');
  await dialogue.fill('小安：我們來幫忙吧！\n小樂：好主意！');
  await page.getByRole('button', { name: '保存分鏡' }).click();
  await expect(page.locator('.success-message')).toContainText(
    '已儲存在這個瀏覽器',
  );

  await page.getByRole('button', { name: '海邊冒險' }).click();
  await expect(visualDescription).toHaveValue('海浪拍上沙灘。\n海龜慢慢走來。');
  await expect(dialogue).toHaveValue('小安：我們來幫忙吧！\n小樂：好主意！');

  await page.getByRole('button', { name: '刪除這份漫畫' }).click();
  const confirmation = page.getByRole('dialog', { name: '刪除漫畫草稿' });
  await confirmation.getByRole('button', { name: '再想一想' }).click();
  await expect(page.getByRole('button', { name: '海邊冒險' })).toBeVisible();

  await page.getByRole('button', { name: '刪除這份漫畫' }).click();
  await page
    .getByRole('dialog', { name: '刪除漫畫草稿' })
    .getByRole('button', { name: '確認刪除' })
    .click();
  await expect(page.getByRole('button', { name: '海邊冒險' })).toHaveCount(0);
});

test('本機保存失敗時保留輸入且不顯示成功狀態', async ({ page }) => {
  await page.addInitScript(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'comic-sprint:draft-store') {
        throw new DOMException('quota exceeded', 'QuotaExceededError');
      }
      originalSetItem.call(this, key, value);
    };
  });
  await page.goto('/');

  await page.getByLabel('漫畫名稱').fill('先不要丟掉我');
  await page.getByRole('button', { name: '建立漫畫' }).click();

  await expect(page.getByRole('alert')).toContainText('無法保存草稿');
  await expect(page.getByLabel('漫畫名稱')).toHaveValue('先不要丟掉我');
  await expect(page.getByRole('status')).toHaveCount(0);
});

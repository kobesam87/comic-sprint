import { expect, test } from '@playwright/test';
import { createLargeDraft } from '../fixtures/large-draft';

test('10 章、100 分鏡的載入、保存、重新開啟及匯出均低於 1 秒', async ({
  page,
}) => {
  test.setTimeout(30_000);
  const draft = createLargeDraft();
  await page.addInitScript((value) => {
    if (localStorage.getItem('comic-sprint:draft-store') === null) {
      localStorage.setItem(
        'comic-sprint:draft-store',
        JSON.stringify({ schemaVersion: 1, drafts: [value] }),
      );
    }
  }, draft);
  await page.goto('/');

  const lastChapter = page.getByRole('region', { name: '章節：第10章' });
  const lastDialogue = lastChapter.getByLabel('第 10 格對話');
  await expect(lastDialogue).toHaveValue(
    '角色10：一起展開新的冒險吧！',
  );

  await lastDialogue.fill('角色10：我們完成了！');
  const saveStarted = Date.now();
  await lastChapter.getByRole('button', { name: '保存分鏡' }).last().click();
  await expect(page.locator('.success-message')).toContainText('已儲存在');
  expect(Date.now() - saveStarted).toBeLessThan(1_000);

  const reopenStarted = Date.now();
  await page.reload();
  await expect(
    page
      .getByRole('region', { name: '章節：第10章' })
      .getByLabel('第 10 格對話'),
  ).toHaveValue('角色10：我們完成了！');
  expect(Date.now() - reopenStarted).toBeLessThan(1_000);

  const downloadPromise = page.waitForEvent('download');
  const exportStarted = Date.now();
  await page.getByRole('button', { name: '匯出漫畫大綱' }).click();
  await downloadPromise;
  expect(Date.now() - exportStarted).toBeLessThan(1_000);
});

import { describe, expect, it } from 'vitest';
import {
  addChapter,
  addPanel,
  createDraft,
} from '../../../../src/features/comic/domain/draft-service';

describe('漫畫草稿服務', () => {
  it('建立標題修剪後且具有有效時間與識別碼的草稿', () => {
    const draft = createDraft('  星星旅行  ', new Date('2026-11-20T05:00:00.000Z'));

    expect(draft.title).toBe('星星旅行');
    expect(draft.id).not.toBe('');
    expect(draft.createdAt).toBe('2026-11-20T05:00:00.000Z');
    expect(draft.updatedAt).toBe(draft.createdAt);
  });

  it('拒絕空白漫畫名稱', () => {
    expect(() => createDraft('   ')).toThrow();
  });

  it('新增章節時保留同名章節並依序排列', () => {
    const draft = createDraft('星星旅行');
    const first = addChapter(draft, '出發');
    const second = addChapter(first, '出發');

    expect(second.chapters.map(({ position, title }) => [position, title])).toEqual([
      [1, '出發'],
      [2, '出發'],
    ]);
    expect(new Set(second.chapters.map(({ id }) => id)).size).toBe(2);
    expect(draft.chapters).toHaveLength(0);
  });

  it('只在指定章節新增空白分鏡並延續該章節順序', () => {
    const draft = addChapter(addChapter(createDraft('星星旅行'), '森林'), '山頂');
    const firstChapter = draft.chapters[0];
    const withPanel = addPanel(draft, firstChapter.id);
    const panel = withPanel.chapters[0].panels[0];

    expect(panel).toMatchObject({
      position: 1,
      visualDescription: '',
      dialogue: '',
    });
    expect(withPanel.chapters[1].panels).toHaveLength(0);
  });
});

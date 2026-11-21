import { describe, expect, it } from 'vitest';
import {
  addChapter,
  addPanel,
  createDraft,
  deleteDraft,
  updatePanel,
} from '../../../../src/features/comic/domain/draft-service';

function makeDraftWithPanel() {
  const withChapter = addChapter(createDraft('星星旅行'), '森林');
  return addPanel(withChapter, withChapter.chapters[0].id);
}

describe('分鏡編輯與草稿刪除', () => {
  it('只更新指定分鏡、保留多行文字並更新修改時間', () => {
    const draft = makeDraftWithPanel();
    const chapterId = draft.chapters[0].id;
    const panelId = draft.chapters[0].panels[0].id;
    const updated = updatePanel(
      draft,
      chapterId,
      panelId,
      {
        visualDescription: '樹葉搖動。\n小鳥飛過。',
        dialogue: '小安：看那邊！\n小樂：好漂亮！',
      },
      new Date('2026-11-20T06:00:00.000Z'),
    );

    expect(updated.chapters[0].panels[0]).toMatchObject({
      visualDescription: '樹葉搖動。\n小鳥飛過。',
      dialogue: '小安：看那邊！\n小樂：好漂亮！',
    });
    expect(updated.updatedAt).toBe('2026-11-20T06:00:00.000Z');
    expect(draft.chapters[0].panels[0].dialogue).toBe('');
  });

  it('目標章節或分鏡不存在時明確拒絕更新', () => {
    const draft = makeDraftWithPanel();

    expect(() =>
      updatePanel(draft, 'missing-chapter', 'missing-panel', {
        visualDescription: '',
        dialogue: '',
      }),
    ).toThrow();
  });

  it('刪除指定草稿並保留其他草稿', () => {
    const first = createDraft('第一個故事');
    const second = createDraft('第二個故事');

    expect(deleteDraft([first, second], first.id)).toEqual([second]);
    expect(() => deleteDraft([second], first.id)).toThrow();
  });
});

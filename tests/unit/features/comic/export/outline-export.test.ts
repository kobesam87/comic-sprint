import { describe, expect, it } from 'vitest';
import { formatOutline } from '../../../../../src/features/comic/export/outline-export';
import type { ComicDraft } from '../../../../../src/features/comic/domain/models';

const makeDraft = (): ComicDraft => ({
  id: 'draft-1',
  title: '星星旅行',
  createdAt: '2026-11-20T05:00:00.000Z',
  updatedAt: '2026-11-20T05:00:00.000Z',
  chapters: [
    {
      id: 'chapter-2',
      title: '山頂',
      position: 2,
      panels: [],
    },
    {
      id: 'chapter-1',
      title: '森林',
      position: 1,
      panels: [
        {
          id: 'panel-2',
          position: 2,
          visualDescription: '',
          dialogue: '小安：看那邊！',
        },
        {
          id: 'panel-1',
          position: 1,
          visualDescription: '樹葉搖動。\n小鳥飛過。',
          dialogue: '',
        },
      ],
    },
  ],
});

describe('漫畫大綱匯出', () => {
  it('依章節及分鏡順序輸出已填文字並保留換行', () => {
    expect(formatOutline(makeDraft())).toBe(
      '# 星星旅行\n\n' +
        '## 第 1 章：森林\n' +
        '### 第 1 格\n' +
        '畫面描述：樹葉搖動。\n小鳥飛過。\n' +
        '### 第 2 格\n' +
        '對話：小安：看那邊！\n\n' +
        '## 第 2 章：山頂\n',
    );
  });

  it('沒有章節時拒絕產生空白大綱', () => {
    const draft = makeDraft();
    draft.chapters = [];

    expect(() => formatOutline(draft)).toThrow('目前沒有章節');
  });

  it('拒絕格式無效的草稿', () => {
    expect(() => formatOutline({} as ComicDraft)).toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import {
  isComicDraft,
  isLocalDraftStore,
} from '../../../../../src/features/comic/domain/models';

const makeDraft = () => ({
  id: 'draft-1',
  title: '星星旅行',
  createdAt: '2026-11-20T05:00:00.000Z',
  updatedAt: '2026-11-20T05:00:00.000Z',
  chapters: [
    {
      id: 'chapter-1',
      title: '出發',
      position: 1,
      panels: [
        {
          id: 'panel-1',
          position: 1,
          visualDescription: '山坡上。\n主角看見一顆星星。',
          dialogue: '小安：我們出發吧！\n小樂：好呀！',
        },
      ],
    },
  ],
});

describe('漫畫草稿資料模型', () => {
  it('接受有效草稿、相同章節名稱及保留換行的分鏡文字', () => {
    const draft = makeDraft();
    draft.chapters.push({
      id: 'chapter-2',
      title: '出發',
      position: 2,
      panels: [],
    });

    expect(isComicDraft(draft)).toBe(true);
    expect(draft.chapters[0].panels[0].dialogue).toBe(
      '小安：我們出發吧！\n小樂：好呀！',
    );
  });

  it('拒絕空白漫畫名稱及無效的 ISO 8601 日期', () => {
    const draft = makeDraft();

    expect(isComicDraft({ ...draft, title: '  ' })).toBe(false);
    expect(isComicDraft({ ...draft, updatedAt: '昨天' })).toBe(false);
    expect(
      isComicDraft({ ...draft, createdAt: '2026-02-31T05:00:00.000Z' }),
    ).toBe(false);
  });

  it('拒絕非正整數或重複的章節與分鏡順序', () => {
    const draft = makeDraft();
    draft.chapters.push({
      id: 'chapter-2',
      title: '第二段',
      position: 1,
      panels: [],
    });
    expect(isComicDraft(draft)).toBe(false);

    const invalidPositionDraft = makeDraft();
    invalidPositionDraft.chapters[0].position = 0;
    expect(isComicDraft(invalidPositionDraft)).toBe(false);

    const panelDraft = makeDraft();
    panelDraft.chapters[0].panels.push({
      id: 'panel-2',
      position: 1,
      visualDescription: '',
      dialogue: '',
    });
    expect(isComicDraft(panelDraft)).toBe(false);
  });

  it('拒絕重複的章節與分鏡識別碼', () => {
    const duplicateChapterId = makeDraft();
    duplicateChapterId.chapters.push({
      id: 'chapter-1',
      title: '另一章',
      position: 2,
      panels: [],
    });
    expect(isComicDraft(duplicateChapterId)).toBe(false);

    const duplicatePanelId = makeDraft();
    duplicatePanelId.chapters[0].panels.push({
      id: 'panel-1',
      position: 2,
      visualDescription: '',
      dialogue: '',
    });
    expect(isComicDraft(duplicatePanelId)).toBe(false);
  });

  it('檢查集合版本並拒絕重複的草稿識別碼', () => {
    const draft = makeDraft();

    expect(isLocalDraftStore({ schemaVersion: 1, drafts: [draft] })).toBe(true);
    expect(
      isLocalDraftStore({ schemaVersion: 1, drafts: [draft, draft] }),
    ).toBe(false);
  });
});

import type { ComicDraft } from '../../src/features/comic/domain/models';

export function createLargeDraft(): ComicDraft {
  return {
    id: 'performance-draft',
    title: '效能驗收故事',
    createdAt: '2026-11-20T05:00:00.000Z',
    updatedAt: '2026-11-20T05:00:00.000Z',
    chapters: Array.from({ length: 10 }, (_, chapterIndex) => ({
      id: `chapter-${chapterIndex + 1}`,
      title: `第${chapterIndex + 1}章`,
      position: chapterIndex + 1,
      panels: Array.from({ length: 10 }, (_, panelIndex) => ({
        id: `chapter-${chapterIndex + 1}-panel-${panelIndex + 1}`,
        position: panelIndex + 1,
        visualDescription: `第${chapterIndex + 1}章第${panelIndex + 1}格的畫面描述。`,
        dialogue: `角色${panelIndex + 1}：一起展開新的冒險吧！`,
      })),
    })),
  };
}

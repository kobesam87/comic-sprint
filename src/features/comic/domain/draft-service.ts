import type { Chapter, ComicDraft, Panel } from './models';
import { isComicDraft } from './models';

export class DraftOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DraftOperationError';
  }
}

function createId(): string {
  return crypto.randomUUID();
}

function requireValidDraft(draft: ComicDraft): void {
  if (!isComicDraft(draft)) {
    throw new DraftOperationError('草稿資料格式無效，請重新載入後再試一次。');
  }
}

export function createDraft(title: string, now = new Date()): ComicDraft {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) {
    throw new DraftOperationError('請先輸入漫畫名稱。');
  }
  if (!Number.isFinite(now.getTime())) {
    throw new DraftOperationError('無法建立草稿時間，請稍後再試。');
  }

  const timestamp = now.toISOString();
  return {
    id: createId(),
    title: normalizedTitle,
    createdAt: timestamp,
    updatedAt: timestamp,
    chapters: [],
  };
}

export function addChapter(draft: ComicDraft, title: string): ComicDraft {
  requireValidDraft(draft);
  const normalizedTitle = title.trim();
  if (!normalizedTitle) {
    throw new DraftOperationError('請先輸入章節名稱。');
  }

  const chapter: Chapter = {
    id: createId(),
    title: normalizedTitle,
    position:
      draft.chapters.reduce(
        (lastPosition, current) => Math.max(lastPosition, current.position),
        0,
      ) + 1,
    panels: [],
  };

  return { ...draft, chapters: [...draft.chapters, chapter] };
}

export function addPanel(draft: ComicDraft, chapterId: string): ComicDraft {
  requireValidDraft(draft);
  const chapterIndex = draft.chapters.findIndex(({ id }) => id === chapterId);
  if (chapterIndex === -1) {
    throw new DraftOperationError('找不到要新增分鏡的章節。');
  }

  const chapter = draft.chapters[chapterIndex];
  const panel: Panel = {
    id: createId(),
    position:
      chapter.panels.reduce(
        (lastPosition, current) => Math.max(lastPosition, current.position),
        0,
      ) + 1,
    visualDescription: '',
    dialogue: '',
  };
  const chapters = [...draft.chapters];
  chapters[chapterIndex] = { ...chapter, panels: [...chapter.panels, panel] };

  return { ...draft, chapters };
}

export function updatePanel(
  draft: ComicDraft,
  chapterId: string,
  panelId: string,
  content: Pick<Panel, 'visualDescription' | 'dialogue'>,
  now = new Date(),
): ComicDraft {
  requireValidDraft(draft);
  if (
    typeof content.visualDescription !== 'string' ||
    typeof content.dialogue !== 'string'
  ) {
    throw new DraftOperationError('分鏡內容格式無效，請檢查後再保存。');
  }
  if (!Number.isFinite(now.getTime())) {
    throw new DraftOperationError('無法更新草稿時間，請稍後再試。');
  }

  const chapterIndex = draft.chapters.findIndex(({ id }) => id === chapterId);
  const panelIndex =
    chapterIndex === -1
      ? -1
      : draft.chapters[chapterIndex].panels.findIndex(
          ({ id }) => id === panelId,
        );
  if (chapterIndex === -1 || panelIndex === -1) {
    throw new DraftOperationError('找不到要編輯的分鏡。');
  }

  const chapters = [...draft.chapters];
  const chapter = chapters[chapterIndex];
  const panels = [...chapter.panels];
  panels[panelIndex] = { ...panels[panelIndex], ...content };
  chapters[chapterIndex] = { ...chapter, panels };

  return { ...draft, updatedAt: now.toISOString(), chapters };
}

export function deleteDraft(
  drafts: ComicDraft[],
  draftId: string,
): ComicDraft[] {
  const index = drafts.findIndex(({ id }) => id === draftId);
  if (index === -1) {
    throw new DraftOperationError('找不到要刪除的漫畫草稿。');
  }
  return drafts.filter(({ id }) => id !== draftId);
}

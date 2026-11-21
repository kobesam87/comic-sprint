import { isComicDraft, type ComicDraft } from '../domain/models';

export class OutlineExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OutlineExportError';
  }
}

export function formatOutline(draft: ComicDraft): string {
  if (!isComicDraft(draft)) {
    throw new OutlineExportError('草稿資料格式無效，無法產生大綱。');
  }
  if (draft.chapters.length === 0) {
    throw new OutlineExportError('目前沒有章節可供匯出。');
  }

  const lines = [`# ${draft.title}`];
  const chapters = [...draft.chapters].sort(
    (first, second) => first.position - second.position,
  );

  for (const chapter of chapters) {
    lines.push('', `## 第 ${chapter.position} 章：${chapter.title}`);
    const panels = [...chapter.panels].sort(
      (first, second) => first.position - second.position,
    );

    for (const panel of panels) {
      lines.push(`### 第 ${panel.position} 格`);
      if (panel.visualDescription.trim()) {
        lines.push(`畫面描述：${panel.visualDescription}`);
      }
      if (panel.dialogue.trim()) {
        lines.push(`對話：${panel.dialogue}`);
      }
    }
  }

  return `${lines.join('\n')}\n`;
}

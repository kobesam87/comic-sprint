import { useEffect, useRef, useState } from 'react';
import type { ComicDraft, Panel } from '../domain/models';
import ChapterEditor from './ChapterEditor';
import ExportOutlineButton from './ExportOutlineButton';

interface DraftEditorProps {
  draft: ComicDraft;
  onAddChapter: (title: string) => boolean;
  onAddPanel: (chapterId: string) => void;
  focusChapterInput?: boolean;
  onSavePanel: (
    chapterId: string,
    panelId: string,
    content: Pick<Panel, 'visualDescription' | 'dialogue'>,
  ) => boolean;
  onDelete: () => boolean;
}

export default function DraftEditor({
  draft,
  onAddChapter,
  onAddPanel,
  focusChapterInput,
  onSavePanel,
  onDelete,
}: DraftEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (showDeleteConfirmation && !dialog.open) {
      dialog.showModal();
    } else if (!showDeleteConfirmation && dialog.open) {
      dialog.close();
    }
  }, [showDeleteConfirmation]);

  return (
    <section className="draft-editor" aria-label="漫畫編輯器">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">正在創作</p>
          <h2>{draft.title}</h2>
        </div>
        <div className="draft-actions">
          <ExportOutlineButton draft={draft} />
          <button
            type="button"
            className="delete-button"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            刪除這份漫畫
          </button>
        </div>
      </div>

      <ChapterEditor
        draft={draft}
        onAddChapter={onAddChapter}
        onAddPanel={onAddPanel}
        focusChapterInput={focusChapterInput}
        onSavePanel={onSavePanel}
      />

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-draft-title"
        onCancel={() => setShowDeleteConfirmation(false)}
        onClose={() => setShowDeleteConfirmation(false)}
      >
        <h2 id="delete-draft-title">刪除漫畫草稿</h2>
        <p>確定要刪除「{draft.title}」嗎？刪除後無法復原。</p>
        <div className="dialog-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowDeleteConfirmation(false)}
          >
            再想一想
          </button>
          <button
            type="button"
            className="delete-button"
            onClick={() => {
              if (onDelete()) {
                setShowDeleteConfirmation(false);
              }
            }}
          >
            確認刪除
          </button>
        </div>
      </dialog>
    </section>
  );
}

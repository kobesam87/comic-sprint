import { useEffect, useMemo, useState } from 'react';
import DraftList from './features/comic/components/DraftList';
import DraftEditor from './features/comic/components/DraftEditor';
import StorageAlert from './features/comic/components/StorageAlert';
import {
  addChapter,
  addPanel,
  createDraft,
  deleteDraft,
  updatePanel,
} from './features/comic/domain/draft-service';
import type { ComicDraft, Panel } from './features/comic/domain/models';
import { BrowserDraftStore } from './features/comic/persistence/local-draft-store';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : '操作未完成，請保留目前內容並稍後再試。';
}

export default function App() {
  const store = useMemo(() => new BrowserDraftStore(), []);
  const [drafts, setDrafts] = useState<ComicDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string>();
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [focusChapterInputDraftId, setFocusChapterInputDraftId] =
    useState<string>();

  useEffect(() => {
    try {
      const savedDrafts = store.loadAll();
      setDrafts(savedDrafts);
      setSelectedDraftId(savedDrafts[0]?.id);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsReady(true);
    }
  }, [store]);

  const selectedDraft = drafts.find(({ id }) => id === selectedDraftId);

  function persistDraft(draft: ComicDraft): boolean {
    try {
      store.save(draft);
      setDrafts((current) => {
        const exists = current.some(({ id }) => id === draft.id);
        return exists
          ? current.map((item) => (item.id === draft.id ? draft : item))
          : [...current, draft];
      });
      setSelectedDraftId(draft.id);
      setErrorMessage('');
      setSaveMessage('已儲存在這個瀏覽器。');
      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setSaveMessage('');
      return false;
    }
  }

  function handleCreate(title: string): boolean {
    if (!isReady) {
      return false;
    }
    try {
      const draft = createDraft(title);
      const saved = persistDraft(draft);
      if (saved) {
        setFocusChapterInputDraftId(draft.id);
      }
      return saved;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setSaveMessage('');
      return false;
    }
  }

  function updateSelectedDraft(
    update: (draft: ComicDraft) => ComicDraft,
  ): boolean {
    if (!selectedDraft) {
      setErrorMessage('請先開啟一份漫畫草稿。');
      return false;
    }
    try {
      return persistDraft(update(selectedDraft));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setSaveMessage('');
      return false;
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">我的漫畫冒險</p>
          <h1>四格漫畫任務</h1>
          <p className="hero-copy">把腦中的故事，一格一格變成漫畫腳本。</p>
        </div>
        <span className="hero-badge" aria-hidden="true">✦</span>
      </header>

      <p className="privacy-note" role="note">
        草稿只保存在這個瀏覽器。共用裝置的其他人可能會看到；清除瀏覽資料也可能讓草稿消失。
      </p>

      <StorageAlert message={errorMessage} />
      {saveMessage && (
        <p className="status-message success-message" role="status">
          {saveMessage}
        </p>
      )}
      {!isReady && <p role="status">正在開啟你的漫畫……</p>}

      <div className="app-layout">
        <DraftList
          drafts={drafts}
          selectedDraftId={selectedDraftId}
          onCreate={handleCreate}
          onOpen={(draft) => {
            setSelectedDraftId(draft.id);
            setFocusChapterInputDraftId(undefined);
            setErrorMessage('');
            setSaveMessage('');
          }}
        />

        <section className="workspace" aria-label="漫畫工作區">
          {selectedDraft ? (
            <DraftEditor
              draft={selectedDraft}
              focusChapterInput={selectedDraft.id === focusChapterInputDraftId}
              onAddChapter={(title) =>
                updateSelectedDraft((draft) => addChapter(draft, title))
              }
              onAddPanel={(chapterId) =>
                updateSelectedDraft((draft) => addPanel(draft, chapterId))
              }
              onSavePanel={(chapterId, panelId, content) =>
                updateSelectedDraft((draft) =>
                  updatePanel(draft, chapterId, panelId, content),
                )
              }
              onDelete={() => handleDelete(selectedDraft)}
            />
          ) : (
            <div className="welcome-card">
              <span className="welcome-icon" aria-hidden="true">✎</span>
              <h2>準備好開始冒險了嗎？</h2>
              <p>建立一份漫畫，接著把你的故事分成章節和分鏡。</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );

  function handleDelete(draft: ComicDraft): boolean {
    try {
      const nextDrafts = deleteDraft(drafts, draft.id);
      store.delete(draft.id);
      setDrafts(nextDrafts);
      setSelectedDraftId(nextDrafts[0]?.id);
      setErrorMessage('');
      setSaveMessage('漫畫草稿已刪除。');
      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setSaveMessage('');
      return false;
    }
  }
}

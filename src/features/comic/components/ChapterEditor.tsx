import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ComicDraft, Panel } from '../domain/models';
import PanelEditor from './PanelEditor';

interface ChapterEditorProps {
  draft: ComicDraft;
  onAddChapter: (title: string) => boolean;
  onAddPanel: (chapterId: string) => void;
  focusChapterInput?: boolean;
  onSavePanel: (
    chapterId: string,
    panelId: string,
    content: Pick<Panel, 'visualDescription' | 'dialogue'>,
  ) => boolean;
}

export default function ChapterEditor({
  draft,
  onAddChapter,
  onAddPanel,
  focusChapterInput = false,
  onSavePanel,
}: ChapterEditorProps) {
  const [chapterTitle, setChapterTitle] = useState('');
  const chapterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusChapterInput) {
      chapterInputRef.current?.focus();
    }
  }, [draft.id, focusChapterInput]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (onAddChapter(chapterTitle)) {
      setChapterTitle('');
    }
  }

  const chapters = [...draft.chapters].sort(
    (first, second) => first.position - second.position,
  );

  return (
    <section className="chapter-editor" aria-labelledby="chapters-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">故事分段</p>
          <h2 id="chapters-heading">我的章節</h2>
        </div>
      </div>

      <form className="add-chapter-form" onSubmit={handleSubmit}>
        <label htmlFor="new-chapter-title">新章節名稱</label>
        <div className="inline-form">
          <input
            id="new-chapter-title"
            ref={chapterInputRef}
            value={chapterTitle}
            onChange={(event) => setChapterTitle(event.target.value)}
            required
          />
          <button type="submit" disabled={!chapterTitle.trim()}>
            新增章節
          </button>
        </div>
      </form>

      {chapters.length === 0 ? (
        <p className="empty-state">新增第一個章節，開始安排你的故事。</p>
      ) : (
        <ol className="chapter-list">
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <section
                className="chapter-card"
                role="region"
                aria-label={`章節：${chapter.title}（第 ${chapter.position} 章）`}
              >
                <div className="chapter-card-heading">
                  <div>
                    <p className="chapter-number">第 {chapter.position} 章</p>
                    <h3>{chapter.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onAddPanel(chapter.id)}
                  >
                    新增分鏡
                  </button>
                </div>

                {chapter.panels.length === 0 ? (
                  <p className="panel-empty-state">這一章還沒有分鏡。</p>
                ) : (
                  <ol className="panel-list">
                    {[...chapter.panels]
                      .sort((first, second) => first.position - second.position)
                      .map((panel) => (
                        <li key={panel.id}>
                          <PanelEditor
                            chapterId={chapter.id}
                            panel={panel}
                            onSave={onSavePanel}
                          />
                        </li>
                      ))}
                  </ol>
                )}
              </section>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

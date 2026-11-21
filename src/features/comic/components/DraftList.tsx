import { useState, type FormEvent } from 'react';
import type { ComicDraft } from '../domain/models';

interface DraftListProps {
  drafts: ComicDraft[];
  selectedDraftId?: string;
  onCreate: (title: string) => boolean;
  onOpen: (draft: ComicDraft) => void;
}

export default function DraftList({
  drafts,
  selectedDraftId,
  onCreate,
  onOpen,
}: DraftListProps) {
  const [title, setTitle] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (onCreate(title)) {
      setTitle('');
    }
  }

  return (
    <aside className="draft-list" aria-label="漫畫草稿清單">
      <form className="create-draft-form" onSubmit={handleSubmit}>
        <label htmlFor="draft-title">漫畫名稱</label>
        <input
          id="draft-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <button type="submit" disabled={!title.trim()}>
          建立漫畫
        </button>
      </form>

      <section aria-labelledby="draft-list-title">
        <h2 id="draft-list-title">我的漫畫</h2>
        {drafts.length === 0 ? (
          <p>還沒有漫畫，先建立一個故事吧！</p>
        ) : (
          <ul className="draft-items">
            {drafts.map((draft) => (
              <li key={draft.id}>
                <button
                  type="button"
                  className="draft-list-item"
                  aria-pressed={draft.id === selectedDraftId}
                  onClick={() => onOpen(draft)}
                >
                  {draft.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

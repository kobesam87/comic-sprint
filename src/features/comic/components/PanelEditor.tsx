import { useState, type FormEvent } from 'react';
import type { Panel } from '../domain/models';

interface PanelEditorProps {
  chapterId: string;
  panel: Panel;
  onSave: (
    chapterId: string,
    panelId: string,
    content: Pick<Panel, 'visualDescription' | 'dialogue'>,
  ) => boolean;
}

export default function PanelEditor({
  chapterId,
  panel,
  onSave,
}: PanelEditorProps) {
  const [visualDescription, setVisualDescription] = useState(
    panel.visualDescription,
  );
  const [dialogue, setDialogue] = useState(panel.dialogue);
  const [saved, setSaved] = useState(false);
  const visualDescriptionId = `panel-${panel.id}-visual-description`;
  const dialogueId = `panel-${panel.id}-dialogue`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(
      onSave(chapterId, panel.id, { visualDescription, dialogue }),
    );
  }

  return (
    <article className="panel-card">
      <h4>第 {panel.position} 格</h4>
      <form className="panel-editor-form" onSubmit={handleSubmit}>
        <label htmlFor={visualDescriptionId}>
          第 {panel.position} 格畫面描述
        </label>
        <textarea
          id={visualDescriptionId}
          rows={3}
          value={visualDescription}
          onChange={(event) => {
            setVisualDescription(event.target.value);
            setSaved(false);
          }}
        />
        <label htmlFor={dialogueId}>第 {panel.position} 格對話</label>
        <textarea
          id={dialogueId}
          rows={3}
          value={dialogue}
          onChange={(event) => {
            setDialogue(event.target.value);
            setSaved(false);
          }}
        />
        <div className="panel-editor-actions">
          <button type="submit">保存分鏡</button>
          <span aria-live="polite">
            {saved ? '已保存' : '修改後請保存'}
          </span>
        </div>
      </form>
    </article>
  );
}

import { useState } from 'react';
import type { ComicDraft } from '../domain/models';
import {
  formatOutline,
  OutlineExportError,
} from '../export/outline-export';

interface ExportOutlineButtonProps {
  draft: ComicDraft;
}

function createFilename(title: string): string {
  const safeTitle = title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').trim();
  return `${safeTitle || '漫畫'}-大綱.txt`;
}

export default function ExportOutlineButton({
  draft,
}: ExportOutlineButtonProps) {
  const [errorMessage, setErrorMessage] = useState('');

  function handleExport() {
    setErrorMessage('');
    let objectUrl: string | undefined;

    try {
      const contents = formatOutline(draft);
      const blob = new Blob([contents], {
        type: 'text/plain;charset=utf-8',
      });
      objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = createFilename(draft.title);
      link.click();
      window.setTimeout(() => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      }, 0);
    } catch (error) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setErrorMessage(
        error instanceof OutlineExportError
          ? error.message
          : `匯出失敗：${error instanceof Error ? error.message : '請稍後再試。'}`,
      );
    }
  }

  return (
    <div className="export-control">
      <button type="button" className="secondary-button" onClick={handleExport}>
        匯出漫畫大綱
      </button>
      {errorMessage && (
        <p className="status-message error-message" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

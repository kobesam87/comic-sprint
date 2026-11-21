import {
  isComicDraft,
  isLocalDraftStore,
  LOCAL_DRAFT_STORE_SCHEMA_VERSION,
  type ComicDraft,
  type LocalDraftStore,
} from '../domain/models';

export const DRAFT_STORE_KEY = 'comic-sprint:draft-store';

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class DraftStoreError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DraftStoreError';
  }
}

export class BrowserDraftStore {
  private readonly storageProvider: () => StoragePort;

  constructor(storage?: StoragePort) {
    this.storageProvider = storage
      ? () => storage
      : () => window.localStorage;
  }

  loadAll(): ComicDraft[] {
    return this.readCollection().drafts;
  }

  save(draft: ComicDraft): void {
    if (!isComicDraft(draft)) {
      throw new DraftStoreError('草稿內容不符合保存格式，請檢查後再試一次。');
    }

    const collection = this.readCollection();
    const index = collection.drafts.findIndex(({ id }) => id === draft.id);
    const drafts = [...collection.drafts];
    if (index === -1) {
      drafts.push(draft);
    } else {
      drafts[index] = draft;
    }

    this.writeCollection({ ...collection, drafts });
  }

  delete(draftId: string): void {
    const collection = this.readCollection();
    const drafts = collection.drafts.filter(({ id }) => id !== draftId);

    if (drafts.length !== collection.drafts.length) {
      this.writeCollection({ ...collection, drafts });
    }
  }

  private readCollection(): LocalDraftStore {
    let raw: string | null;
    try {
      raw = this.storageProvider().getItem(DRAFT_STORE_KEY);
    } catch (cause) {
      throw new DraftStoreError('無法讀取本機草稿，請確認瀏覽器儲存設定。', {
        cause,
      });
    }

    if (raw === null) {
      return {
        schemaVersion: LOCAL_DRAFT_STORE_SCHEMA_VERSION,
        drafts: [],
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new DraftStoreError('草稿資料無法讀取，原始資料已保留。', {
        cause,
      });
    }

    if (!isLocalDraftStore(parsed)) {
      throw new DraftStoreError('草稿資料格式無效，原始資料已保留。');
    }
    if (parsed.schemaVersion !== LOCAL_DRAFT_STORE_SCHEMA_VERSION) {
      throw new DraftStoreError('此草稿資料版本尚不支援，原始資料已保留。');
    }

    return parsed;
  }

  private writeCollection(collection: LocalDraftStore): void {
    try {
      this.storageProvider().setItem(DRAFT_STORE_KEY, JSON.stringify(collection));
    } catch (cause) {
      throw new DraftStoreError('無法保存草稿，請確認瀏覽器儲存空間後重試。', {
        cause,
      });
    }
  }
}

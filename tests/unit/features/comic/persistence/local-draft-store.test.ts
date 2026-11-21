import { describe, expect, it } from 'vitest';
import {
  BrowserDraftStore,
  DraftStoreError,
  type StoragePort,
} from '../../../../../src/features/comic/persistence/local-draft-store';

const makeDraft = (id: string) => ({
  id,
  title: `故事 ${id}`,
  createdAt: '2026-11-20T05:00:00.000Z',
  updatedAt: '2026-11-20T05:00:00.000Z',
  chapters: [],
});

const makeStorage = (initialValue: string | null = null) => {
  const state = { value: initialValue };
  const storage: StoragePort = {
    getItem: () => state.value,
    setItem: (_key, value) => {
      state.value = value;
    },
    removeItem: () => {
      state.value = null;
    },
  };
  return { storage, state };
};

describe('本機草稿保存', () => {
  it('沒有保存資料時回傳空集合', () => {
    const { storage } = makeStorage();

    expect(new BrowserDraftStore(storage).loadAll()).toEqual([]);
  });

  it('保存草稿後可由新的儲存實例重新載入', () => {
    const { storage, state } = makeStorage();
    const draft = makeDraft('draft-1');

    new BrowserDraftStore(storage).save(draft);

    expect(JSON.parse(state.value ?? '{}')).toMatchObject({
      schemaVersion: 1,
      drafts: [draft],
    });
    expect(new BrowserDraftStore(storage).loadAll()).toEqual([draft]);
  });

  it('刪除指定草稿而保留其他草稿', () => {
    const { storage } = makeStorage();
    const store = new BrowserDraftStore(storage);
    store.save(makeDraft('draft-1'));
    store.save(makeDraft('draft-2'));

    store.delete('draft-1');

    expect(store.loadAll().map(({ id }) => id)).toEqual(['draft-2']);
  });

  it('遇到不支援的資料版本時回報錯誤且不覆寫原資料', () => {
    const raw = JSON.stringify({ schemaVersion: 99, drafts: [] });
    const { storage, state } = makeStorage(raw);
    const store = new BrowserDraftStore(storage);

    expect(() => store.loadAll()).toThrow(DraftStoreError);
    expect(state.value).toBe(raw);
  });

  it('瀏覽器讀取或保存失敗時明確回報錯誤', () => {
    const readFailure: StoragePort = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {},
      removeItem: () => {},
    };
    const writeFailure: StoragePort = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
    };

    expect(() => new BrowserDraftStore(readFailure).loadAll()).toThrow(
      DraftStoreError,
    );
    expect(() => new BrowserDraftStore(writeFailure).save(makeDraft('draft-1'))).toThrow(
      DraftStoreError,
    );
  });
});

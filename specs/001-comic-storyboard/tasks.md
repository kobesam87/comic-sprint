# 任務清單：漫畫分鏡與腳本草稿管理工具

**輸入**：`specs/001-comic-storyboard/` 中的規格及設計文件

**前置文件**：[plan.md](plan.md)、[spec.md](spec.md)、[research.md](research.md)、[data-model.md](data-model.md)、[contracts/](contracts/)、[quickstart.md](quickstart.md)

**測試策略**：本清單包含測試先行任務，因專案憲章要求行為變更先有失敗的可執行測試，再進入實作。

**任務組織**：依使用者故事分階段，讓每個故事可獨立驗收。

## 格式

- 每項任務均使用 `- [ ] T編號` 格式。
- `[P]` 表示可在不同檔案中平行處理，且沒有未完成的前置依賴。
- `[US1]`、`[US2]`、`[US3]` 分別對應規格中的使用者故事。
- 每項任務均列出明確的檔案路徑。

## 路徑慣例

- 應用程式原始碼及測試位於專案根目錄的 `src/` 與 `tests/`。
- 初始設定只新增本清單列出的應用程式檔案；不得執行 `npm create vite .` 或其他可能覆寫既有內容的初始化器。
- `.github/`、`.specify/`、`specs/` 及其他既有文件均須保持不變。

---

## Phase 1：Setup（共用基礎設施）

**目的**：建立 React、TypeScript、Vite 專案及測試執行環境。

- [x] T001 逐檔新增 `package.json`、`index.html`、`vite.config.ts`、`tsconfig.json`、`src/main.tsx`、`src/App.tsx`、`src/styles/global.css`；只建立不存在的檔案，不執行 `npm create vite .`，並保留 `.github/`、`.specify/`、`specs/`。
- [x] T002 在 `package.json` 設定核准的 React、React DOM、TypeScript、Vite 及 React Vite 外掛版本；於專案根目錄執行 `npm install` 並產生 `package-lock.json`。
- [x] T003 在 `package.json` 設定 `test:unit`、`test:e2e`、`build` 指令，並新增 `vitest.config.ts`、`playwright.config.ts`（含 Firefox 暫存應用資料目錄）與 `src/vite-env.d.ts`。

---

## Phase 2：Foundational（阻擋所有使用者故事的基礎）

**目的**：先建立受驗證的資料模型及本機保存能力；完成前不得開始任何使用者故事。

- [x] T004 [P] 先在 `tests/unit/features/comic/domain/models.test.ts` 撰寫資料模型測試，涵蓋必填漫畫名稱、識別碼唯一性、ISO 8601 日期、正整數且唯一的順序、允許重複章節名稱，以及可選分鏡文字的換行保留；執行測試確認實作前失敗。
- [x] T005 [P] 先在 `tests/unit/features/comic/persistence/local-draft-store.test.ts` 撰寫本機保存測試，涵蓋資料格式版本、草稿集合、重新載入、刪除、瀏覽器拒絕保存及資料格式不支援；執行測試確認實作前失敗。
- [x] T006 依 [data-model.md](data-model.md) 實作 `src/features/comic/domain/models.ts`：`LocalDraftStore.schemaVersion`、`LocalDraftStore.drafts`；`ComicDraft.id`、`ComicDraft.title`、`ComicDraft.createdAt`、`ComicDraft.updatedAt`、`ComicDraft.chapters`；`Chapter.id`、`Chapter.title`、`Chapter.position`、`Chapter.panels`；`Panel.id`、`Panel.position`、`Panel.visualDescription`、`Panel.dialogue`。使 `tests/unit/features/comic/domain/models.test.ts` 通過。
- [x] T007 依 [data-model.md](data-model.md) 實作 `src/features/comic/persistence/local-draft-store.ts`，以 `LocalDraftStore.schemaVersion` 與 `LocalDraftStore.drafts` 保存草稿；保存失敗須回報錯誤且保留原始資料，不得傳送資料至伺服器。使 `tests/unit/features/comic/persistence/local-draft-store.test.ts` 通過。

**檢查點**：資料模型與本機保存測試通過後，才開始使用者故事。

---

## Phase 3：使用者故事 1 — 建立漫畫草稿與章節（優先級：P1，MVP）

**目標**：學生能建立漫畫草稿、新增章節及分鏡，並看到正確順序。

**獨立驗收方式**：從沒有草稿的狀態建立漫畫、加入兩個章節及多個分鏡，確認名稱與順序正確，且無須輸入學生個人識別資料。

### 測試

- [x] T008 [P] [US1] 在 `tests/unit/features/comic/draft-service.test.ts` 撰寫建立草稿、新增章節及新增分鏡的單元測試；執行測試確認服務實作前失敗。
- [x] T009 [P] [US1] 在 `tests/e2e/create-draft.spec.ts` 撰寫端到端測試，驗證建立草稿、增加章節與分鏡、順序顯示，以及不要求姓名或帳號；執行測試確認介面實作前失敗。

### 實作

- [x] T010 [US1] 依 [data-model.md](data-model.md) 實作 `src/features/comic/domain/draft-service.ts` 的建立草稿、新增章節及新增分鏡操作，遵循 `ComicDraft.id`、`ComicDraft.title`、`ComicDraft.createdAt`、`ComicDraft.updatedAt`、`ComicDraft.chapters`、`Chapter.id`、`Chapter.title`、`Chapter.position`、`Chapter.panels`、`Panel.id`、`Panel.position` 定義。
- [x] T011 [P] [US1] 在 `src/features/comic/components/DraftList.tsx` 建立草稿清單及建立／開啟操作；欄位與按鈕使用適齡台灣繁體中文，不加入登入或個資欄位。
- [x] T012 [P] [US1] 在 `src/features/comic/components/ChapterEditor.tsx` 建立章節及分鏡清單，提供新增章節與分鏡操作，依資料順序呈現並保留相同章節名稱。
- [x] T013 [US1] 在 `src/App.tsx` 整合 `DraftList`、`ChapterEditor` 與 `draft-service.ts`，並以 `tests/e2e/create-draft.spec.ts` 驗證建立流程可獨立完成。

**檢查點**：使用者故事 1 可獨立驗收；此為建議 MVP 範圍，不含部署。

---

## Phase 4：使用者故事 2 — 編輯並保存分鏡內容（優先級：P2）

**目標**：學生能修改畫面描述及對話、保存並重新開啟草稿，或確認刪除草稿。

**獨立驗收方式**：使用預先建立的草稿，修改一個分鏡並保存、重新開啟，確認文字及其他分鏡保持正確；測試刪除的確認與取消，以及本機保存失敗。

### 測試

- [x] T014 [P] [US2] 在 `tests/unit/features/comic/draft-editing.test.ts` 撰寫分鏡修改、換行保留、保存／重新載入、刪除及保存失敗測試；執行測試確認編輯實作前失敗。
- [x] T015 [P] [US2] 在 `tests/e2e/edit-save-delete.spec.ts` 撰寫端到端測試，驗證修改單一分鏡、保存後重新開啟、取消／確認刪除及保存錯誤提示。

### 實作

- [x] T016 [US2] 在 `src/features/comic/domain/draft-service.ts` 實作更新分鏡文字及刪除草稿操作；依 [data-model.md](data-model.md) 的 `Panel.id`、`Panel.visualDescription`、`Panel.dialogue`、`Panel.position`、`ComicDraft.updatedAt` 維持資料關係與保存時間。
- [x] T017 [P] [US2] 在 `src/features/comic/components/PanelEditor.tsx` 建立畫面描述與對話編輯欄位，依 [data-model.md](data-model.md) 的 `Panel.visualDescription` 及 `Panel.dialogue` 保留多行文字且互不覆寫。
- [x] T018 [P] [US2] 在 `src/features/comic/components/StorageAlert.tsx` 建立本機保存、載入失敗及瀏覽器儲存空間不足的明確錯誤提示；錯誤時不得清除目前編輯內容或顯示成功狀態。
- [x] T019 [US2] 在 `src/features/comic/components/DraftEditor.tsx` 整合 `PanelEditor`、明確保存狀態、`StorageAlert` 與刪除確認，並在 `src/features/comic/components/ChapterEditor.tsx` 顯示編輯器，且在 `src/App.tsx` 接通保存、重新開啟及刪除流程；使 `tests/e2e/edit-save-delete.spec.ts` 通過。

**檢查點**：使用者故事 2 可使用本機草稿獨立驗收，不要求帳號或伺服器同步。

---

## Phase 5：使用者故事 3 — 匯出漫畫大綱（優先級：P3）

**目標**：學生能匯出依漫畫、章節及分鏡順序排列的 UTF-8 純文字大綱。

**獨立驗收方式**：以含多章節、已填與未填文字的固定草稿匯出 `.txt`，核對內容與順序；無章節或匯出失敗時確認錯誤提示且不產生成功結果。

### 測試

- [x] T020 [P] [US3] 在 `tests/unit/features/comic/export/outline-export.test.ts` 撰寫純文字大綱測試，涵蓋章節／分鏡順序、空白欄位省略、換行保留及空章節處理；執行測試確認匯出實作前失敗。
- [x] T021 [P] [US3] 在 `tests/e2e/export-outline.spec.ts` 撰寫端到端測試，驗證匯出檔案內容、無章節時的提示，以及匯出失敗時不顯示成功狀態。

### 實作

- [x] T022 [US3] 依 [data-model.md](data-model.md) 實作 `src/features/comic/export/outline-export.ts`，以 `ComicDraft.title`、`ComicDraft.chapters`、`Chapter.title`、`Chapter.position`、`Chapter.panels`、`Panel.position`、`Panel.visualDescription`、`Panel.dialogue` 產生符合合約順序的 UTF-8 純文字大綱。
- [x] T023 [US3] 在 `src/features/comic/components/ExportOutlineButton.tsx` 實作 `.txt` 匯出操作；無章節時顯示原因，匯出失敗時顯示錯誤且不回報成功。
- [x] T024 [US3] 在 `src/features/comic/components/DraftEditor.tsx` 整合 `ExportOutlineButton` 及匯出錯誤狀態，並使 `tests/e2e/export-outline.spec.ts` 通過。

**檢查點**：三個使用者故事皆可由獨立測試資料驗收，整合流程可匯出完整大綱。

---

## Phase 6：Polish 與跨功能驗證

**目的**：驗證無障礙、不同螢幕、效能、使用者文件及目標學生體驗。

- [x] T025 [P] 在 `tests/e2e/accessibility-responsive.spec.ts` 驗證主要操作可用鍵盤完成、焦點清楚、欄位有標籤，並檢查桌面、平板及手機版面。
- [x] T026 [P] 在 `tests/e2e/draft-performance.spec.ts` 及 `tests/fixtures/large-draft.ts` 建立 10 章、100 分鏡資料集，驗證本機保存、重新開啟及匯出各在 1 秒內完成。
- [x] T027 [P] 在 `tests/usability/protocol.md` 撰寫適齡、匿名的 10 人任務測試流程及成人教育者審閱步驟；不得記錄姓名、學校或其他可識別資料。
- [ ] T028 在 `tests/usability/results.md` 記錄 10 位國小四至六年級學生的任務完成數、完成時間及彙總評分；僅在成人教育者確認所需同意及校務程序後執行，不記錄個人識別資料。
- [x] T029 [P] 在 `README.md` 撰寫台灣繁體中文使用說明、同裝置保存限制、共用瀏覽器風險、刪除方式及匯出流程。
- [x] T030 依 `specs/001-comic-storyboard/quickstart.md` 執行建置、單元、端到端及手動驗收情境，並將實際結果更新至 `specs/001-comic-storyboard/quickstart.md`。

---

## 相依關係與執行順序

### 階段相依

- **Setup（Phase 1）**：依序完成 T001 → T002 → T003。
- **Foundational（Phase 2）**：依賴 Setup；T004 與 T005 可平行，T006 須等 T004，T007 須等 T005 與 T006。完成後才可開始使用者故事。
- **使用者故事 1（Phase 3）**：T008 與 T009 可平行；實作 T010 須先觀察測試失敗；T011 與 T012 可在 T010 後平行，T013 等兩者完成。
- **使用者故事 2（Phase 4）**：依賴 US1 的草稿編輯流程；T014 與 T015 可平行，先確認測試失敗，再完成 T016；T017 與 T018 可平行，T019 等三者完成。
- **使用者故事 3（Phase 5）**：匯出單元及端到端測試 T020、T021 可平行；T022、T023、T024 依序完成。
- **Polish（Phase 6）**：依賴三個故事完成；T025、T026、T027、T029 可平行。T028 須等 T027 及成人教育者批准，T030 最後執行。

### 使用者故事相依

- **US1（P1）**：依賴 Foundational；不依賴其他使用者故事。
- **US2（P2）**：整合介面依賴 US1 的草稿與章節流程；單元及端到端測試可使用固定草稿資料。
- **US3（P3）**：整合匯出按鈕依賴 US2 的編輯器；匯出格式測試可使用固定草稿資料。

### 平行機會

- Foundational：T004 與 T005 使用不同測試檔案。
- US1：T008 與 T009 的單元／端到端測試可平行；T011 與 T012 分別建立草稿清單與章節編輯器。
- US2：T014 與 T015 的測試可平行；T017 與 T018 分別建立編輯欄位與錯誤提示。
- US3：T020 與 T021 的單元／端到端測試可平行。
- Polish：無障礙測試、效能測試、匿名測試流程及 README 可在功能整合後平行處理。

### 使用者故事 1 平行範例

```text
T008：在 tests/unit/features/comic/draft-service.test.ts 撰寫建立及章節單元測試
T009：在 tests/e2e/create-draft.spec.ts 撰寫建立草稿端到端測試

T010 測試先行通過後：
T011：建立 src/features/comic/components/DraftList.tsx
T012：建立 src/features/comic/components/ChapterEditor.tsx
```

### 使用者故事 2 平行範例

```text
T014：在 tests/unit/features/comic/draft-editing.test.ts 撰寫編輯及保存測試
T015：在 tests/e2e/edit-save-delete.spec.ts 撰寫編輯流程端到端測試

T016 服務實作完成後：
T017：建立 src/features/comic/components/PanelEditor.tsx
T018：建立 src/features/comic/components/StorageAlert.tsx
```

### 使用者故事 3 平行範例

```text
T020：在 tests/unit/features/comic/export/outline-export.test.ts 撰寫匯出單元測試
T021：在 tests/e2e/export-outline.spec.ts 撰寫匯出端到端測試
```

---

## 實作策略

### 先完成 MVP（僅使用者故事 1）

1. 完成 Phase 1 Setup 及 Phase 2 Foundational。
2. 先執行 T008、T009，確認 US1 測試在實作前失敗。
3. 完成 Phase 3 US1，獨立驗收建立草稿、章節及分鏡。
4. 停止並審閱 MVP；未取得明確授權前不得部署或提交。

### 增量交付

1. 完成 Setup 與 Foundational。
2. 加入 US1，形成可建立及整理漫畫結構的 MVP。
3. 加入 US2，支援保存、重新開啟、修改及刪除。
4. 加入 US3，支援大綱匯出。
5. 最後完成跨瀏覽器、無障礙、效能與匿名學生使用者驗證。

## 備註

- `[P]` 僅用於不同檔案且沒有未完成前置依賴的任務。
- `[US1]`、`[US2]`、`[US3]` 對應規格中的使用者故事。
- 測試任務依憲章測試先行原則，須先觀察失敗再實作。
- 所有產品操作及文件使用台灣繁體中文；技術識別字與正式 CLI 命令保留英文。
- T001–T027、T029–T030 已完成；T028 因尚未取得成人教育者對校務程序及家長／監護人同意的確認而保留未完成。
- 不得自動提交、推送或部署；不得在未取得所需同意前進行學生使用者測試。

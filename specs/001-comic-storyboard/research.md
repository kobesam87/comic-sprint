# 研究與技術決策：漫畫分鏡與腳本草稿管理工具

**日期**：2026-11-20
**範圍**：Phase 0；只供規劃使用，未建立應用程式碼。

## 決策摘要

### 決策 1：採用 React + TypeScript + Vite

**決定**：專案方核准 React + TypeScript + Vite 作為網頁應用程式候選技術棧；Node.js 採 22.12 LTS 系列，最低 22.12.0。依 2026-11-20 查詢的套件最新版本，規劃參考 React 19.3.1、TypeScript 7.0.2、Vite 8.3.8。實作前仍須在套件相依設定中鎖定相容版本。

**理由**：功能包含草稿清單、章節與分鏡的巢狀編輯、保存狀態及錯誤回饋。React 文件提供元件、列表呈現及事件處理等互動 UI 模式；Vite 提供 React + TypeScript 專案範本與靜態建置能力。

**替代方案**：

- 原生 HTML、CSS、JavaScript + Vite：相依較少，適合極小介面；但多區塊編輯狀態與重複元件需自行維護。
- Svelte + TypeScript + Vite：以編譯器產生 UI，可作為輕量替代；專案方已選擇 React 候選，因此不採用。

### 決策 2：使用 Vitest 與 Playwright

**決定**：使用 Vitest 5.1.1 測試草稿領域規則、保存失敗與匯出內容；使用 Playwright 1.65.1 驗證端到端流程，涵蓋 Chromium、Firefox 與 WebKit。

**理由**：Vitest 與 Vite 設定整合，適合快速執行單元測試；Playwright 支援多瀏覽器引擎，適合檢驗此網頁工具在主要瀏覽器中的建立、編輯及匯出流程。Vite 與 Vitest 文件均列出 Node.js 22.12 為支援範圍下限之一。

**替代方案**：

- 僅進行手動測試：成本較低，但無法穩定防止保存、順序及匯出回歸。
- 單一瀏覽器自動化：執行較快，但對不同瀏覽器的本機保存與下載行為涵蓋不足。

### 決策 3：採同裝置本機保存

**決定**：遵循成人教育者已核准的政策：不建立帳號、不上傳、不跨裝置同步；草稿保留至創作者刪除。技術提案採 `localStorage` 保存文字型草稿，並以單一版本化資料結構保存。

**理由**：功能只管理漫畫標題、章節、分鏡描述與對話，不含圖片或協作需求。`localStorage` 可跨瀏覽器工作階段保留資料，實作與操作概念較簡單，適合小型文字草稿。

**風險與控制**：

- 使用者或瀏覽器可能清除本機資料，或設定禁止保存；保存失敗時必須顯示明確訊息，不得宣稱成功。
- 同一瀏覽器設定檔的其他使用者可能看到草稿；介面須在保存前提示共用裝置風險，並提供確認刪除操作。
- 本機保存不提供備份或跨裝置存取；匯出大綱是使用者自行保存副本的方式。
- 不得以 `sessionStorage` 取代持久保存，因其頁面工作階段結束時會清除，無法符合重新開啟草稿需求。

**替代方案**：

- IndexedDB：支援結構化資料、非同步操作及交易，適合大量資料；對目前純文字、小規模草稿增加不必要複雜度。若未來加入圖片或大量資料再重新評估。
- 伺服器保存：可支援跨裝置或教師管理，但需要存取控制、身分策略及更完整的學生資料治理；目前規格與核准政策排除該方案。

### 決策 4：以易讀文字大綱匯出

**決定**：匯出為 UTF-8 純文字 `.txt`，依漫畫名稱、章節、分鏡、畫面描述及對話順序排列；未填欄位不輸出空白佔位文字。

**理由**：功能只包含文字腳本，不需要影像或版面配置相依套件；純文字容易閱讀，也方便學生交由成人教育者審閱。

**替代方案**：

- PDF：版面固定，但需額外處理排版與字型。
- 雲端文件或公開連結：需要外部服務及資料分享權限，不符合目前不登入、不同步、不公開分享的政策。

### 決策 5：使用可及性基準

**決定**：設計及驗收參考 W3C WCAG 2.2 指引，至少檢查鍵盤操作、焦點可見、輸入欄位標籤、錯誤訊息關聯及文字對比。此為產品品質基準，不宣稱法律合規。

**理由**：主要使用者為國小學生，且憲章要求使用者流程在 UI／互動層級驗證。

## 參考資料

- [React Quick Start](https://react.dev/learn)：元件、列表、資料呈現及事件處理。
- [Vite Guide](https://vite.dev/guide/)：React／TypeScript 範本、開發伺服器與建置；Vite 8.3.8 的套件中繼資料要求 Node.js `^20.19.0 || >=22.12.0`。
- [Svelte Overview](https://svelte.dev/docs/svelte/overview)：Svelte 作為 UI 框架及 SvelteKit 的範圍。
- [Vitest Guide](https://vitest.dev/guide/)：測試流程；Vitest 5.1.1 套件中繼資料要求 Node.js `^22.12.0 || ^24.0.0 || >=26.0.0`。
- [Playwright Introduction](https://playwright.dev/docs/intro)：端到端測試及 Chromium、WebKit、Firefox 支援。
- [MDN: `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)：資料跨工作階段保存；瀏覽器政策可能禁止保存。
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)：結構化資料、非同步交易及瀏覽器配額／清除差異。
- [W3C WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)：可及性檢查參考。
- [npm React latest metadata](https://registry.npmjs.org/react/latest)、[TypeScript](https://registry.npmjs.org/typescript/latest)、[Vite](https://registry.npmjs.org/vite/latest)、[Vitest](https://registry.npmjs.org/vitest/latest)、[Playwright Test](https://registry.npmjs.org/@playwright%2Ftest/latest)：版本參考，查詢日為 2026-11-20。

# IELTS 5000・背單字

> 用間隔重複（SM-2）高效背誦 IELTS 5000 核心單字。純前端、離線可用、自動存檔。

一個瀏覽器端的英文單字 SRS（Spaced Repetition System）學習網站，收錄 **4,869** 個 IELTS 單字。
採用間隔重複學習流程，搭配簡潔現代的行動裝置介面（azure-blue 品牌色、圓角卡片、柔和陰影、深色模式）。

## ✨ 功能

- **間隔重複（SM-2）** — 依你對每張卡片的記憶程度（忘記／模糊／記得／秒答）自動排定下次複習時間。
- **雙向背誦** — 「看英文 → 想中文」或「看中文 → 拼英文」。
- **詞性篩選** — 全部／名詞／動詞／形容詞／副詞／其他。
- **每日新卡上限** — 控制學習節奏，每日自動重置。
- **發音** — 內建瀏覽器 Web Speech 朗讀英文（免 API key）。
- **進度統計** — 已學習／待複習／已熟記，含進度條。
- **本機存檔 + 匯出／匯入** — 進度存於 `localStorage`，可匯出 JSON 備份、跨裝置轉移。
- **深色模式** — 跟隨系統並可手動切換。
- **鍵盤操作** — `空白鍵` 翻牌，`1`–`4` 評分。
- **PWA** — 可加入主畫面、離線使用。

## 🛠 技術

React 18 + TypeScript + Vite。無後端，部署為 GitHub Pages 靜態網站。

```
data/ielts-raw.txt        # 從 "IELTS 5000 words.pdf" 抽取的文字（資料來源）
scripts/extract-pdf.mjs    # PDF → ielts-raw.txt（一次性，需 pdfjs-dist）
scripts/build-deck.mjs     # ielts-raw.txt → src/deck.json（dev/build 前自動執行）
src/lib/srs.ts             # SM-2 演算法
src/lib/queue.ts           # 每日佇列 / 待複習選取 / 統計
src/lib/store.ts           # localStorage 存取、匯出／匯入
src/app-state.tsx          # 全域狀態（React Context）
src/components/            # UI 元件
src/styles/tokens.css      # 設計 token（淺色／深色）
```

## 🚀 開發

```bash
npm install
npm run dev        # build:deck 會自動先跑，產生 src/deck.json
npm run build      # 型別檢查 + 打包到 dist/
npm run preview
```

## 📦 部署（GitHub Pages）

已內含 `.github/workflows/deploy.yml`：推到 `main` 即自動打包並部署。
`vite.config.ts` 設定 `base: './'`（相對路徑），因此放在 `https://<user>.github.io/<repo>/` 子路徑也能正常運作。

首次部署需到 repo **Settings → Pages → Source** 選擇 **GitHub Actions**。

## 📖 更新單字資料

```bash
npm i -D pdfjs-dist
node scripts/extract-pdf.mjs "/path/to/IELTS 5000 words.pdf"   # 重新抽取
npm run build:deck                                              # 重新產生 deck.json
```

## ⚖️ 資料來源

單字釋義抽取自個人持有的《IELTS 5000 words》PDF，僅供個人學習用途。原始 PDF 不包含在此 repo 中。

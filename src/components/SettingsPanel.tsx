import { useRef, useState } from 'react';
import { useApp } from '../app-state';
import { CATEGORIES, CATEGORY_LABEL, categoryCounts, DECK } from '../lib/deck';
import type { Direction, FilterCategory } from '../lib/types';

export function SettingsPanel() {
  const { store, updateSettings, restart, exportData, importData, resetProgress } = useApp();
  const { category, direction, newPerDay, theme } = store.settings;
  const counts = categoryCounts();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((t) => {
      setMsg(importData(t) ? '進度已匯入 ✓' : '匯入失敗：檔案格式不正確');
      setTimeout(() => setMsg(null), 2500);
    });
    e.target.value = '';
  };

  return (
    <div className="panel fade-in">
      <div className="panel-card">
        <h2>學習範圍</h2>

        <div className="field">
          <label className="field__label" htmlFor="cat">詞性分類</label>
          <select
            id="cat" className="select" value={category}
            onChange={(e) => updateSettings({ category: e.target.value as FilterCategory })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}（{counts[c]}）</option>
            ))}
          </select>
        </div>

        <div className="field">
          <span className="field__label">背誦方向</span>
          <div className="segmented">
            {(['en2zh', 'zh2en'] as Direction[]).map((d) => (
              <button key={d} aria-pressed={direction === d} onClick={() => updateSettings({ direction: d })}>
                {d === 'en2zh' ? '看英文 → 想中文' : '看中文 → 拼英文'}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="npd">
            每日新卡上限 <span>{newPerDay}</span>
          </label>
          <input
            id="npd" className="range" type="range" min={5} max={60} step={5}
            value={newPerDay}
            onChange={(e) => updateSettings({ newPerDay: Number(e.target.value) })}
          />
        </div>

        <button className="btn btn--ghost btn--block" onClick={restart}>重新開始今日複習</button>
      </div>

      <div className="panel-card">
        <h2>外觀</h2>
        <div className="field" style={{ marginBottom: 0 }}>
          <span className="field__label">主題</span>
          <div className="segmented">
            <button aria-pressed={theme === 'light'} onClick={() => updateSettings({ theme: 'light' })}>淺色</button>
            <button aria-pressed={theme === 'dark'} onClick={() => updateSettings({ theme: 'dark' })}>深色</button>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <h2>進度資料</h2>
        <div className="row-btns" style={{ marginBottom: 'var(--space-2)' }}>
          <button className="btn btn--ghost" onClick={exportData}>匯出備份</button>
          <button className="btn btn--ghost" onClick={() => fileRef.current?.click()}>匯入備份</button>
        </div>
        <button
          className="btn btn--danger btn--block"
          onClick={() => { if (confirm('確定要清除所有學習進度嗎？此動作無法復原。')) resetProgress(); }}
        >
          清除所有進度
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
        {msg && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 0, marginTop: 'var(--space-2)' }}>{msg}</p>}
      </div>

      <div className="panel-card">
        <h2>單字庫</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          共收錄 <b style={{ color: 'var(--text)' }}>{DECK.length.toLocaleString()}</b> 個 IELTS 單字，
          進度自動儲存在此瀏覽器。換裝置時請用匯出／匯入轉移。
        </p>
      </div>
    </div>
  );
}

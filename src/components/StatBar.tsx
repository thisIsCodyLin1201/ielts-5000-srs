import { useApp } from '../app-state';
import { CATEGORY_LABEL } from '../lib/deck';

export function StatBar() {
  const { store, stats, remaining } = useApp();
  const { category, direction, newPerDay } = store.settings;

  return (
    <div className="statbar">
      <span className="stat-chip">{CATEGORY_LABEL[category]}</span>
      <span className="stat-chip">{direction === 'en2zh' ? 'EN → 中' : '中 → EN'}</span>
      <span className="stat-chip stat-chip--new">
        <span className="dot" />新卡 <b>{store.daily.newCount}/{newPerDay}</b>
      </span>
      <span className="stat-chip stat-chip--due">
        <span className="dot" />待複習 <b>{stats.due}</b>
      </span>
      <span className="stat-chip stat-chip--left">
        <span className="dot" />本輪剩 <b>{remaining}</b>
      </span>
    </div>
  );
}

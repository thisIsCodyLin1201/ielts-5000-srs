import { useApp } from '../app-state';
import { CATEGORY_LABEL } from '../lib/deck';

export function StatsPanel() {
  const { stats, store } = useApp();
  const pct = stats.total ? Math.round((stats.learned / stats.total) * 100) : 0;

  return (
    <div className="panel fade-in">
      <div className="panel-card">
        <h2>學習進度 · {CATEGORY_LABEL[store.settings.category]}</h2>
        <div className="stat-grid">
          <div className="stat-cell stat-cell--learned">
            <div className="stat-cell__num">{stats.learned}</div>
            <div className="stat-cell__label">已學習</div>
          </div>
          <div className="stat-cell stat-cell--due">
            <div className="stat-cell__num">{stats.due}</div>
            <div className="stat-cell__label">待複習</div>
          </div>
          <div className="stat-cell stat-cell--mastered">
            <div className="stat-cell__num">{stats.mastered}</div>
            <div className="stat-cell__label">已熟記</div>
          </div>
        </div>

        <div className="progress" style={{ marginTop: 'var(--space-4)' }}>
          <div className="progress__bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-label">
          <span>{stats.learned} / {stats.total} 個單字</span>
          <span>{pct}%</span>
        </div>
      </div>

      <div className="panel-card">
        <h2>今日</h2>
        <div className="stat-grid">
          <div className="stat-cell">
            <div className="stat-cell__num">{store.daily.newCount}</div>
            <div className="stat-cell__label">今日新學</div>
          </div>
          <div className="stat-cell">
            <div className="stat-cell__num">{stats.newRemaining}</div>
            <div className="stat-cell__label">新卡剩餘</div>
          </div>
          <div className="stat-cell">
            <div className="stat-cell__num">{store.settings.newPerDay}</div>
            <div className="stat-cell__label">每日上限</div>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <h2>關於間隔重複</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
          本站採用 <b style={{ color: 'var(--text)' }}>SM-2</b> 演算法：依你對每張卡片的記憶程度（忘記／模糊／記得／秒答），
          自動安排下次複習的時間。答得越好，間隔越長；忘記則重置，隔天再見。
        </p>
      </div>
    </div>
  );
}

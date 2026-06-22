import { useApp } from '../app-state';
import { StatsIcon, SettingsIcon, SunIcon, MoonIcon, BackIcon } from './icons';

export function Header() {
  const { panel, setPanel, store, toggleTheme } = useApp();
  const dark = store.settings.theme === 'dark';
  const inPanel = panel !== 'study';

  return (
    <header className="header">
      {inPanel ? (
        <button className="icon-btn" onClick={() => setPanel('study')} aria-label="返回練習">
          <BackIcon />
        </button>
      ) : (
        <div className="header__brand">
          <div className="header__logo">IE</div>
          <div className="header__title">
            IELTS 5000
            <small>英文單字・間隔重複</small>
          </div>
        </div>
      )}

      <div className="header__spacer" />

      <button className="icon-btn" onClick={toggleTheme} aria-label="切換深色模式">
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
      <button
        className="icon-btn"
        aria-pressed={panel === 'stats'}
        onClick={() => setPanel(panel === 'stats' ? 'study' : 'stats')}
        aria-label="統計"
      >
        <StatsIcon />
      </button>
      <button
        className="icon-btn"
        aria-pressed={panel === 'settings'}
        onClick={() => setPanel(panel === 'settings' ? 'study' : 'settings')}
        aria-label="設定"
      >
        <SettingsIcon />
      </button>
    </header>
  );
}

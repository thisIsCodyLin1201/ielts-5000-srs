import type { Store, Settings } from './types';
import { todayISO } from './srs';

const KEY = 'ielts-srs-v1';

const DEFAULT_SETTINGS: Settings = {
  newPerDay: 20,
  category: 'All',
  direction: 'en2zh',
  theme: 'light',
};

export function defaultStore(settings: Partial<Settings> = {}): Store {
  return {
    version: 1,
    states: {},
    settings: { ...DEFAULT_SETTINGS, ...settings },
    daily: { date: todayISO(), newCount: 0 },
  };
}

/** Load + migrate from localStorage; resets the daily new-card count across days. */
export function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return withDefaultTheme(defaultStore());
    const s = JSON.parse(raw) as Store;
    if (!s || typeof s !== 'object' || !s.states) return withDefaultTheme(defaultStore());
    s.settings = { ...DEFAULT_SETTINGS, ...s.settings };
    s.daily = s.daily ?? { date: todayISO(), newCount: 0 };
    if (s.daily.date !== todayISO()) s.daily = { date: todayISO(), newCount: 0 };
    return s;
  } catch {
    return withDefaultTheme(defaultStore());
  }
}

/** First-visit default: follow the OS dark-mode preference. */
function withDefaultTheme(s: Store): Store {
  try {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) s.settings.theme = 'dark';
  } catch { /* ignore */ }
  return s;
}

export function save(s: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch { /* quota / private mode — ignore */ }
}

export function exportBlob(s: Store): void {
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ielts-srs-backup-${todayISO()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImport(text: string): Store | null {
  try {
    const obj = JSON.parse(text) as Store;
    if (!obj || !obj.states || !obj.settings) return null;
    obj.settings = { ...DEFAULT_SETTINGS, ...obj.settings };
    obj.daily = obj.daily ?? { date: todayISO(), newCount: 0 };
    return obj;
  } catch {
    return null;
  }
}

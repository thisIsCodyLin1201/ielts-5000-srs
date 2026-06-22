import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Card, CardState, Grade, Settings, Store } from './lib/types';
import { freshState, schedule, intervalLabel, todayISO } from './lib/srs';
import { getCard } from './lib/deck';
import { buildQueue, buildPracticeQueue, selectStats, type Stats } from './lib/queue';
import { load, save, defaultStore, exportBlob, parseImport } from './lib/store';

export type Panel = 'study' | 'settings' | 'stats';

interface AppContextValue {
  store: Store;
  panel: Panel;
  setPanel: (p: Panel) => void;
  // session
  current: Card | null;
  currentState: CardState;
  flipped: boolean;
  done: number;
  remaining: number;
  isDone: boolean;
  previews: Record<Grade, string>;
  flip: () => void;
  grade: (g: Grade) => void;
  restart: () => void;
  practiceAgain: () => void;
  // settings / data
  updateSettings: (patch: Partial<Settings>) => void;
  toggleTheme: () => void;
  importData: (text: string) => boolean;
  exportData: () => void;
  resetProgress: () => void;
  stats: Stats;
}

const Ctx = createContext<AppContextValue | null>(null);
export const useApp = (): AppContextValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
};

const GRADES: Grade[] = ['again', 'hard', 'good', 'easy'];

export function AppProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => load());
  const [queue, setQueue] = useState<string[]>(() => buildQueue(store));
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [panel, setPanel] = useState<Panel>('study');

  // persist + apply theme
  useEffect(() => { save(store); }, [store]);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', store.settings.theme);
  }, [store.settings.theme]);

  const currentId = queue[0] ?? null;
  const current = currentId ? getCard(currentId) ?? null : null;
  const currentState = useMemo<CardState>(
    () => (currentId && store.states[currentId]) || freshState(),
    [currentId, store.states],
  );

  const previews = useMemo<Record<Grade, string>>(() => {
    const out = {} as Record<Grade, string>;
    for (const g of GRADES) out[g] = intervalLabel(schedule(currentState, g).interval);
    return out;
  }, [currentState]);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  // Compute from current closure values (no nested/​impure updaters) so a
  // StrictMode double-invoke can't double-apply the schedule or new-card count.
  const grade = useCallback((g: Grade) => {
    const id = queue[0];
    if (!id) return;
    const prev = store.states[id] ?? freshState();
    const wasNew = !prev.introduced;
    const next = schedule(prev, g);
    setStore({
      ...store,
      states: { ...store.states, [id]: next },
      daily: wasNew ? { ...store.daily, newCount: store.daily.newCount + 1 } : store.daily,
    });
    const rest = queue.slice(1);
    setQueue(g === 'again' ? [...rest, id] : rest); // "again" => re-study this session
    setFlipped(false);
    setDone((d) => d + 1);
  }, [queue, store]);

  const restart = useCallback(() => {
    // roll the daily counter if the date changed since load
    const fixed = store.daily.date === todayISO() ? store : { ...store, daily: { date: todayISO(), newCount: 0 } };
    if (fixed !== store) setStore(fixed);
    setQueue(buildQueue(fixed));
    setFlipped(false);
    setDone(0);
    setPanel('study');
  }, [store]);

  const practiceAgain = useCallback(() => {
    setQueue(buildPracticeQueue(store));
    setFlipped(false);
    setDone(0);
    setPanel('study');
  }, [store]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    const next = { ...store, settings: { ...store.settings, ...patch } };
    setStore(next);
    // changing the study pool requires rebuilding today's queue
    if (patch.category !== undefined || patch.newPerDay !== undefined) {
      setQueue(buildQueue(next));
      setFlipped(false);
      setDone(0);
    }
  }, [store]);

  const toggleTheme = useCallback(() => {
    updateSettings({ theme: store.settings.theme === 'dark' ? 'light' : 'dark' });
  }, [store.settings.theme, updateSettings]);

  const importData = useCallback((text: string): boolean => {
    const obj = parseImport(text);
    if (!obj) return false;
    setStore(obj);
    setQueue(buildQueue(obj));
    setFlipped(false);
    setDone(0);
    setPanel('study');
    return true;
  }, []);

  const exportData = useCallback(() => exportBlob(store), [store]);

  const resetProgress = useCallback(() => {
    const fresh = defaultStore(store.settings); // keep settings, wipe progress
    setStore(fresh);
    setQueue(buildQueue(fresh));
    setFlipped(false);
    setDone(0);
    setPanel('study');
  }, [store.settings]);

  const stats = useMemo(() => selectStats(store), [store]);

  const value: AppContextValue = {
    store, panel, setPanel,
    current, currentState, flipped, done,
    remaining: queue.length,
    isDone: queue.length === 0,
    previews, flip, grade, restart, practiceAgain,
    updateSettings, toggleTheme, importData, exportData, resetProgress, stats,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

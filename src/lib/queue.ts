import type { Store } from './types';
import { cardsInCategory } from './deck';
import { todayISO, isMastered } from './srs';

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Today's study queue: all due reviews + up to the remaining daily new-card budget. */
export function buildQueue(store: Store): string[] {
  const today = todayISO();
  const pool = cardsInCategory(store.settings.category);
  const reviews: string[] = [];
  const fresh: string[] = [];
  for (const c of pool) {
    const st = store.states[c.id];
    if (st && st.introduced) {
      if (st.due <= today) reviews.push(c.id);
    } else {
      fresh.push(c.id);
    }
  }
  const remainingNew = Math.max(0, store.settings.newPerDay - store.daily.newCount);
  return shuffle([...shuffle(reviews), ...shuffle(fresh).slice(0, remainingNew)]);
}

/** "Study again" queue: every introduced card in scope, regardless of due date. */
export function buildPracticeQueue(store: Store): string[] {
  const pool = cardsInCategory(store.settings.category);
  const introduced = pool.filter((c) => store.states[c.id]?.introduced).map((c) => c.id);
  if (introduced.length) return shuffle(introduced);
  // nothing learned yet — just practise a fresh batch
  return shuffle(pool.map((c) => c.id)).slice(0, Math.max(store.settings.newPerDay, 10));
}

export interface Stats {
  total: number;
  learned: number;
  due: number;
  mastered: number;
  newRemaining: number;
}

export function selectStats(store: Store): Stats {
  const today = todayISO();
  const pool = cardsInCategory(store.settings.category);
  let learned = 0, due = 0, mastered = 0;
  for (const c of pool) {
    const st = store.states[c.id];
    if (st?.introduced) {
      learned++;
      if (st.due <= today) due++;
      if (isMastered(st)) mastered++;
    }
  }
  return {
    total: pool.length,
    learned,
    due,
    mastered,
    newRemaining: Math.max(0, store.settings.newPerDay - store.daily.newCount),
  };
}

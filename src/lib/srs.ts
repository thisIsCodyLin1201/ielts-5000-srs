import type { CardState, Grade } from './types';

// Map the 4 rating buttons to SuperMemo-2 quality scores.
const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

export function todayISO(today: Date = new Date()): string {
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayISO(dt);
}

export function freshState(today: string = todayISO()): CardState {
  return { ef: 2.5, reps: 0, interval: 0, due: today, introduced: false, lapses: 0 };
}

/** Pure SM-2 step: returns the next state for `state` given a `grade`. */
export function schedule(state: CardState, grade: Grade, today: string = todayISO()): CardState {
  const q = QUALITY[grade];
  let { ef, reps, interval, lapses } = state;

  if (q < 3) {
    // forgot -> reset progress, retry tomorrow
    reps = 0;
    interval = 1;
    lapses += 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ef);
    // "hard" gives a gentler step than the raw ease curve
    if (grade === 'hard') interval = Math.max(1, Math.round(interval * 0.6));
  }

  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  ef = Math.max(1.3, Math.round(ef * 100) / 100);

  return {
    ef,
    reps,
    interval,
    lapses,
    introduced: true,
    due: addDays(today, interval),
  };
}

/** Human-readable interval preview shown on each grade button. */
export function intervalLabel(days: number): string {
  if (days <= 0) return 'now';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return months <= 1 ? '1 mo' : `${months} mo`;
  }
  const years = Math.round((days / 365) * 10) / 10;
  return years === 1 ? '1 yr' : `${years} yr`;
}

/** A card is "mastered" once its interval reaches ~3 weeks. */
export function isMastered(state: CardState | undefined): boolean {
  return !!state && state.interval >= 21;
}

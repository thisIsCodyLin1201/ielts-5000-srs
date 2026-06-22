import { useEffect } from 'react';
import { useApp } from '../app-state';
import type { Grade } from '../lib/types';

const KEY_TO_GRADE: Record<string, Grade> = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' };

export function useKeyboard() {
  const { panel, isDone, flipped, flip, grade } = useApp();

  useEffect(() => {
    if (panel !== 'study' || isDone) return;

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        flip();
      } else if (flipped && KEY_TO_GRADE[e.key]) {
        e.preventDefault();
        grade(KEY_TO_GRADE[e.key]);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel, isDone, flipped, flip, grade]);
}

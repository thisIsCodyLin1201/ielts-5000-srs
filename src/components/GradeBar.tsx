import { useApp } from '../app-state';
import type { Grade } from '../lib/types';

const GRADES: { g: Grade; label: string; key: string }[] = [
  { g: 'again', label: '忘記', key: '1' },
  { g: 'hard', label: '模糊', key: '2' },
  { g: 'good', label: '記得', key: '3' },
  { g: 'easy', label: '秒答', key: '4' },
];

export function GradeBar() {
  const { flipped, flip, grade, previews } = useApp();

  if (!flipped) {
    return (
      <button className="btn btn--primary btn--block" onClick={flip}>
        顯示答案
      </button>
    );
  }

  return (
    <div className="gradebar">
      {GRADES.map(({ g, label, key }) => (
        <button key={g} className={`grade-btn grade-btn--${g}`} onClick={() => grade(g)}>
          <span className="grade-btn__key">{key}</span>
          <span className="grade-btn__label">{label}</span>
          <span className="grade-btn__interval">{previews[g]}</span>
        </button>
      ))}
    </div>
  );
}

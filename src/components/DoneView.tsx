import { useApp } from '../app-state';

export function DoneView() {
  const { done, stats, practiceAgain } = useApp();
  const studiedSomething = done > 0;

  return (
    <div className="done fade-in">
      <div className="done__emoji">{studiedSomething ? '🎉' : '📚'}</div>
      <div className="done__title">{studiedSomething ? '今日複習完成！' : '目前沒有待複習的卡片'}</div>
      <p className="done__sub">
        {studiedSomething
          ? `這一輪複習了 ${done} 張卡片。已學習 ${stats.learned} / ${stats.total} 個單字，其中 ${stats.mastered} 個已熟記。`
          : '可以調高每日新卡數量，或換個詞性分類，再開始一輪練習。'}
      </p>
      <button className="btn btn--primary" onClick={practiceAgain}>
        再複習一輪
      </button>
    </div>
  );
}

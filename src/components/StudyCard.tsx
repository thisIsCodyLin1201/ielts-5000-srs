import { useApp } from '../app-state';
import { CATEGORY_LABEL } from '../lib/deck';
import type { Card } from '../lib/types';
import { TtsButton } from './TtsButton';

function Phrases({ card }: { card: Card }) {
  if (!card.phrases.length) return null;
  return (
    <div className="phrases">
      <div className="phrases__label">常用搭配</div>
      {card.phrases.map((p, i) => (
        <div className="phrase" key={i}>
          <b>{p.phrase}</b> <span>{p.meaning}</span>
        </div>
      ))}
    </div>
  );
}

function Variants({ card }: { card: Card }) {
  if (!card.variants.length) return null;
  return <div className="answer__variants"><b>亦作</b> {card.variants.join(', ')}</div>;
}

function ExampleSentence({ card }: { card: Card }) {
  if (!card.example?.en) return null;
  const { en, zh } = card.example;
  // render **word** segments as bold; TTS reads the marker-stripped sentence
  const parts = en.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  const plain = en.replace(/\*\*/g, '');
  return (
    <div className="example">
      <div className="example__label">例句</div>
      <p className="example__en">
        {parts.map((p, i) =>
          p.startsWith('**') && p.endsWith('**')
            ? <b key={i}>{p.slice(2, -2)}</b>
            : <span key={i}>{p}</span>,
        )}
        <span className="example__tts"><TtsButton text={plain} compact /></span>
      </p>
      {zh && <p className="example__zh">{zh}</p>}
    </div>
  );
}

export function StudyCard() {
  const { current: card, currentState, flipped, flip, store } = useApp();
  if (!card) return null;

  const en2zh = store.settings.direction === 'en2zh';
  const isNew = !currentState.introduced;
  const catLabel = CATEGORY_LABEL[(card.category as keyof typeof CATEGORY_LABEL)] ?? card.category;

  return (
    <div
      className={`card${!flipped ? ' card--clickable' : ''}`}
      onClick={() => { if (!flipped) flip(); }}
      role="button"
      tabIndex={0}
    >
      <div className="card__tags">
        <span className="tag tag--cat">{catLabel}</span>
        {isNew && <span className="tag tag--new">新單字</span>}
        {!isNew && currentState.reps === 0 && <span className="tag tag--again">需加強</span>}
      </div>

      <div className="card__center">
        {en2zh ? (
          <>
            <div className="prompt-word">{card.word}</div>
            <div className="prompt-sub">
              <span className="pos-badge">{card.pos}</span>
              {card.colloc && <span className="colloc-badge">{card.colloc}</span>}
            </div>
            <TtsButton text={card.word} />
          </>
        ) : (
          <div className="prompt-meaning">{card.meaning}</div>
        )}

        {flipped && (
          <div className="answer">
            <div className="answer__divider" />
            {en2zh ? (
              <>
                <div className="answer__meaning">{card.meaning}</div>
                <ExampleSentence card={card} />
                <Variants card={card} />
                <Phrases card={card} />
              </>
            ) : (
              <>
                <div className="answer__word">
                  {card.word}
                  <TtsButton text={card.word} />
                </div>
                <div className="prompt-sub">
                  <span className="pos-badge">{card.pos}</span>
                  {card.colloc && <span className="colloc-badge">{card.colloc}</span>}
                </div>
                <ExampleSentence card={card} />
                <Variants card={card} />
                <Phrases card={card} />
              </>
            )}
          </div>
        )}
      </div>

      {!flipped && (
        <div className="tap-hint">
          點一下卡片或按 <span className="kbd">space</span> 顯示答案
        </div>
      )}
    </div>
  );
}

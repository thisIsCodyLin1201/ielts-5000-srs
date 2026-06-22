import { useState } from 'react';
import { speak, ttsSupported } from '../lib/tts';
import { SpeakerIcon } from './icons';

export function TtsButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const [speaking, setSpeaking] = useState(false);
  if (!ttsSupported()) return null;

  return (
    <button
      className={`tts-btn${compact ? ' tts-btn--sm' : ''}${speaking ? ' is-speaking' : ''}`}
      aria-label={`朗讀 ${text}`}
      onClick={(e) => {
        e.stopPropagation();
        setSpeaking(true);
        speak(text, () => setSpeaking(false));
      }}
    >
      <SpeakerIcon />
    </button>
  );
}

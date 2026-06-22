// Browser text-to-speech for English pronunciation (Web Speech API, no key needed).

let voice: SpeechSynthesisVoice | null = null;
let initialized = false;

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(): void {
  if (!ttsSupported()) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  // Prefer a high-quality en-US/en-GB voice; fall back to any English voice.
  voice =
    voices.find((v) => /^en-US/i.test(v.lang) && /natural|samantha|google/i.test(v.name)) ||
    voices.find((v) => /^en-US/i.test(v.lang)) ||
    voices.find((v) => /^en-GB/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null;
}

export function initTTS(): void {
  if (initialized || !ttsSupported()) return;
  initialized = true;
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

export function hasEnglishVoice(): boolean {
  return !!voice;
}

export function speak(text: string, onEnd?: () => void): void {
  if (!ttsSupported() || !text) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang || 'en-US';
  if (voice) u.voice = voice;
  u.rate = 0.92;
  u.pitch = 1;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}

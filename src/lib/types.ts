export type Grade = 'again' | 'hard' | 'good' | 'easy';

/** Per-card spaced-repetition state (SM-2). */
export interface CardState {
  ef: number;        // ease factor
  reps: number;      // consecutive correct reviews
  interval: number;  // current interval in days
  due: string;       // next due date, ISO 'yyyy-mm-dd'
  introduced: boolean;
  lapses: number;    // times forgotten
}

export interface Phrase {
  phrase: string;
  meaning: string;
}

export interface Example {
  en: string; // English sentence; the target word is wrapped in **double asterisks**
  zh: string; // Traditional Chinese translation
}

/** A vocabulary card as produced by scripts/build-deck.mjs. */
export interface Card {
  id: string;
  word: string;
  variants: string[];   // alternative spellings, e.g. ["anaemia"]
  pos: string;          // e.g. "v." / "adj./adv."
  category: 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Other' | string;
  colloc: string | null; // collocation hint, e.g. "+of" / "to…from"
  meaning: string;       // Chinese definition
  phrases: Phrase[];
  example: Example | null; // generated example sentence (see scripts/generate-examples.mjs)
}

export type Direction = 'en2zh' | 'zh2en';
export type FilterCategory = 'All' | 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Other';
export type Theme = 'light' | 'dark';

export interface Settings {
  newPerDay: number;
  category: FilterCategory;
  direction: Direction;
  theme: Theme;
}

export interface Store {
  version: number;
  states: Record<string, CardState>;
  settings: Settings;
  daily: { date: string; newCount: number };
}

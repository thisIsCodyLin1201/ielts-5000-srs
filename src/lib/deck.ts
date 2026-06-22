import type { Card, FilterCategory } from './types';
import deckRaw from '../deck.json';

export const DECK = deckRaw as Card[];

const byId = new Map(DECK.map((c) => [c.id, c]));
export const getCard = (id: string): Card | undefined => byId.get(id);

export const CATEGORIES: FilterCategory[] = ['All', 'Noun', 'Verb', 'Adjective', 'Adverb', 'Other'];

export const CATEGORY_LABEL: Record<FilterCategory, string> = {
  All: '全部',
  Noun: '名詞',
  Verb: '動詞',
  Adjective: '形容詞',
  Adverb: '副詞',
  Other: '其他',
};

export function cardsInCategory(category: FilterCategory): Card[] {
  if (category === 'All') return DECK;
  if (category === 'Other') {
    const main = new Set(['Noun', 'Verb', 'Adjective', 'Adverb']);
    return DECK.filter((c) => !main.has(c.category));
  }
  return DECK.filter((c) => c.category === category);
}

export function categoryCounts(): Record<FilterCategory, number> {
  const counts = { All: DECK.length } as Record<FilterCategory, number>;
  for (const cat of CATEGORIES) {
    if (cat === 'All') continue;
    counts[cat] = cardsInCategory(cat).length;
  }
  return counts;
}

// Build src/deck.json from data/ielts-raw.txt
//
// data/ielts-raw.txt is the line-by-line text extracted from "IELTS 5000 words.pdf"
// (see scripts/extract-pdf.mjs). Each main entry looks like:
//     headword  POS.  中文釋義
// Definitions may wrap onto continuation lines, and some lines are English phrase
// sub-entries in parentheses, e.g. "(on account of) 由於、因為", which we attach to
// the preceding headword.
//
// Run: node scripts/build-deck.mjs   (also runs automatically before dev/build)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC = path.join(root, 'data', 'ielts-raw.txt');
const OUT = path.join(root, 'src', 'deck.json');

const POS = '(?:v|n|adj|adv|prep|conj|pron|int|interj|art|num|aux|vt|vi|abbr|pl|sing|suf|pref)';
const CJK = '\\u4e00-\\u9fff\\u3400-\\u4dbf';
// A main entry starts with an ASCII letter, has a headword containing no CJK
// ideographs, then whitespace + one or more POS tokens, then the meaning.
const entryRe = new RegExp(`^([A-Za-z][^${CJK}；，、]*?)\\s+(${POS}\\.(?:\\s*/\\s*${POS}\\.)*)\\s*([^\\s].*)$`);
// A phrase sub-entry: a bracketed group whose first inner char is an ASCII letter.
const phraseRe = /^[（(]\s*([A-Za-z][^)）]*)[)）]\s*(.*)$/;

const posMap = {
  v: 'Verb', vt: 'Verb', vi: 'Verb',
  n: 'Noun', pl: 'Noun', sing: 'Noun',
  adj: 'Adjective', adv: 'Adverb',
  prep: 'Preposition', conj: 'Conjunction', pron: 'Pronoun',
  int: 'Interjection', interj: 'Interjection',
  art: 'Article', num: 'Numeral', aux: 'Auxiliary',
  abbr: 'Abbreviation', suf: 'Other', pref: 'Other',
};

function build() {
  const lines = fs.readFileSync(SRC, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
  const cards = [];
  let cur = null;   // current card
  let ref = null;   // last meaning container (card or phrase) for continuation lines
  let id = 0;
  const anomalies = [];

  for (const l of lines) {
    if (l === 'IELTS 5000 words') continue; // page title

    const ph = l.match(phraseRe);
    if (ph && cur) {
      const phrase = { phrase: ph[1].trim(), meaning: ph[2].trim() };
      cur.phrases.push(phrase);
      ref = phrase;
      continue;
    }

    const m = l.match(entryRe);
    if (m) {
      const head = m[1].trim();
      const collocRaw = (head.match(/[（(]\s*([^)）]*)\s*[)）]/) || [])[1];
      const clean = head.replace(/\s*[（(][^)）]*[)）]\s*/g, '').trim();
      const variants = clean.split('=').map((s) => s.trim()).filter(Boolean);
      if (!variants.length) { anomalies.push(l); continue; }
      const primaryPos = m[2].split('/')[0].replace(/\./g, '').trim();
      cur = {
        id: 'w' + ++id,
        word: variants[0],
        variants: variants.slice(1),
        pos: m[2].replace(/\s+/g, ''),
        category: posMap[primaryPos] || 'Other',
        colloc: collocRaw && collocRaw.trim() ? collocRaw.trim() : null,
        meaning: m[3].trim(),
        phrases: [],
      };
      cards.push(cur);
      ref = cur;
      continue;
    }

    // continuation: append to the last meaning container
    if (ref) ref.meaning = (ref.meaning + ' ' + l).replace(/\s+/g, ' ').trim();
    else anomalies.push(l);
  }

  // tidy trailing separators left by wrapped lines
  const tidy = (s) => s.replace(/[\s、；，]+$/, '').trim();
  for (const c of cards) {
    c.meaning = tidy(c.meaning);
    for (const p of c.phrases) p.meaning = tidy(p.meaning);
  }

  // attach generated example sentences (data/examples.json: { id: { en, zh } }), if present
  const EXAMPLES = path.join(root, 'data', 'examples.json');
  let exCount = 0;
  let examples = {};
  if (fs.existsSync(EXAMPLES)) {
    try { examples = JSON.parse(fs.readFileSync(EXAMPLES, 'utf8')); } catch { examples = {}; }
  }
  for (const c of cards) {
    const ex = examples[c.id];
    c.example = ex && ex.en ? { en: ex.en, zh: ex.zh || '' } : null;
    if (c.example) exCount++;
  }

  fs.writeFileSync(OUT, JSON.stringify(cards));

  const byCat = {};
  for (const c of cards) byCat[c.category] = (byCat[c.category] || 0) + 1;
  console.log(`[build-deck] ${cards.length} words ->`, path.relative(root, OUT));
  console.log('[build-deck] by category:', JSON.stringify(byCat));
  console.log(`[build-deck] example sentences: ${exCount}/${cards.length}`);
  if (anomalies.length) console.warn('[build-deck] anomalies:', anomalies.length, anomalies.slice(0, 5));
}

build();

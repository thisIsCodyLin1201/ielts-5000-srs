// Generate one bilingual example sentence per word into data/examples.json.
//
// The source PDF has no example sentences, so we generate them with Claude and
// commit the result — the site stays fully static (no runtime API calls).
//
// Setup (one-time):  npm i -D @anthropic-ai/sdk   and   export ANTHROPIC_API_KEY=sk-ant-...
// Run:               npm run gen:examples
//
// Re-runs only fill in words that don't already have an example, so it's safe to
// run incrementally (e.g. after adding words to data/ielts-raw.txt).
//
// Uses the Batch API (50% cheaper, fine for offline generation) + structured
// outputs so every response is guaranteed-parseable JSON.

import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const DECK = path.join(root, 'src', 'deck.json');
const OUT = path.join(root, 'data', 'examples.json');

const MODEL = process.env.MODEL || 'claude-opus-4-8'; // override with MODEL=claude-sonnet-4-6 / claude-haiku-4-5
const BATCH = 20;

const SYSTEM = `You write example sentences for an IELTS English vocabulary study app aimed at Traditional-Chinese-speaking learners.
For each entry you receive {id, word, pos, meaning(Chinese), colloc(optional)}, produce:
- "en": ONE natural English sentence (about 10–18 words) that clearly demonstrates the word used in the sense given by the Chinese meaning. The sentence must actually contain the word (an inflected form is fine). Wrap exactly that word/phrase in **double asterisks**. If a collocation hint is given (e.g. "+of", "to…from", "with"), demonstrate that pattern. Neutral / mildly academic register suitable for IELTS. No offensive content.
- "zh": a fluent Traditional Chinese (zh-Hant) translation of the sentence.
Return one item per input id.`;

const ITEM_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, en: { type: 'string' }, zh: { type: 'string' } },
        required: ['id', 'en', 'zh'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
};

const deck = JSON.parse(fs.readFileSync(DECK, 'utf8'));
const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const todo = deck.filter((c) => !existing[c.id]?.en);
if (!todo.length) { console.log('[gen] nothing to do — all words have examples'); process.exit(0); }
console.log(`[gen] ${todo.length}/${deck.length} words need examples (model: ${MODEL})`);

const client = new Anthropic();

const requests = [];
for (let i = 0; i < todo.length; i += BATCH) {
  const slice = todo.slice(i, i + BATCH);
  const list = slice.map((c) => ({ id: c.id, word: c.word, pos: c.pos, meaning: c.meaning, colloc: c.colloc || undefined }));
  requests.push({
    custom_id: `b-${i}`,
    params: {
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      output_config: { format: { type: 'json_schema', schema: ITEM_SCHEMA } },
      messages: [{ role: 'user', content: JSON.stringify(list) }],
    },
  });
}

console.log(`[gen] submitting ${requests.length} batch requests...`);
const batch = await client.messages.batches.create({ requests });
console.log(`[gen] batch ${batch.id} — polling...`);

for (;;) {
  const b = await client.messages.batches.retrieve(batch.id);
  if (b.processing_status === 'ended') break;
  process.stdout.write(`\r[gen] ${JSON.stringify(b.request_counts)}   `);
  await new Promise((r) => setTimeout(r, 15000));
}
console.log('\n[gen] batch ended, collecting results');

const out = { ...existing };
let ok = 0;
for await (const res of await client.messages.batches.results(batch.id)) {
  if (res.result.type !== 'succeeded') { console.warn('[gen] failed', res.custom_id, res.result.type); continue; }
  const text = res.result.message.content.find((b) => b.type === 'text')?.text || '{}';
  let parsed;
  try { parsed = JSON.parse(text); } catch { console.warn('[gen] unparseable', res.custom_id); continue; }
  for (const it of parsed.items || []) {
    if (it.id && it.en) { out[it.id] = { en: it.en, zh: it.zh || '' }; ok++; }
  }
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 0));
console.log(`[gen] wrote ${ok} new examples -> ${path.relative(root, OUT)} (total ${Object.keys(out).length})`);

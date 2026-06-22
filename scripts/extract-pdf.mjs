// One-off: extract text lines from "IELTS 5000 words.pdf" into data/ielts-raw.txt.
// Requires: npm i -D pdfjs-dist  (kept out of runtime deps; only needed to refresh data)
// Usage: node scripts/extract-pdf.mjs "/path/to/IELTS 5000 words.pdf"

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const pdfPath = process.argv[2] || path.join(root, 'IELTS 5000 words.pdf');
const out = path.join(root, 'data', 'ielts-raw.txt');

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

const lines = [];
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  const items = tc.items
    .filter((i) => i.str !== undefined)
    .map((i) => ({ s: i.str, x: i.transform[4], y: i.transform[5] }));
  items.sort((a, b) => b.y - a.y || a.x - b.x);
  // cluster items into lines by y (3.5px tolerance)
  const clusters = [];
  for (const it of items) {
    let c = clusters.find((c) => Math.abs(c.y - it.y) <= 3.5);
    if (!c) { c = { y: it.y, items: [] }; clusters.push(c); }
    c.items.push(it);
  }
  clusters.sort((a, b) => b.y - a.y);
  for (const c of clusters) {
    c.items.sort((a, b) => a.x - b.x);
    const line = c.items.map((i) => i.s).join('').replace(/\s+/g, ' ').trim();
    if (line) lines.push(line);
  }
}
fs.writeFileSync(out, lines.join('\n'));
console.log(`[extract-pdf] ${doc.numPages} pages -> ${lines.length} lines -> ${path.relative(root, out)}`);

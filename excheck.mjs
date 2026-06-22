import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0', timeout: 20000 });
await page.waitForSelector('.card', { timeout: 8000 });
const word = await page.$eval('.prompt-word', e => e.textContent).catch(()=>null);
// flip
await page.click('.bottombar .btn');
await page.waitForSelector('.answer', { timeout: 4000 });
// example present?
const ex = await page.evaluate(() => {
  const box = document.querySelector('.example');
  if (!box) return { present:false };
  return {
    present: true,
    bold: box.querySelector('.example__en b')?.textContent || null,
    enText: box.querySelector('.example__en')?.textContent?.trim() || null,
    zh: box.querySelector('.example__zh')?.textContent || null,
    tts: !!box.querySelector('.tts-btn--sm'),
    rawHasAsterisks: (box.querySelector('.example__en')?.textContent || '').includes('*'),
  };
});
console.log('word:', word);
console.log('example:', JSON.stringify(ex, null, 0));
console.log('JS errors:', errs.length ? errs.slice(0,3) : 'none');
await browser.close();
process.exit((ex.present && ex.bold && ex.zh && ex.tts && !ex.rawHasAsterisks && !errs.length) ? 0 : 1);

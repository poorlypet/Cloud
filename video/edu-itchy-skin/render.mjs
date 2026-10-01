// Renders the film frame by frame.
//   node render.mjs                 full H.264 (muxed with audio/score.wav when it exists)
//   node render.mjs --stills 1,4.5  PNG stills at those times
//   node render.mjs --beats         one frame per beat (0.5 s) into stills/, for contact sheets
// Needs playwright-core and ffmpeg-static. Set CHROMIUM_PATH if Playwright's own browser is not installed.
import { chromium } from 'playwright-core';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = f => args.includes(f);
const stillsDir = process.env.STILLS_DIR || path.join(here, 'stills');

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(pathToFileURL(path.join(here, 'index.html')).href + '?render=1');
await page.evaluate(() => window.ready);
const { DUR, FPS } = await page.evaluate(() => ({ DUR: window.DUR, FPS: window.FPS }));
const stage = page.locator('#stage');
const frameAt = async (t, opts) => { await page.evaluate(t => window.renderFrame(t), t); return stage.screenshot(opts); };

if (flag('--stills') || flag('--beats')) {
  fs.mkdirSync(stillsDir, { recursive: true });
  const times = flag('--beats') ? Array.from({ length: DUR * 2 }, (_, i) => i / 2 + 0.25) : args[args.indexOf('--stills') + 1].split(',').map(Number);
  for (const t of times) await frameAt(t, { path: path.join(stillsDir, `f-${t.toFixed(2).padStart(5, '0')}.png`) });
  await browser.close();
  console.log('stills:', times.length);
  process.exit(0);
}

const silent = path.join(here, 'out', 'film-video.mp4');
fs.mkdirSync(path.dirname(silent), { recursive: true });
const enc = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round(DUR * FPS);
for (let f = 0; f < total; f++) {
  const buf = await frameAt(f / FPS, { type: 'jpeg', quality: 95 });
  if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
  if (f % 150 === 0) console.log(`frame ${f}/${total}`);
}
enc.stdin.end();
await new Promise(r => enc.on('close', r));
await browser.close();

const wav = path.join(here, 'audio', 'score.wav');
const out = path.join(here, 'out', 'poorly-pet-itchy-skin-guide.mp4');
if (fs.existsSync(wav)) {
  await new Promise((res, rej) => spawn(ffmpeg, ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' })
    .on('close', c => c ? rej(new Error('mux failed')) : res()));
  console.log('wrote', out);
} else console.log('wrote', silent, '(no audio/score.wav yet)');

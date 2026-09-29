// Renders index.html frame by frame to an MP4.
// Usage: node render.mjs [out.mp4] [--stills 0.5,3,9]
// Needs playwright-core and ffmpeg-static (npm i playwright-core ffmpeg-static).
import { chromium } from 'playwright-core';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const stillsAt = args.includes('--stills') ? args[args.indexOf('--stills') + 1].split(',').map(Number) : null;
const out = args.find(a => a.endsWith('.mp4')) || path.join(here, 'ivdd-signs.mp4');

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(path.join(here, 'index.html')).href + '?render=1');
await page.evaluate(() => window.ready);
const { DUR, FPS } = await page.evaluate(() => ({ DUR: window.DUR, FPS: window.FPS }));
const stage = page.locator('#stage');

if (stillsAt) {
  for (const t of stillsAt) {
    await page.evaluate(t => window.renderFrame(t), t);
    await stage.screenshot({ path: path.join(process.env.STILLS_DIR || here, `still-${t}.png`) });
  }
  await browser.close();
  process.exit(0);
}

const enc = spawn(ffmpeg, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', out],
  { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round(DUR * FPS);
for (let f = 0; f < total; f++) {
  await page.evaluate(t => window.renderFrame(t), f / FPS);
  const buf = await stage.screenshot({ type: 'jpeg', quality: 95 });
  if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
  if (f % 60 === 0) console.log(`frame ${f}/${total}`);
}
enc.stdin.end();
await new Promise(r => enc.on('close', r));
await browser.close();
console.log('wrote', out);

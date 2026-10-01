// Renders the film in either brand.
//   node render.mjs --theme new|old                  full film: 60 fps capture blended to 30 fps (motion blur), muxed with audio/score-<theme>.wav
//   node render.mjs --theme new --stills 1,4.5       PNG stills into stills/<theme>/
//   node render.mjs --theme new --cues               writes audio/cues-<theme>.json from the timeline (for audio/score.py)
import { chromium } from 'playwright-core';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = f => args.includes(f);
const opt = (f, d) => (args.includes(f) ? args[args.indexOf(f) + 1] : d);
const theme = opt('--theme', 'new');

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => console.error('page error:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(pathToFileURL(path.join(here, 'index.html')).href + `?render=1&theme=${theme}`);
await page.evaluate(() => window.ready);
const { DUR } = await page.evaluate(() => ({ DUR: window.DUR }));
const stage = page.locator('#stage');
const frameAt = async (t, o) => { await page.evaluate(t => window.renderFrame(t), t); return stage.screenshot(o); };

if (flag('--cues')) {
  const cues = await page.evaluate(() => window.CUES.slice().sort((a, b) => a[0] - b[0]));
  fs.writeFileSync(path.join(here, 'audio', `cues-${theme}.json`), JSON.stringify(cues));
  console.log('cues', cues.length); await browser.close(); process.exit(0);
}
if (flag('--stills')) {
  const dir = path.join(here, 'stills', theme); fs.mkdirSync(dir, { recursive: true });
  for (const t of opt('--stills').split(',').map(Number)) await frameAt(t, { path: path.join(dir, `f-${t.toFixed(2).padStart(5, '0')}.png`) });
  await browser.close(); console.log('stills done'); process.exit(0);
}

const CAP = 60; // capture rate; pairs of frames are averaged into each 30 fps frame (360° shutter)
const silent = path.join(here, 'out', `film-${theme}.mp4`);
fs.mkdirSync(path.dirname(silent), { recursive: true });
const enc = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(CAP), '-i', '-',
  '-vf', 'tmix=frames=2,fps=30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round(DUR * CAP);
for (let f = 0; f < total; f++) {
  const buf = await frameAt(f / CAP, { type: 'jpeg', quality: 92 });
  if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
  if (f % 300 === 0) console.log(`frame ${f}/${total}`);
}
enc.stdin.end();
await new Promise(r => enc.on('close', r));
await browser.close();
const wav = path.join(here, 'audio', `score-${theme}.wav`);
const out = path.join(here, 'out', `poorly-pet-itchy-skin-${theme}-brand.mp4`);
if (fs.existsSync(wav)) {
  await new Promise((res, rej) => spawn(ffmpeg, ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', c => c ? rej(new Error('mux failed')) : res()));
  console.log('wrote', out);
} else console.log('wrote', silent);

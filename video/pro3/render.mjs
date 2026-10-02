// node render.mjs <film> [--stills 1,2.5] [--cues] [--fast]
// Full render captures at 60 fps and blends frame pairs into 30 fps (motion blur), then muxes <film>/audio/score.wav.
import { chromium } from 'playwright-core';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), film = args[0];
const flag = f => args.includes(f), opt = f => args[args.indexOf(f) + 1];
const dir = path.join(here, film);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => console.error('page error:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(pathToFileURL(path.join(dir, 'index.html')).href + '?render=1');
await page.evaluate(() => window.ready);
const { W, H, DUR } = await page.evaluate(() => ({ W: window.W, H: window.H, DUR: window.DUR }));
await page.setViewportSize({ width: W, height: H });
const stage = page.locator('#stage');
const frameAt = async (t, o) => { await page.evaluate(t => window.renderFrame(t), t); return stage.screenshot(o); };
if (flag('--cues')) {
  const cues = await page.evaluate(() => window.CUES.slice().sort((a, b) => a[0] - b[0]));
  const end = await page.evaluate(() => window.END || window.DUR - 2);
  fs.writeFileSync(path.join(dir, 'audio', 'cues.json'), JSON.stringify({ dur: DUR, end, cues }));
  console.log('cues', cues.length); await browser.close(); process.exit(0);
}
if (flag('--stills')) {
  const sd = path.join(dir, 'stills'); fs.mkdirSync(sd, { recursive: true });
  for (const t of opt('--stills').split(',').map(Number)) await frameAt(t, { path: path.join(sd, `f-${t.toFixed(2).padStart(5, '0')}.png`) });
  await browser.close(); process.exit(0);
}
// window.FAST = [[t0, t1], ...] opts a film into 4 samples per output frame inside those ranges (2 elsewhere)
const FAST = flag('--fast') ? null : await page.evaluate(() => window.FAST || null);
const CAP = flag('--fast') ? 30 : FAST ? 120 : 60;
const silent = path.join(here, 'out', `${film}-video.mp4`); fs.mkdirSync(path.dirname(silent), { recursive: true });
const vf = CAP === 120 ? ['-vf', "tmix=frames=4,select='eq(mod(n\\,4)\\,3)',setpts=N/(30*TB)", '-r', '30'] : CAP === 60 ? ['-vf', 'tmix=frames=2,fps=30'] : [];
// --bitrate 12M caps the file size (grain is costly at crf 17); default stays crf 17
const rate = flag('--bitrate') ? ['-b:v', opt('--bitrate'), '-maxrate', String(parseFloat(opt('--bitrate')) * 1.4) + 'M', '-bufsize', String(parseFloat(opt('--bitrate')) * 2) + 'M'] : ['-crf', '17'];
const enc = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(CAP), '-i', '-', ...vf, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', ...rate, '-preset', 'slow', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const put = async buf => { if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r)); };
if (CAP === 120) {
  const total = Math.round(DUR * 30);
  for (let f = 0; f < total; f++) {
    const t = f / 30, fast = FAST.some(([a, b]) => t >= a && t < b);
    if (fast) for (let k = 0; k < 4; k++) await put(await frameAt(t + k / 120, { type: 'jpeg', quality: 93 }));
    else { const a = await frameAt(t, { type: 'jpeg', quality: 93 }), b = await frameAt(t + 2 / 120, { type: 'jpeg', quality: 93 }); await put(a); await put(a); await put(b); await put(b); }
    if (f % 150 === 0) console.log(`${film} frame ${f}/${total}`);
  }
} else {
  const total = Math.round(DUR * CAP);
  for (let f = 0; f < total; f++) {
    await put(await frameAt(f / CAP, { type: 'jpeg', quality: 93 }));
    if (f % 300 === 0) console.log(`${film} frame ${f}/${total}`);
  }
}
enc.stdin.end(); await new Promise(r => enc.on('close', r)); await browser.close();
const wav = path.join(dir, 'audio', 'score.wav'), outp = path.join(here, 'out', `poorly-pet-${film}.mp4`);
if (fs.existsSync(wav)) {
  await new Promise((res, rej) => spawn(ffmpeg, ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outp], { stdio: 'inherit' }).on('close', c => c ? rej(new Error('mux')) : res()));
  console.log('wrote', outp);
} else console.log('wrote', silent);

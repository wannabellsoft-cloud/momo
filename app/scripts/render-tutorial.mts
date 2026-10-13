// Renders the first-use tutorial motion graphic to video/first-use/out/momo-first-use.mp4 (1080×1920, 30 fps).
// Each scene lasts its `min` seconds, or longer when its narration clip (video/first-use/voice/<id>.mp3,
// from `npm run tutorial:voice`) needs it; the clips are mixed in at their scene's start.
// Without clips the video renders silent, with the lines as on-screen captions.
//
//   npm run tutorial:video            # needs Playwright (Chromium) + ffmpeg
//   npm run tutorial:video -- --still 30.5   # one frame as PNG, for checking a moment
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = fileURLToPath(new URL("../video/first-use/", import.meta.url));
const OUT = `${DIR}out/`;
const cfg = JSON.parse(readFileSync(`${DIR}script.json`, "utf8")) as {
  fps: number; width: number; height: number; tailPad: number; scenes: { id: string; min: number; say: string }[];
};

const probe = (f: string) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

let start = 0;
const timeline = cfg.scenes.map((s) => {
  const clip = `${DIR}voice/${s.id}.mp3`;
  const speak = existsSync(clip) ? probe(clip) : undefined;
  const dur = Math.max(s.min, speak ? speak + 0.35 + cfg.tailPad : 0);
  const row = { id: s.id, say: s.say, start, dur, speak: speak ? speak + 0.35 : undefined, clip: speak ? clip : undefined };
  start += dur;
  return row;
});
const total = start;
const voiced = timeline.filter((s) => s.clip);
console.log(`${timeline.length} scenes · ${total.toFixed(1)} s · narration ${voiced.length}/${timeline.length}`);

/** What video/first-use/index.html exposes. */
type Film = { setup: (tl: unknown[]) => number; render: (t: number) => void };

// Playwright from the project, or the global install
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- optional dependency, typed loosely
let pw: any;
try { pw = require("playwright"); } catch { pw = require(`${execFileSync("npm", ["root", "-g"], { shell: process.platform === "win32" }).toString().trim()}/playwright`); }

mkdirSync(OUT, { recursive: true });
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: cfg.width, height: cfg.height }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(`${DIR}index.html`).href);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
await page.evaluate((tl: typeof timeline) => (window as unknown as Film).setup(tl.map(({ clip, ...s }) => s)), timeline);
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
});
const film = page.locator("#film");

const still = process.argv.indexOf("--still");
if (still > -1) {
  const t = Number(process.argv[still + 1] ?? 1);
  await page.evaluate((t: number) => (window as unknown as Film).render(t), t);
  await film.screenshot({ path: `${OUT}still-${t}.png` });
  console.log(`wrote video/first-use/out/still-${t}.png`);
  await browser.close();
  process.exit(0);
}

// Frames → ffmpeg (silent video)
const silent = `${OUT}silent.mp4`;
const enc = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(cfg.fps), "-c:v", "mjpeg", "-i", "-",
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", silent], { stdio: ["pipe", "inherit", "inherit"] });
const frames = Math.ceil(total * cfg.fps);
for (let i = 0; i < frames; i++) {
  await page.evaluate((t: number) => (window as unknown as Film).render(t), i / cfg.fps);
  const jpg = await film.screenshot({ type: "jpeg", quality: 92 });
  if (!enc.stdin.write(jpg)) await new Promise((r) => enc.stdin.once("drain", r));
  if (i % 150 === 0) console.log(`frame ${i}/${frames}`);
}
enc.stdin.end();
await new Promise((r, j) => enc.on("close", (c) => (c === 0 ? r(null) : j(new Error(`ffmpeg exited ${c}`)))));
await browser.close();

// Narration: each clip delayed to its scene start, mixed, then muxed with the video
const final = `${OUT}momo-first-use.mp4`;
if (voiced.length) {
  const inputs = voiced.flatMap((s) => ["-i", s.clip!]);
  const delays = voiced.map((s, i) => `[${i + 1}:a]adelay=${Math.round((s.start + 0.35) * 1000)}:all=1[a${i}]`).join(";");
  const mix = `${delays};${voiced.map((_, i) => `[a${i}]`).join("")}amix=inputs=${voiced.length}:normalize=0,apad[aout]`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, ...inputs, "-filter_complex", mix, "-map", "0:v", "-map", "[aout]",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", final], { stdio: "inherit" });
} else {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-c", "copy", final]);
}
console.log(`wrote video/first-use/out/momo-first-use.mp4 (${total.toFixed(1)} s)`);

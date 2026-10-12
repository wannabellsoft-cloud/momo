// Renders Momo's 3D model (Meshy GLB) into transparent state images with pastel props drawn on top.
// Usage: npm run mascot:render   (needs Chromium; set CHROMIUM_PATH if it isn't at the default path)
// Model: assets-src/momo.glb (Meshy export: textured + Mixamo-style rig). Poses are set per state via bone offsets. Output: public/mascot/momo/*.webp
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const OUT = join(ROOT, "public/mascot/momo");
const TMP = join(ROOT, ".mascot-tmp");
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".glb": "model/gltf-binary" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let body;
  try {
    body = readFileSync(join(ROOT, path));
  } catch {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" }).end(body);
}).listen(0);
const PORT = server.address().port;

const HEART = "M100 178 C 66 158, 64 130, 84 127 C 93 126, 99 132, 100 137 C 101 132, 107 126, 116 127 C 136 130, 134 158, 100 178Z";
const heart = (cx, cy, s, fill = "url(#hg)") => `<path d="${HEART}" transform="translate(${cx - 100 * s} ${cy - 152 * s}) scale(${s})" fill="${fill}"/>`;
const DEFS = `<defs><radialGradient id="hg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFC7D9"/><stop offset="1" stop-color="#EE7FA3"/></radialGradient>
<filter id="ds" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.2" stdDeviation="1.2" flood-color="#8E4A66" flood-opacity=".22"/></filter></defs>`;
const sparkle = (x, y, s, c = "#F9C74F") => `<path d="M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28}Z" fill="${c}"/>`;
const clock = (cx, cy, r) => `<g filter="url(#ds)" transform="translate(${cx} ${cy})">
  <circle cx="${-r * 0.68}" cy="${-r * 0.98}" r="${r * 0.3}" fill="#F590B0"/><circle cx="${r * 0.68}" cy="${-r * 0.98}" r="${r * 0.3}" fill="#F590B0"/>
  <path d="M${-r * 0.62} ${r * 0.9} l${-r * 0.22} ${r * 0.3} M${r * 0.62} ${r * 0.9} l${r * 0.22} ${r * 0.3}" stroke="#E7799C" stroke-width="${r * 0.16}" stroke-linecap="round"/>
  <circle r="${r}" fill="#F7A2BE"/><circle r="${r * 0.78}" fill="#FFFDFB"/>
  <path d="M0 0 V${-r * 0.5} M0 0 L${r * 0.36} ${r * 0.18}" stroke="#674454" stroke-width="${r * 0.1}" stroke-linecap="round"/><circle r="${r * 0.08}" fill="#F47FA7"/></g>`;
const medbox = (cx, cy, w) => `<g filter="url(#ds)" transform="translate(${cx - w / 2} ${cy - w * 0.36})">
  <rect x="${w * 0.05}" y="${w * 0.12}" width="${w * 0.9}" height="${w * 0.58}" rx="${w * 0.12}" fill="#FFFFFF" stroke="#F2C3D3" stroke-width="1.6"/>
  <rect x="0" y="0" width="${w}" height="${w * 0.17}" rx="${w * 0.08}" fill="#FFE1EB" stroke="#F2C3D3" stroke-width="1.6"/>
  <path d="M${w / 2} ${w * 0.25}v${w * 0.36}M${w * 0.32} ${w * 0.43}h${w * 0.36}" stroke="#F47FA7" stroke-width="${w * 0.09}" stroke-linecap="round"/></g>`;
const note = (cx, cy, w) => `<g filter="url(#ds)" transform="translate(${cx} ${cy}) rotate(-6)">
  <rect x="${-w / 2}" y="${-w * 0.62}" width="${w}" height="${w * 1.2}" rx="${w * 0.12}" fill="#FFFDF7" stroke="#EADBC2" stroke-width="1.6"/>
  <rect x="${-w * 0.2}" y="${-w * 0.7}" width="${w * 0.4}" height="${w * 0.16}" rx="${w * 0.06}" fill="#F7A2BE"/>
  <g stroke="#D8C6B0" stroke-width="1.8" stroke-linecap="round"><path d="M${-w * 0.32} ${-w * 0.3}h${w * 0.4}M${-w * 0.32} ${-w * 0.08}h${w * 0.6}M${-w * 0.32} ${w * 0.14}h${w * 0.34}"/></g>
  <path d="M${-w * 0.3} ${w * 0.32}h${w * 0.08}l${w * 0.08} ${w * 0.18}h${w * 0.3}l${w * 0.07} -${w * 0.13}h-${w * 0.42}" stroke="#A99BD9" stroke-width="1.8" fill="none" stroke-linejoin="round"/></g>`;
const blanket = (top) => `<g filter="url(#ds)"><path d="M14 ${top + 12} C 50 ${top - 6}, 150 ${top - 6}, 186 ${top + 12} L 192 200 L 8 200 Z" fill="#E7DDFA"/>
  <path d="M14 ${top + 12} C 50 ${top - 6}, 150 ${top - 6}, 186 ${top + 12}" stroke="#F4EEFF" stroke-width="7" fill="none" stroke-linecap="round"/>
  <g fill="#F7F2FF">${[[44, 18], [80, 12], [118, 20], [156, 14], [62, 34], [138, 32], [100, 30]].map(([x, y]) => `<circle cx="${x}" cy="${top + y}" r="2.6"/>`).join("")}</g></g>`;
const zzz = `<g fill="#A99BD9" font-family="sans-serif" font-weight="800"><text x="146" y="46" font-size="18">z</text><text x="160" y="32" font-size="13">z</text><text x="171" y="21" font-size="9">z</text></g>`;
const moon = (x, y, r) => `<path filter="url(#ds)" transform="rotate(-25 ${x} ${y})" d="M${x} ${y - r} A ${r} ${r} 0 1 0 ${x} ${y + r} A ${r * 0.72} ${r} 0 1 1 ${x} ${y - r} Z" fill="#F9D774"/>`;
const question = `<g filter="url(#ds)"><circle cx="160" cy="40" r="17" fill="#FFFFFF" stroke="#E9E1FF" stroke-width="2"/><text x="160" y="48" font-size="22" text-anchor="middle" font-family="sans-serif" font-weight="800" fill="#8C7BD6">?</text></g>`;
const lines = (x, y, c = "#F9C74F") => `<g stroke="${c}" stroke-width="3.4" stroke-linecap="round"><path d="M${x} ${y}l9 -8M${x + 4} ${y + 12}l12 -2M${x - 6} ${y - 6}l2 -12"/></g>`;
const confetti = [[30, 40, "#F9A3C1"], [170, 52, "#B8DEFA"], [24, 96, "#FFE08A"], [176, 104, "#C9BBF7"], [44, 20, "#A9E0C4"], [150, 18, "#F9A3C1"]]
  .map(([x, y, c], i) => (i % 2 ? `<rect x="${x}" y="${y}" width="6" height="3" rx="1.5" fill="${c}" transform="rotate(${25 * i} ${x} ${y})"/>` : `<circle cx="${x}" cy="${y}" r="3" fill="${c}"/>`)).join("");

// state: [camera/pose, props over the model]
// Arms forward around a prop (the rig's arm bones; ears are unaffected at these angles).
const HOLD = { LeftArm: [1.05, 0, -0.1], RightArm: [-1.05, 0, 0.1] };
// state: [camera/pose (+ bone offsets, radians), props drawn over the model]
const STATES = {
  welcome: [{ az: 0.28, el: 0.14, bones: { LeftArm: [0.1, 0, 1.25], LeftForeArm: [0, 0, 0.35] } }, lines(156, 62) + heart(40, 70, 0.22, "#F9A3C1") + sparkle(162, 112, 5, "#FFD3E4")],
  reminder: [{ az: 0.2, bones: HOLD }, clock(100, 120, 24) + lines(142, 100, "#F9A3C1")],
  waiting: [{ az: 0.18, bones: HOLD }, heart(100, 117, 0.6) + heart(156, 54, 0.16, "#F9A3C1")],
  success: [{ az: 0.16, el: 0.16, bones: { ...HOLD, Head: [0, 0, 0.1] } }, heart(100, 116, 0.72) + sparkle(46, 58, 6) + sparkle(160, 70, 5, "#F9A3C1") + sparkle(150, 40, 3.5)],
  refill: [{ az: 0.22, bones: HOLD }, medbox(100, 122, 56) + `<g filter="url(#ds)"><circle cx="160" cy="44" r="15" fill="#fff"/><path d="M152 56 l-4 8 l10 -5z" fill="#fff"/></g>` + heart(160, 46, 0.2, "#F590B0")],
  noStock: [{ az: 0.22, bones: HOLD }, note(100, 120, 42) + lines(144, 96, "#B8DEFA")],
  sleep: [{ az: 0.3, el: 0.2, tilt: 0.12, cy: -0.06, bones: { Head: [0, 0, 0.42], Neck: [0.28, 0, 0] } }, blanket(132) + moon(40, 40, 13) + zzz],
  question: [{ az: -0.1, bones: { Head: [0, 0, -0.32], RightArm: [-0.7, 0, -0.5], RightForeArm: [-0.9, 0, 0] } }, question],
  celebrate: [{ az: 0.18, lift: 0.04, bones: { LeftArm: [0, 0, 1.3], RightArm: [0, 0, -1.3], LeftForeArm: [0, 0, 0.3], RightForeArm: [0, 0, -0.3], Head: [0, 0, 0.08] } }, confetti + sparkle(36, 64, 6) + sparkle(166, 78, 6, "#F9A3C1") + heart(150, 30, 0.2, "#F590B0") + lines(36, 120, "#C9BBF7")],
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await browser.newPage({ viewport: { width: 768, height: 768 } });
p.on("pageerror", (e) => console.log("err", e.message));
await p.goto(`http://localhost:${PORT}/scripts/mascot/compose.html`);
await p.waitForFunction(() => window.ready, null, { timeout: 120000 });
for (const [name, [pose, over]] of Object.entries(STATES)) {
  await p.evaluate((o) => { window.pose({ bones: o.bones }); window.render3d(o); }, pose);
  const fy = await p.evaluate(() => window.feetY());
  const shadow = name === "sleep" ? "" : `<ellipse cx="100" cy="${fy - 1}" rx="44" ry="5.5" fill="#B9927A" opacity=".2"/>`;
  await p.evaluate(([u, o]) => window.setOverlay(u, o), [shadow, DEFS + over]);
  await p.locator("#stage").screenshot({ path: `${TMP}/${name}.png`, omitBackground: true });
  console.log("rendered", name);
}
// avatar: face close-up
await p.evaluate(() => { window.pose({}); window.render3d({ az: 0.2, el: 0.04, zoom: 1.7, cy: 0.19 }); });
await p.evaluate(() => window.setOverlay("", ""));
await p.locator("#stage").screenshot({ path: `${TMP}/avatar.png`, omitBackground: true });
console.log("rendered avatar");
await browser.close();
server.close();
// PNG → WebP (ImageMagick `convert`)
for (const name of [...Object.keys(STATES), "avatar"]) {
  const size = name === "avatar" ? "512x512" : "768x768";
  execFileSync("convert", [`${TMP}/${name}.png`, "-resize", size, "-quality", "88", "-define", "webp:alpha-quality=95", "-define", "webp:method=6", `${OUT}/${name}.webp`]);
}
rmSync(TMP, { recursive: true, force: true });
console.log("wrote public/mascot/momo/*.webp");

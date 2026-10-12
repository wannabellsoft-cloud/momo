// Generates Momo's voice clips (public/voice/*.mp3 + manifest.json) so Momo sounds the same on
// every device. Uses Microsoft's free neural voices through the `edge-tts` CLI.
//
//   pip install edge-tts
//   npm run voice                                   # Premwadee (female), cute pitch
//   MOMO_VOICE=th-TH-AcharaNeural npm run voice     # another voice
//   MOMO_PITCH=+30Hz MOMO_RATE=+5% npm run voice    # cuter / faster
//
// Then commit public/voice/. Any clip can be swapped for a real recording with the same name.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { VOICE_LINES } from "../src/lib/voice-lines.ts";

const OUT = new URL("../public/voice/", import.meta.url).pathname;
const voice = process.env.MOMO_VOICE ?? "th-TH-PremwadeeNeural";
const pitch = process.env.MOMO_PITCH ?? "+22Hz";
const rate = process.env.MOMO_RATE ?? "+0%";
mkdirSync(OUT, { recursive: true });

// MOMO_ENGINE=gtts uses Google's Thai voice (pip install gTTS + ffmpeg) where Microsoft refuses the
// connection (e.g. on GitHub's runners); MOMO_SHIFT raises its pitch, e.g. 1.12.
const engine = process.env.MOMO_ENGINE ?? "edge";
const shift = Number(process.env.MOMO_SHIFT ?? "1.12");

for (const [id, text] of Object.entries(VOICE_LINES)) {
  const out = `${OUT}${id}.mp3`;
  if (engine === "gtts") {
    const raw = `${OUT}${id}.raw.mp3`;
    execFileSync("gtts-cli", [text, "--lang", "th", "--output", raw], { stdio: "inherit" });
    const af = shift === 1 ? "anull" : `asetrate=24000*${shift},aresample=24000,atempo=${(1 / shift).toFixed(4)}`;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af", af, "-ac", "1", "-b:a", "64k", out], { stdio: "inherit" });
    rmSync(raw);
  } else execFileSync("edge-tts", ["--voice", voice, `--pitch=${pitch}`, `--rate=${rate}`, "--text", text, "--write-media", out], { stdio: "inherit" });
  console.log("wrote", `public/voice/${id}.mp3`, "·", text);
}
writeFileSync(`${OUT}manifest.json`, JSON.stringify({ ...(engine === "gtts" ? { voice: "google-th", shift } : { voice, pitch, rate }), lines: VOICE_LINES }, null, 2) + "\n");
console.log("wrote public/voice/manifest.json");

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
import { mkdirSync, writeFileSync } from "node:fs";
import { VOICE_LINES } from "../src/lib/voice-lines.ts";

const OUT = new URL("../public/voice/", import.meta.url).pathname;
const voice = process.env.MOMO_VOICE ?? "th-TH-PremwadeeNeural";
const pitch = process.env.MOMO_PITCH ?? "+22Hz";
const rate = process.env.MOMO_RATE ?? "+0%";
mkdirSync(OUT, { recursive: true });

for (const [id, text] of Object.entries(VOICE_LINES)) {
  execFileSync("edge-tts", ["--voice", voice, `--pitch=${pitch}`, `--rate=${rate}`, "--text", text, "--write-media", `${OUT}${id}.mp3`], { stdio: "inherit" });
  console.log("wrote", `public/voice/${id}.mp3`, "·", text);
}
writeFileSync(`${OUT}manifest.json`, JSON.stringify({ voice, pitch, rate, lines: VOICE_LINES }, null, 2) + "\n");
console.log("wrote public/voice/manifest.json");

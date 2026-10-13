// Generates Momo's voice clips (public/voice/*.mp3 + manifest.json) so Momo sounds the same on
// every device. Uses ElevenLabs when ELEVENLABS_API_KEY is set, otherwise the free `edge-tts` CLI
// (settings: scripts/tts.mts).
//
//   ELEVENLABS_API_KEY=... MOMO_ELEVEN_VOICE=<voice_id> npm run voice   # ElevenLabs
//   pip install edge-tts && npm run voice                               # Premwadee (female), cute pitch
//   MOMO_PITCH=+30Hz MOMO_RATE=+5% npm run voice                        # cuter / faster (edge-tts)
//
// Then commit public/voice/. Any clip can be swapped for a real recording with the same name.
import { mkdirSync, writeFileSync } from "node:fs";
import { VOICE_LINES } from "../src/lib/voice-lines.ts";
import { synth, ttsInfo } from "./tts.mts";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../public/voice/", import.meta.url));
const info = ttsInfo();
mkdirSync(OUT, { recursive: true });

for (const [id, text] of Object.entries(VOICE_LINES)) {
  await synth(text, `${OUT}${id}.mp3`, info);
  console.log("wrote", `public/voice/${id}.mp3`, "·", text);
}
writeFileSync(`${OUT}manifest.json`, JSON.stringify({ ...info, lines: VOICE_LINES }, null, 2) + "\n");
console.log("wrote public/voice/manifest.json");

// Generates Momo's voice clips (public/voice/*.mp3 + manifest.json) so Momo sounds the same on
// every device: the launch greetings (VOICE_LINES) and every tap / reaction line (spokenLines(),
// saved as l-<hash>.mp3, see clipId). Uses ElevenLabs when ELEVENLABS_API_KEY is set, otherwise the
// free `edge-tts` CLI (settings: scripts/tts.mts). Clips that already exist are kept; --force redoes all.
//
//   ELEVENLABS_API_KEY=... MOMO_ELEVEN_VOICE=<voice_id> npm run voice   # ElevenLabs
//   pip install edge-tts && npm run voice                               # Premwadee (female), cute pitch
//   npm run voice -- --force                                            # after changing the voice
//
// Then commit public/voice/. Any clip can be swapped for a real recording with the same name.
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { VOICE_LINES, clipId, speakable, spokenLines } from "../src/lib/voice-lines.ts";
import { synth, ttsInfo } from "./tts.mts";

const OUT = fileURLToPath(new URL("../public/voice/", import.meta.url));
const force = process.argv.includes("--force");
const info = ttsInfo();
mkdirSync(OUT, { recursive: true });

const lines: Record<string, string> = { ...VOICE_LINES };
for (const text of spokenLines()) lines[clipId(text)] = text;

for (const [id, text] of Object.entries(lines)) {
  const file = `${OUT}${id}.mp3`;
  if (!force && existsSync(file)) continue;
  await synth(speakable(text), file, info);
  console.log("wrote", `public/voice/${id}.mp3`, "·", text);
}
// clips for lines that no longer exist
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".mp3") && !(f.slice(0, -4) in lines)) {
    rmSync(`${OUT}${f}`);
    console.log("removed", `public/voice/${f}`);
  }
}
writeFileSync(`${OUT}manifest.json`, JSON.stringify({ ...info, lines }, null, 2) + "\n");
console.log(`wrote public/voice/manifest.json · ${Object.keys(lines).length} lines`);

// Designs Momo's own voice with ElevenLabs Voice Design, then saves the one you like.
//
//   ELEVENLABS_API_KEY=... npm run voice:design
//       → writes voice-design/preview-<n>.mp3 (+ ids in voice-design/previews.json). Listen to them.
//   ELEVENLABS_API_KEY=... npm run voice:design -- --save <generated_voice_id>
//       → adds the voice "Momo" to your ElevenLabs account and prints its voice_id.
//         Put that id in MOMO_ELEVEN_VOICE, then `npm run voice` and `npm run tutorial:voice`.
//
// MOMO_VOICE_PROMPT overrides the description below; MOMO_DESIGN_MODEL the design model (eleven_ttv_v3 speaks Thai; speech itself uses MOMO_ELEVEN_MODEL).
import { mkdirSync, writeFileSync } from "node:fs";
import { ELEVEN_API, elevenHeaders, elevenEnabled } from "./tts.mts";
import { fileURLToPath } from "node:url";

if (!elevenEnabled()) throw new Error("Set ELEVENLABS_API_KEY first (or MOMO_TTS=elevenlabs when a proxy adds the key).");
const headers = elevenHeaders();

const DESCRIPTION =
  process.env.MOMO_VOICE_PROMPT ??
  "A sweet, soft and cheerful young female voice for Momo, a fluffy white bunny mascot in a medication reminder app. " +
    "Speaks native Thai with a warm, gentle, slightly high and playful tone, like a caring little friend. Clear studio quality, calm pace.";
const SAMPLE = "สวัสดีแพรวา โมโม่มาแล้วน้า วันนี้ดูแลตัวเองหรือยัง ถ้ากินยาแล้ว แตะบันทึกให้โมโม่หน่อยนะ โมโม่จะอยู่เป็นเพื่อนทุกวันเลย";

const save = process.argv.indexOf("--save");
if (save > -1) {
  const generated_voice_id = process.argv[save + 1];
  const res = await fetch(`${ELEVEN_API}/text-to-voice`, {
    method: "POST",
    headers,
    body: JSON.stringify({ voice_name: "Momo", voice_description: DESCRIPTION, generated_voice_id }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const { voice_id } = (await res.json()) as { voice_id: string };
  console.log(`Saved. MOMO_ELEVEN_VOICE=${voice_id}`);
} else {
  const res = await fetch(`${ELEVEN_API}/text-to-voice/design`, {
    method: "POST",
    headers,
    body: JSON.stringify({ voice_description: DESCRIPTION, text: SAMPLE, model_id: process.env.MOMO_DESIGN_MODEL ?? "eleven_ttv_v3" }), // newest design model; it speaks Thai
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const { previews } = (await res.json()) as { previews: { audio_base_64: string; generated_voice_id: string }[] };
  const out = fileURLToPath(new URL("../voice-design/", import.meta.url));
  mkdirSync(out, { recursive: true });
  previews.forEach((p, i) => {
    writeFileSync(`${out}preview-${i + 1}.mp3`, Buffer.from(p.audio_base_64, "base64"));
    console.log(`voice-design/preview-${i + 1}.mp3  →  npm run voice:design -- --save ${p.generated_voice_id}`);
  });
  writeFileSync(`${out}previews.json`, JSON.stringify(previews.map((p, i) => ({ file: `preview-${i + 1}.mp3`, generated_voice_id: p.generated_voice_id })), null, 2) + "\n");
}

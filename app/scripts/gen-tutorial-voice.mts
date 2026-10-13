// Narration for the first-use tutorial video: one clip per scene in video/first-use/script.json,
// written to video/first-use/voice/<scene id>.mp3 in Momo's voice (settings: scripts/tts.mts).
// `npm run tutorial:video` then times each scene to its clip and mixes the audio in.
//
//   ELEVENLABS_API_KEY=... MOMO_ELEVEN_VOICE=<voice_id> npm run tutorial:voice
import { mkdirSync, readFileSync } from "node:fs";
import { synth, ttsInfo } from "./tts.mts";

const DIR = new URL("../video/first-use/", import.meta.url).pathname;
const { scenes } = JSON.parse(readFileSync(`${DIR}script.json`, "utf8")) as { scenes: { id: string; say: string }[] };
const info = ttsInfo();
mkdirSync(`${DIR}voice`, { recursive: true });

for (const s of scenes) {
  await synth(s.say, `${DIR}voice/${s.id}.mp3`, info);
  console.log("wrote", `video/first-use/voice/${s.id}.mp3`, "·", s.say);
}

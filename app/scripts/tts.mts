// Text-to-speech for Momo's voice, shared by `npm run voice` and `npm run tutorial:voice`.
//
// ElevenLabs (used when ELEVENLABS_API_KEY is set, or MOMO_TTS=elevenlabs):
//   ELEVENLABS_API_KEY=...            your key (elevenlabs.io → Profile → API keys)
//   MOMO_TTS=elevenlabs               instead of the key, when a proxy adds it for you (Claude Code cloud
//                                     "Network secrets": host api.elevenlabs.io, header xi-api-key, no prefix)
//   MOMO_ELEVEN_VOICE=<voice_id>      Momo's voice (make one with `npm run voice:design`, or copy any id from the Voice Library)
//   MOMO_ELEVEN_MODEL=eleven_v3       a model that speaks Thai
//   MOMO_ELEVEN_STABILITY=0.45 MOMO_ELEVEN_STYLE=0.35   tune the delivery
//
// Otherwise falls back to Microsoft's free neural voices through the `edge-tts` CLI (pip install edge-tts):
//   MOMO_VOICE=th-TH-PremwadeeNeural MOMO_PITCH=+22Hz MOMO_RATE=+0%
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

export const ELEVEN_API = "https://api.elevenlabs.io/v1";

/** ElevenLabs when the key is here, or when MOMO_TTS=elevenlabs says a proxy attaches it. */
export const useEleven = () => !!process.env.ELEVENLABS_API_KEY || process.env.MOMO_TTS === "elevenlabs";

/** Request headers for ElevenLabs; the key header is left out when a proxy adds it. */
export function elevenHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const key = process.env.ELEVENLABS_API_KEY;
  return { "content-type": "application/json", ...(key ? { "xi-api-key": key } : {}), ...extra };
}

export type TtsInfo = { provider: "elevenlabs"; voice: string; model: string } | { provider: "edge-tts"; voice: string; pitch: string; rate: string };

export function ttsInfo(): TtsInfo {
  if (useEleven()) {
    const voice = process.env.MOMO_ELEVEN_VOICE;
    if (!voice) throw new Error("ElevenLabs is on but MOMO_ELEVEN_VOICE is not set. Run `npm run voice:design` or pick a voice id from ElevenLabs.");
    return { provider: "elevenlabs", voice, model: process.env.MOMO_ELEVEN_MODEL ?? "eleven_v3" };
  }
  return {
    provider: "edge-tts",
    voice: process.env.MOMO_VOICE ?? "th-TH-PremwadeeNeural",
    pitch: process.env.MOMO_PITCH ?? "+22Hz",
    rate: process.env.MOMO_RATE ?? "+0%",
  };
}

/** Writes `text` spoken in Momo's voice to `outPath` as MP3. */
export async function synth(text: string, outPath: string, info: TtsInfo = ttsInfo()): Promise<void> {
  if (info.provider === "edge-tts") {
    execFileSync("edge-tts", ["--voice", info.voice, `--pitch=${info.pitch}`, `--rate=${info.rate}`, "--text", text, "--write-media", outPath], { stdio: "inherit" });
    return;
  }
  const res = await fetch(`${ELEVEN_API}/text-to-speech/${encodeURIComponent(info.voice)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: elevenHeaders({ accept: "audio/mpeg" }),
    body: JSON.stringify({
      text,
      model_id: info.model,
      voice_settings: {
        stability: Number(process.env.MOMO_ELEVEN_STABILITY ?? 0.45),
        similarity_boost: 0.8,
        style: Number(process.env.MOMO_ELEVEN_STYLE ?? 0.35),
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

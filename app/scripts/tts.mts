// Text-to-speech for Momo's voice, shared by `npm run voice` and `npm run tutorial:voice`.
//
// ElevenLabs (used when ELEVENLABS_API_KEY is set, or MOMO_TTS=elevenlabs):
//   ELEVENLABS_API_KEY=...            your key (elevenlabs.io → Profile → API keys)
//   MOMO_TTS=elevenlabs               instead of the key, when a proxy adds it for you (Claude Code cloud
//                                     "Network secrets": host api.elevenlabs.io, header xi-api-key, no prefix)
//   MOMO_ELEVEN_VOICE=<voice_id>      Momo's voice (make one with `npm run voice:design`, or copy any id from the Voice Library)
//   MOMO_ELEVEN_MODEL=eleven_v4       a model that speaks Thai (also eleven_v4_turbo, eleven_v3)
//   MOMO_ELEVEN_STABILITY=0.45 MOMO_ELEVEN_STYLE=0.35   tune the delivery
//
// Otherwise falls back to Microsoft's free neural voices through the `edge-tts` CLI (pip install edge-tts):
//   MOMO_VOICE=th-TH-PremwadeeNeural MOMO_PITCH=+22Hz MOMO_RATE=+0%
// or, with MOMO_ENGINE=gtts, Google's Thai voice (pip install gTTS + ffmpeg) where Microsoft refuses the
// connection (e.g. on GitHub's runners); MOMO_SHIFT raises its pitch, e.g. 1.12.
import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";

export const ELEVEN_API = "https://api.elevenlabs.io/v1";

/** ElevenLabs when the key is here, or when MOMO_TTS=elevenlabs says a proxy attaches it. */
export const elevenEnabled = () => !!process.env.ELEVENLABS_API_KEY || process.env.MOMO_TTS === "elevenlabs";

/** Request headers for ElevenLabs; the key header is left out when a proxy adds it. */
export function elevenHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const key = process.env.ELEVENLABS_API_KEY;
  return { "content-type": "application/json", ...(key ? { "xi-api-key": key } : {}), ...extra };
}

export type TtsInfo =
  | { provider: "elevenlabs"; voice: string; model: string }
  | { provider: "edge-tts"; voice: string; pitch: string; rate: string }
  | { provider: "gtts"; voice: "google-th"; shift: number };

export function ttsInfo(): TtsInfo {
  if (elevenEnabled()) {
    const voice = process.env.MOMO_ELEVEN_VOICE;
    if (!voice) throw new Error("ElevenLabs is on but MOMO_ELEVEN_VOICE is not set. Run `npm run voice:design` or pick a voice id from ElevenLabs.");
    return { provider: "elevenlabs", voice, model: process.env.MOMO_ELEVEN_MODEL ?? "eleven_v4" };
  }
  if (process.env.MOMO_ENGINE === "gtts") return { provider: "gtts", voice: "google-th", shift: Number(process.env.MOMO_SHIFT || "1.12") };
  return {
    provider: "edge-tts",
    voice: process.env.MOMO_VOICE ?? "th-TH-PremwadeeNeural",
    pitch: process.env.MOMO_PITCH ?? "+22Hz",
    rate: process.env.MOMO_RATE ?? "+0%",
  };
}

/** Writes `text` spoken in Momo's voice to `outPath` as MP3. */
export async function synth(text: string, outPath: string, info: TtsInfo = ttsInfo()): Promise<void> {
  if (info.provider === "gtts") {
    const raw = `${outPath}.raw.mp3`;
    execFileSync("gtts-cli", [text, "--lang", "th", "--output", raw], { stdio: "inherit" });
    const af = info.shift === 1 ? "anull" : `asetrate=24000*${info.shift},aresample=24000,atempo=${(1 / info.shift).toFixed(4)}`;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af", af, "-ac", "1", "-b:a", "64k", outPath], { stdio: "inherit" });
    rmSync(raw);
    return;
  }
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

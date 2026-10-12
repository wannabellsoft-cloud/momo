// Momo's recorded lines. Audio lives in public/voice/<id>.mp3 (generate with `npm run voice`,
// or replace any file with a real recording of the same name). Missing files fall back to the
// device's text-to-speech, so the app works before any audio exists.
export const VOICE_LINES = {
  "greet-morning": "อรุณสวัสดิ์ แพรวา โมโม่มาแล้วน้า",
  "greet-afternoon": "สวัสดีแพรวา โมโม่คิดถึงจังเลย",
  "greet-evening": "สวัสดีตอนเย็นน้า แพรวา",
  "greet-night": "สวัสดีแพรวา ใกล้เวลานอนแล้วน้า",
} as const;

export type VoiceLineId = keyof typeof VOICE_LINES;

export function greetingId(now = new Date()): VoiceLineId {
  const h = now.getHours();
  if (h < 11) return "greet-morning";
  if (h < 17) return "greet-afternoon";
  if (h < 21) return "greet-evening";
  return "greet-night";
}

"use client";

/* Momo's sounds — all synthesized with Web Audio (no audio files), soft and short.
   - Notification tones: sparkle (กรุ๊งกริ๊ง), bubble (ป๊อปฟอง), hop (ปุ๊กปิ๊ก)
   - UI: tap · success · toggle · back, played from a single document listener (see SoundLayer)
   - Greeting: a chime + Momo saying hello with the device's Thai voice
   On iOS the page's audio session is "ambient", so the ring/silent switch mutes Momo. */

export type Tone = "sparkle" | "bubble" | "hop" | "off";
export type UiSound = "tap" | "success" | "toggle" | "back" | "giggle";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "ambient";
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** True once the browser lets us play (after the first tap on iOS). */
export async function audioReady(): Promise<boolean> {
  const c = audio();
  if (!c) return false;
  try {
    await Promise.race([c.resume(), new Promise((r) => setTimeout(r, 150))]);
  } catch {}
  return c.state === "running";
}

type Note = { f: number; t: number; d: number; type?: OscillatorType; v?: number; to?: number; vib?: boolean };

function play(notes: Note[], gain = 1) {
  const c = audio();
  if (!c) return;
  const now = c.currentTime + 0.01;
  const master = c.createGain();
  master.gain.value = gain;
  master.connect(c.destination);
  for (const n of notes) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = n.type ?? "sine";
    o.frequency.setValueAtTime(n.f, now + n.t);
    if (n.to) o.frequency.exponentialRampToValueAtTime(n.to, now + n.t + n.d * 0.8);
    if (n.vib) {
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = 9;
      lg.gain.value = n.f * 0.012;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(now + n.t);
      lfo.stop(now + n.t + n.d + 0.05);
    }
    const peak = n.v ?? 0.16;
    g.gain.setValueAtTime(0.0001, now + n.t);
    g.gain.exponentialRampToValueAtTime(peak, now + n.t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);
    o.connect(g).connect(master);
    o.start(now + n.t);
    o.stop(now + n.t + n.d + 0.05);
  }
}

// C6 E6 G6 C7 — a little music-box sparkle
const SPARKLE: Note[] = [
  { f: 1046.5, t: 0, d: 0.5, v: 0.13 },
  { f: 1318.5, t: 0.09, d: 0.5, v: 0.12 },
  { f: 1568, t: 0.18, d: 0.55, v: 0.12 },
  { f: 2093, t: 0.29, d: 0.8, v: 0.1, vib: true },
  { f: 3136, t: 0.29, d: 0.5, v: 0.025 },
];
const BUBBLE: Note[] = [
  { f: 520, to: 1250, t: 0, d: 0.12, v: 0.2 },
  { f: 700, to: 1600, t: 0.14, d: 0.12, v: 0.18 },
  { f: 900, to: 2000, t: 0.3, d: 0.16, v: 0.15 },
];
const HOP: Note[] = [
  { f: 330, to: 880, t: 0, d: 0.16, type: "triangle", v: 0.2 },
  { f: 440, to: 1175, t: 0.2, d: 0.16, type: "triangle", v: 0.18 },
  { f: 1568, t: 0.4, d: 0.35, v: 0.09, vib: true },
];

export function playTone(tone: Tone | string) {
  if (tone === "off") return;
  play(tone === "bubble" || tone === "pop" ? BUBBLE : tone === "hop" ? HOP : SPARKLE);
}

const UI: Record<UiSound, Note[]> = {
  tap: [{ f: 1180, to: 1580, t: 0, d: 0.07, v: 0.07 }],
  toggle: [{ f: 880, t: 0, d: 0.06, v: 0.06 }, { f: 1320, t: 0.05, d: 0.08, v: 0.06 }],
  back: [{ f: 1400, to: 950, t: 0, d: 0.09, v: 0.06 }],
  success: [
    { f: 784, t: 0, d: 0.18, v: 0.12 },
    { f: 1046.5, t: 0.08, d: 0.2, v: 0.12 },
    { f: 1318.5, t: 0.16, d: 0.22, v: 0.11 },
    { f: 1568, t: 0.24, d: 0.45, v: 0.1, vib: true },
  ],
  giggle: [
    { f: 1200, to: 1700, t: 0, d: 0.07, v: 0.09 },
    { f: 1300, to: 1850, t: 0.09, d: 0.07, v: 0.09 },
    { f: 1450, to: 2050, t: 0.18, d: 0.09, v: 0.08 },
  ],
};

export function playUi(kind: UiSound) {
  play(UI[kind]);
}

/* ─── Greeting ─────────────────────────────────────────────────────────── */
function greetingLine(now = new Date()) {
  const h = now.getHours();
  if (h < 11) return "อรุณสวัสดิ์ แพรวา โมโม่มาแล้วน้า";
  if (h < 17) return "สวัสดีแพรวา โมโม่คิดถึงจังเลย";
  if (h < 21) return "สวัสดีตอนเย็นน้า แพรวา";
  return "สวัสดีแพรวา ใกล้เวลานอนแล้วน้า";
}

function thaiVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang.toLowerCase().startsWith("th")) ?? undefined;
}

/** Chime + Momo speaks — higher pitch so the device voice sounds small and bunny-like. */
export function playGreeting() {
  playTone("sparkle");
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const speak = () => {
    const u = new SpeechSynthesisUtterance(greetingLine());
    u.lang = "th-TH";
    const v = thaiVoice();
    if (v) u.voice = v;
    u.pitch = 1.7;
    u.rate = 1.02;
    u.volume = 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };
  // iOS only allows speech started inside the tap itself, so speak now (the chime is short).
  if (speechSynthesis.getVoices().length) speak();
  else speechSynthesis.addEventListener("voiceschanged", speak, { once: true });
}

export { greetingLine };

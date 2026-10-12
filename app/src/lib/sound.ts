"use client";

/* Momo's sounds — all synthesized with Web Audio (no audio files), soft and short.
   - Notification tones: sparkle (กรุ๊งกริ๊ง), bubble (ป๊อปฟอง), hop (ปุ๊กปิ๊ก)
   - UI: tap · success · toggle · back, played from a single document listener (see SoundLayer)
   - Greeting: a chime + Momo saying hello with the device's Thai voice
   On iOS the page's audio session is "ambient", so the ring/silent switch mutes Momo. */

import { BASE } from "./base";
import { VOICE_LINES, greetingId, type VoiceLineId } from "./voice-lines";

export type Tone = "sparkle" | "bubble" | "hop" | "off";
export type UiSound = "tap" | "success" | "toggle" | "back" | "giggle";

let ctx: AudioContext | null = null;

/** Shared audio context (also used by the background music). */
export function audioContext(): AudioContext | null {
  return audio();
}

/** Background music (to lower itself) and Momo's face (to move her mouth) listen here while Momo talks.
    Returns an unsubscribe function. */
const duckHandlers = new Set<(ms: number) => void>();
export function onDuck(fn: (ms: number) => void) {
  duckHandlers.add(fn);
  return () => void duckHandlers.delete(fn);
}
const duck = (ms = 3500) => duckHandlers.forEach((fn) => fn(ms));

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

/* ─── Momo's voice (Web Speech TTS) ──────────────────────────────────────
   Voices depend on the device. The API has no gender field, so we rank by known Thai voice
   names: female first (Momo is a girl), male voices last. */
export type TtsPitch = "normal" | "cute" | "tiny";
export const TTS_PITCH: Record<TtsPitch, number> = { normal: 1, cute: 1.35, tiny: 1.7 };

const FEMALE = [/premwadee/i, /narisa/i, /kanya/i, /achara/i, /google/i, /female|ผู้หญิง/i];
const MALE = [/pattara/i, /niwat/i, /\bmale\b|ผู้ชาย/i];

export type MomoVoice = { name: string; label: string; gender: "female" | "male" | "unknown"; voice: SpeechSynthesisVoice };

// iOS/macOS "Enhanced"/"Premium" downloads (Settings → Accessibility → Spoken Content → Voices) sound far
// more natural than the built-in compact voice, so they go first. Siri voices are never offered to web apps.
const HQ = /enhanced|premium|natural|neural/i;

function rank(v: SpeechSynthesisVoice) {
  const f = FEMALE.findIndex((r) => r.test(v.name));
  const hq = HQ.test(v.name) || HQ.test(v.voiceURI) ? -0.5 : 0;
  if (f >= 0) return f + hq;
  if (MALE.some((r) => r.test(v.name))) return 90;
  return 50;
}

/** Thai voices on this device, best (female, natural) first. */
export function thaiVoices(): MomoVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("th"))
    .sort((a, b) => rank(a) - rank(b))
    .filter((v, i, all) => all.findIndex((w) => w.name === v.name) === i) // compact + enhanced can share a name: keep the better one
    .map((v) => {
      const r = rank(v);
      const hq = /enhanced|premium/i.test(v.voiceURI) && !/enhanced|premium/i.test(v.name) ? " (คุณภาพสูง)" : "";
      const label = v.name.replace(/^Microsoft\s+/i, "").replace(/\s*-\s*Thai.*$/i, "").replace(/\s*\(Thailand\)/i, "").trim() + hq;
      return { name: v.name, label, gender: r < 50 ? "female" : r >= 90 ? "male" : "unknown", voice: v };
    });
}

/* For useSyncExternalStore: voices arrive asynchronously (voiceschanged). */
let cache: { key: string; list: MomoVoice[] } = { key: "", list: [] };
export function voicesSnapshot(): MomoVoice[] {
  const list = thaiVoices();
  const key = list.map((v) => v.name).join("|");
  if (key !== cache.key) cache = { key, list };
  return cache.list;
}
export function subscribeVoices(cb: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  speechSynthesis.getVoices(); // kick off loading
  speechSynthesis.addEventListener("voiceschanged", cb);
  return () => speechSynthesis.removeEventListener("voiceschanged", cb);
}

function pickVoice(name: string | null): SpeechSynthesisVoice | undefined {
  const list = thaiVoices();
  return (name && list.find((v) => v.name === name)?.voice) || list[0]?.voice;
}

export function speak(text: string, opts: { voice?: string | null; pitch?: TtsPitch } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  duck();
  const go = () => {
    try {
      say();
    } catch {
      /* speech unavailable — Momo stays quiet, nothing else is affected */
    }
  };
  const say = () => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "th-TH";
    const v = pickVoice(opts.voice ?? null);
    if (v) u.voice = v;
    u.pitch = TTS_PITCH[opts.pitch ?? "cute"];
    u.rate = 1;
    u.volume = 0.95;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };
  // iOS only allows speech started inside the tap itself, so speak right away when voices are ready.
  try {
    if (speechSynthesis.getVoices().length) go();
    else speechSynthesis.addEventListener("voiceschanged", go, { once: true });
  } catch {}
}

/* ─── Recorded clips (same voice on every device) ─────────────────────── */
export const MOMO_CLIPS = "@momo"; // settings.ttsVoice value that selects the clips

let clipSet: Promise<Set<string>> | null = null;
/** Which clips exist in public/voice (from manifest.json). Empty when none were generated. */
export function availableClips(): Promise<Set<string>> {
  clipSet ??= fetch(`${BASE}/voice/manifest.json`, { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : { lines: {} }))
    .then((m: { lines?: Record<string, string> }) => new Set(Object.keys(m.lines ?? {})))
    .catch(() => new Set<string>());
  return clipSet;
}

const buffers = new Map<string, Promise<AudioBuffer | null>>();
function loadClip(id: VoiceLineId) {
  const c = audio();
  if (!c) return Promise.resolve(null);
  if (!buffers.has(id))
    buffers.set(
      id,
      fetch(`${BASE}/voice/${id}.mp3`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
        .then((b) => c.decodeAudioData(b))
        .catch(() => null),
    );
  return buffers.get(id)!;
}

/** Play a recorded line through the (already unlocked) audio context. Resolves false if unavailable. */
export async function playClip(id: VoiceLineId, delay = 0): Promise<boolean> {
  const c = audio();
  if (!c || !(await availableClips()).has(id)) return false;
  const buf = await loadClip(id);
  if (!buf) return false;
  duck(buf.duration * 1000 + 1200);
  const src = c.createBufferSource();
  const g = c.createGain();
  g.gain.value = 1;
  src.buffer = buf;
  src.connect(g).connect(c.destination);
  src.start(c.currentTime + delay);
  return true;
}

/** Say a line: recorded clip when chosen/available, otherwise the device voice. */
export async function sayLine(id: VoiceLineId, opts: { voice?: string | null; pitch?: TtsPitch } = {}) {
  const wantClips = opts.voice == null || opts.voice === MOMO_CLIPS;
  if (wantClips && (await availableClips()).has(id)) {
    if (await playClip(id, 0.45)) return;
  }
  speak(VOICE_LINES[id], { ...opts, voice: opts.voice === MOMO_CLIPS ? null : opts.voice });
}

/** Chime + Momo says hello in the chosen voice. */
export function playGreeting(opts: { voice?: string | null; pitch?: TtsPitch } = {}) {
  duck(4000);
  playTone("sparkle");
  const id = greetingId();
  const wantClips = opts.voice == null || opts.voice === MOMO_CLIPS;
  // Device speech must start inside the tap on iOS, so only go async when clips are known to exist.
  if (wantClips && clipSet) {
    void clipSet.then((set) => (set.has(id) ? playClip(id, 0.45).then((ok) => ok || speak(VOICE_LINES[id], opts)) : speak(VOICE_LINES[id], opts)));
    return;
  }
  speak(VOICE_LINES[id], { ...opts, voice: opts.voice === MOMO_CLIPS ? null : opts.voice });
}

const greetingLine = (now = new Date()) => VOICE_LINES[greetingId(now)];
export { greetingLine };

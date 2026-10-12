"use client";

/* Momo's background music — original tunes, synthesized live with Web Audio (no audio files).
   - "box": music-box melody in C major, 84 bpm, soft bass and a little twinkle.
   - "lullaby": slow 3/4 lullaby in F major, 60 bpm — soft celesta melody over a warm, filtered pad.
   - Starts after the first tap (browsers block audio before that), pauses when the app is hidden.
   - Lowers itself ("ducks") while Momo talks.
   - Follows the iPhone silent switch (ambient audio session, see sound.ts). */
import { audioContext, onDuck } from "./sound";

export type Track = "box" | "lullaby";

const SEMI: Record<string, number> = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
/** "A4" · "Bb3" · "F#5" → Hz */
function hz(note: string) {
  const m = /^([A-G])(b|#)?(\d)$/.exec(note);
  if (!m) return 0;
  const n = SEMI[m[1]] + (m[2] === "b" ? -1 : m[2] === "#" ? 1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * 2 ** (n / 12);
}

type Song = {
  bpm: number;
  slots: number; // eighth notes per bar
  melody: string[][]; // one row per bar, "" = rest/hold
  play: (c: AudioContext, out: AudioNode, bar: number, slot: number, t: number, eighth: number) => void;
  volume: number;
};

function box(c: AudioContext, out: AudioNode, f: number, t: number, v: number) {
  // music-box: sine + quiet octave partial, fast attack, long ring
  for (const [mult, gain] of [[1, 1], [2, 0.18], [3, 0.05]] as const) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = f * mult;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v * gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4 / mult);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 1.5);
  }
}

function tone(c: AudioContext, out: AudioNode, f: number, t: number, v: number, type: OscillatorType, attack: number, length: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + length + 0.05);
}

// ─── Music box ────────────────────────────────────────────────────────────
const BOX_BASS = ["C3", "A3", "F3", "G3", "C3", "A3", "F3", "C3"];
const BOX_TWINKLE: [number, number, string][] = [[3, 7, "E6"], [7, 4, "G5"], [5, 3, "E6"]]; // [bar, slot, note]
const MUSIC_BOX: Song = {
  bpm: 84,
  slots: 8,
  volume: 0.32,
  melody: [
    ["E5", "", "G5", "", "C6", "", "G5", ""],
    ["A5", "", "G5", "E5", "", "", "D5", ""],
    ["F5", "", "A5", "", "C6", "", "A5", "G5"],
    ["G5", "", "", "D5", "", "E5", "F5", ""],
    ["E5", "G5", "C6", "", "D6", "", "C6", ""],
    ["A5", "", "C6", "", "A5", "G5", "E5", ""],
    ["F5", "", "A5", "", "G5", "", "D5", ""],
    ["C5", "", "E5", "", "C5", "", "", ""],
  ],
  play(c, out, bar, slot, t, eighth) {
    const note = this.melody[bar][slot];
    if (note) box(c, out, hz(note), t, slot % 2 === 0 ? 0.16 : 0.12);
    if (slot === 0 || slot === 4) tone(c, out, hz(BOX_BASS[bar]), t, 0.09, "triangle", 0.05, eighth * 8 * 0.48);
    for (const [b, sl, n] of BOX_TWINKLE) if (b === bar && sl === slot) box(c, out, hz(n), t + eighth / 2, 0.05);
  },
};

// ─── Lullaby ──────────────────────────────────────────────────────────────
// F · Dm · C · Bb · Bb · F · C · F — each bar: low root + a slow, filtered pad chord.
const LULL_CHORDS: string[][] = [
  ["F2", "F3", "A3", "C4"],
  ["D2", "D3", "F3", "A3"],
  ["C2", "C3", "E3", "G3"],
  ["Bb1", "Bb2", "D3", "F3"],
  ["Bb1", "Bb2", "D3", "F3"],
  ["F2", "F3", "A3", "C4"],
  ["C2", "C3", "E3", "G3"],
  ["F2", "F3", "A3", "C4"],
];
let padFilter: BiquadFilterNode | null = null;
const LULLABY: Song = {
  bpm: 60,
  slots: 6, // 3/4
  volume: 0.36,
  melody: [
    ["A4", "", "", "", "C5", ""],
    ["F5", "", "", "", "", ""],
    ["E5", "", "D5", "", "C5", ""],
    ["D5", "", "", "", "", ""],
    ["Bb4", "", "", "", "D5", ""],
    ["C5", "", "A4", "", "F4", ""],
    ["G4", "", "", "", "E4", ""],
    ["F4", "", "", "", "", ""],
  ],
  play(c, out, bar, slot, t, eighth) {
    const barLen = eighth * 6;
    const note = this.melody[bar][slot];
    if (note) {
      // celesta: sine + soft octave, gentle attack, long ring
      tone(c, out, hz(note), t, 0.12, "sine", 0.03, 2.4);
      tone(c, out, hz(note) * 2, t, 0.018, "sine", 0.02, 1.1);
    }
    if (slot === 0) {
      if (!padFilter || padFilter.context !== c) {
        padFilter = c.createBiquadFilter();
        padFilter.type = "lowpass";
        padFilter.frequency.value = 900;
        padFilter.connect(out);
      }
      const [root, ...pad] = LULL_CHORDS[bar];
      tone(c, out, hz(root), t, 0.07, "sine", 0.08, barLen * 0.95);
      for (const n of pad) tone(c, padFilter, hz(n), t, 0.022, "triangle", barLen * 0.35, barLen * 1.15);
    }
    // a soft "rocking" note on beat 3 of the held bars
    if (slot === 4 && !this.melody[bar][4] && bar % 2 === 1) tone(c, out, hz(LULL_CHORDS[bar][3]) * 2, t, 0.03, "sine", 0.04, 1.4);
  },
};

const SONGS: Record<Track, Song> = { box: MUSIC_BOX, lullaby: LULLABY };

let master: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let nextTime = 0;
let step = 0; // eighth-note index within the loop
let song: Song = MUSIC_BOX;
let current: Track | null = null;
let switching: ReturnType<typeof setTimeout> | null = null;

function schedule() {
  const c = audioContext();
  if (!c || !master) return;
  const eighth = 60 / song.bpm / 2;
  const loop = song.slots * song.melody.length;
  while (nextTime < c.currentTime + 0.25) {
    song.play(c, master, Math.floor(step / song.slots), step % song.slots, nextTime, eighth);
    nextTime += eighth;
    step = (step + 1) % loop;
  }
}

/** Start (or switch to) a track. Switching fades the old one out first. */
export function startMusic(track: Track = "box") {
  const c = audioContext();
  if (!c) return;
  if (switching) clearTimeout(switching);
  switching = null;
  if (current === track) return;
  if (current) {
    stopMusic();
    switching = setTimeout(() => startMusic(track), 450);
    return;
  }
  current = track;
  song = SONGS[track];
  step = 0;
  master ??= (() => {
    const g = c.createGain();
    g.connect(c.destination);
    return g;
  })();
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setValueAtTime(0.0001, c.currentTime);
  master.gain.exponentialRampToValueAtTime(song.volume, c.currentTime + 1.5); // fade in
  nextTime = c.currentTime + 0.1;
  timer = setInterval(schedule, 90);
  schedule();
}

export function stopMusic() {
  const c = audioContext();
  current = null;
  if (switching) clearTimeout(switching);
  switching = null;
  if (timer) clearInterval(timer);
  timer = null;
  if (c && master) {
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), c.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4);
  }
}

export const isMusicPlaying = () => current !== null;

// Quiet the music while Momo talks, then bring it back.
onDuck((ms) => {
  const c = audioContext();
  if (!c || !master || !current) return;
  const g = master.gain;
  const v = song.volume;
  g.cancelScheduledValues(c.currentTime);
  g.setValueAtTime(Math.max(g.value, 0.0001), c.currentTime);
  g.exponentialRampToValueAtTime(v * 0.2, c.currentTime + 0.25);
  g.setValueAtTime(v * 0.2, c.currentTime + ms / 1000);
  g.exponentialRampToValueAtTime(v, c.currentTime + ms / 1000 + 1.2);
});

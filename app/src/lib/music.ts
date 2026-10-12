"use client";

/* Momo's background music — an original, gentle music-box lullaby, synthesized live with Web Audio
   (no audio file). 8-bar loop in C major at 84 bpm: music-box melody, soft bass, a little twinkle.
   - Starts after the first tap (browsers block audio before that), pauses when the app is hidden.
   - Lowers itself ("ducks") while Momo talks.
   - Follows the iPhone silent switch (ambient audio session, see sound.ts). */
import { audioContext, onDuck } from "./sound";

const BPM = 84;
const EIGHTH = 60 / BPM / 2;
const BAR = EIGHTH * 8;
const VOLUME = 0.32;

const N: Record<string, number> = {
  C3: 130.81, F3: 174.61, G3: 196, A3: 220,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51,
};

// 8 eighth-note slots per bar ("" = rest)
const MELODY: string[][] = [
  ["E5", "", "G5", "", "C6", "", "G5", ""],
  ["A5", "", "G5", "E5", "", "", "D5", ""],
  ["F5", "", "A5", "", "C6", "", "A5", "G5"],
  ["G5", "", "", "D5", "", "E5", "F5", ""],
  ["E5", "G5", "C6", "", "D6", "", "C6", ""],
  ["A5", "", "C6", "", "A5", "G5", "E5", ""],
  ["F5", "", "A5", "", "G5", "", "D5", ""],
  ["C5", "", "E5", "", "C5", "", "", ""],
];
const BASS = ["C3", "A3", "F3", "G3", "C3", "A3", "F3", "C3"];
const TWINKLE: [number, number, string][] = [[3, 7, "E6"], [7, 4, "G5"], [5, 3, "E6"]]; // [bar, slot, note]

let master: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let nextTime = 0;
let step = 0; // eighth-note index within the loop
let playing = false;

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

function bass(c: AudioContext, out: AudioNode, f: number, t: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "triangle";
  o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + BAR * 0.48);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + BAR * 0.5);
}

function schedule() {
  const c = audioContext();
  if (!c || !master) return;
  while (nextTime < c.currentTime + 0.25) {
    const bar = Math.floor(step / 8) % 8;
    const slot = step % 8;
    const note = MELODY[bar][slot];
    if (note) box(c, master, N[note], nextTime, slot % 2 === 0 ? 0.16 : 0.12);
    if (slot === 0 || slot === 4) bass(c, master, N[BASS[bar]], nextTime);
    for (const [b, sl, n] of TWINKLE) if (b === bar && sl === slot) box(c, master, N[n], nextTime + EIGHTH / 2, 0.05);
    nextTime += EIGHTH;
    step = (step + 1) % 64;
  }
}

export function startMusic() {
  const c = audioContext();
  if (!c || playing) return;
  playing = true;
  master ??= (() => {
    const g = c.createGain();
    g.connect(c.destination);
    return g;
  })();
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setValueAtTime(0.0001, c.currentTime);
  master.gain.exponentialRampToValueAtTime(VOLUME, c.currentTime + 1.5); // fade in
  nextTime = c.currentTime + 0.1;
  timer = setInterval(schedule, 90);
  schedule();
}

export function stopMusic() {
  const c = audioContext();
  playing = false;
  if (timer) clearInterval(timer);
  timer = null;
  if (c && master) {
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), c.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4);
  }
}

export const isMusicPlaying = () => playing;

// Quiet the music while Momo talks, then bring it back.
onDuck((ms) => {
  const c = audioContext();
  if (!c || !master || !playing) return;
  const g = master.gain;
  g.cancelScheduledValues(c.currentTime);
  g.setValueAtTime(Math.max(g.value, 0.0001), c.currentTime);
  g.exponentialRampToValueAtTime(VOLUME * 0.2, c.currentTime + 0.25);
  g.setValueAtTime(VOLUME * 0.2, c.currentTime + ms / 1000);
  g.exponentialRampToValueAtTime(VOLUME, c.currentTime + ms / 1000 + 1.2);
});

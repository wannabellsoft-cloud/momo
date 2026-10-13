"use client";

/* Momo speaking in the app: tap lines and reactions (taken, refill, open box…), always in her recorded
   voice (public/voice, from `npm run voice`). A line without a clip stays silent — Momo never uses the
   device's text-to-speech. Off with Settings → “โมโม่พูดตอนแตะและตอนบันทึก”. */

import { availableClips, playClip } from "./sound";
import { useMomo } from "./store";
import { clipId } from "./voice-lines";

/** Say a line in Momo's recorded voice. */
export function momoSays(text: string, opts: { delay?: number } = {}) {
  if (!useMomo.getState().settings.momoTalk) return;
  const id = clipId(text);
  void availableClips().then((set) => {
    if (set.has(id)) void playClip(id, opts.delay ?? 0.15);
  });
}

const last: Record<string, number> = {};
/** Say one of `lines`, never the same one twice in a row. */
export function momoSaysOneOf(kind: string, lines: readonly string[], opts?: { delay?: number }) {
  let i = Math.floor(Math.random() * lines.length);
  if (lines.length > 1 && i === last[kind]) i = (i + 1) % lines.length;
  last[kind] = i;
  momoSays(lines[i], opts);
}

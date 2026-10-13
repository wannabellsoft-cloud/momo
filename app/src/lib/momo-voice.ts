"use client";

/* Momo speaking in the app: tap lines and reactions (taken, refill, open box…).
   Plays the recorded clip in Momo's voice (public/voice, from `npm run voice`); with a device voice
   chosen in Settings it speaks through that voice instead. Off with Settings → “โมโม่พูดตอนแตะและตอนบันทึก”. */

import { MOMO_CLIPS, availableClips, playClip, speak } from "./sound";
import { useMomo } from "./store";
import { clipId, speakable } from "./voice-lines";

/** Say a line. `clipOnly`: stay quiet unless the line was recorded (used for every toast). */
export function momoSays(text: string, opts: { clipOnly?: boolean; delay?: number } = {}) {
  const st = useMomo.getState().settings;
  if (!st.momoTalk) return;
  const wantClips = st.ttsVoice == null || st.ttsVoice === MOMO_CLIPS;
  if (!wantClips) {
    // iOS only lets device speech start inside the tap, so speak right away
    if (!opts.clipOnly) speak(speakable(text), { voice: st.ttsVoice, pitch: st.ttsPitch });
    return;
  }
  const id = clipId(text);
  void availableClips().then((set) => {
    if (set.has(id)) void playClip(id, opts.delay ?? 0.15);
  });
}

const last: Record<string, number> = {};
/** Say one of `lines`, never the same one twice in a row. */
export function momoSaysOneOf(kind: string, lines: readonly string[], opts?: { clipOnly?: boolean; delay?: number }) {
  let i = Math.floor(Math.random() * lines.length);
  if (lines.length > 1 && i === last[kind]) i = (i + 1) % lines.length;
  last[kind] = i;
  momoSays(lines[i], opts);
}

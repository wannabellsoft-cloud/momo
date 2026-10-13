"use client";

import { useEffect, useRef, useState } from "react";
import { momoSays } from "@/lib/momo-voice";
import { momoGreeting } from "@/lib/sound";
import { useUI } from "@/lib/ui";
import { HOME_TAP_LINES } from "@/lib/voice-lines";
import { KeepName, cx } from "./ui";
import { TO_MASCOT, type MomoState } from "./momo/MomoBunny";
import { MomoMascot, type MascotState } from "./momo/MomoMascot";

// Things Momo says when tapped — affectionate only, never about whether a dose was taken (lib/voice-lines.ts).
export const TAP_LINES = HOME_TAP_LINES;

type Burst = { id: number; x: number; d: number; s: number; glyph: string };

type Props = {
  state: MomoState;
  /** Momo's line next to her. Without it, tap lines pop up in a small bubble above Momo. */
  bubble?: string;
  size?: number;
  /** What Momo says when tapped (picked at random, never the same twice in a row). */
  lines?: string[];
  /** Say hello with the launch greeting (Home only). */
  greet?: boolean;
  /** Move the mouth while Momo speaks (use on one Momo per screen). */
  talks?: boolean;
  priority?: boolean;
  className?: string;
  /** Extra bubble classes; with `bubbleCustom` they replace the default bubble look entirely. */
  bubbleClassName?: string;
  bubbleCustom?: boolean;
};

/** Momo that reacts: pops in, hops now and then, floating hearts; tap → happy jump, heart burst and a line. */
export function ReactiveMomo({ state, bubble, size = 170, lines = TAP_LINES, greet = false, talks = false, priority, className, bubbleClassName, bubbleCustom = false }: Props) {
  const greetEv = useUI((u) => u.greet);
  const [override, setOverride] = useState<{ line: string; momo?: MascotState; until: number } | null>(null);
  const [jump, setJump] = useState(0);
  const [burst, setBurst] = useState<Burst[]>([]);
  const lastLine = useRef(-1);
  const [mountedAt] = useState(() => Date.now());
  const [seenGreet, setSeenGreet] = useState<number | null>(null);

  // Say hello when the app greets Praewa on launch (not again when returning to the screen later).
  if (greet && greetEv && greetEv.key !== seenGreet) {
    setSeenGreet(greetEv.key);
    if (greetEv.key > mountedAt - 4000) setOverride({ line: greetEv.line + " ♡", momo: "happy", until: greetEv.key + 4200 });
  }

  useEffect(() => {
    if (!override) return;
    const t = setTimeout(() => setOverride(null), Math.max(0, override.until - Date.now()));
    return () => clearTimeout(t);
  }, [override]);

  const poke = () => {
    let i = Math.floor(Math.random() * lines.length);
    if (i === lastLine.current) i = (i + 1) % lines.length;
    lastLine.current = i;
    // while Momo says hello (often the first tap of the session), keep her greeting: just hop and hearts
    if (!momoGreeting()) {
      setOverride({ line: lines[i], momo: "success", until: Date.now() + 2800 });
      momoSays(lines[i], { delay: 0.25 }); // after the giggle
    }
    setJump((j) => j + 1);
    const now = Date.now();
    setBurst((b) => [
      ...b.filter((x) => now - x.id < 1500),
      ...Array.from({ length: 6 }, (_, k) => ({ id: now + k, x: size * (0.12 + Math.random() * 0.7), d: Math.random() * 0.25, s: 12 + Math.random() * 10, glyph: k % 3 === 2 ? "✦" : "♥" })),
    ]);
  };

  const momo: MascotState = override?.momo ?? TO_MASCOT[state];
  const line = override?.line ?? bubble;
  const k = size / 170; // scale the decoration with Momo

  const button = (
    <button
      type="button"
      onClick={poke}
      data-sound="giggle"
      aria-label="แตะโมโม่"
      className="relative flex-none cursor-pointer border-0 bg-transparent p-0"
      style={{ width: size, height: size }}
    >
      {/* ambient hearts */}
      <span aria-hidden="true" className="momo-drift absolute text-(--pink-300)" style={{ bottom: 40 * k, left: 12 * k, fontSize: 13 * Math.max(k, 0.75) }}>♥</span>
      <span aria-hidden="true" className="momo-drift absolute text-(--pink-300) [animation-delay:1.4s]" style={{ bottom: 64 * k, right: 16 * k, fontSize: 10 * Math.max(k, 0.8) }}>✦</span>
      <span aria-hidden="true" className="momo-drift absolute left-[46%] text-(--pink-300) [animation-delay:2.6s]" style={{ bottom: 24 * k, fontSize: 11 * Math.max(k, 0.8) }}>♥</span>
      {state === "taken" && (
        <>
          <span aria-hidden="true" className="momo-drift absolute text-(--pink-400) [animation-delay:.7s]" style={{ bottom: 32 * k, right: 32 * k, fontSize: 15 * Math.max(k, 0.75) }}>♥</span>
          <span aria-hidden="true" className="momo-drift absolute text-(--pink-400) [animation-delay:2s]" style={{ bottom: 48 * k, left: 40 * k, fontSize: 12 * Math.max(k, 0.75) }}>♥</span>
        </>
      )}
      {/* tap burst */}
      {burst.map((b) => (
        <span key={b.id} aria-hidden="true" className="momo-burst pointer-events-none absolute text-(--pink-400)" style={{ left: b.x, bottom: size * 0.38, fontSize: b.s, animationDelay: `${b.d}s` }}>
          {b.glyph}
        </span>
      ))}
      <span className="momo-enter block">
        <span key={jump} className={jump ? "momo-jump block" : "momo-idle-hop block"}>
          <MomoMascot state={momo} px={size} alt="" priority={priority} talks={talks} />
        </span>
      </span>
    </button>
  );

  // Without a standing bubble: the tap line pops up above Momo.
  if (bubble === undefined)
    return (
      <span className={cx("relative inline-block flex-none", className)}>
        {button}
        {override && (
          <span
            key={override.until}
            aria-live="polite"
            className="bubble-pop pointer-events-none absolute right-[55%] bottom-[78%] z-10 w-max max-w-[190px] rounded-[16px_16px_6px_16px] bg-(--surface-card) px-3 py-2 text-[13px] leading-[19px] font-extrabold shadow-(--shadow-soft)"
            style={{ transformOrigin: "100% 100%" }}
          >
            <KeepName text={override.line} />
          </span>
        )}
      </span>
    );

  return (
    <div className={cx("relative flex items-end gap-1", className)}>
      {button}
      <div
        key={line}
        className={cx("bubble-pop relative text-pretty", !bubbleCustom && "self-start rounded-[20px_20px_20px_6px] bg-(--surface-card) px-[14px] py-3 text-[15px] leading-[23px] font-extrabold shadow-(--shadow-soft)", bubbleClassName)}
        aria-live="polite"
      >
        <KeepName text={line ?? ""} />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useUI } from "@/lib/ui";
import { TO_MASCOT, type MomoState } from "./momo/MomoBunny";
import { MomoMascot, type MascotState } from "./momo/MomoMascot";

// Things Momo says when tapped — affectionate only, never about whether a dose was taken.
const TAP_LINES = ["ปุ๊กปิ๊ก ♡", "จิ้มโมโม่ทำไมน้า~ ♡", "กอดหน่อยได้ไหม ♡", "โมโม่อยู่ตรงนี้นะ", "วันนี้ก็เป็นวันที่ดีน้า ✦", "แพรวาน่ารักที่สุดเลย ♡", "ฮึบ! สู้ ๆ น้า"];

type Burst = { id: number; x: number; d: number; s: number; glyph: string };

/** Animated Momo for the Home hero: pop-in, idle hop, floating hearts, tap-to-play, launch wave. */
export function HomeMomo({ state, bubble }: { state: MomoState; bubble: string }) {
  const greet = useUI((u) => u.greet);
  const [override, setOverride] = useState<{ line: string; momo?: MascotState; until: number } | null>(null);
  const [jump, setJump] = useState(0);
  const [burst, setBurst] = useState<Burst[]>([]);
  const lastLine = useRef(-1);
  const [mountedAt] = useState(() => Date.now());
  const [seenGreet, setSeenGreet] = useState<number | null>(null);

  // Wave + say hello when the app greets Praewa on launch (not again when returning to Home later).
  if (greet && greet.key !== seenGreet) {
    setSeenGreet(greet.key);
    if (greet.key > mountedAt - 4000) setOverride({ line: greet.line + " ♡", momo: "happy", until: greet.key + 4200 });
  }

  useEffect(() => {
    if (!override) return;
    const t = setTimeout(() => setOverride(null), Math.max(0, override.until - Date.now()));
    return () => clearTimeout(t);
  }, [override]);

  const poke = () => {
    let i = Math.floor(Math.random() * TAP_LINES.length);
    if (i === lastLine.current) i = (i + 1) % TAP_LINES.length;
    lastLine.current = i;
    setOverride({ line: TAP_LINES[i], momo: "success", until: Date.now() + 2800 });
    setJump((j) => j + 1);
    const now = Date.now();
    setBurst((b) => [
      ...b.filter((x) => now - x.id < 1500),
      ...Array.from({ length: 6 }, (_, k) => ({ id: now + k, x: 20 + Math.random() * 120, d: Math.random() * 0.25, s: 12 + Math.random() * 10, glyph: k % 3 === 2 ? "✦" : "♥" })),
    ]);
  };

  const momo: MascotState = override?.momo ?? TO_MASCOT[state];
  const line = override?.line ?? bubble;

  return (
    <div className="relative mt-[6px] flex items-end gap-1">
      <button
        type="button"
        onClick={poke}
        data-sound="giggle"
        aria-label="แตะโมโม่"
        className="relative -ml-[10px] h-[170px] w-[170px] flex-none cursor-pointer border-0 bg-transparent p-0"
      >
        {/* ambient hearts */}
        <span aria-hidden="true" className="momo-drift absolute bottom-10 left-3 text-[13px] text-(--pink-300)">♥</span>
        <span aria-hidden="true" className="momo-drift absolute right-4 bottom-16 text-[10px] text-(--pink-300) [animation-delay:1.4s]">✦</span>
        <span aria-hidden="true" className="momo-drift absolute bottom-6 left-[46%] text-[11px] text-(--pink-300) [animation-delay:2.6s]">♥</span>
        {state === "taken" && (
          <>
            <span aria-hidden="true" className="momo-drift absolute right-8 bottom-8 text-[15px] text-(--pink-400) [animation-delay:.7s]">♥</span>
            <span aria-hidden="true" className="momo-drift absolute bottom-12 left-10 text-[12px] text-(--pink-400) [animation-delay:2s]">♥</span>
          </>
        )}
        {/* tap burst */}
        {burst.map((b) => (
          <span key={b.id} aria-hidden="true" className="momo-burst pointer-events-none absolute bottom-16 text-(--pink-400)" style={{ left: b.x, fontSize: b.s, animationDelay: `${b.d}s` }}>
            {b.glyph}
          </span>
        ))}
        <span className="momo-enter block">
          <span key={jump} className={jump ? "momo-jump block" : "momo-idle-hop block"}>
            <MomoMascot state={momo} px={170} alt="" />
          </span>
        </span>
      </button>
      <div
        key={line}
        className="bubble-pop relative mt-3 self-start rounded-[20px_20px_20px_6px] bg-(--surface-card) px-[14px] py-3 text-[15px] leading-[23px] font-extrabold text-pretty shadow-(--shadow-soft)"
        aria-live="polite"
      >
        {line}
      </div>
    </div>
  );
}

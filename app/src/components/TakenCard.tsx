"use client";

import { useState } from "react";
import { useUI } from "@/lib/ui";
import { MomoMascot } from "./momo/MomoMascot";

const PRAISE = ["เก่งมากเลยน้า", "โมโม่ภูมิใจจัง", "ดูแลตัวเองดีมาก", "เย้ เรียบร้อย ♡"];

/** “วันนี้กินยาแล้ว” — mint card with a self-drawing check, shimmer, Momo hugging a heart,
    and a heart burst right after a dose is recorded. */
export function TakenCard({ time }: { time: string | null }) {
  const celebrate = useUI((u) => u.celebrate);
  const [mountedAt] = useState(() => Date.now());
  const [praise] = useState(() => PRAISE[Math.floor(Math.random() * PRAISE.length)]);
  const fresh = !!celebrate && celebrate > mountedAt - 8000;
  const [burst] = useState(() => Array.from({ length: 10 }, (_, k) => ({ id: k, x: 8 + Math.random() * 84, d: Math.random() * 0.35, s: 11 + Math.random() * 11, g: k % 3 === 0 ? "✦" : "♥" })));

  return (
    <div className="relative">
    <div
      role="status"
      className="relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-[22px] border-[1.5px] border-solid border-(--taken-dash) py-3 pr-2 pl-3"
      style={{ background: "var(--taken-grad)" }}
    >
      {/* shimmer */}
      <span aria-hidden="true" className="taken-shine pointer-events-none absolute inset-y-0 left-0 w-1/3" style={{ background: "linear-gradient(90deg, transparent, var(--taken-shine), transparent)" }} />
      {/* sparkles */}
      <span aria-hidden="true" className="twinkle absolute top-[6px] left-[52px] text-[10px] text-(--success-fg)">✦</span>
      <span aria-hidden="true" className="twinkle absolute right-[68px] bottom-[7px] text-[9px] text-(--success-fg) [animation-delay:.8s]">✦</span>
      <span aria-hidden="true" className="twinkle absolute top-[8px] right-[74px] text-[11px] text-(--pink-400) [animation-delay:1.5s]">♥</span>

      <span className="check-pop relative flex h-11 w-11 flex-none items-center justify-center rounded-full bg-(--surface-card) shadow-[0_0_0_4px_rgba(93,187,142,.25)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path className="check-draw" d="M5 12.5 10 17.5 19 7" stroke="var(--success-fg)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-[17px] leading-[24px] font-extrabold text-(--success-fg)">วันนี้กินยาแล้ว ♡</span>
        <span className="block text-[13px] leading-[19px] text-(--text-primary)">
          {time ? `บันทึกเวลา ${time} น.` : "บันทึกแล้ว"} · {praise}
        </span>
      </span>
      <span className="taken-bob relative -my-2 flex-none">
        <MomoMascot state={fresh ? "celebrate" : "success"} px={62} alt="" />
      </span>
    </div>

      {fresh &&
        burst.map((b) => (
          <span key={b.id} aria-hidden="true" className="momo-burst pointer-events-none absolute bottom-6 z-10 text-(--pink-400)" style={{ left: `${b.x}%`, fontSize: b.s, animationDelay: `${b.d}s` }}>
            {b.g}
          </span>
        ))}
    </div>
  );
}

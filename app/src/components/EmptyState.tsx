"use client";

import type { ReactNode } from "react";
import { MomoBunny, type MomoState } from "./momo/MomoBunny";
import { Card, PrimaryButton } from "./ui";

/** Screen 11 — mascot in a tinted circle, title, body, CTA. */
export function EmptyState({ momo, tint, title, body, cta, onClick, children }: { momo: MomoState; tint: string; title: string; body: string; cta?: string; onClick?: () => void; children?: ReactNode }) {
  return (
    <Card hero className="flex flex-col items-center gap-[10px] px-5 py-7 text-center">
      <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full" style={{ background: tint }}>
        <MomoBunny state={momo} size={150} />
      </div>
      <h2 className="m-0 text-[20px] leading-[30px] font-extrabold">{title}</h2>
      <p className="m-0 max-w-[280px] text-[15px] leading-[24px] text-pretty text-(--text-secondary)">{body}</p>
      {cta && onClick && (
        <PrimaryButton size="md" className="mt-2 px-6" onClick={onClick}>
          {cta}
        </PrimaryButton>
      )}
      {children}
    </Card>
  );
}

export const EMPTY = {
  history: { momo: "waiting" as const, tint: "var(--bg-subtle)", title: "ยังไม่มีประวัติการกินยา", body: "พอแพรวากดบันทึกครั้งแรก โมโม่จะจดไว้ในปฏิทินให้นะ" },
  packs: { momo: "refill" as const, tint: "var(--surface-secondary)", title: "ยังไม่มีแผงที่เปิดอยู่", body: "เปิดกล่องใหม่ แล้วโมโม่จะสร้างแผงยา 2 แผงให้อัตโนมัติ" },
  reserve: { momo: "nostock" as const, tint: "var(--warning-bg)", title: "ไม่มีกล่องสำรองแล้ว", body: "ได้ยามาเพิ่มเมื่อไหร่ บอกโมโม่ได้เลย จะนับเข้าสต็อกให้" },
};

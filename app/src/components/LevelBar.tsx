"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BASE } from "@/lib/base";
import { momoExp } from "@/lib/exp";
import { useNow } from "@/lib/hooks";
import { useMomo } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { cx } from "./ui";

export const badgeSrc = (b: string) => `${BASE}/mascot/props/${b}.webp`;

/** Momo's level on Home: tier badge, "Lv.n · name", EXP bar and the current streak.
    Also announces level-ups once (remembered in settings.seenLevel). */
export function LevelBar() {
  const s = useMomo();
  const now = useNow();
  const x = momoExp(s, now);
  const showToast = useUI((u) => u.showToast);
  const seen = s.settings.seenLevel;
  const update = s.updateSettings;

  useEffect(() => {
    if (x.level === seen) return;
    if (seen > 0 && x.level > seen) showToast(`เลเวลอัป! โมโม่ Lv.${x.level} ${x.tier.name} ✨`, "welcome");
    update({ seenLevel: x.level });
  }, [x.level, x.tier.name, seen, update, showToast]);

  return (
    <Link
      href="/settings/profile/#level"
      aria-label={`โมโม่เลเวล ${x.level} ${x.tier.name} · ${x.inLevel} จาก ${x.toNext} EXP · ต่อเนื่อง ${x.streak} วัน`}
      className="press flex items-center gap-[10px] rounded-[20px] bg-(--surface-card) py-2 pr-3 pl-2 text-(--text-primary) no-underline shadow-(--shadow-card)"
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-(--surface-soft)">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export; tiny prop image */}
        <img src={badgeSrc(x.tier.badge)} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[14px] leading-[20px] font-extrabold">
            Lv.{x.level} <span className="text-(--action-soft-text)">{x.tier.name}</span>
          </span>
          <span className="tnum flex-none text-[11px] leading-[16px] font-extrabold text-(--text-secondary)">
            {x.inLevel}/{x.toNext} EXP
          </span>
        </span>
        <span className="mt-[5px] block h-[7px] overflow-hidden rounded-full bg-(--bg-subtle)">
          <span className="exp-fill block h-full rounded-full" style={{ width: `${Math.max(4, Math.round(x.progress * 100))}%` }} />
        </span>
      </span>
      <span
        className={cx(
          "flex h-8 flex-none items-center gap-[3px] rounded-full px-[10px] text-[12px] font-extrabold",
          x.streak > 0 ? "bg-(--warning-bg) text-(--warning-fg)" : "bg-(--bg-subtle) text-(--text-secondary)",
        )}
      >
        🔥 {x.streak}
      </span>
    </Link>
  );
}

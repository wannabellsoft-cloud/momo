"use client";

import type { ReactNode } from "react";
import type { BannerKind } from "@/lib/ui";
import { Icon } from "./momo/Icon";
import { MomoBunny, type MomoState } from "./momo/MomoBunny";
import { KeepName, cx } from "./ui";

const MOMO: Record<BannerKind, MomoState> = { remind: "reminder", follow: "waiting", bedtime: "sleep", test: "reminder" };

/** Momo's notification — pastel gradient card, Momo in a little bubble, floating hearts.
    Used for the in-app banner and the preview in Settings. */
export function NotificationCard({
  kind,
  title,
  body,
  time = "ตอนนี้",
  action,
  timer,
  className,
}: {
  kind: BannerKind;
  title: ReactNode;
  body: ReactNode;
  time?: string;
  action?: ReactNode;
  /** Running dismiss timer (ms) — shows a thin progress line. */
  timer?: number;
  className?: string;
}) {
  return (
    <div
      className={cx("relative flex items-center gap-3 overflow-hidden rounded-[26px] border-[1.5px] border-solid border-(--notif-edge) pt-3 pr-3 pb-[15px] pl-[10px] text-left", className)}
      style={{ background: "var(--notif-bg)", boxShadow: "var(--notif-shadow)" }}
    >
      {/* decorations */}
      <span aria-hidden="true" className="notif-float absolute top-[3px] left-[58px] text-[11px] text-(--notif-deco)">♥</span>
      <span aria-hidden="true" className="notif-float absolute bottom-[4px] left-[8px] text-[9px] text-(--notif-deco) [animation-delay:.6s]">✦</span>
      <span aria-hidden="true" className="absolute -top-6 -left-5 h-16 w-16 rounded-full bg-white/40" />

      <span className="notif-pop relative flex h-[54px] w-[54px] flex-none items-end justify-center overflow-visible rounded-full bg-(--surface-card) shadow-[0_0_0_3px_var(--pink-200)]">
        <span className="-mb-[2px]">
          <MomoBunny state={MOMO[kind]} still size={56} />
        </span>
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="flex items-center justify-between text-[11px] leading-4">
          <span className="flex items-center gap-1 font-extrabold tracking-[1px] text-(--action-primary)">
            <Icon name={kind === "bedtime" ? "moon" : "heart"} size={11} stroke={2.8} />
            MOMO
          </span>
          <span className="text-(--text-secondary)">{time}</span>
        </span>
        <span className="mt-[2px] block text-[15px] leading-[21px] font-extrabold text-pretty text-(--text-primary)">{typeof title === "string" ? <KeepName text={title} /> : title}</span>
        <span className="block text-[13px] leading-[18px] text-(--text-secondary)">{typeof body === "string" ? <KeepName text={body} /> : body}</span>
      </span>
      {action && <span className="relative flex-none">{action}</span>}
      {timer != null && (
        <span aria-hidden="true" className="absolute inset-x-6 bottom-[5px] h-[3px] overflow-hidden rounded-full bg-white/50">
          <span className="notif-timer block h-full rounded-full bg-(--pink-300)" style={{ animationDuration: `${timer}ms` }} />
        </span>
      )}
    </div>
  );
}

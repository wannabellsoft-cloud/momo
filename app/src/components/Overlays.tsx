"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuickConfirm } from "@/lib/hooks";
import { useUI } from "@/lib/ui";
import { NotificationCard } from "./NotificationCard";

const BANNER_MS = 5200;
import { Icon, type IconName } from "./momo/Icon";
import { TO_MASCOT, type MomoState } from "./momo/MomoBunny";
import { MomoMascot } from "./momo/MomoMascot";
import { cx } from "./ui";

/** In-app notification card (shown when a reminder fires while Momo is open). */
export function Banner() {
  const banner = useUI((u) => u.banner);
  const hide = useUI((u) => u.hideBanner);
  const router = useRouter();
  const quickConfirm = useQuickConfirm();
  const [shown, setShown] = useState(banner);
  if (banner && banner !== shown) setShown(banner); // keep content while sliding away
  const dose = shown?.kind !== "bedtime";
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(hide, BANNER_MS);
    return () => clearTimeout(t);
  }, [banner, hide]);
  return (
    // Rises from the bottom (just above the tab bar) so it never sits under the OS's own banners, which drop from the top.
    <div className="pointer-events-none fixed inset-x-0 z-[95] mx-auto max-w-[480px] px-[10px]" style={{ bottom: "calc(max(14px, calc(env(safe-area-inset-bottom) - 12px)) + 78px)" }}>
      <div
        role="button"
        tabIndex={banner ? 0 : -1}
        aria-hidden={!banner}
        onClick={() => {
          hide();
          router.push("/");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            hide();
            router.push("/");
          }
        }}
        className={cx("cursor-pointer transition-[transform,opacity] duration-[420ms] ease-(--ease-spring)", banner ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-[260px] opacity-0")}
      >
        {shown && (
          <NotificationCard
            key={shown.key}
            kind={shown.kind}
            title={shown.title}
            body={shown.body}
            timer={BANNER_MS}
            action={
              dose ? (
                <button
                  type="button"
                  data-sound="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    hide();
                    quickConfirm();
                  }}
                  className="press h-9 cursor-pointer rounded-full border-0 bg-(--action-primary) px-3 text-[13px] font-extrabold text-(--text-on-action) shadow-(--shadow-button)"
                >
                  บันทึก ♡
                </button>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

const TOAST_MS = 2800;
type Tone = { bg: string; fg: string; ring: string; icon: IconName };
const TONES = {
  success: { bg: "bg-(--success-bg)", fg: "text-(--success-fg)", ring: "border-(--success-fg)/25", icon: "check" },
  warn: { bg: "bg-(--warning-bg)", fg: "text-(--warning-fg)", ring: "border-(--warning-fg)/25", icon: "alert" },
  pink: { bg: "bg-(--action-soft)", fg: "text-(--action-soft-text)", ring: "border-(--action-soft-text)/20", icon: "bell" },
  calm: { bg: "bg-(--info-bg)", fg: "text-(--info-fg)", ring: "border-(--info-fg)/20", icon: "heart" },
} satisfies Record<string, Tone>;
const toneOf = (m: MomoState): Tone =>
  m === "taken" || m === "welcome" ? TONES.success : m === "nostock" || m === "refill" || m === "error" || m === "missed" ? TONES.warn : m === "reminder" ? TONES.pink : TONES.calm;

/** Toast: Momo peeking over a tinted card, tone icon and a countdown line · aria-live polite ·
    2.8 s, paused while hovered or pressed · tap to dismiss. */
export function Toast() {
  const toast = useUI((u) => u.toast);
  const hide = useUI((u) => u.hideToast);
  const [shown, setShown] = useState(toast);
  const [paused, setPaused] = useState(false);
  const bannerOpen = useUI((u) => !!u.banner);
  const visible = !!toast && !bannerOpen; // the notification card uses the same spot
  // keep the last message rendered while the toast fades out
  if (toast && toast !== shown) setShown(toast);
  useEffect(() => {
    if (!toast || paused) return;
    const t = setTimeout(hide, TOAST_MS);
    return () => clearTimeout(t);
  }, [toast, paused, hide]);
  const tone = toneOf(shown?.momo ?? "taken");
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[90] mx-auto max-w-[480px] px-4" style={{ bottom: "calc(max(14px, calc(env(safe-area-inset-bottom) - 12px)) + 82px)" }}>
      <div
        role="status"
        aria-live="polite"
        onClick={hide}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className={cx(
          "relative cursor-pointer transition-all duration-[320ms] ease-(--ease-spring)",
          visible ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[.96] opacity-0",
        )}
      >
        <div className={cx("relative flex min-h-[60px] items-center gap-3 overflow-hidden rounded-[22px] border-[1.5px] border-solid py-[10px] pr-3 pl-[74px] shadow-(--shadow-toast)", tone.bg, tone.ring)}>
          <span className={cx("min-w-0 flex-1 text-[15px] leading-[21px] font-extrabold text-pretty", tone.fg)}>{shown?.text}</span>
          <span key={shown?.key} className={cx("notif-pop flex h-8 w-8 flex-none items-center justify-center rounded-full bg-(--surface-card)", tone.fg)}>
            <Icon name={tone.icon} size={17} stroke={2.6} />
          </span>
          {visible && (
            <span
              key={`t${shown?.key}`}
              aria-hidden="true"
              className={cx("notif-timer absolute inset-x-0 bottom-0 h-[3px] bg-current opacity-30", tone.fg)}
              style={{ animationDuration: `${TOAST_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
            />
          )}
        </div>
        {/* Momo peeks over the top-left edge */}
        <span key={`m${shown?.key}`} className="toast-momo absolute bottom-[7px] left-[8px] flex h-[56px] w-[56px] items-end justify-center rounded-full bg-(--surface-card) shadow-[0_6px_14px_-6px_rgba(103,68,84,.4)]">
          <MomoMascot state={TO_MASCOT[shown?.momo ?? "taken"]} px={74} animated={false} showProps={false} alt="" className="-mb-[6px]" />
        </span>
      </div>
    </div>
  );
}

const NAV: [string, string, IconName][] = [
  ["/", "หน้าหลัก", "home"],
  ["/blister/", "แผงยา", "blister"],
  ["/history/", "ประวัติ", "calendar"],
  ["/inventory/", "สต็อกยา", "box"],
  ["/settings/", "ตั้งค่า", "settings"],
];

/** Floating bottom navigation · 5 sections. */
export function BottomNav() {
  const path = usePathname() || "/";
  const norm = path.endsWith("/") ? path : path + "/";
  const active = NAV.slice(1).find(([href]) => norm.startsWith(href))?.[0] ?? "/";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] px-3" style={{ paddingBottom: "max(14px, calc(env(safe-area-inset-bottom) - 12px))" }}>
      <nav aria-label="เมนูหลัก" className="pointer-events-auto flex h-[68px] items-center justify-around rounded-[26px] bg-(--surface-nav) px-[6px] shadow-(--shadow-float) backdrop-blur-md">
        {NAV.map(([href, label, icon]) => {
          const on = active === href;
          return (
            <Link key={href} href={href} aria-current={on ? "page" : undefined} className="flex h-[60px] w-16 flex-col items-center justify-center gap-[2px] rounded-[18px] no-underline">
              <span className={cx("flex h-[30px] w-12 items-center justify-center rounded-full transition-colors duration-200", on ? "bg-(--surface-soft) text-(--action-primary)" : "bg-transparent text-(--text-secondary)")}>
                <Icon name={icon} size={22} />
              </span>
              <span className={cx("text-[11px] leading-[14px] font-extrabold", on ? "text-(--action-primary)" : "text-(--text-secondary)")}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

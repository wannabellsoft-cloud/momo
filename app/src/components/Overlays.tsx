"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuickConfirm } from "@/lib/hooks";
import { useUI } from "@/lib/ui";
import { NotificationCard } from "./NotificationCard";

const BANNER_MS = 5200;
import { Icon, type IconName } from "./momo/Icon";
import { MomoBunny } from "./momo/MomoBunny";
import { cx } from "./ui";

/** In-app notification banner (shown when a reminder fires while Momo is open). */
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[95] mx-auto max-w-[480px] px-[10px]" style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}>
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
        className={cx("cursor-pointer transition-[transform,opacity] duration-[420ms] ease-(--ease-spring)", banner ? "pointer-events-auto translate-y-0 opacity-100" : "-translate-y-[220px] opacity-0")}
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

/** Toast with a mini Momo · aria-live polite · 2.6 s, paused while hovered. */
export function Toast() {
  const toast = useUI((u) => u.toast);
  const hide = useUI((u) => u.hideToast);
  const [shown, setShown] = useState(toast);
  const [paused, setPaused] = useState(false);
  const visible = !!toast;
  // keep the last message rendered while the toast fades out
  if (toast && toast !== shown) setShown(toast);
  useEffect(() => {
    if (!toast || paused) return;
    const t = setTimeout(hide, 2600);
    return () => clearTimeout(t);
  }, [toast, paused, hide]);
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[90] mx-auto max-w-[480px] px-4" style={{ bottom: "calc(max(14px, calc(env(safe-area-inset-bottom) - 12px)) + 82px)" }}>
      <div
        role="status"
        aria-live="polite"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className={cx(
          "flex items-center gap-[10px] rounded-[20px] bg-(--surface-card) px-[14px] py-[10px] shadow-(--shadow-toast) transition-all duration-[280ms] ease-(--ease-out)",
          visible ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[.98] opacity-0",
        )}
      >
        <MomoBunny state={shown?.momo ?? "taken"} still size={36} />
        <span className="text-[14px] leading-[20px] font-extrabold">{shown?.text}</span>
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

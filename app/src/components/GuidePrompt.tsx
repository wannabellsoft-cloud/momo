"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@/lib/hooks";
import { useMomo } from "@/lib/store";
import { GuideVideo } from "./GuideVideo";
import { Icon } from "./momo/Icon";
import { MomoBunny } from "./momo/MomoBunny";
import { cx } from "./ui";

const LATER = "momo:guide-later";

/** Home: until the first box is opened, the first-use guide pops up each time the app opens.
    “ไว้ทีหลัง” hides it until the next launch (this tab session). */
export function GuidePrompt() {
  const hydrated = useHydrated();
  const needsGuide = useMomo((s) => s.onboarded && s.packs.length === 0);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated || !needsGuide) return;
    let later = false;
    try {
      later = sessionStorage.getItem(LATER) === "1";
    } catch {}
    if (later) return;
    const t = setTimeout(() => setOpen(true), 700); // after Home has appeared
    return () => clearTimeout(t);
  }, [hydrated, needsGuide]);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(LATER, "1");
    } catch {}
    panel.current?.querySelector("video")?.pause();
  };

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!needsGuide) return null;
  return (
    <>
      <div onClick={close} aria-hidden="true" className={cx("fixed inset-0 z-[70] bg-(--overlay) transition-opacity duration-[240ms]", open ? "opacity-100" : "pointer-events-none opacity-0")} />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] mx-auto max-w-[480px]">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-prompt-title"
          aria-hidden={!open}
          tabIndex={-1}
          className={cx(
            "flex max-h-[92vh] flex-col gap-3 overflow-y-auto rounded-t-[28px] bg-(--surface-card) px-5 pt-[10px] shadow-(--shadow-modal) outline-none transition-transform duration-[340ms] ease-(--ease-out)",
            open ? "pointer-events-auto translate-y-0" : "translate-y-[105%]",
          )}
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 18px)" }}
        >
          <div className="mx-auto mb-1 h-[5px] w-10 flex-none rounded-[3px] bg-(--sheet-handle)" />
          <div className="flex items-center gap-3">
            <MomoBunny state="refill" still={!open} size={64} />
            <div className="min-w-0 flex-1">
              <h2 id="guide-prompt-title" className="m-0 text-[20px] leading-[28px] font-extrabold">มาเริ่มใช้งานกันนะ ♡</h2>
              <p className="m-0 text-[14px] leading-[21px] text-(--text-secondary)">ดูวิดีโอสั้น ๆ แล้วเพิ่มกล่องยา เปิดกล่องแรก โมโม่จะนับยาให้ทุกวัน</p>
            </div>
          </div>
          {open && (
            <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[22px] shadow-(--shadow-soft)">
              <GuideVideo className="max-h-[52vh]" />
            </div>
          )}
          <Link href="/inventory/" onClick={close} className="press flex h-[52px] flex-none items-center justify-center gap-2 rounded-[18px] bg-(--action-primary) text-[16px] font-extrabold text-(--text-on-action) no-underline shadow-(--shadow-button)">
            เริ่มที่สต็อกยาเลย
            <Icon name="right" size={18} stroke={2.6} />
          </Link>
          <div className="flex gap-2">
            <Link href="/guide/" onClick={close} className="press flex h-12 flex-1 items-center justify-center rounded-[16px] bg-(--surface-soft) text-[15px] font-extrabold text-(--action-soft-text) no-underline">
              ดูทีละขั้นตอน
            </Link>
            <button type="button" onClick={close} className="h-12 flex-1 cursor-pointer rounded-[16px] border-0 bg-transparent text-[15px] font-extrabold text-(--text-secondary)">
              ไว้ทีหลัง
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

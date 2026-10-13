"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/momo/Icon";
import { BoxStack, MiniBlister, SkyHeader, type Slot } from "@/components/inventory/InventoryArt";
import { ReactiveMomo } from "@/components/ReactiveMomo";
import { Card, ScreenTitle, cx } from "@/components/ui";
import { thStamp } from "@/lib/date";
import { derive } from "@/lib/derive";
import { useNow } from "@/lib/hooks";
import { LOCS, TABLETS_PER_PACK, left, nextIdx, useMomo } from "@/lib/store";
import { momoSays, momoSaysOneOf } from "@/lib/momo-voice";
import { useUI } from "@/lib/ui";
import { SAY, STOCK_STATUS, STOCK_TAP_LINES } from "@/lib/voice-lines";

// What Momo says when tapped on Stock.
const STOCK_LINES = STOCK_TAP_LINES;

/** Screen 07 — opened packs, reserve boxes, storage mode, refill alert, stock log. */
export default function InventoryPage() {
  const s = useMomo();
  const now = useNow();
  const d = derive(s, now);
  const router = useRouter();
  const showToast = useUI((u) => u.showToast);
  const active = s.packs.filter((p) => left(p) > 0);
  const firstRun = s.packs.length === 0;

  const invMomo = firstRun ? "refill" : d.low ? (s.reserve > 0 ? "refill" : "nostock") : d.supplyLow ? "refill" : "idle";
  const invBubble = firstRun
    ? s.reserve > 0 ? STOCK_STATUS.firstBox : STOCK_STATUS.empty
    : d.low ? (s.reserve > 0 ? STOCK_STATUS.openBox : STOCK_STATUS.buyNow)
    : d.supplyLow ? STOCK_STATUS.buySoon
    : STOCK_STATUS.enough;
  // Momo tells how the stock is doing each time the screen opens
  const said = useRef(false);
  useEffect(() => {
    if (said.current) return;
    said.current = true;
    momoSays(invBubble, { delay: 0.4 });
  }, [invBubble]);
  const canOpen = s.reserve > 0;
  const capacity = Math.max(1, active.length) * TABLETS_PER_PACK;
  // the pack Momo is counting from (active one, else the first with tablets left), drawn in the mini blister
  const cur = s.packs.find((p) => p.id === s.activePackId && left(p) > 0) ?? active[0];
  const next = cur ? nextIdx(cur) : -1;
  const slots: Slot[] = cur
    ? cur.tablets.map((t, i) => (t.removed ? (t.doseId ? "taken" : "removed") : i === next ? "next" : "in"))
    : Array.from({ length: TABLETS_PER_PACK }, () => "in");

  return (
    <div className="flex flex-col gap-4">
      <ScreenTitle eyebrow="INVENTORY" title="สต็อกยา" />

      {/* Header: sky scene (day/night) + Momo + her line */}
      <div className="relative h-[150px] overflow-hidden rounded-[28px]">
        <SkyHeader />
        <ReactiveMomo
          state={invMomo}
          bubble={invBubble}
          size={124}
          lines={STOCK_LINES}
          talks
          bubbleCustom
          className="absolute inset-0 items-end pr-[18px] pl-[6px] [&>button]:-mb-[14px]"
          bubbleClassName="mt-[20px] flex-1 self-start rounded-[18px_18px_18px_4px] bg-(--inv-bubble) px-[15px] py-[10px] text-[15px] leading-[22px] font-extrabold text-(--inv-bubble-fg) shadow-(--inv-bubble-shadow)"
        />
      </div>

      {/* Opened packs: live mini blister, count, progress, packs, storage mode */}
      <div className="relative overflow-hidden rounded-[28px] bg-(--inv-pack-bg)">
        <div className="relative h-[138px]">
          <MiniBlister slots={slots} />
          <div className="relative flex flex-col px-[22px] py-[18px]">
            <span className="text-[15px] font-extrabold text-(--inv-pack-title)">ยาในแผงที่เปิดแล้ว</span>
            <span className="tnum flex items-baseline gap-[10px] text-(--inv-pack-num)">
              <span className="text-[56px] leading-[1.1] font-extrabold">{d.opened}</span>
              <span className="text-[22px] font-extrabold">เม็ด</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-[14px] px-[22px] pt-4 pb-[22px]">
          <div className="flex justify-between gap-3 text-[14px] text-(--inv-pack-meta)">
            <span>เหลือ {d.opened} จาก {capacity} เม็ด</span>
            <span>รวมสำรอง ≈ {d.supplyDays} วัน</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-(--inv-pack-track)" role="progressbar" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={d.opened} aria-label="ยาในแผงที่เปิดแล้ว">
            <div className="h-full rounded-full transition-[width] duration-[350ms] ease-(--ease-out)" style={{ width: `${Math.min(100, (d.opened / capacity) * 100)}%`, background: d.low ? "var(--bar-low)" : "var(--inv-pack-fill)" }} />
          </div>
          {active.length > 0 && (
            <div className="flex flex-col gap-2">
              {active.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-[16px] bg-(--inv-pack-row) px-4 py-[13px] text-(--inv-pack-row-fg)">
                  <span className="font-extrabold">แผง {p.label}</span>
                  <span className="flex-1 text-(--inv-pack-row-sub)">{LOCS[p.location]}</span>
                  <span className="tnum font-extrabold">{left(p)}/{TABLETS_PER_PACK}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[15px] font-extrabold text-(--inv-pack-title)">การเก็บยา</span>
            <div role="radiogroup" aria-label="การเก็บยา" className="flex gap-1 rounded-full bg-(--inv-seg) p-1">
              {([["separate", "แยกที่เก็บ"], ["combined", "รวมที่เดียว"]] as const).map(([m, label]) => {
                const on = s.settings.storageMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      if (on) return;
                      s.setStorageMode(m);
                      if (m === "combined") showToast("รวมแผงไว้ที่เดียวกันแล้ว", "idle");
                    }}
                    className={cx("cursor-pointer rounded-full border-0 px-4 py-[9px] text-[14px] font-extrabold transition-colors", on ? "bg-(--inv-seg-on) text-(--inv-seg-on-fg)" : "bg-transparent text-(--inv-seg-off-fg)")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reserve boxes: stacked cartons + stepper */}
      <div className="relative overflow-hidden rounded-[28px] bg-(--inv-box-bg)">
        <div className="relative h-[124px]">
          <BoxStack n={s.reserve} />
        </div>
        <div className="flex items-center justify-between gap-3 px-[22px] pt-[14px] pb-[22px]">
          <div className="flex flex-col gap-[2px]">
            <span className="text-[15px] font-extrabold text-(--inv-box-title)">กล่องสำรอง (ยังไม่เปิด)</span>
            <span className="tnum flex items-baseline gap-[10px] text-(--inv-box-num)">
              <span className="text-[56px] leading-[1.1] font-extrabold">{s.reserve}</span>
              <span className="text-[22px] font-extrabold">กล่อง</span>
            </span>
            <span className="text-[13px] text-(--inv-box-meta)">1 กล่อง = 2 แผง × 15 เม็ด</span>
          </div>
          <div className="flex items-center gap-[10px] rounded-full bg-(--inv-step) p-[6px]">
            <button type="button" onClick={() => s.changeReserve(-1)} disabled={s.reserve === 0} aria-label="ลดกล่องสำรอง" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-(--inv-minus) text-(--inv-minus-fg) disabled:cursor-not-allowed disabled:opacity-40">
              <Icon name="minus" size={18} stroke={2.6} />
            </button>
            <span className="tnum min-w-5 text-center text-[18px] font-extrabold text-(--inv-box-num)" aria-live="polite">{s.reserve}</span>
            <button type="button" onClick={() => { s.changeReserve(1); momoSaysOneOf("reserve", SAY.reserveAdded); }} aria-label="เพิ่มกล่องสำรอง" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-(--inv-plus) text-(--inv-plus-fg)">
              <Icon name="plus" size={18} stroke={2.6} />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => (canOpen ? router.push("/inventory/open-box/") : showToast(SAY.noReserve, "nostock"))}
        aria-disabled={!canOpen}
        className={cx(
          "press relative flex h-16 items-center justify-center overflow-hidden rounded-[22px] border-0",
          canOpen ? "open-box-cta cursor-pointer bg-(--action-secondary) text-(--text-on-action) shadow-(--shadow-button-secondary)" : "cursor-not-allowed bg-(--action-disabled-bg) text-(--action-disabled-text)",
        )}
      >
        {canOpen && (
          <>
            <span aria-hidden="true" className="taken-shine pointer-events-none absolute inset-y-0 left-0 w-1/3" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)" }} />
            <span aria-hidden="true" className="twinkle absolute top-[10px] left-[22%] text-[10px]">✦</span>
            <span aria-hidden="true" className="twinkle absolute right-[20%] bottom-[10px] text-[9px] [animation-delay:1.1s]">✦</span>
          </>
        )}
        <span className="relative flex flex-col items-center">
          <span className="text-[17px] leading-[24px] font-extrabold">เปิดกล่องใหม่</span>
          <span className="text-[12px] leading-4 opacity-90">เพิ่ม 2 แผง × 15 เม็ด</span>
        </span>
      </button>

      {d.low && !firstRun && (
        <div role="status" className="flex gap-[10px] rounded-[20px] bg-(--refill-bg) px-[14px] py-3 text-(--refill-fg)">
          <Icon name="alert" size={20} />
          <div>
            <div className="text-[14px] leading-[21px] font-extrabold">{d.refillTitle}</div>
            <div className="text-[13px] leading-[20px] text-(--text-primary)">{d.refillBody}</div>
          </div>
        </div>
      )}
      {!d.low && d.supplyLow && !firstRun && (
        <div role="status" className="flex gap-[10px] rounded-[20px] bg-(--warning-bg) px-[14px] py-3 text-(--warning-fg)">
          <Icon name="alert" size={20} />
          <div className="text-[13px] leading-[20px] text-(--text-primary)">ยาทั้งหมด (รวมกล่องสำรอง) พอสำหรับอีก ~{d.supplyDays} วัน เตรียมรับยาเพิ่มได้เลยนะ</div>
        </div>
      )}

      <Card className="flex flex-col gap-2 p-4">
        <div className="text-[15px] font-extrabold">ประวัติสต็อก</div>
        {s.inventoryLog.slice(0, 8).map((l) => (
          <div key={l.id} className="flex items-center gap-[10px] border-t border-solid border-(--border-subtle) pt-2 text-[13px] leading-[20px]">
            <span className="flex-1">
              <span className="block">{l.text}</span>
              <span className="text-[12px] text-(--text-secondary)">{thStamp(l.at)}</span>
            </span>
            <span className="tnum font-extrabold">{l.delta > 0 ? "+" : "−"}{Math.abs(l.delta)} กล่อง</span>
          </div>
        ))}
        {s.inventoryLog.length === 0 && <div className="text-[13px] leading-[20px] text-(--text-secondary)">ยังไม่มีรายการ เพิ่มกล่องสำรองด้วยปุ่ม + ด้านบนได้เลย</div>}
      </Card>
    </div>
  );
}

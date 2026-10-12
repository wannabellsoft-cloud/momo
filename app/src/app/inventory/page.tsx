"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/momo/Icon";
import { ReactiveMomo } from "@/components/ReactiveMomo";
import { Card, ScreenTitle, Segmented, cx } from "@/components/ui";
import { thStamp } from "@/lib/date";
import { derive } from "@/lib/derive";
import { useNow } from "@/lib/hooks";
import { LOCS, TABLETS_PER_BOX, TABLETS_PER_PACK, left, useMomo } from "@/lib/store";
import { useUI } from "@/lib/ui";

// What Momo says when tapped on Stock.
const STOCK_LINES = ["โมโม่นับยาให้ทุกเม็ดเลยน้า ✎", "ยาอยู่ครบ โมโม่ดูแลให้ ♡", "เปิดกล่องใหม่เมื่อไหร่ บอกโมโม่ด้วยนะ", "นับยาทีไร โมโม่ตั้งใจสุด ๆ เลย ✦", "ปุ๊กปิ๊ก ♡"];

/** Screen 07 — opened packs, reserve boxes, storage mode, refill alert, stock log. */
export default function InventoryPage() {
  const s = useMomo();
  const now = useNow();
  const d = derive(s, now);
  const router = useRouter();
  const showToast = useUI((u) => u.showToast);
  const active = s.packs.filter((p) => left(p) > 0);
  const firstRun = s.packs.length === 0;

  const invMomo = firstRun ? "refill" : d.low ? (s.reserve > 0 ? "refill" : "nostock") : "idle";
  const invBubble = firstRun
    ? s.reserve > 0 ? "มีกล่องแล้ว เปิดกล่องแรกได้เลยนะ ♡" : "ใส่จำนวนกล่องยาที่มี แล้วโมโม่จะนับให้นะ ♡"
    : d.low ? (s.reserve > 0 ? "เหลือไม่ถึง 7 เม็ดแล้วน้า เตรียมเปิดกล่องใหม่ได้เลย ♡" : "ยาใกล้หมดแล้วน้า โมโม่ช่วยเตือนให้ไปรับยาเพิ่มนะ")
    : "ยายังพอนะ โมโม่นับไว้ให้แล้ว ♡";
  const canOpen = s.reserve > 0;

  return (
    <div className="flex flex-col gap-4">
      <ScreenTitle eyebrow="INVENTORY" title="สต็อกยา" />

      <div className="rounded-[28px] bg-(--surface-soft) pt-2 pr-4 pb-1 pl-1">
        <ReactiveMomo state={invMomo} bubble={invBubble} size={112} lines={STOCK_LINES} className="items-center" bubbleClassName="self-center rounded-[18px_18px_18px_6px] px-3 py-[10px] text-[14px] leading-[21px]" />
      </div>

      {/* InventorySummaryCard */}
      <div className="flex flex-col gap-[10px] rounded-[24px] bg-(--success-bg) p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-extrabold text-(--success-fg)">ยาในแผงที่เปิดแล้ว</span>
          <span className="text-[12px] text-(--success-fg)">รวมสำรอง ≈ {d.supplyDays} วัน</span>
        </div>
        <div className="tnum text-[40px] leading-[44px] font-extrabold">{d.opened} <span className="text-[18px]">เม็ด</span></div>
        <div className="h-[10px] overflow-hidden rounded-full bg-(--surface-card)" role="progressbar" aria-valuemin={0} aria-valuemax={TABLETS_PER_BOX} aria-valuenow={d.opened} aria-label="ยาในแผงที่เปิดแล้ว">
          <div className="h-full rounded-full transition-[width] duration-[350ms] ease-(--ease-out)" style={{ width: `${Math.min(100, (d.opened / TABLETS_PER_BOX) * 100)}%`, background: d.low ? "var(--bar-low)" : "var(--bar-ok)" }} />
        </div>
        {active.map((p) => (
          <div key={p.id} className="flex items-center gap-[10px] rounded-[14px] bg-(--surface-glass) px-3 py-2 text-[14px]">
            <span className="font-extrabold">แผง {p.label}</span>
            <span className="flex-1 text-(--text-secondary)">{LOCS[p.location]}</span>
            <span className="tnum font-extrabold">{left(p)}/{TABLETS_PER_PACK}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[13px] font-extrabold text-(--success-fg)">การเก็บยา</span>
          <Segmented
            compact
            track="card"
            label="การเก็บยา"
            value={s.settings.storageMode}
            options={[["separate", "แยกที่เก็บ"], ["combined", "รวมที่เดียว"]]}
            onChange={(m) => {
              s.setStorageMode(m);
              if (m === "combined") showToast("รวมแผงไว้ที่เดียวกันแล้ว", "idle");
            }}
          />
        </div>
      </div>

      {/* Reserve boxes + NumberStepper */}
      <div className="flex items-center gap-3 rounded-[24px] bg-(--surface-secondary) p-4">
        <div className="flex-1">
          <div className="text-[13px] font-extrabold text-(--dose-missed-fg)">กล่องสำรอง (ยังไม่เปิด)</div>
          <div className="tnum text-[40px] leading-[44px] font-extrabold">{s.reserve} <span className="text-[18px]">กล่อง</span></div>
          <div className="text-[12px] text-(--dose-missed-fg)">1 กล่อง = 2 แผง × 15 เม็ด</div>
        </div>
        <div className="flex items-center gap-[6px] rounded-full bg-(--surface-card) p-1">
          <button type="button" onClick={() => s.changeReserve(-1)} disabled={s.reserve === 0} aria-label="ลดกล่องสำรอง" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-(--stepper-bg) text-(--dose-missed-fg) disabled:cursor-not-allowed disabled:opacity-40">
            <Icon name="minus" size={18} stroke={2.6} />
          </button>
          <span className="min-w-[22px] text-center text-[18px] font-extrabold" aria-live="polite">{s.reserve}</span>
          <button type="button" onClick={() => s.changeReserve(1)} aria-label="เพิ่มกล่องสำรอง" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-(--stepper-bg) text-(--dose-missed-fg)">
            <Icon name="plus" size={18} stroke={2.6} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => (canOpen ? router.push("/inventory/open-box/") : showToast("ยังไม่มีกล่องสำรอง เพิ่มกล่องก่อนนะ", "nostock"))}
        aria-disabled={!canOpen}
        className={cx(
          "press flex h-16 items-center justify-center gap-3 rounded-[22px] border-0",
          canOpen ? "cursor-pointer bg-(--action-secondary) text-(--text-on-action) shadow-(--shadow-button-secondary)" : "cursor-not-allowed bg-(--action-disabled-bg) text-(--action-disabled-text)",
        )}
      >
        <Icon name="box" size={22} />
        <span className="flex flex-col items-start">
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

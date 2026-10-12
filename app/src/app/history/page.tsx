"use client";

import { useRef, useState } from "react";
import { EMPTY, EmptyState } from "@/components/EmptyState";
import { Icon, type IconName } from "@/components/momo/Icon";
import { MomoBunny, type MomoState } from "@/components/momo/MomoBunny";
import { Card, OutlineButton, PrimaryButton, ScreenTitle, cx } from "@/components/ui";
import { TH_MONTHS, TH_WEEKDAYS_SHORT, dayKey, parseDayKey } from "@/lib/date";
import { dayStatus, type DayStatus } from "@/lib/derive";
import { useNow, useQuickConfirm } from "@/lib/hooks";
import { useMomo } from "@/lib/store";
import { useUI } from "@/lib/ui";

const CELL: Record<DayStatus, { bg: string; fg: string; border: string; icon: IconName | null; aria: string }> = {
  taken: { bg: "var(--dose-taken-bg)", fg: "var(--text-primary)", border: "1.5px solid transparent", icon: "check", aria: "กินแล้ว" },
  pending: { bg: "var(--dose-pending-bg)", fg: "var(--text-primary)", border: "1.5px solid transparent", icon: "clock", aria: "รอบันทึก" },
  upcoming: { bg: "var(--dose-pending-bg)", fg: "var(--text-primary)", border: "1.5px solid transparent", icon: "clock", aria: "ยังไม่ถึงเวลา" },
  missed: { bg: "var(--surface-card)", fg: "var(--text-primary)", border: "1.5px dashed var(--lavender-300)", icon: null, aria: "ไม่มีบันทึก" },
  future: { bg: "var(--surface-card)", fg: "var(--text-disabled)", border: "1.5px solid transparent", icon: null, aria: "" },
  untracked: { bg: "var(--surface-card)", fg: "var(--text-disabled)", border: "1.5px solid transparent", icon: null, aria: "ก่อนเริ่มใช้โมโม่" },
};

/** Screen 06 — monthly calendar with taken / pending / missed, and day details. */
export default function HistoryPage() {
  const s = useMomo();
  const now = useNow();
  const quickConfirm = useQuickConfirm();
  const showToast = useUI((u) => u.showToast);
  const today = dayKey(now);
  const [sel, setSel] = useState(today);
  const [month, setMonth] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }));

  const first = new Date(month.y, month.m, 1);
  const daysIn = new Date(month.y, month.m + 1, 0).getDate();
  // Browse 24 months back and 12 ahead (future days show when Momo will remind).
  const offset = month.y * 12 + month.m - (now.getFullYear() * 12 + now.getMonth());
  const canPrev = offset > -24;
  const canNext = offset < 12;
  const shift = (k: number) => {
    if ((k < 0 && !canPrev) || (k > 0 && !canNext)) return;
    const d = new Date(month.y, month.m + k, 1);
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };
  const goToday = () => {
    setMonth({ y: now.getFullYear(), m: now.getMonth() });
    setSel(today);
  };
  // swipe left/right on the calendar
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const selDate = parseDayKey(sel);
  const selSt = dayStatus(s, sel, now);
  const dose = s.doses[sel];
  const remind = s.settings.remind;
  const packLabel = (id: string) => s.packs.find((p) => p.id === id)?.label ?? "—";
  const detail: Record<DayStatus, { icon: IconName; status: string; detail: string; cls: string; momo: MomoState }> = {
    taken: {
      icon: "check",
      status: dose?.source === "backfill" ? "กินแล้ว (บันทึกย้อนหลัง)" : "กินแล้ว",
      detail: !dose ? "" : dose.source === "backfill" ? "ไม่ระบุเวลา · ไม่ผูกกับเม็ดยา" : `บันทึกเวลา ${dose.time} น. · ${dose.tablets.map((r) => `แผง ${packLabel(r.packId)} เม็ดที่ ${r.index + 1}`).join(", ")}`,
      cls: "bg-(--dose-taken-bg) text-(--dose-taken-fg)",
      momo: "taken",
    },
    missed: { icon: "info", status: "ไม่มีบันทึก", detail: "วันนี้ไม่ได้กดบันทึกไว้", cls: "bg-(--dose-missed-bg) text-(--dose-missed-fg)", momo: "missed" },
    pending: { icon: "clock", status: "รอบันทึก", detail: `เวลาเตือน ${remind} น.`, cls: "bg-(--dose-pending-bg) text-(--dose-pending-fg)", momo: "reminder" },
    upcoming: { icon: "clock", status: "ยังไม่ถึงเวลา", detail: `โมโม่จะเตือนตอน ${remind} น.`, cls: "bg-(--dose-pending-bg) text-(--dose-pending-fg)", momo: "idle" },
    future: { icon: "calendar", status: "ยังไม่ถึงวัน", detail: `โมโม่จะเตือนตอน ${remind} น.`, cls: "bg-(--surface-muted) text-(--text-secondary)", momo: "sleep" },
    untracked: { icon: "calendar", status: "ก่อนเริ่มใช้โมโม่", detail: "ยังไม่มีข้อมูลช่วงนี้", cls: "bg-(--surface-muted) text-(--text-secondary)", momo: "sleep" },
  };
  const sd = detail[selSt];
  const noHistory = Object.keys(s.doses).length === 0;

  return (
    <div className="flex flex-col gap-4">
      <ScreenTitle eyebrow="HISTORY" title="ประวัติการกินยา" />
      <Card hero className="p-4">
        <div className="mb-[10px] flex items-center justify-between">
          <button type="button" aria-label="เดือนก่อน" disabled={!canPrev} onClick={() => shift(-1)} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-(--bg-subtle) text-(--text-primary) disabled:cursor-default disabled:opacity-50">
            <Icon name="left" size={18} />
          </button>
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-full bg-(--bg-subtle) px-[18px] py-2 text-[17px] font-extrabold" aria-live="polite">{TH_MONTHS[month.m]} {month.y}</div>
            {offset !== 0 && (
              <button type="button" onClick={goToday} className="h-7 cursor-pointer rounded-full border-0 bg-transparent px-3 text-[12px] font-extrabold text-(--action-soft-text)">
                กลับมาวันนี้
              </button>
            )}
          </div>
          <button type="button" aria-label="เดือนถัดไป" disabled={!canNext} onClick={() => shift(1)} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-(--bg-subtle) text-(--text-primary) disabled:cursor-default disabled:opacity-50">
            <Icon name="right" size={18} />
          </button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[12px] text-(--text-secondary)" aria-hidden="true">
          {TH_WEEKDAYS_SHORT.map((w) => <span key={w}>{w}</span>)}
        </div>
        <div
          className="grid touch-pan-y grid-cols-7 gap-1"
          onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            const st = swipe.current;
            swipe.current = null;
            if (!st) return;
            const dx = e.clientX - st.x;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - st.y)) shift(dx < 0 ? 1 : -1);
          }}
        >
          {Array.from({ length: first.getDay() }, (_, i) => <span key={"b" + i} className="h-12" />)}
          {Array.from({ length: daysIn }, (_, i) => {
            const key = dayKey(new Date(month.y, month.m, i + 1));
            const st = dayStatus(s, key, now);
            const c = CELL[st];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSel(key)}
                aria-label={`${i + 1} ${TH_MONTHS[month.m]} ${c.aria}`.trim()}
                aria-pressed={key === sel}
                className="flex h-12 cursor-pointer flex-col items-center justify-center gap-px rounded-[14px] p-0 text-[14px] font-extrabold"
                style={{ background: c.bg, color: c.fg, border: c.border, boxShadow: key === sel ? "0 0 0 2.5px var(--action-primary)" : "none" }}
              >
                <span>{i + 1}</span>
                <span className="flex h-3 items-center" style={{ color: st === "taken" ? "var(--dose-taken-fg)" : "var(--dose-pending-fg)" }}>
                  {c.icon && <Icon name={c.icon} size={10} stroke={3.4} />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-(--text-secondary)">
          <span className="flex items-center gap-[5px]"><span className="h-[10px] w-[10px] rounded-full bg-(--dose-taken-fg)" />กินแล้ว</span>
          <span className="flex items-center gap-[5px]"><span className="h-[10px] w-[10px] rounded-full bg-(--dose-pending-fg)" />รอบันทึก</span>
          <span className="flex items-center gap-[5px]"><span className="h-[10px] w-[10px] rounded-full border-2 border-dashed border-(--lavender-600)" />ไม่มีบันทึก</span>
        </div>
      </Card>

      {noHistory && selSt !== "pending" ? (
        <EmptyState {...EMPTY.history} cta="บันทึกครั้งแรก" onClick={quickConfirm} />
      ) : (
        <Card className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h2 className="m-0 text-[20px] leading-[28px] font-extrabold">{sel === today ? "วันนี้" : `${selDate.getDate()} ${TH_MONTHS[selDate.getMonth()]}`}</h2>
              <div className="text-[13px] leading-[20px] text-(--text-secondary)">{selDate.getDate()} {TH_MONTHS[selDate.getMonth()]} {selDate.getFullYear()}</div>
            </div>
            <MomoBunny state={sd.momo} still size={72} />
          </div>
          <div className={cx("flex items-center gap-3 rounded-[18px] px-[14px] py-3", sd.cls)}>
            <Icon name={sd.icon} size={20} stroke={2.6} />
            <div>
              <div className="text-[15px] leading-[22px] font-extrabold">{sd.status}</div>
              <div className="text-[13px] leading-[20px]">{sd.detail}</div>
            </div>
          </div>
          {selSt === "missed" && (
            <>
              <div className="rounded-[16px] bg-(--bg-subtle) p-3 text-[13px] leading-[21px]">ถ้าลืมกินยา ไม่ต้องกินเพิ่มเป็นสองเท่านะ ทำตามคำแนะนำของแพทย์หรือเภสัชกร ถ้าไม่แน่ใจ ปรึกษาได้เสมอ</div>
              <OutlineButton
                className="h-12 rounded-[16px] text-[15px]"
                onClick={() => {
                  if (s.backfill(sel).ok) showToast("บันทึกย้อนหลังแล้ว ขอบคุณที่บอกโมโม่นะ", "taken");
                }}
              >
                กินแล้ว แต่ลืมบันทึก
              </OutlineButton>
            </>
          )}
          {(selSt === "pending" || selSt === "upcoming") && (
            <PrimaryButton size="md" onClick={quickConfirm}>บันทึกว่ากินยาแล้ว ♡</PrimaryButton>
          )}
        </Card>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { dayKey, hm, parseDayKey, thShortDate } from "@/lib/date";
import { pickLine } from "@/lib/derive";
import { LOCS, MED, nextIdx, snakeIndex, useMomo, type TabletRef } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Icon } from "./momo/Icon";
import { MomoBunny } from "./momo/MomoBunny";
import { OutlineButton, PrimaryButton, SoftButton, cx } from "./ui";

/** Screen 05 — dose confirmation / tablet detail bottom sheet. */
export function DoseSheet() {
  const sheet = useUI((u) => u.sheet);
  const close = useUI((u) => u.closeSheet);
  // keep the last tablet rendered while the sheet slides away
  const [shown, setShown] = useState<{ ref: TabletRef; k: number } | null>(null);
  if (sheet && sheet !== shown?.ref) setShown({ ref: sheet, k: (shown?.k ?? 0) + 1 });
  const open = !!sheet;
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = panel.current;
    el?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && el) {
        const f = el.querySelectorAll<HTMLElement>('button:not([disabled]), input, [tabindex="0"]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, close]);

  return (
    <>
      <div onClick={close} aria-hidden="true" className={cx("fixed inset-0 z-[70] bg-(--overlay) transition-opacity duration-[240ms]", open ? "opacity-100" : "pointer-events-none opacity-0")} />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] mx-auto max-w-[480px]">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="ยืนยันการกินยา"
          aria-hidden={!open}
          tabIndex={-1}
          className={cx(
            "rounded-t-[28px] bg-(--surface-card) px-5 pt-[10px] shadow-(--shadow-modal) outline-none transition-transform duration-[340ms] ease-(--ease-out)",
            open ? "pointer-events-auto translate-y-0" : "translate-y-[105%]",
          )}
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
        >
          <div className="mx-auto mb-[14px] h-[5px] w-10 rounded-[3px] bg-(--sheet-handle)" />
          {shown && <SheetBody key={shown.k} sheetRef={shown.ref} open={open} />}
        </div>
      </div>
    </>
  );
}

function SheetBody({ sheetRef, open }: { sheetRef: TabletRef; open: boolean }) {
  const s = useMomo();
  const ui = useUI();
  const today = dayKey(new Date());
  const todayDose = s.doses[today];
  const p = s.packs.find((x) => x.id === sheetRef.packId);
  const [choice, setChoice] = useState<"dose" | "remove">(todayDose ? "remove" : "dose");
  const [time, setTime] = useState(() => hm(new Date()));
  if (!p) return null;
  const t = p.tablets[sheetRef.index];
  const n = sheetRef.index + 1;
  const pn = nextIdx(p);
  const { call, qty, voice } = s.settings;

  const mini = Array.from({ length: 15 }, (_, k) => {
    const i = snakeIndex(Math.floor(k / 5), k % 5);
    const tt = p.tablets[i];
    const sel = i === sheetRef.index;
    return (
      <span
        key={k}
        className="h-3 w-3 rounded-full"
        style={{ background: sel ? "var(--action-primary)" : tt.removed ? "transparent" : "var(--tablet-pill)", border: tt.removed && !sel ? "1px dashed var(--text-disabled)" : "none" }}
      />
    );
  });

  const header = (momo: "reminder" | "taken" | "waiting") => (
    <div className="flex items-center gap-[14px]">
      <div className="grid flex-none grid-cols-[repeat(5,12px)] gap-1 rounded-[14px] bg-(--tablet-foil) p-2" aria-hidden="true">{mini}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] leading-[20px] text-(--text-secondary)">แผง {p.label} · {LOCS[p.location]}</div>
        <div className="text-[22px] leading-[30px] font-extrabold">เม็ดที่ {n}</div>
        <div className="text-[13px] leading-[20px] text-(--text-secondary)">{MED.name} · {MED.generic}</div>
      </div>
      <MomoBunny state={momo} still size={64} />
    </div>
  );

  if (t.removed) {
    const dose = t.doseId ? Object.values(s.doses).find((d) => d.id === t.doseId) : undefined;
    const taken = !!dose;
    const body = taken
      ? dose.date === today ? `บันทึกวันนี้ ${dose.time ?? ""} น.` : `บันทึกเมื่อ ${thShortDate(parseDayKey(dose.date))}${dose.time ? ` · ${dose.time} น.` : ""}`
      : "ไม่นับเป็นการกินยา";
    return (
      <>
        {header(taken ? "taken" : "waiting")}
        <div className={cx("mt-4 flex items-center gap-3 rounded-[18px] px-[14px] py-3", taken ? "bg-(--dose-taken-bg) text-(--dose-taken-fg)" : "bg-(--dose-missed-bg) text-(--dose-missed-fg)")}>
          <Icon name={taken ? "check" : "minus"} size={20} stroke={2.6} />
          <div>
            <div className="text-[15px] font-extrabold">{taken ? "กินแล้ว" : "แกะออก ไม่ได้กิน"}</div>
            <div className="text-[13px] leading-[20px]">{body}</div>
          </div>
        </div>
        <div className="mt-3 text-[13px] leading-[20px] text-(--text-secondary)">แก้ไขได้ถ้าบันทึกผิด ทุกการแก้ไขจะถูกเก็บไว้ในบันทึกการเปลี่ยนแปลง</div>
        <div className="mt-[14px] flex flex-col gap-2">
          <OutlineButton
            disabled={!open}
            className="h-[52px] rounded-[18px] text-[15px]"
            onClick={() => {
              s.restoreTablet(sheetRef);
              ui.closeSheet();
              ui.showToast("แก้ไขแล้ว เม็ดนี้กลับเข้าแผงนะ", "idle");
            }}
          >
            <Icon name="undo" size={18} />
            เม็ดนี้ยังอยู่ในแผง
          </OutlineButton>
          {taken && (
            <OutlineButton
              disabled={!open}
              className="h-[52px] rounded-[18px] text-[15px]"
              onClick={() => {
                s.unDose(sheetRef);
                ui.closeSheet();
                ui.showToast("แก้ไขแล้ว", "idle");
              }}
            >
              แกะออกแล้ว แต่ไม่ได้กิน
            </OutlineButton>
          )}
          <SoftButton className="h-12 rounded-[16px] text-[16px]" onClick={ui.closeSheet}>ปิด</SoftButton>
        </div>
      </>
    );
  }

  const warn =
    todayDose && choice === "dose" ? ""
    : todayDose ? `วันนี้บันทึกกินยาแล้วเมื่อ ${todayDose.time ?? "—"} น. ไม่ต้องกินซ้ำนะ บันทึกได้เฉพาะ “แกะออก”`
    : sheetRef.index !== pn ? `ตามลำดับ เม็ดถัดไปคือเม็ดที่ ${pn + 1} เลือกเม็ดนี้ก็ได้นะ`
    : "";

  const opt = (on: boolean, dis?: boolean) =>
    cx(
      "flex w-full items-center gap-3 rounded-[18px] border-2 border-solid px-[14px] py-3 text-left text-(--text-primary)",
      on ? "border-(--tablet-next) bg-(--bg-subtle)" : "border-(--border-subtle) bg-(--surface-card)",
      dis ? "cursor-not-allowed opacity-45" : "cursor-pointer",
    );
  const dot = (on: boolean) => <span className="h-[22px] w-[22px] flex-none rounded-full bg-white transition-all duration-150" style={{ border: on ? "7px solid var(--action-primary)" : "2px solid var(--border-strong)" }} />;

  const confirm = () => {
    if (choice === "dose") {
      const r = s.recordDose(sheetRef, time || hm(new Date()));
      ui.closeSheet();
      if (r.ok) ui.showToast(voice === "sweet" ? pickLine("taken", call) : "บันทึกการกินยาแล้ว", "taken");
      else ui.showToast("วันนี้บันทึกไปแล้วนะ ไม่ต้องกินซ้ำ", "waiting");
    } else {
      s.removeOnly(sheetRef);
      ui.closeSheet();
      ui.showToast("แกะเม็ดออกแล้ว ไม่ได้นับเป็นการกินยานะ", "waiting");
    }
  };

  return (
    <>
      {header("reminder")}
      <div className="mt-4 text-[20px] leading-[30px] font-extrabold text-pretty">{choice === "dose" ? `${call}กินยาเม็ดนี้แล้วใช่ไหม?` : "แกะเม็ดนี้ออกจากแผงใช่ไหม?"}</div>
      <div role="radiogroup" aria-label="สิ่งที่ทำกับเม็ดนี้" className="mt-3 flex flex-col gap-2">
        <button type="button" role="radio" aria-checked={choice === "dose"} aria-disabled={!!todayDose} onClick={() => !todayDose && setChoice("dose")} className={opt(choice === "dose", !!todayDose)}>
          {dot(choice === "dose")}
          <span className="flex-1">
            <span className="block text-[15px] font-extrabold">กินเม็ดนี้แล้ว</span>
            <span className="block text-[12px] text-(--text-secondary)">บันทึกการกินยาของวันนี้ + แกะเม็ดออกจากแผง</span>
          </span>
        </button>
        <button type="button" role="radio" aria-checked={choice === "remove"} onClick={() => setChoice("remove")} className={opt(choice === "remove")}>
          {dot(choice === "remove")}
          <span className="flex-1">
            <span className="block text-[15px] font-extrabold">แค่แกะเม็ดออก</span>
            <span className="block text-[12px] text-(--text-secondary)">เช่น ทำหล่น หรือย้ายไปตลับยา · ไม่นับว่ากิน</span>
          </span>
        </button>
      </div>
      <div className="mt-3 flex gap-[10px]">
        <div className="flex-1 rounded-[16px] bg-(--bg-app) px-3 py-[10px]">
          <div className="text-[12px] text-(--text-secondary)">วันที่</div>
          <div className="text-[15px] font-extrabold">วันนี้ · {thShortDate(new Date())}</div>
        </div>
        <label className="block flex-1 rounded-[16px] bg-(--bg-app) px-3 py-[10px]">
          <span className="block text-[12px] text-(--text-secondary)">เวลา</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={choice !== "dose"} className="w-full border-0 bg-transparent p-0 text-[15px] font-extrabold text-(--text-primary) disabled:opacity-60" />
        </label>
      </div>
      {choice === "dose" && qty > 1 && (
        <div className="mt-[10px] flex gap-2 rounded-[14px] bg-(--info-bg) px-3 py-[10px] text-[13px] leading-[20px] text-(--info-fg)">
          <Icon name="info" size={16} />
          <span>ครั้งละ {qty} เม็ด · โมโม่จะแกะเม็ดถัดไปตามลำดับให้ด้วย</span>
        </div>
      )}
      {warn && (
        <div className="mt-[10px] flex gap-2 rounded-[14px] bg-(--warning-bg) px-3 py-[10px] text-[13px] leading-[20px] text-(--warning-fg)">
          <Icon name="info" size={16} />
          <span>{warn}</span>
        </div>
      )}
      <div className="mt-4 flex flex-col gap-2">
        <PrimaryButton disabled={!open} onClick={confirm}>{choice === "dose" ? "ยืนยัน กินแล้ว ♡" : "ยืนยัน แกะออก"}</PrimaryButton>
        <SoftButton className="h-12 rounded-[16px] text-[16px]" onClick={ui.closeSheet}>ยกเลิก</SoftButton>
      </div>
    </>
  );
}

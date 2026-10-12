"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/momo/Icon";
import { HomeMomo } from "@/components/HomeMomo";
import { TakenCard } from "@/components/TakenCard";
import { MomoBunny } from "@/components/momo/MomoBunny";
import { Card, DemoLabel, PrimaryButton, cx } from "@/components/ui";
import { thLongDay } from "@/lib/date";
import { derive } from "@/lib/derive";
import { useNow, useOnline, useQuickConfirm } from "@/lib/hooks";
import { MED, left, useMomo } from "@/lib/store";

/** Screen 03 — Home dashboard. */
export default function HomePage() {
  const s = useMomo();
  const now = useNow();
  const online = useOnline();
  const d = derive(s, now);
  const quickConfirm = useQuickConfirm();
  const { remind, qty } = s.settings;

  const chip: { icon: IconName; label: string; cls: string } = d.todayDose
    ? { icon: "check", label: `กินแล้ว ${d.todayDose.time ?? ""} น.`, cls: "bg-(--dose-taken-bg) text-(--dose-taken-fg)" }
    : d.pending
      ? { icon: "clock", label: `รอบันทึก · ${remind} น.`, cls: "bg-(--dose-pending-bg) text-(--dose-pending-fg)" }
      : { icon: "bell", label: `ยังไม่ถึงเวลา · ${remind} น.`, cls: "bg-(--surface-card) text-(--action-soft-text)" };

  const openedPacks = s.packs.filter((p) => left(p) > 0).map((p) => p.label).join("+") || "—";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 pt-2">
        <div>
          <h1 className="m-0 text-[28px] leading-[38px] font-extrabold">สวัสดี{d.call} ☀️</h1>
          <div className="text-[15px] leading-[24px] text-(--text-secondary)">{thLongDay(now)} · วันนี้ดูแลตัวเองหรือยัง?</div>
        </div>
        <Link href="/settings/profile/" aria-label="โปรไฟล์โมโม่" className="h-12 w-12 flex-none overflow-hidden rounded-full bg-(--surface-soft)">
          <MomoBunny crop="head" still size={48} />
        </Link>
      </div>

      {!online && (
        <div className="flex h-8 items-center gap-[6px] self-start rounded-full bg-(--info-bg) px-3 text-[12px] font-extrabold text-(--info-fg)">
          <Icon name="wifioff" size={14} stroke={2.6} />
          ออฟไลน์อยู่ · บันทึกได้ตามปกติ
        </div>
      )}

      {/* MomoHeroCard */}
      <div className="relative min-h-[250px] overflow-hidden rounded-[28px] bg-(--surface-soft) px-5 pt-5">
        <div className="absolute -top-[30px] -right-[30px] h-[140px] w-[140px] rounded-full bg-(--surface-hero-deco)" />
        <div className="relative flex flex-wrap items-center gap-2">
          <span className={cx("inline-flex h-[30px] items-center gap-[6px] rounded-full px-3 text-[13px] font-extrabold", chip.cls)}>
            <Icon name={chip.icon} size={14} stroke={2.6} />
            {chip.label}
          </span>
        </div>
        <HomeMomo state={d.homeMomo} bubble={d.bubble} />
      </div>

      {/* MedicationCard */}
      <Card className="relative mx-2 -mt-9 flex items-center gap-[14px] px-[18px] py-4">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-[20px] leading-[28px] font-extrabold">{MED.name}</h2>
          <div className="text-[13px] leading-[20px] text-(--text-secondary)">{MED.generic} · {qty} เม็ด · {remind} น.</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-(--info-bg) text-(--info-fg)">
          <Icon name="pill" size={22} />
        </div>
      </Card>

      {d.todayDose ? (
        <TakenCard time={d.todayDose.time} />
      ) : (
        <PrimaryButton onClick={quickConfirm}>บันทึกว่ากินยาแล้ว ♡</PrimaryButton>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/blister/" className="press flex flex-col gap-[2px] rounded-[24px] bg-(--success-bg) p-4 text-(--text-primary) no-underline">
          <span className="text-[13px] leading-[20px] font-extrabold text-(--success-fg)">ยาในแผง ({openedPacks})</span>
          <span className="tnum text-[32px] leading-[40px] font-extrabold">{d.opened} <span className="text-[17px]">เม็ด</span></span>
          <span className="text-[12px] leading-[18px] text-(--success-fg)">{d.low ? "เหลือน้อยกว่า 7 เม็ด" : `ยาพอสำหรับ ~${d.openedDays} วัน`}</span>
        </Link>
        <Link href="/inventory/" className="press flex flex-col gap-[2px] rounded-[24px] bg-(--surface-secondary) p-4 text-(--text-primary) no-underline">
          <span className="text-[13px] leading-[20px] font-extrabold text-(--dose-missed-fg)">กล่องสำรอง</span>
          <span className="tnum text-[32px] leading-[40px] font-extrabold">{s.reserve} <span className="text-[17px]">กล่อง</span></span>
          <span className="text-[12px] leading-[18px] text-(--dose-missed-fg)">{s.reserve > 0 ? "ยังไม่ได้เปิด" : "หมดแล้ว"}</span>
        </Link>
      </div>

      {s.packs.length === 0 && (
        <Link href="/inventory/" className="press flex items-center gap-3 rounded-[24px] bg-(--surface-secondary) px-4 py-[14px] text-(--text-primary) no-underline">
          <MomoBunny state="refill" still size={56} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] leading-[22px] font-extrabold text-(--dose-missed-fg)">มาเริ่มนับยากันนะ</div>
            <div className="text-[13px] leading-[20px]">ใส่จำนวนกล่องที่มี แล้วเปิดกล่องแรก โมโม่จะสร้างแผงให้</div>
          </div>
          <Icon name="right" size={18} />
        </Link>
      )}
      {d.low && s.packs.length > 0 && <RefillAlert reserve={s.reserve} title={d.refillTitle} body={d.refillBody} />}
      {!d.low && d.supplyLow && (
        <Link href="/inventory/" role="status" className="flex items-center gap-[10px] rounded-[20px] bg-(--warning-bg) px-[14px] py-3 text-[13px] leading-[20px] text-(--warning-fg) no-underline">
          <Icon name="alert" size={18} />
          <span>ยาทั้งหมดพอสำหรับอีก ~{d.supplyDays} วัน เตรียมรับยาเพิ่มได้เลยนะ</span>
        </Link>
      )}

      <Card className="flex items-center gap-3 px-4 py-[14px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-(--bg-subtle) text-(--action-primary)">
          <Icon name="bell" size={20} />
        </div>
        <div className="flex-1">
          <div className="text-[13px] leading-[20px] text-(--text-secondary)">เตือนครั้งถัดไป</div>
          <div className="text-[16px] leading-[24px] font-extrabold">{d.nextReminder}</div>
        </div>
        <Link href="/settings/" className="flex h-11 items-center rounded-full bg-(--bg-subtle) px-[14px] text-[14px] font-extrabold text-(--action-soft-text) no-underline">แก้ไข</Link>
      </Card>
      {s.demo && <DemoLabel />}
    </div>
  );
}

/** RefillAlertCard — has-reserve (refill) · no-reserve (nostock). */
function RefillAlert({ reserve, title, body }: { reserve: number; title: string; body: string }) {
  return (
    <Link href="/inventory/" role="status" className="press flex items-center gap-3 rounded-[24px] bg-(--refill-bg) px-4 py-[14px] text-(--text-primary) no-underline">
      <MomoBunny state={reserve > 0 ? "refill" : "nostock"} still size={56} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-[6px] text-[15px] leading-[22px] font-extrabold text-(--refill-fg)">
          <Icon name="alert" size={16} />
          {title}
        </div>
        <div className="text-[13px] leading-[20px]">{body}</div>
      </div>
      <Icon name="right" size={18} />
    </Link>
  );
}

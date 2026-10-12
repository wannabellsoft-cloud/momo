"use client";

import { Fragment } from "react";
import { Icon } from "@/components/momo/Icon";
import { MomoMascot } from "@/components/momo/MomoMascot";
import { PristiqBox } from "@/components/PristiqBox";
import { BackHeader, Card } from "@/components/ui";
import { BASE } from "@/lib/base";
import { CAUTIONS, MISSED_DOSE } from "@/lib/care-info";
import { addDays, atTime, dayKey } from "@/lib/date";
import { useNow } from "@/lib/hooks";
import { MED, useMomo } from "@/lib/store";

/** "**text**" → highlighted */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 ? (
          <mark key={i} className="rounded-[6px] bg-(--warning-bg) px-1 font-extrabold text-(--warning-fg)">{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Drug info: the Pristiq box, Missed Dose Assistant and important cautions. */
export default function CarePage() {
  const s = useMomo();
  const now = useNow();
  const { remind } = s.settings;
  const today = s.doses[dayKey(now)];
  // the next scheduled dose, to help judge "close to the next dose"
  const todayAt = atTime(now, remind);
  const next = today || now >= todayAt ? atTime(addDays(now, 1), remind) : todayAt;
  const mins = Math.max(0, Math.round((next.getTime() - now.getTime()) / 60000));
  const until = mins >= 60 ? `อีกประมาณ ${Math.floor(mins / 60)} ชม.${mins % 60 ? ` ${mins % 60} นาที` : ""}` : `อีก ${mins} นาที`;
  const nextLabel = `${dayKey(next) === dayKey(now) ? "วันนี้" : "พรุ่งนี้"} ${remind} น.`;

  return (
    <div className="flex flex-col gap-4">
      <BackHeader href="/" eyebrow="DRUG INFO" title="ข้อมูลยา" />

      {/* Drug info card */}
      <Card className="flex items-center gap-3 overflow-hidden py-3 pr-4 pl-3">
        <PristiqBox width={128} title="กล่องยา Pristiq 50 mg" />
        <div className="min-w-0 flex-1">
          <div className="text-[18px] leading-[26px] font-extrabold">{MED.name}</div>
          <div className="text-[13px] leading-[20px] text-(--text-secondary)">{MED.generic}</div>
          <div className="mt-1 inline-flex h-7 items-center rounded-full bg-(--surface-soft) px-[10px] text-[12px] font-extrabold text-(--action-soft-text)">วันละ {s.settings.qty} เม็ด · {remind} น.</div>
        </div>
      </Card>

      {/* Missed Dose Assistant */}
      <section id="missed" className="flex scroll-mt-4 flex-col gap-3">
        <div className="relative overflow-hidden rounded-[28px] bg-(--surface-soft) px-4 pt-4 pb-3">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1 pb-2">
              <div className="text-[12px] font-extrabold tracking-[.08em] text-(--action-primary)">MISSED DOSE</div>
              <h2 className="m-0 text-[20px] leading-[28px] font-extrabold">{MISSED_DOSE.title}</h2>
              <div className="mt-2 inline-flex items-center gap-2 rounded-[14px] bg-(--surface-card) py-2 pr-3 pl-2 text-[13px] leading-[19px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static export; tiny prop image */}
                <img src={`${BASE}/mascot/props/alarm.webp`} alt="" width={26} height={30} className="h-[30px] w-[26px] flex-none object-contain" />
                {today ? (
                  <span><b className="text-(--success-fg)">วันนี้บันทึกแล้ว</b> {today.time ? `ตอน ${today.time} น.` : ""}</span>
                ) : (
                  <span>
                    มื้อถัดไป <b>{nextLabel}</b> · {until}
                  </span>
                )}
              </div>
            </div>
            <MomoMascot state="missed" px={96} showProps={false} alt="" className="-mr-1 flex-none" />
          </div>
        </div>

        {MISSED_DOSE.cases.map((c, i) => (
          <Card key={c.when} className="flex items-start gap-3 px-4 py-[14px]">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-(--surface-soft) text-[16px] font-extrabold text-(--action-primary)">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] leading-[20px] font-extrabold text-(--text-secondary)">{c.when}</div>
              <div className="flex items-center gap-[6px] text-[16px] leading-[24px] font-extrabold">
                <Icon name={c.icon === "clock" ? "check" : "right"} size={16} stroke={2.8} />
                {c.then}
              </div>
            </div>
          </Card>
        ))}

        <div role="note" className="flex items-start gap-3 rounded-[22px] border-[1.5px] border-solid border-(--error-fg)/30 bg-(--error-bg) px-4 py-[14px] text-(--error-fg)">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-(--surface-card) text-[18px] font-extrabold">✕2</span>
          <div>
            <div className="text-[16px] leading-[24px] font-extrabold">{MISSED_DOSE.never.title}</div>
            <div className="text-[13px] leading-[20px]">{MISSED_DOSE.never.body}</div>
          </div>
        </div>
        <div className="px-1 text-[12px] leading-[18px] text-(--text-secondary)">ไม่แน่ใจว่าใกล้มื้อถัดไปแค่ไหน ถามเภสัชกรหรือแพทย์ได้เลยนะ</div>
      </section>

      {/* Cautions */}
      <section id="caution" className="scroll-mt-4">
        <Card className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--warning-bg) text-(--warning-fg)">
              <Icon name="alert" size={18} stroke={2.4} />
            </span>
            <h2 className="m-0 text-[18px] leading-[26px] font-extrabold">ข้อควรระวังสำคัญ</h2>
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {CAUTIONS.map((c) => (
              <li key={c} className="flex gap-2 rounded-[16px] bg-(--bg-app) px-3 py-[10px] text-[14px] leading-[22px]">
                <span className="mt-[8px] h-[6px] w-[6px] flex-none rounded-full bg-(--action-primary)" aria-hidden="true" />
                <span><Rich text={c} /></span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <div className="px-1 text-[12px] leading-[18px] text-(--text-secondary)">
        ข้อมูลทั่วไปเพื่อช่วยจำ ไม่ใช่คำแนะนำเฉพาะบุคคล ทำตามที่แพทย์หรือเภสัชกรสั่งเสมอ
      </div>
    </div>
  );
}

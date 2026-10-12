"use client";

import { useState } from "react";
import { useMomo } from "@/lib/store";
import { MomoBunny, type MomoState } from "./momo/MomoBunny";
import { PrimaryButton, cx } from "./ui";

const OB: { momo: MomoState; tint: string; en: string; title: string; body: string; cta: string }[] = [
  { momo: "welcome", tint: "var(--surface-soft)", en: "Meet Momo", title: "สวัสดีแพรวา โมโม่เองนะ", body: "โมโม่เป็นกระต่ายตัวเล็กที่จะอยู่ข้าง ๆ คอยเตือนและดูแลแพรวาทุกวัน", cta: "ต่อไป" },
  { momo: "reminder", tint: "var(--warning-bg)", en: "Gentle reminders", title: "เตือนเบา ๆ ตามเวลาที่ตั้งไว้", body: "โมโม่จะไม่บันทึกแทน จนกว่าแพรวาจะกดยืนยันเอง ปัดแจ้งเตือนทิ้งก็ไม่นับว่ากินนะ", cta: "ต่อไป" },
  { momo: "waiting", tint: "var(--surface-secondary)", en: "Private by default", title: "เรื่องของเรา เก็บไว้ในเครื่องนี้", body: "ข้อมูลยาอยู่ในเครื่องของแพรวาเท่านั้น และซ่อนชื่อยาบนหน้าจอล็อกได้", cta: "เริ่มใช้งาน ♡" },
];

/** Screens 01 Splash + 02 Onboarding — shown until onboarding is completed. */
export function Welcome() {
  const [step, setStep] = useState<"splash" | number>("splash");
  const finish = useMomo((s) => s.completeOnboarding);

  if (step === "splash") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden bg-(--surface-soft) p-10">
        <div className="absolute top-[120px] left-10 h-[34px] w-[90px] rounded-[20px] bg-(--bg-subtle) opacity-80" />
        <div className="absolute top-[180px] right-[30px] h-[26px] w-[70px] rounded-[20px] bg-(--bg-subtle) opacity-70" />
        <MomoBunny state="welcome" size={220} />
        <div className="mt-2 flex items-start gap-[2px] text-[56px] leading-[60px] font-extrabold tracking-[-1.5px]">
          momo<span className="text-[22px] leading-[30px] text-(--pink-400)">♥</span>
        </div>
        <div className="text-[17px] leading-[26px]">Your little bunny who cares.</div>
        <div className="text-[15px] leading-[24px] text-(--text-secondary)">กระต่ายตัวเล็กที่คอยดูแลแพรวา</div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[480px] px-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 40px)" }}>
          <PrimaryButton className="w-full" onClick={() => setStep(0)}>เริ่มต้นกับโมโม่ ♡</PrimaryButton>
        </div>
      </div>
    );
  }

  const ob = OB[step];
  const last = step === OB.length - 1;
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}>
      <div className="flex justify-end">
        <button type="button" onClick={() => finish(false)} className="h-11 cursor-pointer border-0 bg-transparent px-2 text-[15px] text-(--text-secondary)">ข้าม</button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-[260px] w-[260px] items-center justify-center rounded-full" style={{ background: ob.tint }}>
          <MomoBunny state={ob.momo} size={210} />
        </div>
        <div className="text-[12px] font-extrabold tracking-[1.4px] text-(--action-primary) uppercase">{ob.en}</div>
        <h1 className="m-0 text-[28px] leading-[38px] font-extrabold text-pretty">{ob.title}</h1>
        <p className="m-0 max-w-[300px] text-[16px] leading-[26px] text-pretty text-(--text-secondary)">{ob.body}</p>
      </div>
      <div className="mb-6 flex justify-center gap-2" aria-hidden="true">
        {OB.map((_, i) => (
          <span key={i} className={cx("h-2 rounded-full transition-all duration-[240ms] ease-(--ease-out)", i === step ? "w-6 bg-(--action-primary)" : "w-2 bg-(--border-default)")} />
        ))}
      </div>
      <PrimaryButton onClick={() => (last ? finish(false) : setStep(step + 1))}>{ob.cta}</PrimaryButton>
      {last && (
        <button type="button" onClick={() => finish(true)} className="mt-2 h-11 cursor-pointer border-0 bg-transparent text-[14px] font-extrabold text-(--action-soft-text)">
          ลองใช้ด้วยข้อมูลตัวอย่างก่อน
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { canPromptInstall, isIOS, promptInstall, shouldOfferInstall } from "@/lib/install";
import { checkNotificationPermission, notificationPermission, requestNotificationPermission } from "@/lib/notify";
import { syncPush } from "@/lib/push";
import { playGreeting, playTone } from "@/lib/sound";
import { useMomo, DEFAULT_SETTINGS } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Icon } from "./momo/Icon";
import { MomoBunny, type MomoState } from "./momo/MomoBunny";
import { MomoMascot } from "./momo/MomoMascot";
import { PrimaryButton, cx } from "./ui";

const OB: { momo: MomoState; tint: string; en: string; title: string; body: string }[] = [
  { momo: "welcome", tint: "var(--surface-soft)", en: "Meet Momo", title: "สวัสดีแพรวา โมโม่เองนะ", body: "โมโม่เป็นกระต่ายโมจิตัวเล็กที่จะอยู่ข้าง ๆ คอยเตือนและดูแลแพรวาทุกวัน" },
  { momo: "reminder", tint: "var(--warning-bg)", en: "Gentle reminders", title: "เตือนเบา ๆ ตามเวลาที่ตั้งไว้", body: "โมโม่จะไม่บันทึกแทน จนกว่าแพรวาจะกดยืนยันเอง ปัดแจ้งเตือนทิ้งก็ไม่นับว่ากินนะ" },
  { momo: "waiting", tint: "var(--surface-secondary)", en: "Private by default", title: "เรื่องของเรา เก็บไว้ในเครื่องนี้", body: "ข้อมูลยาอยู่ในเครื่องของแพรวาเท่านั้น และซ่อนชื่อยาบนหน้าจอล็อกได้" },
];

type Step = "splash" | "install" | 0 | 1 | 2 | "notify";

/** First run: 01 Splash → (Add to Home Screen) → 02 Onboarding → turn on reminders. */
export function Welcome() {
  const [step, setStep] = useState<Step>("splash");
  const finish = useMomo((s) => s.completeOnboarding);
  const offerInstall = shouldOfferInstall();

  const start = () => {
    setStep(offerInstall ? "install" : 0);
    // The first tap unlocks audio on iOS — Momo says hello.
    const st = useMomo.getState().settings;
    if (st.greeting) {
      playGreeting();
      try {
        sessionStorage.setItem("momo:greeted", "1");
      } catch {}
    }
  };

  if (step === "splash") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden bg-(--surface-soft) p-10">
        <div className="absolute top-[120px] left-10 h-[34px] w-[90px] rounded-[20px] bg-(--bg-subtle) opacity-80" />
        <div className="absolute top-[180px] right-[30px] h-[26px] w-[70px] rounded-[20px] bg-(--bg-subtle) opacity-70" />
        <span className="momo-enter block">
          <MomoMascot state="idle" px={220} alt="โมโม่ยิ้มทักทาย" priority talks />
        </span>
        <div className="mt-2 flex items-start gap-[2px] text-[56px] leading-[60px] font-extrabold tracking-[-1.5px]">
          momo<span className="text-[22px] leading-[30px] text-(--pink-400)">♥</span>
        </div>
        <div className="text-[17px] leading-[26px]">Your little bunny who cares.</div>
        <div className="text-[15px] leading-[24px] text-(--text-secondary)">เพื่อนตัวเล็กที่คอยดูแลแพรวา</div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[480px] px-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 40px)" }}>
          <PrimaryButton className="w-full" data-sound="none" onClick={start}>เริ่มต้นกับโมโม่ ♡</PrimaryButton>
        </div>
      </div>
    );
  }

  if (step === "install") return <InstallStep onSkip={() => setStep(0)} />;
  if (step === "notify") return <NotifyStep onDone={(demo) => finish(demo)} />;

  const ob = OB[step];
  const last = step === OB.length - 1;
  const next = () => {
    if (!last) return setStep((step + 1) as Step);
    // Ask for reminders unless the choice was already made.
    if (notificationPermission() === "granted" || notificationPermission() === "denied") finish(false);
    else setStep("notify");
  };
  return (
    <Frame onSkip={() => setStep("notify")}>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <div key={step} className="momo-enter flex h-[260px] w-[260px] items-center justify-center rounded-full" style={{ background: ob.tint }}>
          <MomoBunny state={ob.momo} size={210} />
        </div>
        <div className="text-[12px] font-extrabold tracking-[1.4px] text-(--action-primary) uppercase">{ob.en}</div>
        <h1 className="m-0 text-[28px] leading-[38px] font-extrabold text-pretty">{ob.title}</h1>
        <p className="m-0 max-w-[300px] text-[16px] leading-[26px] text-pretty text-(--text-secondary)">{ob.body}</p>
      </div>
      <Dots active={step} />
      <PrimaryButton onClick={next}>ต่อไป</PrimaryButton>
    </Frame>
  );
}

function Frame({ children, onSkip }: { children: React.ReactNode; onSkip?: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}>
      <div className="flex h-11 justify-end">
        {onSkip && (
          <button type="button" onClick={onSkip} className="h-11 cursor-pointer border-0 bg-transparent px-2 text-[15px] text-(--text-secondary)">ข้าม</button>
        )}
      </div>
      {children}
    </div>
  );
}

function Dots({ active }: { active: number }) {
  return (
    <div className="mb-6 flex justify-center gap-2" aria-hidden="true">
      {OB.map((_, i) => (
        <span key={i} className={cx("h-2 rounded-full transition-all duration-[240ms] ease-(--ease-out)", i === active ? "w-6 bg-(--action-primary)" : "w-2 bg-(--border-default)")} />
      ))}
    </div>
  );
}

/** Add to Home Screen — iOS steps, or a one-tap install where the browser supports it. */
function InstallStep({ onSkip }: { onSkip: () => void }) {
  const ios = isIOS();
  const [installing, setInstalling] = useState(false);
  return (
    <Frame>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="momo-enter flex h-[200px] w-[200px] items-center justify-center rounded-full bg-(--surface-soft)">
          <MomoBunny state="welcome" size={170} />
        </div>
        <div className="text-[12px] font-extrabold tracking-[1.4px] text-(--action-primary) uppercase">Add to Home Screen</div>
        <h1 className="m-0 text-[26px] leading-[36px] font-extrabold text-pretty">พาโมโม่ไปอยู่หน้าโฮมกันนะ</h1>
        <p className="m-0 max-w-[310px] text-[15px] leading-[24px] text-pretty text-(--text-secondary)">
          โมโม่จะเปิดได้ทันทีเหมือนแอป และส่งแจ้งเตือนเตือนกินยาได้{ios ? " (iPhone เปิดการแจ้งเตือนได้เฉพาะตอนเปิดจากหน้าโฮม)" : ""}
        </p>
        {ios ? (
          <ol className="m-0 flex w-full max-w-[340px] list-none flex-col gap-2 p-0 text-left">
            <InstallRow n={1} icon="share" text={<>แตะปุ่ม <b>แชร์</b> ที่แถบด้านล่างของ Safari</>} />
            <InstallRow n={2} icon="plussquare" text={<>เลือก <b>“เพิ่มไปยังหน้าจอโฮม”</b> แล้วกด <b>เพิ่ม</b></>} />
            <InstallRow n={3} icon="heart" text={<>เปิด <b>โมโม่</b> จากไอคอนบนหน้าโฮม แล้วเริ่มกันที่นั่นเลย</>} />
          </ol>
        ) : null}
        {ios && <div className="max-w-[320px] rounded-[16px] bg-(--warning-bg) px-3 py-2 text-[12px] leading-[18px] text-(--warning-fg)">ข้อมูลใน Safari กับในแอปบนหน้าโฮมแยกกันนะ เริ่มใช้จากไอคอนหน้าโฮมดีที่สุด</div>}
      </div>
      {ios && (
        <div className="install-nudge mb-3 flex flex-col items-center text-(--action-primary)" aria-hidden="true">
          <span className="text-[12px] font-extrabold">ปุ่มแชร์อยู่ด้านล่าง</span>
          <Icon name="down" size={22} stroke={2.8} />
        </div>
      )}
      {!ios && canPromptInstall() && (
        <PrimaryButton
          disabled={installing}
          onClick={async () => {
            setInstalling(true);
            const ok = await promptInstall();
            setInstalling(false);
            if (ok) onSkip();
          }}
        >
          ติดตั้งโมโม่ ♡
        </PrimaryButton>
      )}
      <button type="button" onClick={onSkip} className="mt-2 h-11 cursor-pointer border-0 bg-transparent text-[14px] font-extrabold text-(--action-soft-text)">
        {ios ? "ใช้ใน Safari ไปก่อน" : "ไว้ทีหลัง"}
      </button>
    </Frame>
  );
}

function InstallRow({ n, icon, text }: { n: number; icon: "share" | "plussquare" | "heart"; text: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-[18px] bg-(--surface-card) px-3 py-[10px] shadow-(--shadow-card)">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-(--surface-soft) text-[13px] font-extrabold text-(--action-primary)">{n}</span>
      <span className="flex-1 text-[14px] leading-[21px]">{text}</span>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[12px] bg-(--info-bg) text-(--info-fg)">
        <Icon name={icon} size={20} />
      </span>
    </li>
  );
}

/** Turn on reminders from day one: pick the time, then allow notifications. */
function NotifyStep({ onDone }: { onDone: (demo: boolean) => void }) {
  const remind = useMomo((s) => s.settings.remind);
  const set = useMomo((s) => s.updateSettings);
  const showToast = useUI((u) => u.showToast);
  const [busy, setBusy] = useState(false);
  const supported = notificationPermission() !== "unsupported";

  const allow = async (demo: boolean) => {
    setBusy(true);
    const p = await requestNotificationPermission();
    setBusy(false);
    if (p === "granted") {
      playTone(useMomo.getState().settings.tone);
      showToast("ขอบคุณน้า โมโม่จะเตือนเบา ๆ นะ", "welcome");
      // turn on reminders-while-closed right away (Web Push) — still inside the tap, as iOS wants
      void syncPush(useMomo.getState(), { create: true, force: true });
    } else if ((await checkNotificationPermission()) === "denied") {
      showToast("เปิดได้ทีหลังในการตั้งค่าของเครื่องนะ", "waiting");
    }
    onDone(demo);
  };

  return (
    <Frame>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="momo-enter flex h-[220px] w-[220px] items-center justify-center rounded-full bg-(--warning-bg)">
          <MomoBunny state="reminder" size={180} />
        </div>
        <div className="text-[12px] font-extrabold tracking-[1.4px] text-(--action-primary) uppercase">Reminders</div>
        <h1 className="m-0 text-[26px] leading-[36px] font-extrabold text-pretty">ให้โมโม่เตือนได้ไหมน้า</h1>
        <p className="m-0 max-w-[310px] text-[15px] leading-[24px] text-pretty text-(--text-secondary)">
          {supported
            ? "โมโม่จะเตือนทุกวันตามเวลานี้ และแวะมาถามอีกครั้งถ้ายังไม่ได้บันทึก"
            : "เบราว์เซอร์นี้ยังส่งแจ้งเตือนไม่ได้ บน iPhone ต้องเปิดโมโม่จากไอคอนหน้าโฮมก่อนนะ"}
        </p>
        <label className="flex w-full max-w-[300px] items-center gap-3 rounded-[20px] bg-(--surface-card) px-4 py-3 shadow-(--shadow-card)">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-(--bg-subtle) text-(--action-primary)">
            <Icon name="bell" size={20} />
          </span>
          <span className="flex-1 text-left text-[15px] font-extrabold whitespace-nowrap">เวลาเตือน</span>
          <input
            type="time"
            value={remind}
            onChange={(e) => set({ remind: e.target.value || DEFAULT_SETTINGS.remind })}
            className="h-11 rounded-[14px] border-0 bg-(--bg-subtle) px-3 text-[17px] font-extrabold text-(--text-primary)"
          />
        </label>
      </div>
      {supported ? (
        <PrimaryButton disabled={busy} onClick={() => allow(false)}>
          เปิดการแจ้งเตือน ♡
        </PrimaryButton>
      ) : (
        <PrimaryButton onClick={() => onDone(false)}>เริ่มใช้งาน ♡</PrimaryButton>
      )}
      <div className="mt-2 flex justify-center gap-2">
        {supported && (
          <button type="button" onClick={() => onDone(false)} className="h-11 cursor-pointer border-0 bg-transparent px-3 text-[14px] font-extrabold text-(--text-secondary)">
            ไว้ทีหลัง
          </button>
        )}
        <button type="button" onClick={() => (supported ? allow(true) : onDone(true))} className="h-11 cursor-pointer border-0 bg-transparent px-3 text-[14px] font-extrabold text-(--action-soft-text)">
          ลองด้วยข้อมูลตัวอย่าง
        </button>
      </div>
    </Frame>
  );
}

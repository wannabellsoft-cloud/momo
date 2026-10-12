"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MOMO_CLIPS, availableClips, greetingLine, playClip, speak, subscribeVoices, voicesSnapshot, type MomoVoice, type TtsPitch } from "@/lib/sound";
import { greetingId } from "@/lib/voice-lines";
import { isIOS } from "@/lib/install";
import { useMomo } from "@/lib/store";
import { Icon } from "./momo/Icon";
import { Segmented, cx } from "./ui";

const EMPTY: MomoVoice[] = [];
const GENDER = { female: "ผู้หญิง", male: "ผู้ชาย", unknown: "" } as const;

/** Choose Momo's speaking voice from the Thai voices installed on this device. Tapping a voice plays a sample. */
export function VoicePicker() {
  const voices = useSyncExternalStore(subscribeVoices, voicesSnapshot, () => EMPTY);
  const { ttsVoice, ttsPitch } = useMomo((s) => s.settings);
  const set = useMomo((s) => s.updateSettings);
  const [hasClips, setHasClips] = useState(false);
  useEffect(() => {
    void availableClips().then((s) => setHasClips(s.has(greetingId())));
  }, []);
  const selected = ttsVoice === MOMO_CLIPS && hasClips ? MOMO_CLIPS : ttsVoice && voices.some((v) => v.name === ttsVoice) ? ttsVoice : null;
  const sample = (voice: string | null, pitch: TtsPitch = ttsPitch) => {
    if ((voice === MOMO_CLIPS || voice === null) && hasClips) void playClip(greetingId());
    else speak(greetingLine(), { voice, pitch });
  };

  const row = (key: string | null, title: string, sub: string, chip?: string) => {
    const on = selected === key;
    return (
      <button
        key={key ?? "auto"}
        type="button"
        role="radio"
        aria-checked={on}
        data-sound="none"
        onClick={() => {
          set({ ttsVoice: key });
          sample(key);
        }}
        className={cx(
          "flex w-full cursor-pointer items-center gap-3 rounded-[16px] border-2 border-solid px-3 py-[10px] text-left text-(--text-primary)",
          on ? "border-(--tablet-next) bg-(--bg-subtle)" : "border-(--border-subtle) bg-(--surface-card)",
        )}
      >
        <span className="h-5 w-5 flex-none rounded-full bg-white" style={{ border: on ? "6px solid var(--action-primary)" : "2px solid var(--border-strong)" }} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-extrabold">{title}</span>
          <span className="block truncate text-[12px] text-(--text-secondary)">{sub}</span>
        </span>
        {chip && (
          <span className={cx("flex-none rounded-full px-2 py-[2px] text-[11px] font-extrabold", chip === "ผู้หญิง" ? "bg-(--surface-soft) text-(--action-soft-text)" : "bg-(--info-bg) text-(--info-fg)")}>{chip}</span>
        )}
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-(--surface-soft) text-(--action-primary)" aria-hidden="true">
          <Icon name="volume" size={16} />
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-extrabold">เสียงของโมโม่</span>
      {voices.length === 0 && !hasClips ? (
        <span className="rounded-[14px] bg-(--warning-bg) px-3 py-[10px] text-[13px] leading-[20px] text-(--warning-fg)">
          เครื่องนี้ยังไม่มีเสียงภาษาไทย
          {isIOS() ? " · ดาวน์โหลดได้ที่ การตั้งค่า → การช่วยการเข้าถึง → เนื้อหาที่พูด → เสียง → ไทย" : " · ลองเปิดใน Chrome, Edge หรือ Safari"}
        </span>
      ) : (
        <div role="radiogroup" aria-label="เสียงของโมโม่" className="flex flex-col gap-2">
          {row(null, "อัตโนมัติ", hasClips ? "ใช้เสียงโมโม่ที่อัดไว้" : `เสียงผู้หญิงที่ดีที่สุดในเครื่อง · ${voices[0].label}`)}
          {hasClips && row(MOMO_CLIPS, "เสียงโมโม่", "ไฟล์เสียง · เหมือนกันทุกเครื่อง", "ผู้หญิง")}
          {voices.map((v) => row(v.name, v.label, v.voice.localService ? "ในเครื่อง" : "ออนไลน์", GENDER[v.gender] || undefined))}
        </div>
      )}
      {selected !== MOMO_CLIPS && !(selected === null && hasClips) && (
      <>
      <span className="mt-1 text-[13px] font-extrabold text-(--text-secondary)">ความน่ารักของเสียง</span>
      <div data-sound="none">
        <Segmented<TtsPitch>
          label="ความน่ารักของเสียง"
          value={ttsPitch}
          options={[["normal", "ปกติ"], ["cute", "น่ารัก"], ["tiny", "ตัวจิ๋ว"]]}
          onChange={(p) => {
            set({ ttsPitch: p });
            sample(selected, p);
          }}
        />
      </div>
      </>
      )}
      {isIOS() && !hasClips && (
        <span className="text-[12px] leading-[18px] text-(--text-secondary)">
          อยากได้เสียงนุ่มขึ้น: ดาวน์โหลดเสียง “Narisa (ปรับปรุง)” ใน การตั้งค่า → การช่วยการเข้าถึง → เนื้อหาที่พูด → เสียง → ไทย
        </span>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { PristiqBox } from "@/components/PristiqBox";
import { useEffect, useState } from "react";
import { Icon } from "@/components/momo/Icon";
import { MomoBunny } from "@/components/momo/MomoBunny";
import { Card, OutlineButton, PrimaryButton, RowLabel, ScreenTitle, Segmented, Switch } from "@/components/ui";
import { addMin } from "@/lib/date";
import { notificationCopy, systemNotificationCopy } from "@/lib/derive";
import { checkNotificationPermission, notificationPermission, playTone, requestNotificationPermission, showSystemNotification, type Permission } from "@/lib/notify";
import { isNative, rescheduleNative } from "@/lib/native";
import { MED, useMomo, type FollowUp, DEFAULT_SETTINGS } from "@/lib/store";
import { useUI } from "@/lib/ui";

const PERM_TEXT: Record<Permission, string> = {
  granted: "โมโม่ส่งแจ้งเตือนได้แล้ว",
  default: "ยังไม่ได้อนุญาต · โมโม่จะเตือนไม่ได้",
  denied: "ถูกปิดไว้ · เปิดได้ที่การตั้งค่าของเครื่อง",
  unsupported: "เบราว์เซอร์นี้ยังไม่รองรับ · บน iPhone ให้เพิ่มโมโม่ลงหน้าโฮมก่อน",
};

/** Screen 09 — reminder time, dose quantity, follow-ups, bedtime note, permission, privacy. */
export default function SettingsPage() {
  const s = useMomo();
  const set = s.updateSettings;
  const ui = useUI();
  const { remind, qty, follow, maxFollowUps, bedtime, bedTime, privacy } = s.settings;
  // Pages only render on the client (AppShell waits for hydration), so reading the API here is safe.
  const [perm, setPerm] = useState<Permission>(notificationPermission);
  useEffect(() => {
    void checkNotificationPermission().then(setPerm); // the iOS app answers asynchronously
  }, []);

  const testNotify = () => {
    const { title, body } = notificationCopy(s, "remind");
    ui.showBanner({ title, body, kind: "test" });
    playTone(s.settings.tone);
    const sys = systemNotificationCopy(s, "remind");
    if (perm === "granted") void showSystemNotification(sys.title, sys.body, { tag: "momo-test", silent: s.settings.tone === "off", kind: "remind" });
  };

  return (
    <div className="flex flex-col gap-4">
      <ScreenTitle eyebrow="REMINDERS" title="ตั้งค่าการเตือน" />

      {/* ReminderSettingsCard */}
      <Card className="px-4 py-1">
        <label className="flex min-h-[60px] items-center gap-3 border-b border-solid border-(--border-subtle)">
          <RowLabel title="เวลาเตือนกินยา" sub={`${MED.name} · ทุกวัน`} />
          <input
            type="time"
            value={remind}
            onChange={(e) => set({ remind: e.target.value || DEFAULT_SETTINGS.remind })}
            onBlur={() => ui.showToast(`บันทึกเวลาเตือนแล้ว · ${useMomo.getState().settings.remind} น. ♡`, "welcome")}
            className="h-11 rounded-[14px] border-0 bg-(--bg-subtle) px-3 text-[17px] font-extrabold text-(--text-primary)"
          />
        </label>
        <div className="flex min-h-[60px] items-center gap-3 border-b border-solid border-(--border-subtle)">
          <RowLabel title="จำนวนต่อครั้ง" sub="ตามที่แพทย์สั่ง" />
          <div className="flex items-center gap-1 rounded-full bg-(--bg-subtle) p-[3px]">
            <button type="button" aria-label="ลดจำนวนเม็ด" disabled={qty <= 1} onClick={() => set({ qty: Math.max(1, qty - 1) })} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-(--surface-card) disabled:cursor-not-allowed disabled:opacity-40">
              <Icon name="minus" size={16} />
            </button>
            <span className="min-w-11 text-center font-extrabold" aria-live="polite">{qty} เม็ด</span>
            <button type="button" aria-label="เพิ่มจำนวนเม็ด" disabled={qty >= 4} onClick={() => set({ qty: Math.min(4, qty + 1) })} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-(--surface-card) disabled:cursor-not-allowed disabled:opacity-40">
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-b border-solid border-(--border-subtle) py-3">
          <span className="text-[15px] font-extrabold">เตือนซ้ำถ้ายังไม่บันทึก</span>
          <Segmented<FollowUp>
            label="เตือนซ้ำถ้ายังไม่บันทึก"
            value={follow}
            options={[[0, "ปิด"], [15, "15 นาที"], [30, "30 นาที"], [60, "1 ชม."]]}
            onChange={(v) => set({ follow: v })}
          />
          <span className="text-[12px] leading-[18px] text-(--text-secondary)">
            {follow
              ? `ถ้ายังไม่บันทึก โมโม่จะแวะมาถามอีกครั้งตอน ${addMin(remind, follow)} น. (สูงสุด ${maxFollowUps} ครั้ง) · การปัดทิ้งไม่นับว่ากินยา`
              : "โมโม่จะเตือนครั้งเดียวตามเวลา"}
          </span>
        </div>
        <div className="flex min-h-[60px] items-center gap-3">
          <RowLabel
            title="ข้อความราตรีสวัสดิ์"
            sub={
              <>
                ไม่เกี่ยวกับการบันทึกยา ·{" "}
                <input
                  type="time"
                  aria-label="เวลาข้อความราตรีสวัสดิ์"
                  value={bedTime}
                  onChange={(e) => set({ bedTime: e.target.value || "22:30" })}
                  className="border-0 bg-transparent p-0 text-[12px] text-(--text-secondary) underline decoration-dotted"
                />{" "}
                น.
              </>
            }
          />
          <Switch checked={bedtime} onChange={(v) => set({ bedtime: v })} label="ข้อความราตรีสวัสดิ์" />
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <RowLabel title="การแจ้งเตือน" sub={PERM_TEXT[perm]} />
          {perm === "granted" ? (
            <span className="flex h-8 items-center gap-[6px] rounded-full bg-(--success-bg) px-3 text-[13px] font-extrabold text-(--success-fg)">
              <Icon name="check" size={14} stroke={3} />
              เปิดอยู่
            </span>
          ) : perm === "default" ? (
            <PrimaryButton
              size="sm"
              onClick={async () => {
                const p = await requestNotificationPermission();
                setPerm(p);
                if (p === "granted") {
                  ui.showToast("ขอบคุณน้า โมโม่จะเตือนเบา ๆ นะ", "welcome");
                  void rescheduleNative(useMomo.getState());
                }
              }}
            >
              อนุญาต
            </PrimaryButton>
          ) : null}
        </div>
        <div className="flex items-center gap-3 border-t border-solid border-(--border-subtle) pt-3">
          <RowLabel title="ซ่อนชื่อยาบนหน้าจอล็อก" sub="แนะนำให้เปิดไว้" />
          <Switch checked={privacy} onChange={(v) => set({ privacy: v })} label="ซ่อนชื่อยา" />
        </div>
        <OutlineButton className="h-11 rounded-[14px] text-[14px]" onClick={testNotify} data-sound="none">
          <Icon name="bell" size={16} />
          ลองส่งการแจ้งเตือน
        </OutlineButton>
        <div className="text-[12px] leading-[18px] text-(--text-secondary)">
          {isNative()
            ? "โมโม่ตั้งเวลาเตือนไว้กับ iPhone ล่วงหน้า 14 วัน เด้งตรงเวลาแม้ปิดแอปหรือไม่มีเน็ต"
            : <>โมโม่เตือนได้ตอนที่แอปเปิดอยู่หรือยังทำงานเบื้องหลัง บน iPhone ให้กด “แชร์ → เพิ่มไปยังหน้าจอโฮม” ก่อน แล้วค่อยอนุญาตการแจ้งเตือน</>}
        </div>
      </Card>

      <Link href="/settings/profile/" className="press flex items-center gap-3 rounded-[24px] bg-(--surface-card) px-4 py-3 text-(--text-primary) no-underline shadow-(--shadow-card)">
        <span className="h-12 w-12 flex-none overflow-hidden rounded-full bg-(--surface-soft)">
          <MomoBunny crop="head" still size={48} />
        </span>
        <RowLabel title="โปรไฟล์โมโม่" sub="การพูด เสียงเตือน และการเคลื่อนไหว" />
        <Icon name="right" size={18} />
      </Link>

      <Link href="/care/" className="press flex items-center gap-3 rounded-[24px] bg-(--surface-card) px-4 py-3 text-(--text-primary) no-underline shadow-(--shadow-card)">
        <PristiqBox width={52} />
        <RowLabel title="ข้อมูลยา Pristiq" sub="ลืมกินยาทำไงดี · ข้อควรระวัง" />
        <Icon name="right" size={18} />
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MomoBunny } from "@/components/momo/MomoBunny";
import { VoicePicker } from "@/components/VoicePicker";
import { BondBadge } from "@/components/BondBadge";
import { StreakFlame } from "@/components/StreakFlame";
import { EXP_RULES, TIERS, momoExp } from "@/lib/exp";
import { useNow } from "@/lib/hooks";
import { BackHeader, Card, OutlineButton, RowLabel, Segmented, Switch, KeepName, cx } from "@/components/ui";
import { playGreeting, playTone } from "@/lib/sound";
import { MED, useMomo, type Settings } from "@/lib/store";
import { useUI } from "@/lib/ui";

const TONE_TOAST = { sparkle: "กรุ๊งกริ๊ง ♪", bubble: "ป๊อป ป๊อป ♪", hop: "ปุ๊กปิ๊ก ♪" } as const;

/** Screen 10 — Momo profile: voice, sounds, motion — plus theme and data. */
export default function ProfilePage() {
  const s = useMomo();
  const set = s.updateSettings;
  const showToast = useUI((u) => u.showToast);
  const { call, voice, tone, uiSounds, greeting, momoTalk, music, musicTrack, reduceMotion, theme } = s.settings;
  const [confirmReset, setConfirmReset] = useState(false);
  const sweet = voice === "sweet";

  return (
    <div className="flex flex-col gap-4">
      <BackHeader href="/settings/" eyebrow="MOMO PROFILE" title="โปรไฟล์โมโม่" />
      <div className="flex flex-col items-center gap-1 rounded-[28px] bg-(--surface-soft) p-5 text-center">
        <MomoBunny state="idle" size={170} />
        <div className="text-[28px] leading-[36px] font-extrabold">
          โมโม่ <span className="text-[15px] text-(--action-soft-text)">Momo</span>
        </div>
        <div className="text-[14px] leading-[22px] text-balance"><KeepName text="กระต่ายโมจิตัวเล็ก ชอบแดดอุ่น ๆ กับการงีบตอนบ่าย ที่คุณเบลส่งมาช่วยดูแลพี่แพรวางับ" /></div>
      </div>

      <LevelCard />

      <Card className="flex flex-col gap-[14px] p-4">
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-extrabold">สไตล์การพูด</span>
          <Segmented<Settings["voice"]> label="สไตล์การพูด" value={voice} options={[["sweet", "หวาน ๆ"], ["plain", "เรียบ ๆ"]]} onChange={(v) => set({ voice: v })} />
          <span className="rounded-[14px] bg-(--bg-app) px-3 py-[10px] text-[13px] leading-[20px] text-(--text-secondary)">
            “{sweet ? `${call}า ได้เวลากินยาแล้วน้า โมโม่มาเตือนแล้วนะ ♡` : `ถึงเวลากินยาแล้ว ${call} · ${MED.name}`}”
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-extrabold">เสียงแจ้งเตือน</span>
          <div data-sound="none">
          <Segmented<Settings["tone"]>
            label="เสียงแจ้งเตือน"
            value={tone}
            options={[["sparkle", "กรุ๊งกริ๊ง"], ["bubble", "ป๊อปฟอง"], ["hop", "ปุ๊กปิ๊ก"], ["off", "ปิด"]]}
            onChange={(v) => {
              set({ tone: v });
              playTone(v);
              showToast(v === "off" ? "ปิดเสียงแล้ว แจ้งเตือนยังขึ้นตามปกติ" : TONE_TOAST[v], "reminder");
            }}
          />
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-solid border-(--border-subtle) pt-3">
          <RowLabel title="เพลงประกอบ" sub="เพลงเบา ๆ ตอนเปิดแอป · ปิดเองเมื่อโหมดเงียบ" />
          <Switch checked={music} onChange={(v) => set({ music: v })} label="เพลงประกอบ" />
        </div>
        {music && (
          <div className="-mt-1 flex flex-col gap-2">
            <Segmented<Settings["musicTrack"]>
              label="เพลง"
              value={musicTrack}
              options={[["lullaby", "กล่อมนอน"], ["box", "กล่องดนตรี"], ["time", "ตามเวลา"]]}
              onChange={(v) => set({ musicTrack: v })}
            />
            <span className="text-[12px] leading-[18px] text-(--text-secondary)">
              {musicTrack === "lullaby" ? "เพลงกล่อมช้า ๆ นุ่ม ๆ ฟังสบาย" : musicTrack === "box" ? "กล่องดนตรีใส ๆ สดใส" : "กลางวันกล่องดนตรี · หลัง 6 โมงเย็นเปลี่ยนเป็นเพลงกล่อมนอน"}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <RowLabel title="เสียงตอนกดปุ่ม" sub="ปิ๊ก ๆ เบา ๆ ทุกครั้งที่แตะ" />
          <Switch checked={uiSounds} onChange={(v) => set({ uiSounds: v })} label="เสียงตอนกดปุ่ม" />
        </div>
        <div className="flex items-center gap-3">
          <RowLabel title="โมโม่ทักทายตอนเปิดแอป" sub="เสียงกรุ๊งกริ๊ง + โมโม่พูดสวัสดีแพรวา" />
          <span data-sound="none" className="contents"><Switch checked={greeting} onChange={(v) => { set({ greeting: v }); if (v) playGreeting({ voice: s.settings.ttsVoice, pitch: s.settings.ttsPitch }); }} label="โมโม่ทักทายตอนเปิดแอป" /></span>
        </div>
        <div className="flex items-center gap-3">
          <RowLabel title="โมโม่พูดตอนแตะและตอนบันทึก" sub="แตะโมโม่ กินยาแล้ว เติมสต็อก เปิดกล่องใหม่" />
          <Switch checked={momoTalk} onChange={(v) => set({ momoTalk: v })} label="โมโม่พูดตอนแตะและตอนบันทึก" />
        </div>
        <VoicePicker />
        <div className="flex items-center gap-3 border-t border-solid border-(--border-subtle) pt-3">
          <RowLabel title="ลดการเคลื่อนไหว" sub="โมโม่จะนั่งนิ่ง ๆ ไม่ขยับหู ไม่กระพริบตา" />
          <Switch checked={reduceMotion} onChange={(v) => set({ reduceMotion: v })} label="ลดการเคลื่อนไหว" />
        </div>
      </Card>

      <Card className="flex flex-col gap-[14px] p-4">
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-extrabold">ธีม</span>
          <Segmented<Settings["theme"]> label="ธีม" value={theme} options={[["time", "ตามเวลา"], ["system", "ตามเครื่อง"], ["light", "สว่าง"], ["dark", "มืด"]]} onChange={(v) => set({ theme: v })} />
        </div>
        <div className="flex flex-col gap-2 border-t border-solid border-(--border-subtle) pt-3">
          <span className="text-[15px] font-extrabold">ข้อมูลในเครื่อง</span>
          <span className="text-[12px] leading-[18px] text-(--text-secondary)">ข้อมูลยาเก็บอยู่ในเครื่องนี้เท่านั้น{s.demo ? " · ตอนนี้กำลังใช้ข้อมูลตัวอย่าง (Demo data)" : ""}</span>
          <OutlineButton
            className="h-11 rounded-[14px] text-[14px]"
            onClick={() => {
              s.loadDemo();
              showToast("โหลดข้อมูลตัวอย่างแล้ว", "idle");
            }}
          >
            โหลดข้อมูลตัวอย่าง
          </OutlineButton>
          <OutlineButton
            className="h-11 rounded-[14px] text-[14px] text-(--error-fg)"
            onClick={() => {
              if (!confirmReset) return setConfirmReset(true);
              s.resetAll();
              setConfirmReset(false);
              showToast("ล้างข้อมูลแล้ว เริ่มใหม่ได้เลยนะ", "idle");
            }}
            onBlur={() => setConfirmReset(false)}
          >
            {confirmReset ? "แตะอีกครั้งเพื่อยืนยันการล้างข้อมูล" : "ล้างข้อมูลทั้งหมด"}
          </OutlineButton>
        </div>
      </Card>
    </div>
  );
}

const MOOD = { happy: "อารมณ์ดีสุด ๆ ♡", ok: "สบายดี", sulky: "งอนนิดนึง 😤" } as const;

/** Closeness with Momo: level, points, streak and mood — and how points are earned (lib/exp.ts). */
function LevelCard() {
  const s = useMomo();
  const x = momoExp(s, useNow());
  const R = EXP_RULES;
  return (
    <section id="level" className="scroll-mt-4">
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <BondBadge level={x.level} tier={x.tier.index} size={60} />
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-extrabold tracking-[.08em] text-(--action-soft-text)">ความสนิทกับโมโม่ · Lv.{x.level}</div>
          <div className="text-[22px] leading-[30px] font-extrabold">{x.tier.name}</div>
        </div>
      </div>
      <div>
        <div className="h-[10px] overflow-hidden rounded-full bg-(--bg-subtle)">
          <div className="exp-fill h-full rounded-full" style={{ width: `${Math.max(4, Math.round(x.progress * 100))}%` }} />
        </div>
        <div className="tnum mt-1 flex justify-between text-[12px] font-extrabold text-(--text-secondary)">
          <span>{x.inLevel}/{x.toNext} ♡ ถึงเลเวลถัดไป</span>
          <span>รวม {x.exp} ♡</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[16px] bg-(--action-soft) px-3 py-2 text-(--action-soft-text)">
          <div className="text-[12px] font-extrabold">ต่อเนื่อง</div>
          <div className="flex items-center gap-[6px] text-[18px] font-extrabold text-(--text-primary)">
            <StreakFlame size={24} lit={x.streak > 0} />
            {x.streak} วัน
          </div>
        </div>
        <div className="rounded-[16px] bg-(--surface-soft) px-3 py-2">
          <div className="text-[12px] font-extrabold text-(--action-soft-text)">อารมณ์โมโม่</div>
          <div className="text-[16px] leading-[27px] font-extrabold">{MOOD[x.mood]}</div>
        </div>
      </div>
      <div className="rounded-[16px] bg-(--bg-app) px-3 py-[10px] text-[13px] leading-[21px]">
        <div className="mb-1 font-extrabold">สนิทกันมากขึ้นได้ยังไง</div>
        <div>• บันทึกว่ากินยาแล้ว +{R.base}</div>
        <div>• ตรงเวลา (ไม่เกิน {R.onTimeMin} นาทีจากเวลาเตือน) +{R.onTime} · เกือบตรง ({R.closeMin} นาที) +{R.close}</div>
        <div>• กินต่อเนื่องทุกวัน +{R.streakStep} ต่อวัน (สูงสุด +{R.streakMax})</div>
        <div className="text-(--text-secondary)">ลืมกินไม่โดนหักแต้ม แต่ความต่อเนื่องจะเริ่มใหม่ และโมโม่จะงอนนิดนึง</div>
      </div>
      <div className="flex gap-2">
        {TIERS.map((t) => (
          <div key={t.name} className={cx("flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[16px] px-[2px] py-2 text-center", x.tier.name === t.name ? "bg-(--action-soft)" : "bg-(--bg-subtle)", x.level < t.from && "opacity-55")}>
            <BondBadge level={t.from} tier={t.index} size={30} />
            <span className="text-[10px] leading-[14px] font-extrabold">{t.name}</span>
          </div>
        ))}
      </div>
    </Card>
    </section>
  );
}

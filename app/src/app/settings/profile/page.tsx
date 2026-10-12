"use client";

import { useState } from "react";
import { MomoBunny } from "@/components/momo/MomoBunny";
import { BackHeader, Card, OutlineButton, RowLabel, Segmented, Switch } from "@/components/ui";
import { playTone } from "@/lib/notify";
import { MED, useMomo, type Settings } from "@/lib/store";
import { useUI } from "@/lib/ui";

/** Screen 10 — Momo profile: what Momo calls you, voice, tone, motion — plus theme and data. */
export default function ProfilePage() {
  const s = useMomo();
  const set = s.updateSettings;
  const showToast = useUI((u) => u.showToast);
  const { call, voice, tone, reduceMotion, theme } = s.settings;
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
        <div className="text-[14px] leading-[22px]">กระต่ายตัวเล็กของ{call} ชอบดอกไม้สีชมพูกับการงีบตอนบ่าย</div>
      </div>

      <Card className="flex flex-col gap-[14px] p-4">
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-extrabold">โมโม่เรียกเราว่า</span>
          <Segmented label="โมโม่เรียกเราว่า" value={call} options={[["แพรวา", "แพรวา"], ["แพรว", "แพรว"], ["หนู", "หนู"]]} onChange={(v) => set({ call: v })} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-extrabold">สไตล์การพูด</span>
          <Segmented<Settings["voice"]> label="สไตล์การพูด" value={voice} options={[["sweet", "หวาน ๆ"], ["plain", "เรียบ ๆ"]]} onChange={(v) => set({ voice: v })} />
          <span className="rounded-[14px] bg-(--bg-app) px-3 py-[10px] text-[13px] leading-[20px] text-(--text-secondary)">
            “{sweet ? `${call}า ได้เวลากินยาแล้วน้า โมโม่มาเตือนแล้วนะ ♡` : `ถึงเวลากินยาแล้ว ${call} · ${MED.name}`}”
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-extrabold">เสียงแจ้งเตือน</span>
          <Segmented<Settings["tone"]>
            label="เสียงแจ้งเตือน"
            value={tone}
            options={[["bell", "กระดิ่ง"], ["pop", "ป๊อป"], ["off", "ปิดเสียง"]]}
            onChange={(v) => {
              set({ tone: v });
              playTone(v);
              showToast(v === "off" ? "ปิดเสียงแล้ว แจ้งเตือนยังขึ้นตามปกติ" : "กรุ๊งกริ๊ง ♪", "reminder");
            }}
          />
        </div>
        <div className="flex items-center gap-3 border-t border-solid border-(--border-subtle) pt-3">
          <RowLabel title="ลดการเคลื่อนไหว" sub="โมโม่จะนั่งนิ่ง ๆ ไม่ขยับหู ไม่กระพริบตา" />
          <Switch checked={reduceMotion} onChange={(v) => set({ reduceMotion: v })} label="ลดการเคลื่อนไหว" />
        </div>
      </Card>

      <Card className="flex flex-col gap-[14px] p-4">
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-extrabold">ธีม</span>
          <Segmented<Settings["theme"]> label="ธีม" value={theme} options={[["system", "ตามเครื่อง"], ["light", "สว่าง"], ["dark", "มืด"]]} onChange={(v) => set({ theme: v })} />
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

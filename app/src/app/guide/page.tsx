"use client";

import Link from "next/link";
import { GuideVideo } from "@/components/GuideVideo";
import { Icon } from "@/components/momo/Icon";
import { MomoBunny } from "@/components/momo/MomoBunny";
import { BackHeader, Card } from "@/components/ui";

const STEPS = [
  ["ไปที่เมนู สต็อกยา", "แตะเมนู “สต็อกยา” ที่แถบด้านล่าง"],
  ["เพิ่มกล่องสำรอง", "กดปุ่ม + ตามจำนวนกล่องยาที่มี"],
  ["ตรวจสอบจำนวนกล่อง", "ตัวเลขกล่องสำรองจะเพิ่มขึ้น"],
  ["กด “เปิดกล่องใหม่”", "โมโม่จะเพิ่มแผงยาให้ (1 กล่อง = 2 แผง × 15 เม็ด)"],
  ["ไปที่เมนู แผงยา", "แผงใหม่ เม็ดถัดไปคือเม็ดที่ 1"],
  ["ตั้งเม็ดที่กินไปแล้ว", "ถ้าแผงถูกแกะไปบ้างแล้ว แตะเม็ดนั้น → “แค่แกะเม็ดออก” ทำทีละเม็ด"],
  ["ตรวจสอบเม็ดถัดไป", "เม็ดที่แกะแล้วเป็นวงเส้นประ โมโม่ชี้เม็ดถัดไปให้"],
  ["บันทึกการกินยา", "กินยาแล้ว กด “บันทึกว่ากินยาแล้ว ♡” ที่หน้าแรก"],
] as const;

/** First-use guide: Momo's tutorial video and the steps in text. */
export default function GuidePage() {
  return (
    <div className="flex flex-col gap-4">
      <BackHeader href="/" eyebrow="GUIDE" title="วิธีเริ่มใช้งาน" />

      <div className="overflow-hidden rounded-[28px] bg-(--surface-card) shadow-(--shadow-card)">
        <GuideVideo className="max-h-[72vh]" />
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <MomoBunny state="taken" still size={56} />
          <div className="min-w-0 flex-1">
            <div className="text-[16px] leading-[24px] font-extrabold">8 ขั้นตอนง่าย ๆ</div>
            <div className="text-[13px] leading-[20px] text-(--text-secondary)">ทำตามครั้งเดียว แล้วโมโม่จะนับยาให้ทุกวัน</div>
          </div>
        </div>
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="flex items-start gap-3 rounded-[16px] bg-(--bg-subtle) px-3 py-[10px]">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-(--action-primary) text-[14px] font-extrabold text-(--text-on-action)">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-[22px] font-extrabold">{title}</span>
                <span className="block text-[13px] leading-[20px] text-(--text-secondary)">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Link href="/inventory/" className="press flex items-center justify-center gap-2 rounded-[20px] bg-(--action-primary) px-4 py-[14px] text-[16px] font-extrabold text-(--text-on-action) no-underline shadow-(--shadow-button)">
        เริ่มที่สต็อกยาเลย
        <Icon name="right" size={18} stroke={2.6} />
      </Link>
    </div>
  );
}

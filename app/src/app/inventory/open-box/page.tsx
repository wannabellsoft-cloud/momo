"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EMPTY, EmptyState } from "@/components/EmptyState";
import { MomoBunny } from "@/components/momo/MomoBunny";
import { BackHeader, Card, PrimaryButton, cx } from "@/components/ui";
import { LOCS, LOC_KEYS, packLabel, useMomo, type LocationId } from "@/lib/store";
import { useUI } from "@/lib/ui";

/** Screen 08 — confirm stock deduction, create two packs, assign storage locations. */
export default function OpenBoxPage() {
  const s = useMomo();
  const router = useRouter();
  const showToast = useUI((u) => u.showToast);
  const combined = s.settings.storageMode === "combined";
  const [locs, setLocs] = useState<[LocationId, LocationId]>(["bedroom", combined ? "bedroom" : "work"]);
  const names = [packLabel(s.packCounter), packLabel(s.packCounter + 1)];
  const firstBox = s.packs.length === 0;

  const pick = (k: 0 | 1, l: LocationId) =>
    setLocs((cur) => {
      const nl: [LocationId, LocationId] = [...cur];
      nl[k] = l;
      if (combined) nl[1 - k] = l;
      return nl;
    });

  const confirm = () => {
    const r = s.openBox(locs);
    if (!r.ok) return;
    showToast(`เปิดกล่องแล้ว ได้แผง ${names[0]} กับ ${names[1]} ♡`, "refill");
    router.push("/blister/");
  };

  return (
    <div className="flex flex-col gap-4">
      <BackHeader href="/inventory/" eyebrow="OPEN NEW BOX" title="เปิดกล่องใหม่" />
      {s.reserve < 1 ? (
        <EmptyState
          {...EMPTY.reserve}
          cta="เพิ่มกล่องสำรอง"
          onClick={() => s.changeReserve(1)}
        />
      ) : (
        <>
          <div className="flex flex-col items-center gap-[6px] rounded-[28px] bg-(--surface-secondary) p-5 text-center">
            <MomoBunny state="refill" size={150} />
            <div className="text-[18px] leading-[28px] font-extrabold">โมโม่จะช่วยแกะกล่องให้นะ</div>
            <div className="text-[14px] leading-[22px] text-(--dose-missed-fg)">กล่องสำรอง {s.reserve} → {s.reserve - 1} กล่อง · ได้แผงใหม่ 2 แผง (+30 เม็ด)</div>
          </div>
          {names.map((name, k) => (
            <Card key={name} className="flex flex-col gap-[10px] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[17px] font-extrabold">แผง {name}</span>
                <span className="text-[13px] text-(--text-secondary)">15 เม็ด</span>
              </div>
              <div className="text-[13px] text-(--text-secondary)" id={`loc-${k}`}>เก็บไว้ที่</div>
              <div className="flex flex-wrap gap-[6px]" role="group" aria-labelledby={`loc-${k}`}>
                {LOC_KEYS.map((l) => {
                  const on = locs[k] === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pick(k as 0 | 1, l)}
                      className={cx(
                        "h-11 cursor-pointer rounded-full border-2 border-solid px-4 text-[14px] font-extrabold",
                        on ? "border-(--tablet-next) bg-(--bg-subtle) text-(--action-soft-text)" : "border-(--border-subtle) bg-(--surface-card) text-(--text-primary)",
                      )}
                    >
                      {LOCS[l]}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
          <div className="px-1 text-[13px] leading-[20px] text-(--text-secondary)">
            {firstBox
              ? "ถ้าแผงที่ใช้อยู่ถูกแกะไปแล้วบางเม็ด หลังเปิดกล่อง แตะเม็ดนั้นในหน้าแผงยา แล้วเลือก “แค่แกะเม็ดออก” จะไม่นับว่ากินยา"
              : "แผงที่เปิดอยู่เดิมจะไม่ถูกลบ เม็ดที่เหลือยังนับรวมเหมือนเดิม"}
            {combined && " · โหมดรวมที่เดียว: ทั้งสองแผงจะเก็บที่เดียวกัน"}
          </div>
          <PrimaryButton onClick={confirm}>ยืนยัน เปิดกล่อง (−1 กล่องสำรอง)</PrimaryButton>
        </>
      )}
    </div>
  );
}

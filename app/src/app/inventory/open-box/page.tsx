"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EMPTY, EmptyState } from "@/components/EmptyState";
import { MomoBunny } from "@/components/momo/MomoBunny";
import { Icon } from "@/components/momo/Icon";
import { BackHeader, Card, PrimaryButton, Segmented } from "@/components/ui";
import { LOCS, LOC_KEYS, packLabel, useMomo, type LocationId } from "@/lib/store";
import { momoSays, momoSaysOneOf } from "@/lib/momo-voice";
import { useUI } from "@/lib/ui";
import { SAY } from "@/lib/voice-lines";

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
    momoSays(SAY.boxOpened);
    router.push("/blister/");
  };

  return (
    <div className="flex flex-col gap-4">
      <BackHeader href="/inventory/" eyebrow="OPEN NEW BOX" title="เปิดกล่องใหม่" />
      {s.reserve < 1 ? (
        <EmptyState
          {...EMPTY.reserve}
          cta="เพิ่มกล่องสำรอง"
          onClick={() => {
            s.changeReserve(1);
            momoSaysOneOf("reserve", SAY.reserveAdded);
          }}
        />
      ) : (
        <>
          {/* summary — compact so everything fits above the sticky button */}
          <div className="flex items-center gap-3 rounded-[24px] bg-(--surface-secondary) py-3 pr-4 pl-2">
            <MomoBunny state="refill" size={84} />
            <div className="min-w-0 flex-1">
              <div className="text-[17px] leading-[25px] font-extrabold">ได้แผงใหม่ 2 แผง</div>
              <div className="text-[13px] leading-[20px] text-(--dose-missed-fg)">แผง {names[0]} + แผง {names[1]} · +30 เม็ด</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-(--surface-card) px-[10px] py-[2px] text-[12px] font-extrabold">
                กล่องสำรอง <span className="tnum">{s.reserve}</span> → <span className="tnum text-(--action-primary)">{s.reserve - 1}</span>
              </div>
            </div>
          </div>

          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2 text-[15px] font-extrabold">
              <Icon name="pin" size={18} />
              เก็บแผงไว้ที่ไหนดี
            </div>
            {(combined ? [0] : [0, 1]).map((k) => (
              <div key={k} className="flex flex-col gap-[6px]">
                <span className="text-[13px] font-extrabold text-(--text-secondary)">{combined ? `แผง ${names[0]} + ${names[1]} (รวมที่เดียว)` : `แผง ${names[k]}`}</span>
                <Segmented<LocationId> label={`ที่เก็บแผง ${names[k]}`} value={locs[k]} options={LOC_KEYS.map((l) => [l, LOCS[l]] as [LocationId, string])} onChange={(l) => pick(k as 0 | 1, l)} />
              </div>
            ))}
          </Card>

          <div className="px-1 text-[13px] leading-[20px] text-(--text-secondary)">
            {firstBox
              ? "ถ้าแผงที่ใช้อยู่ถูกแกะไปแล้วบางเม็ด หลังเปิดกล่อง แตะเม็ดนั้นในหน้าแผงยา แล้วเลือก “แค่แกะเม็ดออก” จะไม่นับว่ากินยา"
              : "แผงที่เปิดอยู่เดิมจะไม่ถูกลบ เม็ดที่เหลือยังนับรวมเหมือนเดิม"}
          </div>

          {/* sticky action bar — always reachable with the thumb */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px]">
            <div className="h-6 bg-gradient-to-t from-(--bg-app) to-transparent" />
            <div className="pointer-events-auto flex flex-col gap-1 bg-(--bg-app) px-5 pt-1" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}>
              <PrimaryButton onClick={confirm} data-sound="success">
                <Icon name="box" size={20} />
                เปิดกล่องเลย ♡
              </PrimaryButton>
              <button type="button" onClick={() => router.push("/inventory/")} className="h-10 cursor-pointer border-0 bg-transparent text-[14px] font-extrabold text-(--text-secondary)">
                ยังไม่เปิดตอนนี้
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

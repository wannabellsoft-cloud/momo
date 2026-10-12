"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { EMPTY, EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/momo/Icon";
import { Card, ScreenTitle, cx } from "@/components/ui";
import { dayKey, hm, thShortDate } from "@/lib/date";
import { LOCS, MED, left, nextIdx, snakeIndex, useMomo, type Pack } from "@/lib/store";
import { useUI } from "@/lib/ui";

type TabletState = "next" | "in" | "taken" | "removed";
const LABELS: Record<TabletState, string> = { next: "ถัดไป ยังอยู่ในแผง", in: "ยังอยู่ในแผง", taken: "กินแล้ว", removed: "แกะออก ไม่ได้กิน" };

/** Screen 04 — interactive blister: Pack selector, 3×5 snake grid, next tablet, audit log. */
export default function BlisterPage() {
  const s = useMomo();
  const openSheet = useUI((u) => u.openSheet);
  const router = useRouter();
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    tabs.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [s.activePackId]);

  if (s.packs.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <ScreenTitle eyebrow="BLISTER" title="แผงยา" />
        <EmptyState {...EMPTY.packs} cta="เปิดกล่องใหม่" onClick={() => router.push(s.reserve > 0 ? "/inventory/open-box/" : "/inventory/")} />
      </div>
    );
  }

  const cur = s.packs.find((p) => p.id === s.activePackId) ?? s.packs[0];
  // Empty packs auto-archive: hidden from the selector unless currently selected.
  const visible = s.packs.filter((p) => left(p) > 0 || p.id === cur.id);
  const ni = nextIdx(cur);
  const today = dayKey(new Date());
  const audit = s.audit.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      <ScreenTitle eyebrow="BLISTER" title="แผงยา" />

      {/* PackSelector */}
      <div ref={tabs} role="tablist" aria-label="เลือกแผงยา" className="no-scrollbar flex gap-2 overflow-x-auto overflow-y-hidden p-[2px]">
        {visible.map((p) => {
          const on = p.id === cur.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => s.setActivePack(p.id)}
              className={cx(
                "flex h-[60px] min-w-[132px] flex-none cursor-pointer flex-col items-center justify-center rounded-[20px] border-0 px-4 whitespace-nowrap transition-all duration-200",
                on ? "bg-(--action-primary) text-(--text-on-action) shadow-(--shadow-button)" : "bg-(--info-bg) text-(--info-fg)",
              )}
            >
              <span className="text-[16px] leading-[22px] font-extrabold">แผง {p.label}</span>
              <span className="text-[12px] leading-[16px] opacity-90">{LOCS[p.location]} · เหลือ {left(p)}</span>
            </button>
          );
        })}
      </div>

      {/* BlisterPack */}
      <Card hero className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="m-0 text-[18px] leading-[26px] font-extrabold">{MED.name}</h2>
            <div className="text-[13px] leading-[20px] text-(--text-secondary)">{MED.generic} · แผง {cur.label}</div>
          </div>
          <button
            type="button"
            onClick={() => s.cyclePackLocation(cur.id)}
            aria-label={`ที่เก็บ: ${LOCS[cur.location]} แตะเพื่อเปลี่ยน`}
            className="flex h-11 flex-none cursor-pointer items-center gap-[6px] rounded-full border-[1.5px] border-solid border-(--border-default) bg-(--surface-card) px-3 text-[13px] font-extrabold whitespace-nowrap text-(--text-primary)"
          >
            <Icon name="pin" size={16} />
            {LOCS[cur.location]}
          </button>
        </div>
        <BlisterGrid pack={cur} next={ni} onPress={(i) => openSheet({ packId: cur.id, index: i })} />
        <div className="flex flex-wrap gap-3 text-[12px] leading-[18px] text-(--text-secondary)">
          <span className="flex items-center gap-[6px]"><span className="h-[14px] w-[14px] rounded-full bg-(--tablet-pill) shadow-[0_0_0_2.5px_var(--tablet-next)]" />ถัดไป</span>
          <span className="flex items-center gap-[6px]"><span className="h-[14px] w-[14px] rounded-full border border-solid border-(--pill-edge) bg-(--tablet-pill)" />ยังอยู่</span>
          <span className="flex items-center gap-[6px]"><span className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-(--dose-taken-bg) text-[10px] text-(--dose-taken-fg)">✓</span>กินแล้ว</span>
          <span className="flex items-center gap-[6px]"><span className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-(--dose-missed-bg) text-[10px] text-(--dose-missed-fg)">–</span>แกะออก (ไม่ได้กิน)</span>
        </div>
      </Card>

      {ni >= 0 ? (
        <button type="button" onClick={() => openSheet({ packId: cur.id, index: ni })} className="press flex cursor-pointer items-center gap-[14px] rounded-[24px] border-0 bg-(--surface-soft) px-4 py-[14px] text-left text-(--text-primary)">
          <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-(--surface-card) text-(--action-primary) shadow-[0_0_0_3px_var(--tablet-next)]">
            <Icon name="pill" size={24} />
          </span>
          <span className="flex-1">
            <span className="block text-[13px] leading-[20px] font-extrabold text-(--action-soft-text)">เม็ดถัดไป</span>
            <span className="block text-[22px] leading-[30px] font-extrabold">ลำดับที่ {ni + 1}</span>
          </span>
          <Icon name="right" size={20} />
        </button>
      ) : (
        <div className="rounded-[24px] bg-(--surface-secondary) px-4 py-[14px] text-[14px] leading-[22px] text-(--dose-missed-fg)">
          แผงนี้หมดแล้ว เลือกแผงอื่นด้านบน หรือ{" "}
          <Link href="/inventory/" className="font-extrabold text-(--dose-missed-fg) underline">เปิดกล่องใหม่</Link>
        </div>
      )}

      <Card className="flex flex-col gap-[10px] p-4">
        <div className="flex items-center gap-2 text-[15px] font-extrabold">
          <Icon name="list" size={18} />
          บันทึกการเปลี่ยนแปลง
        </div>
        {audit.map((a) => {
          const d = new Date(a.at);
          return (
            <div key={a.id} className="flex gap-[10px] border-t border-solid border-(--border-subtle) pt-2 text-[13px] leading-[20px]">
              <span className="tnum min-w-11 flex-none text-(--text-secondary)">{dayKey(d) === today ? hm(d) : thShortDate(d).split(" ").slice(0, 2).join(" ")}</span>
              <span>{a.text}</span>
            </div>
          );
        })}
        {audit.length === 0 && <div className="text-[13px] leading-[20px] text-(--text-secondary)">ยังไม่มีการเปลี่ยนแปลง แตะเม็ดยาเพื่อบันทึกหรือแก้ไข</div>}
      </Card>
    </div>
  );
}

function tabletState(pack: Pack, i: number, next: number): TabletState {
  const t = pack.tablets[i];
  if (!t.removed) return i === next ? "next" : "in";
  return t.doseId ? "taken" : "removed";
}

/** 3 rows × 5 — row 2 runs right→left (snake order). role=grid for screen readers. */
function BlisterGrid({ pack, next, onPress }: { pack: Pack; next: number; onPress: (i: number) => void }) {
  return (
    <div role="grid" aria-label={`แผง ${pack.label} 15 เม็ด`} className="flex flex-col gap-[6px] rounded-[20px] bg-(--tablet-foil) px-[10px] py-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,.9),inset_0_-2px_6px_rgba(103,68,84,.08)]">
      {[0, 1, 2].map((r) => (
        <div key={r} role="row" className="flex items-center gap-1">
          <div className="grid flex-1 grid-cols-5 gap-1">
            {[0, 1, 2, 3, 4].map((c) => {
              const i = snakeIndex(r, c);
              const st = tabletState(pack, i, next);
              return (
                <button
                  key={c}
                  type="button"
                  role="gridcell"
                  aria-label={`เม็ดที่ ${i + 1} ${LABELS[st]}`}
                  onClick={() => onPress(i)}
                  className="group flex min-h-16 cursor-pointer flex-col items-center gap-[3px] border-0 bg-transparent px-0 py-1"
                >
                  <Pill st={st} />
                  <span className={cx("text-[12px] leading-[16px] font-extrabold", st === "next" ? "text-(--action-primary)" : "text-(--text-secondary)")}>{i + 1}</span>
                </button>
              );
            })}
          </div>
          <span className="flex w-5 justify-center text-(--text-disabled)" aria-hidden="true">
            <Icon name={r === 1 ? "left" : "right"} size={16} stroke={2.4} />
          </span>
        </div>
      ))}
    </div>
  );
}

function Pill({ st }: { st: TabletState }) {
  const base = "flex h-[46px] w-[46px] items-center justify-center rounded-full transition-all duration-[240ms] ease-(--ease-out) group-active:scale-[.96]";
  if (st === "taken")
    return (
      <span className={cx(base, "border-[1.5px] border-dashed border-(--taken-dash) bg-(--dose-taken-bg) text-(--dose-taken-fg) shadow-[inset_0_2px_4px_rgba(44,118,81,.15)]")}>
        <Icon name="check" size={18} stroke={3} />
      </span>
    );
  if (st === "removed")
    return (
      <span className={cx(base, "border-[1.5px] border-dashed border-(--removed-dash) bg-(--dose-missed-bg) text-(--dose-missed-fg) shadow-[inset_0_2px_4px_rgba(94,76,184,.12)]")}>
        <Icon name="minus" size={18} stroke={3} />
      </span>
    );
  return (
    <span
      className={base}
      style={{
        background: "var(--pill-gradient)",
        boxShadow:
          st === "next"
            ? "0 0 0 3px var(--tablet-next), 0 0 0 7px rgba(244,127,167,.25), 0 3px 6px rgba(103,68,84,.18)"
            : "0 3px 6px rgba(103,68,84,.18), inset 0 -2px 3px rgba(103,68,84,.08)",
      }}
    />
  );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useMomo, left, nextIdx } from "./store";
import { useUI } from "./ui";

/** Current time, refreshed every 30 s and when the app returns to the foreground. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs]);
  return now;
}

/** True once the persisted store has rehydrated from localStorage (always false during static prerender). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useMomo.persist.onFinishHydration(cb),
    () => useMomo.persist.hasHydrated(),
    () => false,
  );
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

/** Home / History “บันทึกว่ากินยาแล้ว”: open the sheet on the next tablet of the active pack, else any pack. */
export function useQuickConfirm() {
  const router = useRouter();
  return () => {
    const s = useMomo.getState();
    const ui = useUI.getState();
    const p = s.packs.find((x) => x.id === s.activePackId && left(x) > 0) ?? s.packs.find((x) => left(x) > 0);
    if (!p) {
      ui.showToast("ไม่มีเม็ดยาในแผงแล้ว เปิดกล่องใหม่ก่อนนะ", "nostock");
      router.push("/inventory/");
      return;
    }
    s.setActivePack(p.id);
    ui.openSheet({ packId: p.id, index: nextIdx(p) });
  };
}

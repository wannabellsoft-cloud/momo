"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useHydrated } from "@/lib/hooks";
import { useMomo } from "@/lib/store";
import { DoseSheet } from "./DoseSheet";
import { Banner, BottomNav, Toast } from "./Overlays";
import { ReminderEngine } from "./ReminderEngine";
import { SaveError } from "./SaveError";
import { SoundLayer } from "./SoundLayer";
import { Welcome } from "./Welcome";

function useSystemDark() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-color-scheme: dark)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );
}

/** Applies theme + reduce-motion to <html>, gates on hydration/onboarding, and hosts global overlays. */
export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const onboarded = useMomo((s) => s.onboarded);
  const theme = useMomo((s) => s.settings.theme);
  const reduce = useMomo((s) => s.settings.reduceMotion);
  const systemDark = useSystemDark();
  const path = usePathname() || "/";

  const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
  useEffect(() => {
    if (!hydrated) return;
    const html = document.documentElement;
    html.dataset.theme = resolved;
    html.dataset.reduceMotion = String(reduce);
    try {
      localStorage.setItem("momo:theme", resolved);
    } catch {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#22181D" : "#FFF8F2");
  }, [hydrated, resolved, reduce]);

  if (!hydrated) return <div className="min-h-dvh bg-(--bg-app)" />;
  if (!onboarded)
    return (
      <>
        <Welcome />
        <Toast />
        <SoundLayer />
      </>
    );

  const showNav = !path.startsWith("/inventory/open-box");
  return (
    <>
      <main className="mx-auto min-h-dvh max-w-[480px] px-5" style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 120px)" }}>
        {children}
      </main>
      {showNav && <BottomNav />}
      <Banner />
      <Toast />
      <DoseSheet />
      <SaveError />
      <ReminderEngine />
      <SoundLayer />
    </>
  );
}

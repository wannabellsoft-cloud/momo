"use client";

import { useEffect } from "react";
import { audioReady, availableClips, greetingLine, playGreeting, playUi, type UiSound } from "@/lib/sound";
import { startMusic, stopMusic } from "@/lib/music";
import { isNight } from "@/lib/date";
import { useMomo } from "@/lib/store";
import { useUI } from "@/lib/ui";

const GREETED = "momo:greeted";

/** Cute tap sounds for every control (opt out per element with data-sound="none"),
    and Momo's hello once per app launch — right away if the browser allows audio,
    otherwise on the first tap (iOS requires a gesture). */
export function SoundLayer() {
  useEffect(() => {
    void availableClips(); // know early whether recorded clips exist
    let pendingGreeting = false;
    const greet = () => {
      pendingGreeting = false;
      try {
        sessionStorage.setItem(GREETED, "1");
      } catch {}
      playGreeting();
      useUI.getState().setGreet(greetingLine());
    };

    const s = useMomo.getState();
    let greeted = false;
    try {
      greeted = sessionStorage.getItem(GREETED) === "1";
    } catch {}
    if (s.onboarded && s.settings.greeting && !greeted) {
      pendingGreeting = true;
      void audioReady().then((ok) => {
        if (ok && pendingGreeting) greet();
      });
    }

    // Background music: needs a first tap (unlocked), follows the setting and app visibility.
    let unlocked = false;
    const syncMusic = () => {
      const { music, musicTrack } = useMomo.getState().settings;
      const on = unlocked && music && document.visibilityState === "visible";
      if (on) startMusic(musicTrack === "time" ? (isNight(new Date()) ? "lullaby" : "box") : musicTrack);
      else stopMusic();
    };
    void audioReady().then((ok) => {
      unlocked ||= ok;
      syncMusic();
    });
    const unsubMusic = useMomo.subscribe((st, prev) => {
      if (st.settings.music !== prev.settings.music || st.settings.musicTrack !== prev.settings.musicTrack) syncMusic();
    });
    document.addEventListener("visibilitychange", syncMusic);

    const onDown = (e: PointerEvent) => {
      if (!unlocked) {
        unlocked = true;
        setTimeout(syncMusic, 0);
      }
      const settings = useMomo.getState().settings;
      if (pendingGreeting) {
        greet();
        return;
      }
      if (!settings.uiSounds) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>("button, a, input, [role=switch], [role=radio]");
      if (!el || (el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true") return;
      const tagged = el.closest<HTMLElement>("[data-sound]")?.dataset.sound;
      if (tagged === "none") return;
      const role = el.getAttribute("role");
      const kind: UiSound =
        (tagged as UiSound) || (role === "switch" || role === "radio" || role === "tab" ? "toggle" : el.getAttribute("aria-label") === "กลับ" ? "back" : "tap");
      playUi(kind);
    };
    document.addEventListener("pointerdown", onDown, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", onDown, { capture: true });
      document.removeEventListener("visibilitychange", syncMusic);
      unsubMusic();
      stopMusic();
    };
  }, []);
  return null;
}

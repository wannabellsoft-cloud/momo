"use client";

import { create } from "zustand";
import type { MomoState } from "@/components/momo/MomoBunny";
import type { TabletRef } from "./store";

export type BannerKind = "remind" | "follow" | "bedtime" | "test";
type Banner = { title: string; body: string; kind: BannerKind };

type UI = {
  sheet: TabletRef | null;
  toast: { text: string; momo: MomoState; key: number } | null;
  banner: (Banner & { key: number }) | null;
  saveError: boolean;
  /** Bumped when Momo greets on launch — Home makes Momo wave and say the line. */
  greet: { line: string; key: number } | null;
  setGreet: (line: string) => void;
  setSaveError: (v: boolean) => void;
  openSheet: (ref: TabletRef) => void;
  closeSheet: () => void;
  showToast: (text: string, momo?: MomoState) => void;
  hideToast: () => void;
  showBanner: (b: Banner) => void;
  hideBanner: () => void;
};

export const useUI = create<UI>()((set) => ({
  sheet: null,
  toast: null,
  banner: null,
  saveError: false,
  greet: null,
  setGreet: (line) => set({ greet: { line, key: Date.now() } }),
  setSaveError: (saveError) => set({ saveError }),
  openSheet: (sheet) => set({ sheet }),
  closeSheet: () => set({ sheet: null }),
  showToast: (text, momo = "taken") => set({ toast: { text, momo, key: Date.now() } }),
  hideToast: () => set({ toast: null }),
  showBanner: (b) => set({ banner: { ...b, key: Date.now() } }),
  hideBanner: () => set({ banner: null }),
}));

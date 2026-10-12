"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addDays, dayKey, isoAt, nowIso } from "./date";
import { useUI } from "./ui";

/* ─── Domain constants ─────────────────────────────────────────────────── */
export const MED = { name: "Pristiq 50 mg", generic: "Desvenlafaxine" } as const;
export const TABLETS_PER_PACK = 15;
export const PACKS_PER_BOX = 2;
export const TABLETS_PER_BOX = TABLETS_PER_PACK * PACKS_PER_BOX;
export const LOW_THRESHOLD = 7;
export const SUPPLY_WARN_DAYS = 14;

export type LocationId = "bedroom" | "work" | "bag";
export const LOCS: Record<LocationId, string> = { bedroom: "ห้องนอน", work: "ห้องทำงาน", bag: "กระเป๋า" };
export const LOC_KEYS: LocationId[] = ["bedroom", "work", "bag"];

/* ─── Data model (HANDOFF §2) ───────────────────────────────────────────
   Medication consumption (Dose) and physical tablet removal (Tablet.removed) are
   separate records. Tablet index 0–14 is the snake order. */
export type TabletRef = { packId: string; index: number };
export type Tablet = { removed: boolean; removedAt?: string; doseId?: string };
export type Pack = { id: string; label: string; location: LocationId; tablets: Tablet[]; openedAt: string };
export type Dose = {
  id: string;
  date: string; // YYYY-MM-DD local
  time: string | null; // HH:mm, null when backfilled without a time
  takenAt: string | null;
  tablets: TabletRef[];
  source: "tablet" | "backfill";
};
export type InventoryTx = { id: string; at: string; kind: "add_box" | "remove_box" | "open_box"; delta: number; text: string; packIds?: string[] };
export type AuditEntry = { id: string; at: string; text: string };
export type FollowUp = 0 | 15 | 30 | 60;
export type Settings = {
  remind: string; // HH:mm
  qty: number; // tablets per dose, as prescribed
  follow: FollowUp;
  maxFollowUps: number;
  privacy: boolean; // hide drug name on lock screen
  bedtime: boolean;
  bedTime: string;
  call: string; // Momo is made for Praewa: always "แพรวา" (no longer user-editable)
  voice: "sweet" | "plain";
  tone: "sparkle" | "bubble" | "hop" | "off"; // notification tone (in-app); see lib/sound.ts
  uiSounds: boolean; // cute sounds on taps
  greeting: boolean; // Momo says hello when the app opens
  music: boolean; // gentle background music while the app is open
  musicTrack: "box" | "lullaby" | "time"; // "time": music box by day, lullaby at night
  seenLevel: number; // Momo level already announced (0 = not yet), see lib/exp.ts
  ttsVoice: string | null; // device voice name; null = best female Thai voice
  ttsPitch: "normal" | "cute" | "tiny";
  reduceMotion: boolean;
  storageMode: "separate" | "combined";
  theme: "time" | "system" | "light" | "dark"; // "time": night theme 18:00–06:00
};

export type MomoData = {
  version: 1;
  onboarded: boolean;
  demo: boolean;
  trackingSince: string;
  packs: Pack[];
  packCounter: number;
  activePackId: string | null;
  reserve: number;
  doses: Record<string, Dose>; // one dose per day (single daily schedule)
  inventoryLog: InventoryTx[];
  audit: AuditEntry[];
  settings: Settings;
};

export const DEFAULT_SETTINGS: Settings = {
  remind: "08:00",
  qty: 1,
  follow: 30,
  maxFollowUps: 2,
  privacy: true,
  bedtime: false,
  bedTime: "22:30",
  call: "แพรวา",
  voice: "sweet",
  tone: "sparkle",
  uiSounds: true,
  greeting: true,
  music: true,
  musicTrack: "lullaby",
  seenLevel: 0,
  ttsVoice: null,
  ttsPitch: "cute",
  reduceMotion: false,
  storageMode: "separate",
  theme: "time",
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const packLabel = (n: number) => (n < 26 ? String.fromCharCode(65 + n) : String.fromCharCode(65 + Math.floor(n / 26) - 1) + String.fromCharCode(65 + (n % 26)));
export const left = (p: Pack) => p.tablets.filter((t) => !t.removed).length;
export const nextIdx = (p: Pack) => p.tablets.findIndex((t) => !t.removed);
/** Grid position of snake index i → row, col (row 2 runs right→left). */
export const snakePos = (i: number) => {
  const row = Math.floor(i / 5);
  return { row, col: row % 2 === 0 ? i % 5 : 4 - (i % 5) };
};
/** Snake index at grid row/col. */
export const snakeIndex = (row: number, col: number) => row * 5 + (row % 2 === 0 ? col : 4 - col);

function newPack(n: number, location: LocationId, at: string, used = 0): Pack {
  return { id: uid(), label: packLabel(n), location, openedAt: at, tablets: Array.from({ length: TABLETS_PER_PACK }, (_, i) => ({ removed: i < used, removedAt: i < used ? at : undefined })) };
}

function emptyData(): MomoData {
  return {
    version: 1,
    onboarded: false,
    demo: false,
    trackingSince: dayKey(new Date()),
    packs: [],
    packCounter: 0,
    activePackId: null,
    reserve: 0,
    doses: {},
    inventoryLog: [],
    audit: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Sample data relative to today (HANDOFF §6): Pack A 5 left, Pack B 1 left, 1 reserve box, one unrecorded day. */
export function demoData(settings: Settings = DEFAULT_SETTINGS): MomoData {
  const today = new Date();
  const start = addDays(today, -26);
  const openedAt = isoAt(dayKey(start), "08:10");
  const A = newPack(0, "bedroom", openedAt);
  const B = newPack(1, "work", openedAt);
  const doses: Record<string, Dose> = {};
  const times = ["08:12", "08:05", "08:31", "08:02", "08:20", "09:10", "08:14", "08:03", "08:40", "08:09", "08:18", "08:07", "08:25"];
  // Pack B (workspace) was used first: 14 tablets on days −25…−12.
  // Pack A (bedroom) after: 10 tablets on days −11…−1, with day −5 left unrecorded.
  const plan: { offset: number; pack: Pack; idx: number }[] = [];
  for (let k = 0; k < 14; k++) plan.push({ offset: -25 + k, pack: B, idx: k });
  let a = 0;
  for (let off = -11; off <= -1; off++) if (off !== -5) plan.push({ offset: off, pack: A, idx: a++ });
  plan.forEach(({ offset, pack, idx }, i) => {
    const date = dayKey(addDays(today, offset));
    const time = times[i % times.length];
    const takenAt = isoAt(date, time);
    const id = uid();
    pack.tablets[idx] = { removed: true, removedAt: takenAt, doseId: id };
    doses[date] = { id, date, time, takenAt, tablets: [{ packId: pack.id, index: idx }], source: "tablet" };
  });
  return {
    ...emptyData(),
    onboarded: true,
    demo: true,
    trackingSince: dayKey(addDays(today, -25)),
    packs: [A, B],
    packCounter: 2,
    activePackId: A.id,
    reserve: 1,
    doses,
    inventoryLog: [
      { id: uid(), at: openedAt, kind: "open_box", delta: -1, text: "เปิดกล่องใหม่ → แผง A, B", packIds: [A.id, B.id] },
      { id: uid(), at: isoAt(dayKey(addDays(start, -3)), "18:40"), kind: "add_box", delta: 2, text: "ซื้อยาเพิ่ม" },
    ],
    settings: { ...settings },
  };
}

/* ─── Store ────────────────────────────────────────────────────────────── */
export type ActionResult = { ok: true } | { ok: false; reason: "already_taken" | "no_tablet" | "no_reserve" };

type Actions = {
  completeOnboarding: (withDemo: boolean) => void;
  loadDemo: () => void;
  resetAll: () => void;
  setActivePack: (id: string) => void;
  cyclePackLocation: (id: string) => void;
  setStorageMode: (mode: Settings["storageMode"]) => void;
  recordDose: (ref: TabletRef, time: string) => ActionResult;
  removeOnly: (ref: TabletRef) => void;
  restoreTablet: (ref: TabletRef) => void;
  unDose: (ref: TabletRef) => void;
  backfill: (date: string) => ActionResult;
  changeReserve: (delta: 1 | -1) => void;
  openBox: (locs: [LocationId, LocationId]) => ActionResult;
  updateSettings: (patch: Partial<Settings>) => void;
};

export type MomoStore = MomoData & Actions;

const packName = (s: MomoData, id: string) => s.packs.find((p) => p.id === id)?.label ?? "?";
const audit = (text: string): AuditEntry => ({ id: uid(), at: nowIso(), text });
const tx = (kind: InventoryTx["kind"], delta: number, text: string, packIds?: string[]): InventoryTx => ({ id: uid(), at: nowIso(), kind, delta, text, packIds });

function clonePacks(packs: Pack[]) {
  return packs.map((p) => ({ ...p, tablets: p.tablets.map((t) => ({ ...t })) }));
}

/** Selected tablet first, then the next ones in snake order (same pack, then other packs) for multi-tablet doses. */
function pickTablets(packs: Pack[], ref: TabletRef, qty: number): TabletRef[] {
  const out: TabletRef[] = [ref];
  const ordered = [packs.find((p) => p.id === ref.packId)!, ...packs.filter((p) => p.id !== ref.packId)];
  for (const p of ordered) {
    for (let i = 0; i < p.tablets.length && out.length < qty; i++) {
      if (!p.tablets[i].removed && !(p.id === ref.packId && i === ref.index)) out.push({ packId: p.id, index: i });
    }
  }
  return out;
}

/** Detach a dose from all of its tablets; they stay physically removed, now "removed only". */
function dropDose(s: { packs: Pack[]; doses: Record<string, Dose> }, dose: Dose) {
  for (const r of dose.tablets) {
    const t = s.packs.find((p) => p.id === r.packId)?.tablets[r.index];
    if (t && t.doseId === dose.id) delete t.doseId;
  }
  delete s.doses[dose.date];
}

const findDoseById = (doses: Record<string, Dose>, id?: string) => (id ? Object.values(doses).find((d) => d.id === id) : undefined);

/** localStorage that reports failed writes (quota, private mode) instead of throwing. Data in memory is kept. */
const safeStorage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
      if (useUI.getState().saveError) useUI.getState().setSaveError(false);
    } catch {
      useUI.getState().setSaveError(true);
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

export const useMomo = create<MomoStore>()(
  persist(
    (set, get) => ({
      ...emptyData(),

      completeOnboarding: (withDemo) => {
        if (withDemo) set({ ...demoData(get().settings) });
        else set({ onboarded: true, trackingSince: dayKey(new Date()) });
      },
      loadDemo: () => set({ ...demoData(get().settings) }),
      resetAll: () => set({ ...emptyData(), onboarded: true, settings: get().settings }),

      setActivePack: (id) => set({ activePackId: id }),

      cyclePackLocation: (id) =>
        set((s) => {
          const p = s.packs.find((x) => x.id === id);
          if (!p) return {};
          const nl = LOC_KEYS[(LOC_KEYS.indexOf(p.location) + 1) % LOC_KEYS.length];
          const combined = s.settings.storageMode === "combined";
          return {
            packs: s.packs.map((x) => (x.id === id || (combined && left(x) > 0) ? { ...x, location: nl } : x)),
            audit: [audit(combined ? `ย้ายทุกแผงไป${LOCS[nl]}` : `ย้ายแผง ${p.label} ไป${LOCS[nl]}`), ...s.audit],
          };
        }),

      setStorageMode: (mode) =>
        set((s) => {
          if (mode === "separate") return { settings: { ...s.settings, storageMode: mode } };
          const loc = s.packs.find((p) => p.id === s.activePackId)?.location ?? "bedroom";
          return {
            settings: { ...s.settings, storageMode: mode },
            packs: s.packs.map((p) => (left(p) > 0 ? { ...p, location: loc } : p)),
            audit: [audit(`รวมแผงไว้ที่${LOCS[loc]}`), ...s.audit],
          };
        }),

      recordDose: (ref, time) => {
        const s = get();
        const today = dayKey(new Date());
        if (s.doses[today]) return { ok: false, reason: "already_taken" };
        const packs = clonePacks(s.packs);
        const target = packs.find((p) => p.id === ref.packId)?.tablets[ref.index];
        if (!target || target.removed) return { ok: false, reason: "no_tablet" };
        const refs = pickTablets(packs, ref, Math.max(1, s.settings.qty));
        const id = uid();
        const takenAt = isoAt(today, time);
        for (const r of refs) packs.find((p) => p.id === r.packId)!.tablets[r.index] = { removed: true, removedAt: takenAt, doseId: id };
        const label = refs.map((r) => `แผง ${packName(s, r.packId)} เม็ดที่ ${r.index + 1}`).join(", ");
        set({
          packs,
          activePackId: ref.packId,
          doses: { ...s.doses, [today]: { id, date: today, time, takenAt, tablets: refs, source: "tablet" } },
          audit: [audit(`กินยา · ${label}`), ...s.audit],
        });
        return { ok: true };
      },

      removeOnly: (ref) =>
        set((s) => {
          const packs = clonePacks(s.packs);
          const t = packs.find((p) => p.id === ref.packId)?.tablets[ref.index];
          if (!t || t.removed) return {};
          Object.assign(t, { removed: true, removedAt: nowIso(), doseId: undefined });
          return { packs, activePackId: ref.packId, audit: [audit(`แกะเม็ดออก (ไม่นับว่ากิน) · แผง ${packName(s, ref.packId)} เม็ดที่ ${ref.index + 1}`), ...s.audit] };
        }),

      // Restoring a tablet linked to today's dose also removes that dose. Older doses stay intact.
      restoreTablet: (ref) =>
        set((s) => {
          const packs = clonePacks(s.packs);
          const doses = structuredClone(s.doses);
          const t = packs.find((p) => p.id === ref.packId)?.tablets[ref.index];
          if (!t || !t.removed) return {};
          const dose = findDoseById(doses, t.doseId);
          const today = dayKey(new Date());
          const cancelsToday = !!dose && dose.date === today;
          if (dose) {
            if (cancelsToday) dropDose({ packs, doses }, dose);
            else dose.tablets = dose.tablets.filter((r) => !(r.packId === ref.packId && r.index === ref.index));
          }
          packs.find((p) => p.id === ref.packId)!.tablets[ref.index] = { removed: false };
          return {
            packs,
            doses,
            audit: [audit(`แก้ไข: คืนเม็ดที่ ${ref.index + 1} เข้าแผง ${packName(s, ref.packId)}${cancelsToday ? " และยกเลิกบันทึกวันนี้" : ""}`), ...s.audit],
          };
        }),

      // "Removed but not taken": the tablet stays out; the dose it belonged to is withdrawn.
      unDose: (ref) =>
        set((s) => {
          const packs = clonePacks(s.packs);
          const doses = structuredClone(s.doses);
          const t = packs.find((p) => p.id === ref.packId)?.tablets[ref.index];
          if (!t || !t.doseId) return {};
          const dose = findDoseById(doses, t.doseId);
          if (dose) dropDose({ packs, doses }, dose);
          delete t.doseId;
          return { packs, doses, audit: [audit(`แก้ไข: เม็ดที่ ${ref.index + 1} แกะออกแต่ไม่ได้กิน`), ...s.audit] };
        }),

      backfill: (date) => {
        const s = get();
        if (s.doses[date]) return { ok: false, reason: "already_taken" };
        set({
          doses: { ...s.doses, [date]: { id: uid(), date, time: null, takenAt: null, tablets: [], source: "backfill" } },
          audit: [audit(`บันทึกย้อนหลัง · ${date} (ไม่ระบุเวลา ไม่ผูกกับเม็ดยา)`), ...s.audit],
        });
        return { ok: true };
      },

      changeReserve: (delta) =>
        set((s) => {
          const r = Math.max(0, s.reserve + delta);
          if (r === s.reserve) return {};
          return {
            reserve: r,
            inventoryLog: [tx(delta > 0 ? "add_box" : "remove_box", delta, delta > 0 ? "เพิ่มกล่องสำรอง" : "ลดกล่องสำรอง (แก้ไขจำนวน)"), ...s.inventoryLog],
          };
        }),

      openBox: (locs) => {
        const s = get();
        if (s.reserve < 1) return { ok: false, reason: "no_reserve" };
        const at = nowIso();
        const combined = s.settings.storageMode === "combined";
        const a = newPack(s.packCounter, locs[0], at);
        const b = newPack(s.packCounter + 1, combined ? locs[0] : locs[1], at);
        set({
          reserve: s.reserve - 1,
          packs: [...s.packs, a, b],
          packCounter: s.packCounter + 2,
          activePackId: a.id,
          inventoryLog: [tx("open_box", -1, `เปิดกล่องใหม่ → แผง ${a.label}, ${b.label}`, [a.id, b.id]), ...s.inventoryLog],
        });
        return { ok: true };
      },

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "momo:v1",
      version: 2,
      // v2: the night theme follows the clock by default
      migrate: (state, version) => {
        const st = state as Partial<MomoData>;
        if (version < 2 && st.settings && st.settings.theme === "system") st.settings.theme = "time";
        return st as MomoStore;
      },
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { completeOnboarding, loadDemo, resetAll, setActivePack, cyclePackLocation, setStorageMode, recordDose, removeOnly, restoreTablet, unDose, backfill, changeReserve, openBox, updateSettings, ...data } = s;
        return data;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<MomoData>;
        const settings = { ...DEFAULT_SETTINGS, ...(p.settings ?? {}), call: "แพรวา" };
        // older tone names
        const legacy = settings.tone as string;
        if (legacy === "bell") settings.tone = "sparkle";
        if (legacy === "pop") settings.tone = "bubble";
        return { ...current, ...p, settings };
      },
    },
  ),
);


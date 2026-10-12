import { createECDH, createHash, createHmac } from "node:crypto";
import { Client, Receiver } from "@upstash/qstash";
import webpush from "web-push";

/* Web Push for Momo — reminders that arrive even when the app is closed (iOS 16.4+ Home Screen app).
   No database: QStash keeps one daily schedule per reminder, and each schedule carries the device's
   push subscription and the notification text in its body. Schedule ids are derived from the
   subscription, so syncing again simply overwrites them.

     momo-<id>-remind    daily at the reminder time        → push "remind"
     momo-<id>-f1, -f2   daily follow-ups                  → push "follow"
     momo-<id>-bed       optional bedtime note             → push "bedtime"
     momo-<id>-reset     daily at 00:00                    → resume remind + follow-ups

   Recording a dose pauses remind + follow-ups for the rest of the day; the midnight reset resumes them.
   VAPID keys are derived from QSTASH_TOKEN (or VAPID_PRIVATE_KEY if set), so no extra secret is needed. */

export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };
export type Copy = { title: string; body: string };
export type SyncBody = {
  subscription: PushSub;
  tz: string;
  remind: string; // HH:mm
  follow: number; // minutes, 0 = off
  maxFollowUps: number;
  bedtime: boolean;
  bedTime: string;
  copy: { remind: Copy; follow: Copy; bedtime: Copy };
  takenToday: boolean;
};
type FireBody = { kind: "remind" | "follow" | "bedtime" | "reset"; subscription: PushSub; copy?: Copy; id: string };

const PUSH_HOSTS = [/\.push\.apple\.com$/, /(^|\.)fcm\.googleapis\.com$/, /\.push\.services\.mozilla\.com$/, /\.notify\.windows\.com$/];

/** QSTASH_* variables — also when an integration added them under another name, e.g. UPSTASH_QSTASH_TOKEN,
    STORAGE_QSTASH_TOKEN or QSTASH_QSTASH_TOKEN. */
function env(name: string) {
  if (process.env[name]) return process.env[name];
  const keys = Object.keys(process.env).filter((k) => process.env[k]);
  const key = keys.find((k) => k.endsWith(`_${name}`)) ?? keys.find((k) => k.includes("QSTASH") && k.endsWith(name.replace(/^QSTASH_/, "_")));
  return key ? process.env[key] : undefined;
}

/** Names (never values) of QStash-looking variables, to debug the setup from /api/push/key/. */
export const qstashVarNames = () => Object.keys(process.env).filter((k) => /QSTASH|UPSTASH/i.test(k)).sort();

export const enabled = () => !!env("QSTASH_TOKEN");

function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let vapid: { publicKey: string; privateKey: string } | null = null;
export function vapidKeys() {
  if (vapid) return vapid;
  if (process.env.VAPID_PRIVATE_KEY && process.env.VAPID_PUBLIC_KEY) return (vapid = { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY });
  let priv = createHmac("sha256", env("QSTASH_TOKEN") ?? "").update("momo-vapid-v1").digest();
  const ecdh = createECDH("prime256v1");
  for (let i = 0; ; i++) {
    try {
      ecdh.setPrivateKey(priv);
      break;
    } catch {
      priv = createHash("sha256").update(priv).update(String(i)).digest(); // practically never needed
    }
  }
  return (vapid = { publicKey: b64url(ecdh.getPublicKey()), privateKey: b64url(priv) });
}

export const subId = (endpoint: string) => createHash("sha256").update(endpoint).digest("hex").slice(0, 20);

export function validSubscription(s: unknown): s is PushSub {
  const x = s as PushSub;
  try {
    return !!x?.keys?.p256dh && !!x.keys.auth && PUSH_HOSTS.some((r) => r.test(new URL(x.endpoint).hostname));
  } catch {
    return false;
  }
}

function qstash() {
  return new Client({ token: env("QSTASH_TOKEN")!, baseUrl: env("QSTASH_URL") || undefined });
}

const cronAt = (tz: string, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `CRON_TZ=${tz} ${m} ${h} * * *`;
};
const addMin = (hhmm: string, add: number) => {
  const [h, m] = hhmm.split(":").map(Number);
  const t = h * 60 + m + add;
  return t >= 1440 ? null : `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; // same day only, like the in-app engine
};
const DOSE_IDS = (id: string) => [`momo-${id}-remind`, `momo-${id}-f1`, `momo-${id}-f2`];

async function quiet<T>(p: Promise<T>) {
  try {
    return await p;
  } catch {
    return undefined;
  }
}

/** Create/overwrite this device's schedules from its current settings. */
export async function sync(b: SyncBody, origin: string) {
  const q = qstash();
  const id = subId(b.subscription.endpoint);
  const dest = `${origin}/api/push/fire/`;
  const tz = /^[A-Za-z_]+\/[A-Za-z_]+$/.test(b.tz) ? b.tz : "Asia/Bangkok";
  const put = (scheduleId: string, hhmm: string, body: FireBody) =>
    q.schedules.create({ scheduleId, destination: dest, cron: cronAt(tz, hhmm), body: JSON.stringify(body), headers: { "Content-Type": "application/json" }, retries: 2 });

  const jobs: Promise<unknown>[] = [put(`momo-${id}-remind`, b.remind, { kind: "remind", subscription: b.subscription, copy: b.copy.remind, id })];
  const follows = b.follow ? Array.from({ length: Math.min(2, b.maxFollowUps) }, (_, k) => addMin(b.remind, b.follow * (k + 1))) : [];
  for (let k = 0; k < 2; k++) {
    const t = follows[k];
    if (t) jobs.push(put(`momo-${id}-f${k + 1}`, t, { kind: "follow", subscription: b.subscription, copy: b.copy.follow, id }));
    else jobs.push(quiet(q.schedules.delete(`momo-${id}-f${k + 1}`)));
  }
  if (b.bedtime) jobs.push(put(`momo-${id}-bed`, b.bedTime, { kind: "bedtime", subscription: b.subscription, copy: b.copy.bedtime, id }));
  else jobs.push(quiet(q.schedules.delete(`momo-${id}-bed`)));
  jobs.push(put(`momo-${id}-reset`, "00:00", { kind: "reset", subscription: b.subscription, id }));
  await Promise.all(jobs);
  await setTaken(id, b.takenToday, follows.filter(Boolean).length);
  return id;
}

/** Dose recorded today → no more dose reminders today; undone → back on. */
export async function setTaken(id: string, taken: boolean, followCount = 2) {
  const q = qstash();
  const ids = DOSE_IDS(id).slice(0, 1 + followCount);
  await Promise.all(ids.map((s) => quiet(taken ? q.schedules.pause({ schedule: s }) : q.schedules.resume({ schedule: s }))));
}

export async function remove(id: string) {
  const q = qstash();
  await Promise.all([...DOSE_IDS(id), `momo-${id}-bed`, `momo-${id}-reset`].map((s) => quiet(q.schedules.delete(s))));
}

export async function verify(req: Request, body: string) {
  const r = new Receiver({ currentSigningKey: env("QSTASH_CURRENT_SIGNING_KEY")!, nextSigningKey: env("QSTASH_NEXT_SIGNING_KEY")! });
  const signature = req.headers.get("upstash-signature");
  if (!signature) return false;
  return r.verify({ signature, body }).catch(() => false);
}

export async function sendPush(sub: PushSub, payload: { title: string; body: string; kind: string }) {
  const k = vapidKeys();
  webpush.setVapidDetails("mailto:momo@example.com", k.publicKey, k.privateKey);
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 60 * 60, urgency: "high", topic: `momo-${payload.kind}` });
    return "ok" as const;
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    return code === 404 || code === 410 ? ("gone" as const) : ("error" as const);
  }
}

export async function fire(b: FireBody) {
  if (b.kind === "reset") return setTaken(b.id, false);
  if (!b.copy) return;
  const r = await sendPush(b.subscription, { ...b.copy, kind: b.kind });
  if (r === "gone") await remove(b.id); // the device unsubscribed — stop sending
}

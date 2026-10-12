import { enabled, sendPush, validSubscription, type PushSub } from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** "ลองส่งการแจ้งเตือน" through the real push path (server → Apple/Google → device). */
export async function POST(req: Request) {
  if (!enabled()) return Response.json({ enabled: false }, { status: 503 });
  const b = (await req.json().catch(() => null)) as { subscription?: PushSub; title?: string; body?: string } | null;
  if (!b || !validSubscription(b.subscription)) return Response.json({ error: "bad request" }, { status: 400 });
  const r = await sendPush(b.subscription, { title: String(b.title ?? "Momo").slice(0, 120), body: String(b.body ?? "").slice(0, 400), kind: "test" });
  return Response.json({ ok: r === "ok", result: r });
}

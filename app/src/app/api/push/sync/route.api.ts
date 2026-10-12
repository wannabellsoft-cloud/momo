import { enabled, sync, validSubscription, type SyncBody } from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HHMM = /^\d{2}:\d{2}$/;

/** Device → its reminder schedule (overwrites the previous one). */
export async function POST(req: Request) {
  if (!enabled()) return Response.json({ enabled: false }, { status: 503 });
  const b = (await req.json().catch(() => null)) as SyncBody | null;
  if (!b || !validSubscription(b.subscription) || !HHMM.test(b.remind) || !HHMM.test(b.bedTime) || !b.copy?.remind?.title) return Response.json({ error: "bad request" }, { status: 400 });
  const origin = new URL(req.url).origin;
  const id = await sync(b, origin);
  return Response.json({ ok: true, id });
}

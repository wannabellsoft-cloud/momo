import { enabled, remove, subId } from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stop all server reminders for this device. */
export async function POST(req: Request) {
  if (!enabled()) return Response.json({ enabled: false }, { status: 503 });
  const b = (await req.json().catch(() => null)) as { endpoint?: string } | null;
  if (!b?.endpoint) return Response.json({ error: "bad request" }, { status: 400 });
  await remove(subId(b.endpoint));
  return Response.json({ ok: true });
}

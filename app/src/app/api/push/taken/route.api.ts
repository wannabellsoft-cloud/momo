import { enabled, setTaken, subId } from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Dose recorded (taken: true) or undone (false) → pause / resume today's dose reminders. */
export async function POST(req: Request) {
  if (!enabled()) return Response.json({ enabled: false }, { status: 503 });
  const b = (await req.json().catch(() => null)) as { endpoint?: string; taken?: boolean } | null;
  if (!b?.endpoint) return Response.json({ error: "bad request" }, { status: 400 });
  await setTaken(subId(b.endpoint), !!b.taken);
  return Response.json({ ok: true });
}

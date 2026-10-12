import { fire, verify } from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Called by QStash on schedule (signed). Sends the push, or resumes reminders at midnight. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!(await verify(req, raw))) return new Response("bad signature", { status: 401 });
  await fire(JSON.parse(raw));
  return Response.json({ ok: true });
}

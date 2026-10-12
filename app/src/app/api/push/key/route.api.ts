import { enabled, vapidKeys } from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public VAPID key for pushManager.subscribe, or enabled:false when QStash isn't configured. */
export function GET() {
  if (!enabled()) return Response.json({ enabled: false });
  return Response.json({ enabled: true, publicKey: vapidKeys().publicKey });
}

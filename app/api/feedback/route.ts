import { NextRequest, NextResponse } from "next/server";
import { recordFeedback } from "@/lib/usage";

export const runtime = "nodejs";

/** Thumb feedback — stores counts + a structured log only. No message content. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "invalid JSON" }, { status: 400 }); }

  const r = body as Record<string, unknown>;
  const useful = r.useful === "up" || r.useful === "down" ? r.useful : null;
  if (!useful) return NextResponse.json({ error: "useful must be up or down" }, { status: 400 });

  const note =
    typeof r.note === "string" ? r.note.trim().slice(0, 280) : "";
  const risk =
    typeof r.risk_level === "string" ? r.risk_level.slice(0, 40) : null;

  recordFeedback(useful);
  console.log(
    JSON.stringify({
      evt: "scamscan_feedback",
      ts: new Date().toISOString(),
      useful,
      risk,
      note: note || null,
    })
  );

  return NextResponse.json({ ok: true });
}

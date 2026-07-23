import { NextRequest, NextResponse } from "next/server";
import { getStats } from "@/lib/usage";

export const runtime = "nodejs";

// Usage counters, protected by SCAMSCAN_STATS_TOKEN. Without the env var the
// endpoint doesn't exist as far as callers can tell.
export async function GET(req: NextRequest) {
  const token = process.env.SCAMSCAN_STATS_TOKEN;
  if (!token) return NextResponse.json({ error: "not found" }, { status: 404 });

  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    req.nextUrl.searchParams.get("token");
  if (provided !== token) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  return NextResponse.json(getStats());
}

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getWorkbookSnapshot } from "@/lib/excel";
import { getOwnedGiftIdsByTokenHash } from "@/lib/view-models";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const token = typeof payload?.token === "string" ? payload.token : "";
  if (!token) {
    return NextResponse.json({ error: "Token ausente." }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const snapshot = await getWorkbookSnapshot();
  const giftIds = getOwnedGiftIdsByTokenHash(snapshot, tokenHash);
  return NextResponse.json({ giftIds });
}

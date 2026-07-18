import { NextResponse } from "next/server";
import { isAdminCookieValueValid } from "@/lib/auth";
import { getRsvpList, saveRsvpEntry } from "@/lib/excel";
import { rsvpSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const session = request.headers.get("cookie")?.match(/wedding-admin-session=([^;]+)/)?.[1];
  if (!isAdminCookieValueValid(session)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const rsvp = await getRsvpList();
  return NextResponse.json(rsvp);
}

export async function POST(request: Request) {
  const payload = rsvpSchema.safeParse(await request.json().catch(() => ({})));
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  await saveRsvpEntry(payload.data);
  return NextResponse.json({ ok: true, message: "Sua confirmação foi registrada." });
}

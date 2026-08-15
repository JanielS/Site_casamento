import { NextResponse } from "next/server";
import { isAdminCookieValueValid } from "@/lib/auth";
import { deleteRsvpEntry } from "@/lib/excel";

export async function DELETE(request: Request) {
  const session = request.headers.get("cookie")?.match(/wedding-admin-session=([^;]+)/)?.[1];
  if (!isAdminCookieValueValid(session)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload?.id) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  await deleteRsvpEntry(payload.id);
  return NextResponse.json({ ok: true });
}

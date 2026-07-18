import { NextResponse } from "next/server";
import { isAdminCookieValueValid } from "@/lib/auth";
import { saveSiteSettings } from "@/lib/excel";
import { settingsSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const session = request.headers.get("cookie")?.match(/wedding-admin-session=([^;]+)/)?.[1];
  if (!isAdminCookieValueValid(session)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const payload = settingsSchema.safeParse(await request.json().catch(() => ({})));
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Configuracao invalida." }, { status: 400 });
  }

  await saveSiteSettings(payload.data);
  return NextResponse.json({ ok: true });
}

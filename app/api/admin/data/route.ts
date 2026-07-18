import { NextResponse } from "next/server";
import { isAdminCookieValueValid } from "@/lib/auth";
import { getWorkbookSnapshot } from "@/lib/excel";

export async function GET(request: Request) {
  const session = request.headers.get("cookie")?.match(/wedding-admin-session=([^;]+)/)?.[1];
  if (!isAdminCookieValueValid(session)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const snapshot = await getWorkbookSnapshot();
  return NextResponse.json(snapshot);
}

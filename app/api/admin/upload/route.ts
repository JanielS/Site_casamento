import { NextResponse } from "next/server";
import { isAdminCookieValueValid } from "@/lib/auth";
import { uploadGiftImage } from "@/lib/excel";

export async function POST(request: Request) {
  const session = request.headers.get("cookie")?.match(/wedding-admin-session=([^;]+)/)?.[1];
  if (!isAdminCookieValueValid(session)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const giftId = form.get("giftId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
  }

  const imagePath = await uploadGiftImage(file, typeof giftId === "string" ? giftId : undefined);
  return NextResponse.json({ imagePath });
}

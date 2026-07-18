import { NextResponse } from "next/server";
import { createGiftReservationToken, reserveGiftForToken } from "@/lib/excel";
import { reservationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = reservationSchema.safeParse(await request.json().catch(() => ({})));
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  try {
    await reserveGiftForToken(payload.data);
    return NextResponse.json({ ok: true, token: payload.data.token ?? createGiftReservationToken() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel reservar." },
      { status: 409 }
    );
  }
}

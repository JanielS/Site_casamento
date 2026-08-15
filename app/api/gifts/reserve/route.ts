import { NextResponse } from "next/server";
import { createGiftReservationToken, reserveGiftForTokenWithQuantity } from "@/lib/excel";
import { rateLimitRequest } from "@/lib/rate-limit";
import { reservationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimit = rateLimitRequest(request, "gift-reserve", 16, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante e tente novamente." }, { status: 429 });
  }

  const payload = reservationSchema.safeParse(await request.json().catch(() => ({})));
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  try {
    await reserveGiftForTokenWithQuantity(payload.data);
    return NextResponse.json({ ok: true, token: payload.data.token ?? createGiftReservationToken() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel reservar." },
      { status: 409 }
    );
  }
}

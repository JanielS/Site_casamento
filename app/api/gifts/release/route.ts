import { NextResponse } from "next/server";
import { releaseGiftReservation } from "@/lib/excel";
import { releaseSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = releaseSchema.safeParse(await request.json().catch(() => ({})));
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  try {
    await releaseGiftReservation(payload.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel liberar." },
      { status: 409 }
    );
  }
}

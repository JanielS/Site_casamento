import { NextResponse } from "next/server";
import { savePixContribution } from "@/lib/excel";
import { rateLimitRequest } from "@/lib/rate-limit";
import { pixContributionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimit = rateLimitRequest(request, "pix-contribution", 10, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um instante e tente novamente." },
      { status: 429 }
    );
  }

  const payload = pixContributionSchema.safeParse(await request.json().catch(() => ({})));
  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  await savePixContribution(payload.data);
  return NextResponse.json({ ok: true, message: "Sua contribuição via PIX foi registrada." });
}

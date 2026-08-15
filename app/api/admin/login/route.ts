import { NextResponse } from "next/server";
import { createAdminSessionValue, getAdminPassword } from "@/lib/auth";
import { rateLimitRequest } from "@/lib/rate-limit";
import { adminPasswordSchema } from "@/lib/validation";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: Request) {
  const rateLimit = rateLimitRequest(request, "admin-login", 10, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante e tente novamente." }, { status: 429 });
  }

  const payload = adminPasswordSchema.safeParse(await request.json().catch(() => ({})));
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Senha inválida." }, { status: 400 });
  }

  if (payload.data.password !== getAdminPassword()) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function createAdminSessionValue() {
  const payload = `${getAdminPassword()}:${getAdminSessionSecret()}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function isAdminSessionValid(value?: string | null) {
  if (!value) {
    return false;
  }

  return value === createAdminSessionValue();
}

export function isAdminCookieValueValid(value?: string | null) {
  return isAdminSessionValid(value);
}

export async function readAdminSession() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE_NAME)?.value ?? null;
}

export async function isAdminRequestAuthenticated() {
  return isAdminSessionValid(await readAdminSession());
}

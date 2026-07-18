import crypto from "node:crypto";

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createReservationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

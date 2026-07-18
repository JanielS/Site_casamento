import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import ExcelJS from "exceljs";
import {
  DATA_DIR,
  DEFAULT_GIFT_IMAGE,
  buildInitialGiftSeed,
  defaultSettings
} from "@/lib/constants";
import { createId, createReservationToken, hashToken } from "@/lib/crypto";
import { giftSchema, rsvpSchema, settingsSchema } from "@/lib/validation";
import type {
  GiftRecord,
  GiftReservationRecord,
  RSVPRecord,
  SiteSettings,
  WorkbookSnapshot
} from "@/lib/types";

const DATA_ROOT = process.env.VERCEL ? path.join(os.tmpdir(), DATA_DIR) : path.join(process.cwd(), DATA_DIR);
const DATA_PATH = path.join(DATA_ROOT, "wedding-data.xlsx");
const LOCK_PATH = `${DATA_PATH}.lock`;

const SHEETS = {
  settings: "settings",
  rsvp: "rsvp",
  gifts: "gifts",
  giftReservations: "gift_reservations"
} as const;

let queue = Promise.resolve();

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value === "true" || value === "1" || value.toLowerCase() === "sim";
  return false;
}

function toStringValue(value: unknown) {
  return value == null ? "" : String(value);
}

async function ensureBaseFolders() {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
}

async function createEmptyWorkbook(filePath: string) {
  const workbook = new ExcelJS.Workbook();
  const now = new Date().toISOString();
  const settings = workbook.addWorksheet(SHEETS.settings);
  settings.columns = [
    { header: "key", key: "key", width: 26 },
    { header: "value", key: "value", width: 80 }
  ];

  const settingsEntries: Array<[keyof SiteSettings, string]> = [
    ["coupleNames", defaultSettings.coupleNames],
    ["weddingDate", defaultSettings.weddingDate],
    ["churchMapsUrl", defaultSettings.churchMapsUrl],
    ["audioUrl", defaultSettings.audioUrl],
    ["videoUrl", defaultSettings.videoUrl],
    ["heroImageUrl", defaultSettings.heroImageUrl],
    ["confirmationImageUrl", defaultSettings.confirmationImageUrl],
    ["presentsImageUrl", defaultSettings.presentsImageUrl],
    ["siteTitle", defaultSettings.siteTitle],
    ["siteDescription", defaultSettings.siteDescription]
  ];

  settingsEntries.forEach(([key, value]) => settings.addRow({ key, value }));

  const rsvp = workbook.addWorksheet(SHEETS.rsvp);
  rsvp.columns = [
    { header: "id", key: "id", width: 36 },
    { header: "name", key: "name", width: 28 },
    { header: "willAttend", key: "willAttend", width: 14 },
    { header: "guestCount", key: "guestCount", width: 12 },
    { header: "createdAt", key: "createdAt", width: 22 },
    { header: "updatedAt", key: "updatedAt", width: 22 }
  ];

  const gifts = workbook.addWorksheet(SHEETS.gifts);
  gifts.columns = [
    { header: "id", key: "id", width: 36 },
    { header: "name", key: "name", width: 30 },
    { header: "imagePath", key: "imagePath", width: 45 },
    { header: "description", key: "description", width: 40 },
    { header: "sortOrder", key: "sortOrder", width: 12 },
    { header: "isActive", key: "isActive", width: 10 },
    { header: "createdAt", key: "createdAt", width: 22 },
    { header: "updatedAt", key: "updatedAt", width: 22 }
  ];

  buildInitialGiftSeed(now).forEach((gift) => gifts.addRow(gift));

  const reservations = workbook.addWorksheet(SHEETS.giftReservations);
  reservations.columns = [
    { header: "id", key: "id", width: 36 },
    { header: "giftId", key: "giftId", width: 36 },
    { header: "ownerTokenHash", key: "ownerTokenHash", width: 70 },
    { header: "createdAt", key: "createdAt", width: 22 },
    { header: "updatedAt", key: "updatedAt", width: 22 }
  ];

  await workbook.xlsx.writeFile(filePath);
}

async function ensureWorkbookFile() {
  await ensureBaseFolders();

  try {
    await fs.access(DATA_PATH);
  } catch {
    await createEmptyWorkbook(DATA_PATH);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(DATA_PATH);

  const settings = workbook.getWorksheet(SHEETS.settings) ?? workbook.addWorksheet(SHEETS.settings);
  const rsvp = workbook.getWorksheet(SHEETS.rsvp) ?? workbook.addWorksheet(SHEETS.rsvp);
  const gifts = workbook.getWorksheet(SHEETS.gifts) ?? workbook.addWorksheet(SHEETS.gifts);
  const reservations = workbook.getWorksheet(SHEETS.giftReservations) ?? workbook.addWorksheet(SHEETS.giftReservations);

  if (settings.rowCount === 0) {
    settings.columns = [
      { header: "key", key: "key", width: 26 },
      { header: "value", key: "value", width: 80 }
    ];
  }

  if (rsvp.rowCount === 0) {
    rsvp.columns = [
      { header: "id", key: "id", width: 36 },
      { header: "name", key: "name", width: 28 },
      { header: "willAttend", key: "willAttend", width: 14 },
      { header: "guestCount", key: "guestCount", width: 12 },
      { header: "createdAt", key: "createdAt", width: 22 },
      { header: "updatedAt", key: "updatedAt", width: 22 }
    ];
  }

  if (gifts.rowCount === 0) {
    gifts.columns = [
      { header: "id", key: "id", width: 36 },
      { header: "name", key: "name", width: 30 },
      { header: "imagePath", key: "imagePath", width: 45 },
      { header: "description", key: "description", width: 40 },
      { header: "sortOrder", key: "sortOrder", width: 12 },
      { header: "isActive", key: "isActive", width: 10 },
      { header: "createdAt", key: "createdAt", width: 22 },
      { header: "updatedAt", key: "updatedAt", width: 22 }
    ];
    buildInitialGiftSeed(new Date().toISOString()).forEach((gift) => gifts.addRow(gift));
  }

  if (reservations.rowCount === 0) {
    reservations.columns = [
      { header: "id", key: "id", width: 36 },
      { header: "giftId", key: "giftId", width: 36 },
      { header: "ownerTokenHash", key: "ownerTokenHash", width: 70 },
      { header: "createdAt", key: "createdAt", width: 22 },
      { header: "updatedAt", key: "updatedAt", width: 22 }
    ];
  }

  await workbook.xlsx.writeFile(DATA_PATH);
}

async function readWorkbookInternal(): Promise<WorkbookSnapshot> {
  await ensureWorkbookFile();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(DATA_PATH);

  const settingsSheet = workbook.getWorksheet(SHEETS.settings)!;
  const rsvpSheet = workbook.getWorksheet(SHEETS.rsvp)!;
  const giftsSheet = workbook.getWorksheet(SHEETS.gifts)!;
  const reservationsSheet = workbook.getWorksheet(SHEETS.giftReservations)!;

  const settingsEntries = settingsSheet.getRows(2, Math.max(settingsSheet.rowCount - 1, 0)) ?? [];
  const settingsMap = new Map<string, string>();
  settingsEntries.forEach((row) => {
    const key = toStringValue(row.getCell(1).value);
    const value = toStringValue(row.getCell(2).value);
    if (key) {
      settingsMap.set(key, value);
    }
  });

  const settings = settingsSchema.parse({
    coupleNames: settingsMap.get("coupleNames") ?? defaultSettings.coupleNames,
    weddingDate: settingsMap.get("weddingDate") ?? defaultSettings.weddingDate,
    churchMapsUrl: settingsMap.get("churchMapsUrl") ?? defaultSettings.churchMapsUrl,
    audioUrl: settingsMap.get("audioUrl") ?? defaultSettings.audioUrl,
    videoUrl: settingsMap.get("videoUrl") ?? defaultSettings.videoUrl,
    heroImageUrl: settingsMap.get("heroImageUrl") ?? defaultSettings.heroImageUrl,
    confirmationImageUrl: settingsMap.get("confirmationImageUrl") ?? defaultSettings.confirmationImageUrl,
    presentsImageUrl: settingsMap.get("presentsImageUrl") ?? defaultSettings.presentsImageUrl,
    siteTitle: settingsMap.get("siteTitle") ?? defaultSettings.siteTitle,
    siteDescription: settingsMap.get("siteDescription") ?? defaultSettings.siteDescription
  });

  const rsvpRows = rsvpSheet.getRows(2, Math.max(rsvpSheet.rowCount - 1, 0)) ?? [];
  const rsvp = rsvpRows
    .map<RSVPRecord>((row) => ({
      id: toStringValue(row.getCell(1).value),
      name: toStringValue(row.getCell(2).value),
      willAttend: normalizeBoolean(row.getCell(3).value),
      guestCount: Number(row.getCell(4).value ?? 0),
      createdAt: toStringValue(row.getCell(5).value),
      updatedAt: toStringValue(row.getCell(6).value)
    }))
    .filter((entry) => entry.id && entry.name);

  const giftsRows = giftsSheet.getRows(2, Math.max(giftsSheet.rowCount - 1, 0)) ?? [];
  const gifts = giftsRows
    .map<GiftRecord>((row) => ({
      id: toStringValue(row.getCell(1).value),
      name: toStringValue(row.getCell(2).value),
      imagePath: toStringValue(row.getCell(3).value) || DEFAULT_GIFT_IMAGE,
      description: toStringValue(row.getCell(4).value),
      sortOrder: Number(row.getCell(5).value ?? 0),
      isActive: normalizeBoolean(row.getCell(6).value),
      createdAt: toStringValue(row.getCell(7).value),
      updatedAt: toStringValue(row.getCell(8).value)
    }))
    .filter((gift) => gift.id && gift.name)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const reservationRows = reservationsSheet.getRows(2, Math.max(reservationsSheet.rowCount - 1, 0)) ?? [];
  const giftReservations = reservationRows
    .map<GiftReservationRecord>((row) => ({
      id: toStringValue(row.getCell(1).value),
      giftId: toStringValue(row.getCell(2).value),
      ownerTokenHash: toStringValue(row.getCell(3).value),
      createdAt: toStringValue(row.getCell(4).value),
      updatedAt: toStringValue(row.getCell(5).value)
    }))
    .filter((row) => row.id && row.giftId && row.ownerTokenHash);

  return {
    settings,
    rsvp,
    gifts,
    giftReservations
  };
}

async function writeWorkbookInternal(snapshot: WorkbookSnapshot) {
  await ensureBaseFolders();

  const workbook = new ExcelJS.Workbook();

  const settings = workbook.addWorksheet(SHEETS.settings);
  settings.columns = [
    { header: "key", key: "key", width: 26 },
    { header: "value", key: "value", width: 80 }
  ];
  Object.entries(snapshot.settings).forEach(([key, value]) => {
    settings.addRow({ key, value: String(value) });
  });

  const rsvp = workbook.addWorksheet(SHEETS.rsvp);
  rsvp.columns = [
    { header: "id", key: "id", width: 36 },
    { header: "name", key: "name", width: 28 },
    { header: "willAttend", key: "willAttend", width: 14 },
    { header: "guestCount", key: "guestCount", width: 12 },
    { header: "createdAt", key: "createdAt", width: 22 },
    { header: "updatedAt", key: "updatedAt", width: 22 }
  ];
  snapshot.rsvp.forEach((record) => rsvp.addRow(record));

  const gifts = workbook.addWorksheet(SHEETS.gifts);
  gifts.columns = [
    { header: "id", key: "id", width: 36 },
    { header: "name", key: "name", width: 30 },
    { header: "imagePath", key: "imagePath", width: 45 },
    { header: "description", key: "description", width: 40 },
    { header: "sortOrder", key: "sortOrder", width: 12 },
    { header: "isActive", key: "isActive", width: 10 },
    { header: "createdAt", key: "createdAt", width: 22 },
    { header: "updatedAt", key: "updatedAt", width: 22 }
  ];
  snapshot.gifts.forEach((record) => gifts.addRow(record));

  const reservations = workbook.addWorksheet(SHEETS.giftReservations);
  reservations.columns = [
    { header: "id", key: "id", width: 36 },
    { header: "giftId", key: "giftId", width: 36 },
    { header: "ownerTokenHash", key: "ownerTokenHash", width: 70 },
    { header: "createdAt", key: "createdAt", width: 22 },
    { header: "updatedAt", key: "updatedAt", width: 22 }
  ];
  snapshot.giftReservations.forEach((record) => reservations.addRow(record));

  const tempPath = `${DATA_PATH}.tmp`;
  await workbook.xlsx.writeFile(tempPath);
  await fs.rename(tempPath, DATA_PATH);
}

async function runExclusive<T>(task: () => Promise<T>): Promise<T> {
  const previous = queue;
  let release: () => void = () => {};
  queue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await task();
  } finally {
    release();
  }
}

export async function getWorkbookSnapshot() {
  return runExclusive(() => readWorkbookInternal());
}

export async function updateWorkbookSnapshot(
  updater: (snapshot: WorkbookSnapshot) => Promise<WorkbookSnapshot> | WorkbookSnapshot
) {
  return runExclusive(async () => {
    const snapshot = await readWorkbookInternal();
    const nextSnapshot = await updater(snapshot);
    await writeWorkbookInternal(nextSnapshot);
    return nextSnapshot;
  });
}

export async function getSiteSettings() {
  const snapshot = await getWorkbookSnapshot();
  return snapshot.settings;
}

export async function getGiftList() {
  const snapshot = await getWorkbookSnapshot();
  return snapshot.gifts;
}

export async function getRsvpList() {
  const snapshot = await getWorkbookSnapshot();
  return snapshot.rsvp;
}

export async function getReservationList() {
  const snapshot = await getWorkbookSnapshot();
  return snapshot.giftReservations;
}

export async function saveSiteSettings(nextSettings: SiteSettings) {
  return updateWorkbookSnapshot(async (snapshot) => ({
    ...snapshot,
    settings: settingsSchema.parse(nextSettings)
  }));
}

export async function saveRsvpEntry(input: {
  name: string;
  willAttend: boolean;
  guestCount: number;
}) {
  const parsed = rsvpSchema.parse(input);
  const now = new Date().toISOString();
  return updateWorkbookSnapshot(async (snapshot) => {
    const existing = snapshot.rsvp.find((entry) => entry.name.toLowerCase() === parsed.name.toLowerCase());
    const nextEntry: RSVPRecord = {
      id: existing?.id ?? createId("rsvp"),
      name: parsed.name,
      willAttend: parsed.willAttend,
      guestCount: parsed.guestCount,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    const rsvp = existing
      ? snapshot.rsvp.map((entry) => (entry.id === existing.id ? nextEntry : entry))
      : [...snapshot.rsvp, nextEntry];

    return {
      ...snapshot,
      rsvp
    };
  });
}

export async function exportRsvpRows() {
  const snapshot = await getWorkbookSnapshot();
  return snapshot.rsvp
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((record) => ({
      Nome: record.name,
      "Ira ao casamento?": record.willAttend ? "Sim" : "Nao",
      "Numero de pessoas": record.guestCount,
      "Data da resposta": record.createdAt,
      "Ultima atualizacao": record.updatedAt
    }));
}

export async function upsertGift(input: Partial<GiftRecord> & { name: string; sortOrder: number }) {
  const parsed = giftSchema.parse({
    ...input,
    imagePath: input.imagePath ?? "",
    description: input.description ?? "",
    isActive: input.isActive ?? true
  });
  const now = new Date().toISOString();

  return updateWorkbookSnapshot(async (snapshot) => {
    const existing = input.id ? snapshot.gifts.find((gift) => gift.id === input.id) : undefined;
    const record: GiftRecord = {
      id: existing?.id ?? createId("gift"),
      name: parsed.name,
      imagePath: parsed.imagePath || existing?.imagePath || DEFAULT_GIFT_IMAGE,
      description: parsed.description ?? "",
      sortOrder: parsed.sortOrder,
      isActive: parsed.isActive,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    const gifts = existing
      ? snapshot.gifts.map((gift) => (gift.id === existing.id ? record : gift))
      : [...snapshot.gifts, record];

    return {
      ...snapshot,
      gifts: gifts.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    };
  });
}

export async function deactivateGift(giftId: string) {
  return updateWorkbookSnapshot(async (snapshot) => ({
    ...snapshot,
    gifts: snapshot.gifts.map((gift) =>
      gift.id === giftId
        ? {
            ...gift,
            isActive: false,
            updatedAt: new Date().toISOString()
          }
        : gift
    )
  }));
}

export async function reserveGiftForToken(input: { giftId: string; token: string }) {
  const now = new Date().toISOString();
  const tokenHash = hashToken(input.token);

  return updateWorkbookSnapshot(async (snapshot) => {
    const gift = snapshot.gifts.find((item) => item.id === input.giftId);
    if (!gift || !gift.isActive) {
      throw new Error("Presente indisponivel.");
    }

    const existingReservation = snapshot.giftReservations.find((entry) => entry.giftId === input.giftId);
    if (existingReservation && existingReservation.ownerTokenHash !== tokenHash) {
      throw new Error("Este presente acabou de ser escolhido por outra pessoa.");
    }

    const reservation: GiftReservationRecord = existingReservation
      ? {
          ...existingReservation,
          updatedAt: now
        }
      : {
          id: createId("gift_reservation"),
          giftId: input.giftId,
          ownerTokenHash: tokenHash,
          createdAt: now,
          updatedAt: now
        };

    const giftReservations = existingReservation
      ? snapshot.giftReservations.map((entry) => (entry.giftId === input.giftId ? reservation : entry))
      : [...snapshot.giftReservations, reservation];

    return {
      ...snapshot,
      giftReservations
    };
  });
}

export async function releaseGiftReservation(input: { giftId: string; token: string }) {
  const tokenHash = hashToken(input.token);
  return updateWorkbookSnapshot(async (snapshot) => {
    const existingReservation = snapshot.giftReservations.find((entry) => entry.giftId === input.giftId);
    if (!existingReservation) {
      throw new Error("Presente sem reserva.");
    }

    if (existingReservation.ownerTokenHash !== tokenHash) {
      throw new Error("Nao foi possivel liberar este presente.");
    }

    return {
      ...snapshot,
      giftReservations: snapshot.giftReservations.filter((entry) => entry.giftId !== input.giftId)
    };
  });
}

export async function uploadGiftImage(file: File, giftId?: string) {
  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ".jpg";
  const fileName = `${giftId ?? createId("gift_image")}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.VERCEL) {
    const uploadDir = path.join(os.tmpdir(), "uploads", "gifts");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    return `/api/uploads/gifts/${fileName}`;
  }

  await ensureBaseFolders();
  const destination = path.join(process.cwd(), "public", "uploads", "gifts", fileName);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, buffer);
  return `/uploads/gifts/${fileName}`;
}

export function createGiftReservationToken() {
  return createReservationToken();
}

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import { DEFAULT_GIFT_IMAGE } from "@/lib/constants";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

function getMimeType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return MIME_TYPES[extension] ?? "application/octet-stream";
}

async function readFileIfExists(filePath: string) {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const runtimePath = path.join(os.tmpdir(), "uploads", "gifts", filename);
  const localPath = path.join(process.cwd(), "public", "uploads", "gifts", filename);

  const buffer = (await readFileIfExists(runtimePath)) ?? (await readFileIfExists(localPath));
  if (!buffer) {
    return NextResponse.redirect(new URL(DEFAULT_GIFT_IMAGE, request.url), 307);
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": getMimeType(filename),
      "Cache-Control": "public, max-age=60"
    }
  });
}

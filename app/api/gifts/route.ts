import { NextResponse } from "next/server";
import { getWorkbookSnapshot } from "@/lib/excel";
import { mapPublicGifts } from "@/lib/view-models";

export async function GET() {
  const snapshot = await getWorkbookSnapshot();
  return NextResponse.json(mapPublicGifts(snapshot));
}

import type { GiftRecord, GiftReservationRecord, WorkbookSnapshot } from "@/lib/types";

export type PublicGiftView = GiftRecord & {
  isReserved: boolean;
};

export function mapPublicGifts(snapshot: Pick<WorkbookSnapshot, "gifts" | "giftReservations">): PublicGiftView[] {
  const reservedGiftIds = new Set(snapshot.giftReservations.map((reservation) => reservation.giftId));
  return snapshot.gifts
    .filter((gift) => gift.isActive)
    .map((gift) => ({
      ...gift,
      isReserved: reservedGiftIds.has(gift.id)
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function getOwnedGiftIdsByTokenHash(
  snapshot: Pick<WorkbookSnapshot, "giftReservations">,
  tokenHash: string
) {
  return snapshot.giftReservations
    .filter((reservation) => reservation.ownerTokenHash === tokenHash)
    .map((reservation) => reservation.giftId);
}

export function hasReservation(snapshot: Pick<WorkbookSnapshot, "giftReservations">, giftId: string) {
  return snapshot.giftReservations.some((reservation) => reservation.giftId === giftId);
}

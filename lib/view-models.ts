import type { GiftRecord, GiftReservationRecord, WorkbookSnapshot } from "@/lib/types";

export type PublicGiftView = GiftRecord & {
  reservedQuantity: number;
  availableQuantity: number;
  isFullyReserved: boolean;
};

export function mapPublicGifts(snapshot: Pick<WorkbookSnapshot, "gifts" | "giftReservations">): PublicGiftView[] {
  const reservedByGift = new Map<string, number>();
  snapshot.giftReservations.forEach((reservation) => {
    reservedByGift.set(reservation.giftId, (reservedByGift.get(reservation.giftId) ?? 0) + reservation.quantity);
  });

  return snapshot.gifts
    .filter((gift) => gift.isActive)
    .map((gift) => ({
      ...gift,
      reservedQuantity: reservedByGift.get(gift.id) ?? 0,
      availableQuantity: Math.max(gift.quantity - (reservedByGift.get(gift.id) ?? 0), 0),
      isFullyReserved: (reservedByGift.get(gift.id) ?? 0) >= gift.quantity
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function getOwnedGiftReservationsByTokenHash(
  snapshot: Pick<WorkbookSnapshot, "giftReservations">,
  tokenHash: string
) {
  return snapshot.giftReservations
    .filter((reservation) => reservation.ownerTokenHash === tokenHash)
    .map((reservation) => ({
      giftId: reservation.giftId,
      quantity: reservation.quantity,
      guestName: reservation.guestName
    }));
}

export function hasReservation(snapshot: Pick<WorkbookSnapshot, "giftReservations">, giftId: string) {
  return snapshot.giftReservations.some((reservation) => reservation.giftId === giftId);
}

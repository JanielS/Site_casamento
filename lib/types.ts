export type SiteSettings = {
  coupleNames: string;
  weddingDate: string;
  churchMapsUrl: string;
  notices: SiteNotice[];
  audioUrl: string;
  videoUrl: string;
  heroImageUrl: string;
  confirmationImageUrl: string;
  presentsImageUrl: string;
  siteTitle: string;
  siteDescription: string;
};

export type SiteNotice = {
  id: string;
  title: string;
  text: string;
};

export type RSVPRecord = {
  id: string;
  name: string;
  willAttend: boolean;
  guestCount: number;
  createdAt: string;
  updatedAt: string;
};

export type GiftRecord = {
  id: string;
  name: string;
  imagePath: string;
  description: string;
  quantity: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GiftReservationRecord = {
  id: string;
  giftId: string;
  ownerTokenHash: string;
  accessToken: string;
  guestName: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkbookSnapshot = {
  settings: SiteSettings;
  rsvp: RSVPRecord[];
  gifts: GiftRecord[];
  giftReservations: GiftReservationRecord[];
};

export type GiftStatus = "available" | "selectedByYou" | "selectedByOther";

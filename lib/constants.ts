import type { GiftRecord, SiteNotice, SiteSettings } from "@/lib/types";

export const WEDDING_DATE_DEFAULT = "2027-01-23T18:00:00-03:00";
export const WEDDING_TZ = "America/Maceio";
export const DATA_DIR = "data";
export const WORKBOOK_FILE = "wedding-data.xlsx";
export const MEDIA_DIR = "public";
export const GIFT_UPLOAD_DIR = "public/uploads/gifts";
export const ADMIN_COOKIE_NAME = "wedding-admin-session";
export const ADMIN_LOGIN_PATH = "/admin";
export const DEFAULT_GIFT_IMAGE = "/images/gift-placeholder.svg";
export const DEFAULT_GIFT_QUANTITY = 1;

export const defaultNotices: SiteNotice[] = [
  {
    id: "confirmar-presenca",
    title: "Confirme sua presença",
    text: "Responda o quanto antes para nos ajudar na organização."
  },
  {
    id: "pontualidade",
    title: "Pontualidade é essencial",
    text: "Chegar atrasado pode atrapalhar a cerimônia."
  },
  {
    id: "celular-silencioso",
    title: "Silencie o celular",
    text: "Evite toques e notificações durante a cerimônia."
  }
];

export const mediaPaths = {
  audio: "/O_mundo_e_nos.mp3",
  video: "/VIDEO_OFICIAL.mov",
  heroImage: "/SENSAÇÃO_PARTE01.jpeg",
  confirmationImage: "/FOTO_CONFIRMAÇÃO.jpeg",
  presentsImage: "/SENSAÇÃO_PRESENTES.jpeg",
  inspirationConfirmation: "/SENSAÇÃO_PARTE02.jpeg"
} as const;

export const defaultSettings: SiteSettings = {
  coupleNames: "Lina 𝄞 Janiel",
  weddingDate: process.env.NEXT_PUBLIC_WEDDING_DATE ?? WEDDING_DATE_DEFAULT,
  churchMapsUrl:
    process.env.NEXT_PUBLIC_CHURCH_MAPS_URL ??
    "https://maps.app.goo.gl/Mt6wwARimRkpqReV7?g_st=iw",
  audioUrl: mediaPaths.audio,
  videoUrl: mediaPaths.video,
  heroImageUrl: mediaPaths.heroImage,
  confirmationImageUrl: mediaPaths.confirmationImage,
  presentsImageUrl: mediaPaths.presentsImage,
  siteTitle: "Lina e Janiel",
  siteDescription:
    "Um site de casamento delicado, responsivo e contínuo para Lina e Janiel.",
  notices: defaultNotices
};

export const initialGiftNames = [
  "Air fryer",
  "Jogo de panelas",
  "Jogo de jantar",
  "Faqueiro completo",
  "Jogo de taças",
  "Aparelho de jantar",
  "Jogo de cama queen",
  "Jogo de toalhas",
  "Kit panelas antiaderentes",
  "Cafeteira elétrica",
  "Liquidificador",
  "Torradeira",
  "Jogo de copos",
  "Colchão queen",
  "Travesseiros",
  "Travessas de servir",
  "Kit churrasco",
  "Organizador de cozinha",
  "Edredom queen",
  "Jogo de banheiro"
] as const;

export function buildInitialGiftSeed(nowIso: string): GiftRecord[] {
  return initialGiftNames.map((name, index) => ({
    id: slugifyGiftId(name, index + 1),
    name,
    imagePath: "",
    description: "",
    quantity: DEFAULT_GIFT_QUANTITY,
    sortOrder: index + 1,
    isActive: true,
    createdAt: nowIso,
    updatedAt: nowIso
  }));
}

export function slugifyGiftId(name: string, suffix: number): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug}-${suffix}`;
}

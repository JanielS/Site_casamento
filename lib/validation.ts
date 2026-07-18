import { z } from "zod";

export const rsvpSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome."),
    willAttend: z.boolean(),
    guestCount: z.coerce.number().int().min(0).max(20)
  })
  .superRefine((value, ctx) => {
    if (value.willAttend && value.guestCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe ao menos 1 pessoa quando a resposta for sim.",
        path: ["guestCount"]
      });
    }
  });

export const giftSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Informe o nome do presente."),
  imagePath: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
  sortOrder: z.coerce.number().int().min(1).max(9999),
  isActive: z.coerce.boolean().default(true)
});

export const settingsSchema = z.object({
  coupleNames: z.string().trim().min(2),
  weddingDate: z.string().trim().min(10),
  churchMapsUrl: z.string().trim().url(),
  audioUrl: z.string().trim().min(1),
  videoUrl: z.string().trim().min(1),
  heroImageUrl: z.string().trim().min(1),
  confirmationImageUrl: z.string().trim().min(1),
  presentsImageUrl: z.string().trim().min(1),
  siteTitle: z.string().trim().min(2),
  siteDescription: z.string().trim().min(2)
});

export const adminPasswordSchema = z.object({
  password: z.string().min(1, "Informe a senha.")
});

export const reservationSchema = z.object({
  giftId: z.string().min(1, "Informe o presente."),
  token: z.string().min(1, "Token ausente.")
});

export const releaseSchema = reservationSchema;

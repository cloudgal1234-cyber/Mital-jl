import { z } from "zod";

export const israeliPhoneRegex = /^0(5\d|[2-489])-?\d{7}$/;

export const clientDetailsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "נא להזין שם מלא")
    .max(80, "השם ארוך מדי"),
  phone: z
    .string()
    .trim()
    .regex(israeliPhoneRegex, "מספר טלפון לא תקין"),
  email: z.union([z.literal(""), z.string().trim().email("אימייל לא תקין")]).optional(),
  notes: z.string().trim().max(500, "ההערה ארוכה מדי").optional(),
});

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1, "נא לבחור טיפול"),
  startTime: z.coerce.date(),
  client: clientDetailsSchema,
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type ClientDetailsInput = z.infer<typeof clientDetailsSchema>;

export const blockSlotSchema = z
  .object({
    type: z.enum(["BREAK", "VACATION", "BLOCKED"]),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    notes: z.string().trim().max(200).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "שעת הסיום חייבת להיות אחרי שעת ההתחלה",
    path: ["endTime"],
  });

export type BlockSlotInput = z.infer<typeof blockSlotSchema>;

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "נא להזין שם טיפול").max(80, "השם ארוך מדי"),
  description: z.string().trim().max(300, "התיאור ארוך מדי").optional(),
  durationMin: z.coerce.number().int().min(5, "משך מינימלי 5 דקות").max(480, "משך ארוך מדי"),
  priceAgorot: z.coerce.number().int().min(0, "מחיר לא יכול להיות שלילי"),
  category: z.string().trim().max(40).optional(),
  colorTag: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "צבע לא תקין"),
  icon: z.string().trim().max(40).optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const businessHoursDaySchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    openTime: z.string().regex(timeRegex, "שעה לא תקינה"),
    closeTime: z.string().regex(timeRegex, "שעה לא תקינה"),
    isClosed: z.boolean(),
  })
  .refine((data) => data.isClosed || data.closeTime > data.openTime, {
    message: "שעת הסגירה חייבת להיות אחרי שעת הפתיחה",
    path: ["closeTime"],
  });

export const businessHoursSchema = z.array(businessHoursDaySchema).length(7);

export type BusinessHoursDayInput = z.infer<typeof businessHoursDaySchema>;
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;

export const businessInfoSchema = z.object({
  name: z.string().trim().min(2, "נא להזין שם עסק").max(80, "השם ארוך מדי"),
  address: z.string().trim().min(2, "נא להזין כתובת").max(200, "הכתובת ארוכה מדי"),
  phone: z.string().trim().min(2, "נא להזין טלפון").max(30, "מספר טלפון ארוך מדי"),
  instagram: z.string().trim().max(60, "ארוך מדי").optional(),
  facebook: z.string().trim().max(60, "ארוך מדי").optional(),
  whatsapp: z.string().trim().max(30, "ארוך מדי").optional(),
  about: z.string().trim().max(500, "ארוך מדי").optional(),
});

export type BusinessInfoInput = z.infer<typeof businessInfoSchema>;

export const galleryImageSchema = z.object({
  title: z.string().trim().max(80, "כותרת ארוכה מדי").optional(),
  dataUrl: z
    .string()
    .trim()
    .startsWith("data:image/", "פורמט תמונה לא נתמך")
    .max(3_000_000, "התמונה גדולה מדי"),
});

export type GalleryImageInput = z.infer<typeof galleryImageSchema>;

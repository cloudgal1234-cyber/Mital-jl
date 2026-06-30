"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { businessHoursSchema, type BusinessHoursInput } from "@/lib/validation";

export type BusinessHoursDay = { id: string; weekday: number; openTime: string; closeTime: string; isClosed: boolean };

export async function getBusinessHours(): Promise<BusinessHoursDay[]> {
  const hours = await prisma.businessHours.findMany({ orderBy: { weekday: "asc" } });
  return Array.from({ length: 7 }, (_, weekday) => hours.find((h) => h.weekday === weekday) ?? { id: "", weekday, openTime: "09:00", closeTime: "19:00", isClosed: false });
}

type ActionResult = { success: true } | { success: false; error: string };

export async function updateBusinessHours(input: BusinessHoursInput): Promise<ActionResult> {
  const parsed = businessHoursSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" };
  }

  await prisma.$transaction(
    parsed.data.map((day) =>
      prisma.businessHours.upsert({
        where: { weekday: day.weekday },
        update: { openTime: day.openTime, closeTime: day.closeTime, isClosed: day.isClosed },
        create: day,
      }),
    ),
  );

  revalidatePath("/admin/hours");
  revalidatePath("/booking");
  return { success: true };
}

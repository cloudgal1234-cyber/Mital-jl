"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { businessInfoSchema, type BusinessInfoInput } from "@/lib/validation";

const SINGLETON_ID = "singleton";

const DEFAULTS = {
  name: "מיטל ג'ל",
  address: "רחוב הדוגמה 12, תל אביב",
  phone: "050-0000000",
  instagram: "@mital.nails",
  facebook: null as string | null,
  whatsapp: null as string | null,
  about: null as string | null,
};

export async function getBusinessInfo() {
  const info = await prisma.businessInfo.findUnique({ where: { id: SINGLETON_ID } });
  return info ?? { id: SINGLETON_ID, ...DEFAULTS, updatedAt: new Date() };
}

type ActionResult = { success: true } | { success: false; error: string };

export async function updateBusinessInfo(input: BusinessInfoInput): Promise<ActionResult> {
  const parsed = businessInfoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" };
  }

  await prisma.businessInfo.upsert({
    where: { id: SINGLETON_ID },
    update: parsed.data,
    create: { id: SINGLETON_ID, ...parsed.data },
  });

  revalidatePath("/admin/business");
  revalidatePath("/");
  revalidatePath("/booking");
  return { success: true };
}

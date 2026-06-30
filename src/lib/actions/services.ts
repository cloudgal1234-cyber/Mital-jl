"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serviceSchema, type ServiceInput } from "@/lib/validation";

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllServicesAdmin() {
  return prisma.service.findMany({
    orderBy: [{ active: "desc" }, { sortOrder: "asc" }],
  });
}

type ActionResult = { success: true } | { success: false; error: string };

export async function createService(input: ServiceInput): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" };
  }

  const maxSortOrder = await prisma.service.aggregate({ _max: { sortOrder: true } });

  await prisma.service.create({
    data: { ...parsed.data, sortOrder: (maxSortOrder._max.sortOrder ?? 0) + 1 },
  });

  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/booking");
  return { success: true };
}

export async function updateService(id: string, input: ServiceInput): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" };
  }

  await prisma.service.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/booking");
  return { success: true };
}

export async function toggleServiceActive(id: string, active: boolean): Promise<ActionResult> {
  await prisma.service.update({ where: { id }, data: { active } });

  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/booking");
  return { success: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    await prisma.service.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { success: false, error: "לא ניתן למחוק טיפול עם תורים משויכים — אפשר להסתיר אותו במקום" };
    }
    throw error;
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/booking");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { galleryImageSchema, type GalleryImageInput } from "@/lib/validation";

export async function getGalleryImages() {
  return prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } });
}

type ActionResult = { success: true } | { success: false; error: string };

export async function addGalleryImage(input: GalleryImageInput): Promise<ActionResult> {
  const parsed = galleryImageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" };
  }

  const maxSortOrder = await prisma.galleryImage.aggregate({ _max: { sortOrder: true } });

  await prisma.galleryImage.create({
    data: { ...parsed.data, sortOrder: (maxSortOrder._max.sortOrder ?? 0) + 1 },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  await prisma.galleryImage.delete({ where: { id } });

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { success: true };
}

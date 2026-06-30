"use server";

import { prisma } from "@/lib/prisma";

export async function getActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

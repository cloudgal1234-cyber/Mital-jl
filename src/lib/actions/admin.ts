"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { blockSlotSchema, type BlockSlotInput } from "@/lib/validation";
import { BookingConflictError } from "@/lib/booking-errors";

export async function getEntriesForRange(start: Date, end: Date) {
  return prisma.scheduleEntry.findMany({
    where: {
      status: { not: "CANCELLED" },
      startTime: { lt: end },
      endTime: { gt: start },
    },
    include: { client: true, service: true },
    orderBy: { startTime: "asc" },
  });
}

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Manually blocks a time range (break / vacation / ad-hoc block). Uses the
 * exact same advisory-lock + overlap-check + exclusion-constraint pattern as
 * `createAppointment`, so a block can never silently overwrite an existing
 * confirmed appointment — the admin has to cancel it first.
 */
export async function createBlock(input: BlockSlotInput): Promise<ActionResult> {
  const parsed = blockSlotSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" };
  }
  const { type, startTime, endTime, notes } = parsed.data;
  const dayKey = startTime.toISOString().slice(0, 10);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${dayKey}))`;

      const conflicts = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "ScheduleEntry"
        WHERE status IN ('CONFIRMED', 'COMPLETED')
          AND tstzrange("startTime", "endTime", '[)') && tstzrange(${startTime}::timestamptz, ${endTime}::timestamptz, '[)')
        LIMIT 1
      `;

      if (conflicts.length > 0) {
        throw new BookingConflictError("יש תור קיים שחופף לטווח הזמן הזה");
      }

      await tx.scheduleEntry.create({
        data: { type, status: "CONFIRMED", startTime, endTime, notes },
      });
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    if (error instanceof BookingConflictError) return { success: false, error: error.message };
    if (isExclusionViolation(error)) return { success: false, error: "יש תור קיים שחופף לטווח הזמן הזה" };
    throw error;
  }
}

export async function cancelEntry(id: string): Promise<ActionResult> {
  await prisma.scheduleEntry.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/admin");
  return { success: true };
}

export async function getClients(query?: string) {
  return prisma.client.findMany({
    where: query
      ? { OR: [{ fullName: { contains: query, mode: "insensitive" } }, { phone: { contains: query } }] }
      : undefined,
    orderBy: { fullName: "asc" },
  });
}

export async function getClientDetail(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      entries: {
        where: { type: "APPOINTMENT" },
        include: { service: true },
        orderBy: { startTime: "desc" },
      },
    },
  });
}

export async function updateClientNotes(id: string, notes: string): Promise<ActionResult> {
  await prisma.client.update({ where: { id }, data: { notes } });
  revalidatePath("/admin/clients");
  return { success: true };
}

function isExclusionViolation(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const meta = error.meta as { code?: string; message?: string } | undefined;
    if (meta?.code === "23P01") return true;
    if (typeof meta?.message === "string" && meta.message.includes("schedule_entry_no_overlap")) return true;
  }
  if (error instanceof Error && error.message.includes("schedule_entry_no_overlap")) return true;
  return false;
}

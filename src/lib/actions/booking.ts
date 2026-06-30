"use server";

import { addMinutes, areIntervalsOverlapping, isBefore, startOfDay, endOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchema, type CreateAppointmentInput } from "@/lib/validation";
import { BookingConflictError } from "@/lib/booking-errors";

const SLOT_STEP_MIN = 30;
// Don't let people book in the last few minutes before the slot starts.
const MIN_LEAD_TIME_MIN = 30;

export type TimeSlot = {
  startTime: string; // ISO
  available: boolean;
};

/**
 * Returns the bookable time grid for a given service + day, taking business
 * hours and existing appointments/blocks into account. This is a read-only
 * convenience for the UI — the real conflict guard runs again, inside a
 * transaction, in `createAppointment` below. Never trust this list alone.
 */
export async function getAvailableSlots(serviceId: string, dateStr: string): Promise<TimeSlot[]> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) return [];

  const day = new Date(`${dateStr}T00:00:00`);
  const weekday = day.getDay();

  const hours = await prisma.businessHours.findUnique({ where: { weekday } });
  if (!hours || hours.isClosed) return [];

  const open = new Date(`${dateStr}T${hours.openTime}:00`);
  const close = new Date(`${dateStr}T${hours.closeTime}:00`);

  const existing = await prisma.scheduleEntry.findMany({
    where: {
      status: { in: ["CONFIRMED", "COMPLETED"] },
      startTime: { lt: endOfDay(day) },
      endTime: { gt: startOfDay(day) },
    },
    select: { startTime: true, endTime: true },
  });

  const now = new Date();
  const slots: TimeSlot[] = [];

  for (let cursor = open; !isBefore(close, addMinutes(cursor, service.durationMin)); cursor = addMinutes(cursor, SLOT_STEP_MIN)) {
    const slotStart = cursor;
    const slotEnd = addMinutes(cursor, service.durationMin);

    if (isBefore(slotStart, addMinutes(now, MIN_LEAD_TIME_MIN))) continue;

    const available = !existing.some((entry) =>
      areIntervalsOverlapping(
        { start: slotStart, end: slotEnd },
        { start: entry.startTime, end: entry.endTime },
        { inclusive: false },
      ),
    );

    slots.push({ startTime: slotStart.toISOString(), available });
  }

  return slots;
}

type CreateAppointmentResult =
  | { success: true; appointmentId: string }
  | { success: false; error: string };

/**
 * Creates a confirmed appointment with two independent layers of protection
 * against double-booking:
 *
 *  1. A Postgres advisory lock keyed by calendar day serializes concurrent
 *     booking attempts for that day, so the overlap check below is reliable
 *     even when two requests hit the server at the exact same millisecond.
 *  2. Even if that lock were somehow bypassed (e.g. a second app instance,
 *     a direct SQL write), the `schedule_entry_no_overlap` EXCLUDE
 *     constraint at the database level makes a physically overlapping
 *     CONFIRMED row impossible to commit — we catch that as a fallback and
 *     still return a friendly error instead of a 500.
 */
export async function createAppointment(input: CreateAppointmentInput): Promise<CreateAppointmentResult> {
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" };
  }
  const { serviceId, startTime, client } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return { success: false, error: "הטיפול שנבחר אינו זמין" };
  }

  if (isBefore(startTime, addMinutes(new Date(), MIN_LEAD_TIME_MIN))) {
    return { success: false, error: "לא ניתן לקבוע תור במועד שכבר חלף" };
  }

  const endTime = addMinutes(startTime, service.durationMin);
  const dayKey = startTime.toISOString().slice(0, 10);

  try {
    const appointmentId = await prisma.$transaction(async (tx) => {
      // Serialize all booking attempts for this calendar day. Held for the
      // duration of this transaction only (xact-scoped advisory lock).
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${dayKey}))`;

      const conflicts = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "ScheduleEntry"
        WHERE status IN ('CONFIRMED', 'COMPLETED')
          AND tstzrange("startTime", "endTime", '[)') && tstzrange(${startTime}::timestamptz, ${endTime}::timestamptz, '[)')
        LIMIT 1
      `;

      if (conflicts.length > 0) {
        throw new BookingConflictError("השעה שבחרת נתפסה זה עתה, נא לבחור שעה אחרת");
      }

      const clientRecord = await tx.client.upsert({
        where: { phone: client.phone },
        update: { fullName: client.fullName, email: client.email || undefined },
        create: {
          fullName: client.fullName,
          phone: client.phone,
          email: client.email || undefined,
          notes: client.notes,
        },
      });

      const entry = await tx.scheduleEntry.create({
        data: {
          type: "APPOINTMENT",
          status: "CONFIRMED",
          startTime,
          endTime,
          serviceId: service.id,
          clientId: clientRecord.id,
          notes: client.notes,
        },
      });

      return entry.id;
    });

    revalidatePath("/admin");
    return { success: true, appointmentId };
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return { success: false, error: error.message };
    }
    if (isExclusionViolation(error)) {
      return { success: false, error: "השעה שבחרת נתפסה זה עתה, נא לבחור שעה אחרת" };
    }
    throw error;
  }
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

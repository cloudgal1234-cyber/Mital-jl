-- ============================================================================
-- 0001_init
--
-- Creates the core schema AND the no-double-booking guarantee:
--   - btree_gist extension (required for an EXCLUDE constraint on a range
--     type combined with equality-style WHERE filtering)
--   - "timeRange" generated column on ScheduleEntry
--   - GiST EXCLUDE constraint that makes it physically impossible for two
--     CONFIRMED/COMPLETED entries to share any overlapping time, even under
--     concurrent transactions racing on the exact same second.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---- Enums -----------------------------------------------------------------

CREATE TYPE "EntryType" AS ENUM ('APPOINTMENT', 'BREAK', 'VACATION', 'BLOCKED');
CREATE TYPE "AppointmentStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- ---- Service -----------------------------------------------------------------

CREATE TABLE "Service" (
    "id"          TEXT PRIMARY KEY,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "durationMin" INTEGER NOT NULL,
    "priceAgorot" INTEGER NOT NULL,
    "icon"        TEXT,
    "category"    TEXT,
    "colorTag"    TEXT NOT NULL DEFAULT '#cf6a85',
    "active"      BOOLEAN NOT NULL DEFAULT true,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"   TIMESTAMPTZ NOT NULL
);

CREATE INDEX "Service_active_sortOrder_idx" ON "Service" ("active", "sortOrder");

-- ---- Client ------------------------------------------------------------------

CREATE TABLE "Client" (
    "id"        TEXT PRIMARY KEY,
    "fullName"  TEXT NOT NULL,
    "phone"     TEXT NOT NULL,
    "email"     TEXT,
    "notes"     TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX "Client_phone_key" ON "Client" ("phone");
CREATE INDEX "Client_fullName_idx" ON "Client" ("fullName");

-- ---- ScheduleEntry -------------------------------------------------------------

CREATE TABLE "ScheduleEntry" (
    "id"        TEXT PRIMARY KEY,
    "type"      "EntryType" NOT NULL,
    "status"    "AppointmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "startTime" TIMESTAMPTZ NOT NULL,
    "endTime"   TIMESTAMPTZ NOT NULL,
    -- Generated, always in sync with startTime/endTime — this is what the
    -- exclusion constraint below actually indexes.
    "timeRange" tstzrange GENERATED ALWAYS AS (
        tstzrange("startTime", "endTime", '[)')
    ) STORED,
    "clientId"  TEXT REFERENCES "Client"("id") ON DELETE SET NULL,
    "serviceId" TEXT REFERENCES "Service"("id") ON DELETE SET NULL,
    "notes"     TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "schedule_entry_time_order_check" CHECK ("endTime" > "startTime")
);

CREATE INDEX "ScheduleEntry_startTime_endTime_idx" ON "ScheduleEntry" ("startTime", "endTime");
CREATE INDEX "ScheduleEntry_clientId_idx" ON "ScheduleEntry" ("clientId");
CREATE INDEX "ScheduleEntry_status_idx" ON "ScheduleEntry" ("status");

-- ============================================================================
-- THE GUARANTEE: no two active (CONFIRMED/COMPLETED) entries may overlap.
--
-- This protects against double-booking regardless of where the write comes
-- from — the booking wizard, the admin dashboard, a future mobile app, a
-- script, or two requests landing in the same millisecond on two different
-- server instances. The app-level transaction (see booking.ts) is what gives
-- users a friendly error message; THIS constraint is what makes the
-- guarantee actually true.
-- ============================================================================

ALTER TABLE "ScheduleEntry"
    ADD CONSTRAINT "schedule_entry_no_overlap"
    EXCLUDE USING gist (
        "timeRange" WITH &&
    )
    WHERE ("status" IN ('CONFIRMED', 'COMPLETED'));

-- ---- BusinessHours -------------------------------------------------------------

CREATE TABLE "BusinessHours" (
    "id"        TEXT PRIMARY KEY,
    "weekday"   INTEGER NOT NULL,
    "openTime"  TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed"  BOOLEAN NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX "BusinessHours_weekday_key" ON "BusinessHours" ("weekday");

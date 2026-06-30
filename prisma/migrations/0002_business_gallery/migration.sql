-- ============================================================================
-- 0002_business_gallery
--
-- Adds editable business contact details (singleton row) and a gallery of
-- work images, stored as base64 data URLs directly in the DB so the site
-- doesn't need a separate file/object storage service.
-- ============================================================================

CREATE TABLE "BusinessInfo" (
    "id"        TEXT PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "address"   TEXT NOT NULL,
    "phone"     TEXT NOT NULL,
    "instagram" TEXT,
    "facebook"  TEXT,
    "whatsapp"  TEXT,
    "about"     TEXT,
    "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "GalleryImage" (
    "id"        TEXT PRIMARY KEY,
    "title"     TEXT,
    "dataUrl"   TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "GalleryImage_sortOrder_idx" ON "GalleryImage" ("sortOrder");

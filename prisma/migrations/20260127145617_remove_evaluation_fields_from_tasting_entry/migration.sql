/*
  Warnings:

  - You are about to drop the column `acidity` on the `tasting_entries` table. All the data in the column will be lost.
  - You are about to drop the column `aftertaste` on the `tasting_entries` table. All the data in the column will be lost.
  - You are about to drop the column `bitterness` on the `tasting_entries` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `tasting_entries` table. All the data in the column will be lost.
  - You are about to drop the column `flavorTags` on the `tasting_entries` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `tasting_entries` table. All the data in the column will be lost.
  - You are about to drop the column `overallRating` on the `tasting_entries` table. All the data in the column will be lost.
  - You are about to drop the column `recordedBy` on the `tasting_entries` table. All the data in the column will be lost.
  - You are about to drop the column `sweetness` on the `tasting_entries` table. All the data in the column will be lost.

*/

-- Step 1: Migrate existing evaluation data to tasting_notes
-- Only migrate entries that have at least one evaluation field filled
INSERT INTO "tasting_notes" (
    "tastingEntryId",
    "recordedBy",
    "acidity",
    "bitterness",
    "sweetness",
    "body",
    "aftertaste",
    "flavorTags",
    "overallRating",
    "notes",
    "createdAt",
    "updatedAt"
)
SELECT
    "id" as "tastingEntryId",
    "recordedBy",
    "acidity",
    "bitterness",
    "sweetness",
    "body",
    "aftertaste",
    "flavorTags",
    "overallRating",
    "notes",
    "createdAt",
    "updatedAt"
FROM "tasting_entries"
WHERE "acidity" IS NOT NULL
   OR "bitterness" IS NOT NULL
   OR "sweetness" IS NOT NULL
   OR "body" IS NOT NULL
   OR "aftertaste" IS NOT NULL
   OR "flavorTags" IS NOT NULL
   OR "overallRating" IS NOT NULL
   OR "notes" IS NOT NULL;

-- Step 2: RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasting_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "grindSize" REAL,
    "brewDate" DATETIME NOT NULL,
    "imagePath" TEXT,
    "brewedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "coffeeBeanId" INTEGER NOT NULL,
    "dripperId" INTEGER,
    "filterId" INTEGER,
    CONSTRAINT "tasting_entries_coffeeBeanId_fkey" FOREIGN KEY ("coffeeBeanId") REFERENCES "coffee_beans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasting_entries_dripperId_fkey" FOREIGN KEY ("dripperId") REFERENCES "drippers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasting_entries_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "filters" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_tasting_entries" ("brewDate", "brewedBy", "coffeeBeanId", "createdAt", "dripperId", "filterId", "grindSize", "id", "imagePath", "updatedAt") SELECT "brewDate", "brewedBy", "coffeeBeanId", "createdAt", "dripperId", "filterId", "grindSize", "id", "imagePath", "updatedAt" FROM "tasting_entries";
DROP TABLE "tasting_entries";
ALTER TABLE "new_tasting_entries" RENAME TO "tasting_entries";
CREATE INDEX "tasting_entries_coffeeBeanId_idx" ON "tasting_entries"("coffeeBeanId");
CREATE INDEX "tasting_entries_brewDate_idx" ON "tasting_entries"("brewDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "tasting_notes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recordedBy" TEXT,
    "acidity" INTEGER,
    "bitterness" INTEGER,
    "sweetness" INTEGER,
    "body" TEXT,
    "aftertaste" INTEGER,
    "flavorTags" TEXT,
    "overallRating" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tastingEntryId" INTEGER NOT NULL,
    CONSTRAINT "tasting_notes_tastingEntryId_fkey" FOREIGN KEY ("tastingEntryId") REFERENCES "tasting_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "tasting_notes_tastingEntryId_idx" ON "tasting_notes"("tastingEntryId");

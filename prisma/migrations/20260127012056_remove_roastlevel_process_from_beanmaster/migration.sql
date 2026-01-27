/*
  Warnings:

  - You are about to drop the column `origin` on the `bean_masters` table. All the data in the column will be lost.
  - You are about to drop the column `process` on the `bean_masters` table. All the data in the column will be lost.
  - You are about to drop the column `roastLevel` on the `bean_masters` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bean_masters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "originId" INTEGER,
    CONSTRAINT "bean_masters_originId_fkey" FOREIGN KEY ("originId") REFERENCES "origin_masters" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_bean_masters" ("createdAt", "id", "name", "notes", "updatedAt") SELECT "createdAt", "id", "name", "notes", "updatedAt" FROM "bean_masters";
DROP TABLE "bean_masters";
ALTER TABLE "new_bean_masters" RENAME TO "bean_masters";
CREATE INDEX "bean_masters_originId_idx" ON "bean_masters"("originId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

/*
  Warnings:

  - You are about to drop the column `brandName` on the `shops` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_shops" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "branchName" TEXT,
    "address" TEXT,
    "url" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_shops" ("address", "createdAt", "id", "name", "notes", "updatedAt", "url") SELECT "address", "createdAt", "id", "name", "notes", "updatedAt", "url" FROM "shops";
DROP TABLE "shops";
ALTER TABLE "new_shops" RENAME TO "shops";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

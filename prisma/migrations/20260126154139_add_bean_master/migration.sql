-- CreateTable
CREATE TABLE "bean_masters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "origin" TEXT,
    "roastLevel" TEXT,
    "process" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_coffee_beans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "origin" TEXT,
    "roastLevel" TEXT,
    "process" TEXT,
    "isDecaf" BOOLEAN NOT NULL DEFAULT false,
    "beanType" TEXT,
    "acidityScore" INTEGER NOT NULL DEFAULT 0,
    "bitternessScore" INTEGER NOT NULL DEFAULT 0,
    "bodyScore" INTEGER NOT NULL DEFAULT 0,
    "flavorScore" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "url" TEXT,
    "purchaseDate" DATETIME,
    "price" INTEGER,
    "amount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "finishedDate" DATETIME,
    "imagePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shopId" INTEGER,
    "beanMasterId" INTEGER,
    CONSTRAINT "coffee_beans_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "coffee_beans_beanMasterId_fkey" FOREIGN KEY ("beanMasterId") REFERENCES "bean_masters" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_coffee_beans" ("acidityScore", "amount", "beanType", "bitternessScore", "bodyScore", "createdAt", "finishedDate", "flavorScore", "id", "imagePath", "isDecaf", "name", "notes", "origin", "price", "process", "purchaseDate", "roastLevel", "shopId", "status", "updatedAt", "url") SELECT "acidityScore", "amount", "beanType", "bitternessScore", "bodyScore", "createdAt", "finishedDate", "flavorScore", "id", "imagePath", "isDecaf", "name", "notes", "origin", "price", "process", "purchaseDate", "roastLevel", "shopId", "status", "updatedAt", "url" FROM "coffee_beans";
DROP TABLE "coffee_beans";
ALTER TABLE "new_coffee_beans" RENAME TO "coffee_beans";
CREATE INDEX "coffee_beans_status_idx" ON "coffee_beans"("status");
CREATE INDEX "coffee_beans_shopId_idx" ON "coffee_beans"("shopId");
CREATE INDEX "coffee_beans_beanMasterId_idx" ON "coffee_beans"("beanMasterId");
CREATE INDEX "coffee_beans_origin_idx" ON "coffee_beans"("origin");
CREATE INDEX "coffee_beans_roastLevel_idx" ON "coffee_beans"("roastLevel");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

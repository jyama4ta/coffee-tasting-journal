-- CreateTable
CREATE TABLE "shops" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "url" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "drippers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "notes" TEXT,
    "imagePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "filters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "notes" TEXT,
    "imagePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "coffee_beans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "origin" TEXT,
    "roastLevel" TEXT,
    "process" TEXT,
    "isDecaf" BOOLEAN NOT NULL DEFAULT false,
    "beanType" TEXT,
    "notes" TEXT,
    "purchaseDate" DATETIME,
    "price" INTEGER,
    "amount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "finishedDate" DATETIME,
    "imagePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shopId" INTEGER,
    CONSTRAINT "coffee_beans_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tasting_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "grindSize" REAL,
    "brewDate" DATETIME NOT NULL,
    "acidity" INTEGER,
    "bitterness" INTEGER,
    "sweetness" INTEGER,
    "body" TEXT,
    "aftertaste" INTEGER,
    "flavorTags" TEXT,
    "overallRating" INTEGER,
    "notes" TEXT,
    "imagePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "coffeeBeanId" INTEGER NOT NULL,
    "dripperId" INTEGER,
    "filterId" INTEGER,
    CONSTRAINT "tasting_entries_coffeeBeanId_fkey" FOREIGN KEY ("coffeeBeanId") REFERENCES "coffee_beans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasting_entries_dripperId_fkey" FOREIGN KEY ("dripperId") REFERENCES "drippers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasting_entries_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "filters" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "coffee_beans_status_idx" ON "coffee_beans"("status");

-- CreateIndex
CREATE INDEX "coffee_beans_shopId_idx" ON "coffee_beans"("shopId");

-- CreateIndex
CREATE INDEX "coffee_beans_origin_idx" ON "coffee_beans"("origin");

-- CreateIndex
CREATE INDEX "coffee_beans_roastLevel_idx" ON "coffee_beans"("roastLevel");

-- CreateIndex
CREATE INDEX "tasting_entries_coffeeBeanId_idx" ON "tasting_entries"("coffeeBeanId");

-- CreateIndex
CREATE INDEX "tasting_entries_brewDate_idx" ON "tasting_entries"("brewDate");

-- CreateIndex
CREATE INDEX "tasting_entries_overallRating_idx" ON "tasting_entries"("overallRating");

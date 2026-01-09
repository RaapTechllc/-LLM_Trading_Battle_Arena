-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "requirement" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_opponents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "strategy" TEXT NOT NULL DEFAULT 'BALANCED',
    "description" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_battles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT,
    "aiOpponentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "winnerId" TEXT,
    "battleType" TEXT NOT NULL DEFAULT 'CASUAL',
    "entryFee" DECIMAL NOT NULL DEFAULT 0.00,
    "prizePool" DECIMAL NOT NULL DEFAULT 0.00,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "battles_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "battles_aiOpponentId_fkey" FOREIGN KEY ("aiOpponentId") REFERENCES "ai_opponents" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_battles" ("battleType", "createdAt", "entryFee", "id", "player1Id", "player2Id", "prizePool", "status", "updatedAt", "winnerId") SELECT "battleType", "createdAt", "entryFee", "id", "player1Id", "player2Id", "prizePool", "status", "updatedAt", "winnerId" FROM "battles";
DROP TABLE "battles";
ALTER TABLE "new_battles" RENAME TO "battles";
CREATE TABLE "new_cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "attack" INTEGER NOT NULL DEFAULT 1,
    "defense" INTEGER NOT NULL DEFAULT 1,
    "health" INTEGER NOT NULL DEFAULT 1,
    "manaCost" INTEGER NOT NULL DEFAULT 1,
    "ability" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "cardType" TEXT NOT NULL DEFAULT 'CREATURE',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "marketValue" DECIMAL NOT NULL DEFAULT 0.00,
    "isForSale" BOOLEAN NOT NULL DEFAULT false,
    "salePrice" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cards_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_cards" ("ability", "attack", "cardType", "createdAt", "defense", "description", "health", "id", "isForSale", "manaCost", "marketValue", "name", "ownerId", "rarity", "salePrice", "updatedAt") SELECT "ability", "attack", "cardType", "createdAt", "defense", "description", "health", "id", "isForSale", "manaCost", "marketValue", "name", "ownerId", "rarity", "salePrice", "updatedAt" FROM "cards";
DROP TABLE "cards";
ALTER TABLE "new_cards" RENAME TO "cards";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

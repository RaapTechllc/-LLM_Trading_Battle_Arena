/*
  Warnings:

  - You are about to drop the column `cashAmount` on the `trades` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_trade_offers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "fromSender" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "trade_offers_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trades" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "trade_offers_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_trade_offers" ("cardId", "id", "tradeId") SELECT "cardId", "id", "tradeId" FROM "trade_offers";
DROP TABLE "trade_offers";
ALTER TABLE "new_trade_offers" RENAME TO "trade_offers";
CREATE TABLE "new_trades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderId" TEXT NOT NULL DEFAULT 'default-user',
    "receiverId" TEXT NOT NULL DEFAULT 'default-user-2',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "trades_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "trades_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_trades" ("createdAt", "id", "receiverId", "senderId", "status", "updatedAt") SELECT "createdAt", "id", "receiverId", "senderId", "status", "updatedAt" FROM "trades";
DROP TABLE "trades";
ALTER TABLE "new_trades" RENAME TO "trades";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

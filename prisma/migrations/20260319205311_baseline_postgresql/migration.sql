-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "account_balances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cashBalance" DECIMAL(15,2) NOT NULL DEFAULT 10000,
    "equityValue" DECIMAL(15,2) NOT NULL DEFAULT 10000,
    "buyingPower" DECIMAL(15,2) NOT NULL DEFAULT 10000,
    "totalPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "quantity" DECIMAL(15,8) NOT NULL,
    "avgEntryPrice" DECIMAL(15,8) NOT NULL,
    "currentPrice" DECIMAL(15,8) NOT NULL DEFAULT 0,
    "unrealizedPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "realizedPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "modelId" TEXT,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "positionId" TEXT,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "quantity" DECIMAL(15,8) NOT NULL,
    "limitPrice" DECIMAL(15,8),
    "filledPrice" DECIMAL(15,8),
    "status" TEXT NOT NULL,
    "brokerOrderId" TEXT,
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filledAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "description" TEXT,
    "avatar" TEXT,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winCount" INTEGER NOT NULL DEFAULT 0,
    "totalPnlPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trading_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_cards" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION NOT NULL,
    "leverage" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "pnlPercent" DOUBLE PRECISION NOT NULL,
    "pnlUsd" DOUBLE PRECISION NOT NULL,
    "holdingHours" DOUBLE PRECISION NOT NULL,
    "rarity" TEXT NOT NULL,
    "reasoning" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_battles" (
    "id" TEXT NOT NULL,
    "model1Id" TEXT NOT NULL,
    "model2Id" TEXT NOT NULL,
    "model1Cards" TEXT NOT NULL,
    "model2Cards" TEXT NOT NULL,
    "model1Score" DOUBLE PRECISION NOT NULL,
    "model2Score" DOUBLE PRECISION NOT NULL,
    "winnerId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arena_agents" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelProvider" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "executionPath" TEXT NOT NULL,
    "strategyPrompt" TEXT NOT NULL,
    "agentMd" TEXT,
    "riskMaxExposure" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
    "riskMaxLeverage" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "riskMaxPositions" INTEGER NOT NULL DEFAULT 3,
    "riskStopLossReq" BOOLEAN NOT NULL DEFAULT true,
    "liveApproved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "haltedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arena_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arena_seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roundIntervalMin" INTEGER NOT NULL DEFAULT 240,
    "tradingPairs" TEXT NOT NULL DEFAULT 'BTC,ETH,SOL',
    "tradingMode" TEXT NOT NULL DEFAULT 'SIMULATED',
    "paperBroker" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "arena_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arena_season_entries" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "startingBalance" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "totalPnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realizedPnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unrealizedPnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winCount" INTEGER NOT NULL DEFAULT 0,
    "lossCount" INTEGER NOT NULL DEFAULT 0,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "sharpeRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDrawdown" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arena_season_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arena_trades" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "roundId" TEXT,
    "pair" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "size" DOUBLE PRECISION NOT NULL,
    "sizePct" DOUBLE PRECISION NOT NULL,
    "leverage" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "pnl" DOUBLE PRECISION,
    "pnlPct" DOUBLE PRECISION,
    "reasoning" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "riskCheckPassed" BOOLEAN NOT NULL DEFAULT true,
    "killSwitchActive" BOOLEAN NOT NULL DEFAULT false,
    "executionMode" TEXT NOT NULL DEFAULT 'simulated',
    "externalOrderId" TEXT,
    "executedPrice" DOUBLE PRECISION,
    "slippage" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'open',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "arena_trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arena_rounds" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "marketData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "arena_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arena_round_decisions" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "pair" TEXT,
    "sizePct" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "reasoning" TEXT NOT NULL,
    "rawResponse" TEXT,
    "latencyMs" INTEGER,
    "tokensUsed" INTEGER,
    "riskCheckPassed" BOOLEAN NOT NULL DEFAULT true,
    "rejectionReason" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arena_round_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "account_balances_userId_key" ON "account_balances"("userId");

-- CreateIndex
CREATE INDEX "positions_userId_status_idx" ON "positions"("userId", "status");

-- CreateIndex
CREATE INDEX "positions_symbol_idx" ON "positions"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "orders_brokerOrderId_key" ON "orders"("brokerOrderId");

-- CreateIndex
CREATE INDEX "orders_userId_status_idx" ON "orders"("userId", "status");

-- CreateIndex
CREATE INDEX "orders_brokerOrderId_idx" ON "orders"("brokerOrderId");

-- CreateIndex
CREATE INDEX "risk_events_userId_createdAt_idx" ON "risk_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "trading_models_name_key" ON "trading_models"("name");

-- CreateIndex
CREATE INDEX "trade_cards_modelId_idx" ON "trade_cards"("modelId");

-- CreateIndex
CREATE INDEX "trade_cards_userId_idx" ON "trade_cards"("userId");

-- CreateIndex
CREATE INDEX "trade_cards_createdAt_idx" ON "trade_cards"("createdAt");

-- CreateIndex
CREATE INDEX "trade_cards_rarity_idx" ON "trade_cards"("rarity");

-- CreateIndex
CREATE INDEX "model_battles_model1Id_idx" ON "model_battles"("model1Id");

-- CreateIndex
CREATE INDEX "model_battles_model2Id_idx" ON "model_battles"("model2Id");

-- CreateIndex
CREATE INDEX "model_battles_winnerId_idx" ON "model_battles"("winnerId");

-- CreateIndex
CREATE INDEX "model_battles_userId_idx" ON "model_battles"("userId");

-- CreateIndex
CREATE INDEX "model_battles_createdAt_idx" ON "model_battles"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "arena_agents_tag_key" ON "arena_agents"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "arena_season_entries_agentId_seasonId_key" ON "arena_season_entries"("agentId", "seasonId");

-- CreateIndex
CREATE INDEX "arena_trades_entryId_idx" ON "arena_trades"("entryId");

-- CreateIndex
CREATE INDEX "arena_trades_roundId_idx" ON "arena_trades"("roundId");

-- CreateIndex
CREATE INDEX "arena_trades_status_idx" ON "arena_trades"("status");

-- CreateIndex
CREATE INDEX "arena_trades_openedAt_idx" ON "arena_trades"("openedAt");

-- CreateIndex
CREATE INDEX "arena_rounds_seasonId_idx" ON "arena_rounds"("seasonId");

-- CreateIndex
CREATE INDEX "arena_rounds_status_idx" ON "arena_rounds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "arena_rounds_seasonId_roundNumber_key" ON "arena_rounds"("seasonId", "roundNumber");

-- CreateIndex
CREATE INDEX "arena_round_decisions_roundId_idx" ON "arena_round_decisions"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "arena_round_decisions_roundId_entryId_key" ON "arena_round_decisions"("roundId", "entryId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "trading_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_cards" ADD CONSTRAINT "trade_cards_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "trading_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_cards" ADD CONSTRAINT "trade_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_battles" ADD CONSTRAINT "model_battles_model1Id_fkey" FOREIGN KEY ("model1Id") REFERENCES "trading_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_battles" ADD CONSTRAINT "model_battles_model2Id_fkey" FOREIGN KEY ("model2Id") REFERENCES "trading_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_battles" ADD CONSTRAINT "model_battles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_season_entries" ADD CONSTRAINT "arena_season_entries_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "arena_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_season_entries" ADD CONSTRAINT "arena_season_entries_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "arena_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_trades" ADD CONSTRAINT "arena_trades_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "arena_season_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_trades" ADD CONSTRAINT "arena_trades_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "arena_rounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_rounds" ADD CONSTRAINT "arena_rounds_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "arena_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_round_decisions" ADD CONSTRAINT "arena_round_decisions_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "arena_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_round_decisions" ADD CONSTRAINT "arena_round_decisions_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "arena_season_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.5.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTradeDecision, TradeDecision } from '@/lib/openrouter'
import { TRADING_MODELS, ASSETS, getRarity, DIRECTIONS, LEVERAGE_OPTIONS } from '@/lib/constants'

// Fallback random trade when OpenRouter unavailable
function generateRandomTrade(asset: string, currentPrice: number): TradeDecision {
  const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
  const leverage = LEVERAGE_OPTIONS[Math.floor(Math.random() * 4)] // 1-10x max for random
  const entryPrice = currentPrice * (0.98 + Math.random() * 0.04)
  const exitPrice = currentPrice * (0.95 + Math.random() * 0.1)
  const reasonings = [
    "Technical analysis pattern detected",
    "Volume breakout confirmation",
    "Support/resistance level test",
    "Momentum indicator signal"
  ]
  return {
    direction,
    leverage,
    entryPrice,
    exitPrice,
    reasoning: reasonings[Math.floor(Math.random() * reasonings.length)],
    confidence: 50 + Math.floor(Math.random() * 30)
  }
}

export async function POST() {
  const results: Array<{ model: string; success: boolean; card?: any; error?: string }> = []

  for (const model of TRADING_MODELS) {
    try {
      // Pick random asset (crypto only for live prices)
      const cryptoAssets = ASSETS.filter(a => ['BTC', 'ETH', 'SOL'].includes(a.symbol))
      const asset = cryptoAssets[Math.floor(Math.random() * cryptoAssets.length)]

      // Get current price
      const priceRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/market/live-prices`)
      const priceData = await priceRes.json()
      const currentPrice = priceData.data?.[asset.symbol]?.price || 95000

      // Generate trade decision (with fallback)
      let decision: TradeDecision
      try {
        decision = await generateTradeDecision(model.name, asset.symbol, currentPrice)
      } catch {
        // Fallback to random if OpenRouter unavailable
        decision = generateRandomTrade(asset.symbol, currentPrice)
      }

      // Calculate P&L (simulated outcome with some randomness)
      const pnlMultiplier = (Math.random() - 0.4) * 0.1 // -4% to +6% base
      const pnlPercent = pnlMultiplier * decision.leverage * 100
      const pnlUsd = (10000 * pnlPercent) / 100
      const holdingHours = Math.random() * 24 + 1

      // Find model in DB
      const dbModel = await prisma.tradingModel.findUnique({ where: { name: model.name } })
      if (!dbModel) continue

      // Create trade card
      const card = await prisma.tradeCard.create({
        data: {
          modelId: dbModel.id,
          asset: asset.symbol,
          direction: decision.direction,
          entryPrice: decision.entryPrice,
          exitPrice: decision.exitPrice,
          leverage: decision.leverage,
          pnlPercent,
          pnlUsd,
          holdingHours,
          rarity: getRarity(pnlPercent),
          reasoning: decision.reasoning
        }
      })

      // Update model stats
      const stats = await prisma.tradeCard.aggregate({
        where: { modelId: dbModel.id },
        _count: { id: true },
        _sum: { pnlPercent: true }
      })
      const winCount = await prisma.tradeCard.count({
        where: { modelId: dbModel.id, pnlPercent: { gt: 0 } }
      })
      await prisma.tradingModel.update({
        where: { id: dbModel.id },
        data: {
          totalTrades: stats._count.id,
          winCount,
          totalPnlPct: stats._sum.pnlPercent || 0
        }
      })

      results.push({
        model: model.name,
        success: true,
        card: {
          asset: card.asset,
          direction: card.direction,
          pnlPercent: card.pnlPercent,
          rarity: card.rarity
        }
      })
    } catch (error) {
      results.push({
        model: model.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const successful = results.filter(r => r.success).length
  return NextResponse.json({
    success: successful > 0,
    message: `Generated ${successful}/${TRADING_MODELS.length} trades`,
    results,
    timestamp: new Date().toISOString()
  })
}

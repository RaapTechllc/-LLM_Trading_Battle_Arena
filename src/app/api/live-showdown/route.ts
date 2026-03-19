import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTradeDecision, TradeDecision } from '@/lib/openrouter'
import { getRarity } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { model1Name, model2Name, asset, currentPrice } = await request.json()

    if (!model1Name || !model2Name || !asset || !currentPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (model1Name === model2Name) {
      return NextResponse.json({ error: 'Select two different models' }, { status: 400 })
    }

    // Generate trades in parallel
    const [decision1, decision2] = await Promise.all([
      generateTradeDecision(model1Name, asset, currentPrice),
      generateTradeDecision(model2Name, asset, currentPrice)
    ])

    // Simulate outcomes (random market movement)
    const marketMove = (Math.random() - 0.5) * 0.1 // -5% to +5%
    const finalPrice = currentPrice * (1 + marketMove)

    const calcPnL = (d: TradeDecision) => {
      const priceChange = (finalPrice - d.entryPrice) / d.entryPrice
      const pnl = d.direction === 'LONG' ? priceChange : -priceChange
      return pnl * d.leverage * 100
    }

    const pnl1 = calcPnL(decision1)
    const pnl2 = calcPnL(decision2)

    // Find models in DB
    const [dbModel1, dbModel2] = await Promise.all([
      prisma.tradingModel.findUnique({ where: { name: model1Name } }),
      prisma.tradingModel.findUnique({ where: { name: model2Name } })
    ])

    if (!dbModel1 || !dbModel2) {
      return NextResponse.json({ error: 'Models not found' }, { status: 404 })
    }

    // Save trade cards for both
    const holdingHours = Math.random() * 4 + 0.5
    const [card1, card2] = await Promise.all([
      prisma.tradeCard.create({
        data: {
          modelId: dbModel1.id, asset, direction: decision1.direction,
          entryPrice: decision1.entryPrice, exitPrice: finalPrice,
          leverage: decision1.leverage, pnlPercent: pnl1,
          pnlUsd: (10000 * pnl1) / 100, holdingHours,
          rarity: getRarity(pnl1), reasoning: decision1.reasoning
        }
      }),
      prisma.tradeCard.create({
        data: {
          modelId: dbModel2.id, asset, direction: decision2.direction,
          entryPrice: decision2.entryPrice, exitPrice: finalPrice,
          leverage: decision2.leverage, pnlPercent: pnl2,
          pnlUsd: (10000 * pnl2) / 100, holdingHours,
          rarity: getRarity(pnl2), reasoning: decision2.reasoning
        }
      })
    ])

    // Update model stats for both
    for (const [dbModel] of [[dbModel1], [dbModel2]]) {
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
    }

    // Determine winner
    const winner = pnl1 > pnl2 ? 'model1' : pnl2 > pnl1 ? 'model2' : 'tie'

    // Save battle
    await prisma.modelBattle.create({
      data: {
        model1Id: dbModel1.id, model2Id: dbModel2.id,
        model1Cards: JSON.stringify([card1.id]),
        model2Cards: JSON.stringify([card2.id]),
        model1Score: pnl1, model2Score: pnl2,
        winnerId: winner === 'model1' ? dbModel1.id : winner === 'model2' ? dbModel2.id : null
      }
    })

    return NextResponse.json({
      success: true,
      asset,
      marketMove: (marketMove * 100).toFixed(2),
      finalPrice,
      model1: {
        name: model1Name, decision: decision1, pnl: pnl1,
        rarity: getRarity(pnl1), cardId: card1.id
      },
      model2: {
        name: model2Name, decision: decision2, pnl: pnl2,
        rarity: getRarity(pnl2), cardId: card2.id
      },
      winner
    })

  } catch (error) {
    console.error('Live showdown error:', error)
    const message = error instanceof Error ? error.message : 'Battle failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

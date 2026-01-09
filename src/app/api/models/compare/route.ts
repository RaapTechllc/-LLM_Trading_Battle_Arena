import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const model1Name = searchParams.get('model1')
    const model2Name = searchParams.get('model2')

    if (!model1Name || !model2Name) {
      return NextResponse.json(
        { error: 'Missing required params: model1, model2' },
        { status: 400 }
      )
    }

    const [model1, model2] = await Promise.all([
      prisma.tradingModel.findUnique({ where: { name: model1Name } }),
      prisma.tradingModel.findUnique({ where: { name: model2Name } })
    ])

    if (!model1 || !model2) {
      return NextResponse.json({ error: 'One or both models not found' }, { status: 404 })
    }

    const [trades1, trades2, battles] = await Promise.all([
      prisma.tradeCard.findMany({ where: { modelId: model1.id } }),
      prisma.tradeCard.findMany({ where: { modelId: model2.id } }),
      prisma.modelBattle.findMany({
        where: {
          OR: [
            { model1Id: model1.id, model2Id: model2.id },
            { model1Id: model2.id, model2Id: model1.id }
          ]
        }
      })
    ])

    const getStats = (trades: typeof trades1) => ({
      wins: trades.filter(t => t.pnlPercent > 0).length,
      avgPnl: trades.length ? Math.round((trades.reduce((s, t) => s + t.pnlPercent, 0) / trades.length) * 100) / 100 : 0,
      bestTrade: trades.length ? Math.max(...trades.map(t => t.pnlPercent)) : 0
    })

    const h2hWins1 = battles.filter(b => b.winnerId === model1.id).length
    const h2hWins2 = battles.filter(b => b.winnerId === model2.id).length

    return NextResponse.json({
      model1: { name: model1.name, ...getStats(trades1) },
      model2: { name: model2.name, ...getStats(trades2) },
      headToHead: {
        battles: battles.length,
        model1Wins: h2hWins1,
        model2Wins: h2hWins2
      }
    })

  } catch (error) {
    console.error('Compare error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

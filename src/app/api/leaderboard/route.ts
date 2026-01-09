import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const models = await prisma.tradingModel.findMany({
      orderBy: {
        totalPnlPct: 'desc'
      }
    })

    const modelsWithStats = models.map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      avatar: model.avatar || '🤖',
      description: model.description || '',
      totalTrades: model.totalTrades,
      winCount: model.winCount,
      totalPnlPct: model.totalPnlPct,
      winRate: model.totalTrades > 0 ? (model.winCount / model.totalTrades) * 100 : 0,
      avgPnlPerTrade: model.totalTrades > 0 ? model.totalPnlPct / model.totalTrades : 0
    }))

    return NextResponse.json({ models: modelsWithStats })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

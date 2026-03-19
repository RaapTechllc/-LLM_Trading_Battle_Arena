import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const { modelId } = await params
    
    const model = await prisma.tradingModel.findUnique({
      where: { id: modelId }
    })

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const trades = await prisma.tradeCard.findMany({
      where: { modelId },
      orderBy: { createdAt: 'desc' }
    })

    if (!trades.length) {
      return NextResponse.json({
        modelId,
        modelName: model.name,
        winRate: 0,
        avgPnl: 0,
        bestAsset: null,
        worstAsset: null,
        currentStreak: 0,
        longestWinStreak: 0,
        tradesByAsset: {},
        recentTrend: 'neutral'
      })
    }

    // Calculate stats
    const wins = trades.filter(t => t.pnlPercent > 0)
    const winRate = (wins.length / trades.length) * 100
    const avgPnl = trades.reduce((sum, t) => sum + t.pnlPercent, 0) / trades.length

    // Trades by asset
    const byAsset: Record<string, { count: number; pnl: number }> = {}
    for (const t of trades) {
      if (!byAsset[t.asset]) byAsset[t.asset] = { count: 0, pnl: 0 }
      byAsset[t.asset].count++
      byAsset[t.asset].pnl += t.pnlPercent
    }

    const assets = Object.entries(byAsset)
    const bestAsset = assets.length ? assets.sort((a, b) => b[1].pnl - a[1].pnl)[0][0] : null
    const worstAsset = assets.length ? assets.sort((a, b) => a[1].pnl - b[1].pnl)[0][0] : null
    const tradesByAsset = Object.fromEntries(assets.map(([k, v]) => [k, v.count]))

    // Streaks (trades are newest-first, reverse for chronological streak calc)
    let currentStreak = 0
    let longestWinStreak = 0
    let streak = 0
    for (const t of [...trades].reverse()) {
      if (t.pnlPercent > 0) {
        streak++
        longestWinStreak = Math.max(longestWinStreak, streak)
      } else {
        streak = 0
      }
    }
    // Current streak from most recent
    for (const t of trades) {
      if (t.pnlPercent > 0) currentStreak++
      else break
    }

    // Recent trend (last 5)
    const recent5 = trades.slice(0, 5)
    const recentPnl = recent5.reduce((sum, t) => sum + t.pnlPercent, 0)
    const recentTrend = recentPnl > 2 ? 'up' : recentPnl < -2 ? 'down' : 'neutral'

    return NextResponse.json({
      modelId,
      modelName: model.name,
      winRate: Math.round(winRate * 10) / 10,
      avgPnl: Math.round(avgPnl * 100) / 100,
      bestAsset,
      worstAsset,
      currentStreak,
      longestWinStreak,
      tradesByAsset,
      recentTrend
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

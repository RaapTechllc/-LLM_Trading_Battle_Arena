import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const entries = await prisma.arenaSeasonEntry.findMany({
    where: { season: { isActive: true } },
    orderBy: { totalPnl: 'desc' },
    select: {
      id: true,
      currentBalance: true,
      totalPnl: true,
      winCount: true,
      lossCount: true,
      totalTrades: true,
      updatedAt: true,
      agent: {
        select: { tag: true, name: true, modelProvider: true, modelId: true },
      },
      season: {
        select: { name: true, startedAt: true },
      },
    },
  })
  return NextResponse.json(entries)
}

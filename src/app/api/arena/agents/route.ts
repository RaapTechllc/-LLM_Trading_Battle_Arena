import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const agents = await prisma.arenaAgent.findMany({
    where: { isActive: true },
    select: {
      id: true,
      tag: true,
      name: true,
      modelProvider: true,
      modelId: true,
      executionPath: true,
      riskMaxExposure: true,
      riskMaxLeverage: true,
      riskMaxPositions: true,
      haltedUntil: true,
      seasonEntries: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
        select: {
          currentBalance: true,
          totalPnl: true,
          winCount: true,
          lossCount: true,
          totalTrades: true,
        },
      },
    },
  })
  return NextResponse.json(agents)
}

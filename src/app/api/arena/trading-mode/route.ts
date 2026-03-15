/**
 * Arena Trading Mode API
 * GET: returns current season's trading mode
 * PATCH: switches mode (SIMULATED ↔ PAPER only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple token auth for Arena API endpoints
function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  return token === process.env.ARENA_API_TOKEN
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const season = await prisma.arenaSeason.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        tradingMode: true,
        paperBroker: true,
        isActive: true,
        startedAt: true,
      },
    })

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 })
    }

    return NextResponse.json({
      seasonId: season.id,
      seasonName: season.name,
      tradingMode: season.tradingMode,
      paperBroker: season.paperBroker,
      isActive: season.isActive,
      startedAt: season.startedAt,
    })
  } catch (err) {
    console.error('[TradingMode API] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { tradingMode, paperBroker, seasonId } = body as {
      tradingMode?: string
      paperBroker?: string
      seasonId?: string
    }

    if (!tradingMode) {
      return NextResponse.json({ error: 'tradingMode is required' }, { status: 400 })
    }

    // Validate trading mode
    const validModes = ['SIMULATED', 'PAPER', 'LIVE']
    if (!validModes.includes(tradingMode)) {
      return NextResponse.json(
        { error: `Invalid tradingMode. Must be one of: ${validModes.join(', ')}` },
        { status: 400 }
      )
    }

    // Find the target season
    const season = seasonId
      ? await prisma.arenaSeason.findUnique({ where: { id: seasonId } })
      : await prisma.arenaSeason.findFirst({ where: { isActive: true } })

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 })
    }

    // LIVE mode not yet enabled
    if (tradingMode === 'LIVE') {
      return NextResponse.json({ error: 'Live trading not yet enabled' }, { status: 403 })
    }

    // Only allow SIMULATED ↔ PAPER freely; LIVE requires gate checks above
    const allowedTransitions: Record<string, string[]> = {
      'SIMULATED': ['PAPER'],
      'PAPER': ['SIMULATED', 'LIVE'],
      'LIVE': ['PAPER'], // Can always downgrade from LIVE
    }

    const allowed = allowedTransitions[season.tradingMode] ?? []
    if (!allowed.includes(tradingMode)) {
      return NextResponse.json({
        error: `Cannot transition from ${season.tradingMode} to ${tradingMode}. Allowed: ${allowed.join(', ')}`,
      }, { status: 400 })
    }

    // Update season
    const updated = await prisma.arenaSeason.update({
      where: { id: season.id },
      data: {
        tradingMode: tradingMode as any,
        ...(paperBroker !== undefined ? { paperBroker } : {}),
      },
    })

    console.log(
      `[TradingMode API] Season ${season.id} mode changed: ${season.tradingMode} → ${tradingMode}` +
      (paperBroker ? ` (broker: ${paperBroker})` : '')
    )

    return NextResponse.json({
      seasonId: updated.id,
      previousMode: season.tradingMode,
      tradingMode: updated.tradingMode,
      paperBroker: updated.paperBroker,
    })
  } catch (err) {
    console.error('[TradingMode API] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

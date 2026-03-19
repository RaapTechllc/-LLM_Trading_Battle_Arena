/**
 * Live Trading Gate
 * Enforces strict requirements before any agent can go live with real money.
 * All requirements must pass + manual Kyle approval required.
 */

import { prisma } from '@/lib/prisma'

interface GateCheckResult {
  canGoLive: boolean
  reasons: string[]
  metrics: {
    paperTradeCount: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
    liveApproved: boolean
    isHalted: boolean
  }
}

interface HaltResult {
  success: boolean
  agentId: string
  haltedUntil: Date
  reason: string
}

// Gate thresholds — Kyle's rules
const GATE_REQUIREMENTS = {
  MIN_PAPER_TRADES: 100,
  MIN_SHARPE_RATIO: 0,      // Must be positive
  MAX_DRAWDOWN_PCT: 0.15,   // 15%
  MIN_WIN_RATE: 0.45,       // 45%
} as const

export class LiveTradingGate {
  /**
   * Check if an agent meets all requirements to go live
   */
  async canGoLive(agentId: string): Promise<GateCheckResult> {
    const reasons: string[] = []

    // Fetch agent with their season entries
    const agent = await prisma.arenaAgent.findUnique({
      where: { id: agentId },
      include: {
        seasonEntries: {
          include: {
            trades: {
              where: { executionMode: 'paper' },
            },
          },
        },
      },
    })

    if (!agent) {
      return {
        canGoLive: false,
        reasons: [`Agent ${agentId} not found`],
        metrics: {
          paperTradeCount: 0, sharpeRatio: 0, maxDrawdown: 0,
          winRate: 0, liveApproved: false, isHalted: false,
        },
      }
    }

    // Aggregate paper trading stats across all seasons
    let totalPaperTrades = 0
    let totalWins = 0
    let bestSharpe = -Infinity
    let worstDrawdown = 0

    for (const entry of agent.seasonEntries) {
      const paperTrades = entry.trades.filter(t => t.executionMode === 'paper' && t.status === 'closed')
      totalPaperTrades += paperTrades.length
      totalWins += paperTrades.filter(t => (t.pnl ?? 0) > 0).length

      if (entry.sharpeRatio > bestSharpe) bestSharpe = entry.sharpeRatio
      if (entry.maxDrawdown > worstDrawdown) worstDrawdown = entry.maxDrawdown
    }

    const winRate = totalPaperTrades > 0 ? totalWins / totalPaperTrades : 0
    const isHalted = !!(agent.haltedUntil && new Date() < agent.haltedUntil)

    // Check each requirement
    if (totalPaperTrades < GATE_REQUIREMENTS.MIN_PAPER_TRADES) {
      reasons.push(
        `Insufficient paper trades: ${totalPaperTrades}/${GATE_REQUIREMENTS.MIN_PAPER_TRADES} required`
      )
    }

    if (bestSharpe <= GATE_REQUIREMENTS.MIN_SHARPE_RATIO) {
      reasons.push(
        `Sharpe ratio must be positive: current best is ${bestSharpe.toFixed(3)}`
      )
    }

    if (worstDrawdown > GATE_REQUIREMENTS.MAX_DRAWDOWN_PCT) {
      reasons.push(
        `Max drawdown ${(worstDrawdown * 100).toFixed(1)}% exceeds limit of ${(GATE_REQUIREMENTS.MAX_DRAWDOWN_PCT * 100).toFixed(0)}%`
      )
    }

    if (winRate < GATE_REQUIREMENTS.MIN_WIN_RATE) {
      reasons.push(
        `Win rate ${(winRate * 100).toFixed(1)}% below minimum ${(GATE_REQUIREMENTS.MIN_WIN_RATE * 100).toFixed(0)}%`
      )
    }

    if (!agent.liveApproved) {
      reasons.push('Manual approval from Kyle required (liveApproved = false)')
    }

    if (isHalted) {
      reasons.push(`Agent is halted until ${agent.haltedUntil!.toISOString()}`)
    }

    return {
      canGoLive: reasons.length === 0,
      reasons,
      metrics: {
        paperTradeCount: totalPaperTrades,
        sharpeRatio: bestSharpe === -Infinity ? 0 : bestSharpe,
        maxDrawdown: worstDrawdown,
        winRate,
        liveApproved: agent.liveApproved,
        isHalted,
      },
    }
  }

  /**
   * Kill switch: halt an agent immediately
   */
  async haltAgent(agentId: string, reason: string, durationHours: number = 24): Promise<HaltResult> {
    const haltedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000)

    await prisma.arenaAgent.update({
      where: { id: agentId },
      data: {
        haltedUntil,
        isActive: false,
      },
    })

    // Close all open trades for this agent
    const entries = await prisma.arenaSeasonEntry.findMany({
      where: { agentId },
      select: { id: true },
    })
    const entryIds = entries.map(e => e.id)

    const openTrades = await prisma.arenaTrade.updateMany({
      where: {
        entryId: { in: entryIds },
        status: 'open',
      },
      data: {
        status: 'stopped',
        killSwitchActive: true,
        closedAt: new Date(),
      },
    })

    console.log(
      `[LiveTradingGate] HALTED agent ${agentId}: ${reason}. ` +
      `${openTrades.count} trades stopped. Halted until ${haltedUntil.toISOString()}`
    )

    return { success: true, agentId, haltedUntil, reason }
  }

  /**
   * Resume a halted agent (clears halt, re-activates)
   */
  async resumeAgent(agentId: string): Promise<{ success: boolean }> {
    await prisma.arenaAgent.update({
      where: { id: agentId },
      data: {
        haltedUntil: null,
        isActive: true,
      },
    })

    console.log(`[LiveTradingGate] Resumed agent ${agentId}`)
    return { success: true }
  }

  /**
   * Check all active agents for drawdown breaches and auto-halt if needed
   */
  async enforceDrawdownLimits(): Promise<{ halted: string[] }> {
    const entries = await prisma.arenaSeasonEntry.findMany({
      where: {
        agent: { isActive: true },
        season: { isActive: true },
      },
      include: { agent: true },
    })

    const halted: string[] = []

    for (const entry of entries) {
      if (entry.maxDrawdown > GATE_REQUIREMENTS.MAX_DRAWDOWN_PCT) {
        await this.haltAgent(
          entry.agentId,
          `Auto-halt: drawdown ${(entry.maxDrawdown * 100).toFixed(1)}% exceeds ${(GATE_REQUIREMENTS.MAX_DRAWDOWN_PCT * 100).toFixed(0)}% limit`,
          48 // 48-hour cooldown
        )
        halted.push(entry.agentId)
      }
    }

    return { halted }
  }
}

// Singleton
export const liveTradingGate = new LiveTradingGate()
